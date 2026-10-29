/**
 * MySpace music → Devialet (UPnP) bridge
 *
 * - SSDP discovery of MediaRenderers
 * - WebSocket PCM ingest from the browser DAW
 * - HTTP /stream.wav for the Phantom to pull
 * - AVTransport SetAVTransportURI + Play / Stop
 *
 * Run: npm run upnp-bridge
 * API:  http://127.0.0.1:8787
 */
import http from 'node:http';
import os from 'node:os';
import { WebSocketServer } from 'ws';
import ssdp from 'node-ssdp';

const { Client: SsdpClient } = ssdp;

const PORT = Number(process.env.UPNP_BRIDGE_PORT || 8787);
const SAMPLE_RATE_DEFAULT = 48000;
const CHANNELS = 2;
const BYTES_PER_SAMPLE = 2; // int16
const FRAME_BYTES = CHANNELS * BYTES_PER_SAMPLE;
/** ~1.5s ring — never stockpile minutes of “past” audio for the Phantom. */
const RING_SECONDS = 1.5;

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,HEAD,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

/**
 * @typedef {{ id: string, name: string, location: string, controlURL: string, host: string }} Renderer
 */

class RingBuffer {
  /** @param {number} capacityBytes */
  constructor(capacityBytes) {
    this.buf = Buffer.alloc(capacityBytes);
    this.capacity = capacityBytes;
    this.readPos = 0;
    this.writePos = 0;
    this.length = 0;
  }

  /** @param {Buffer} chunk */
  write(chunk) {
    let offset = 0;
    while (offset < chunk.length) {
      if (this.length >= this.capacity) {
        const drop = Math.min(FRAME_BYTES * 256, this.length);
        this.readPos = (this.readPos + drop) % this.capacity;
        this.length -= drop;
      }
      const space = Math.min(this.capacity - this.writePos, chunk.length - offset, this.capacity - this.length);
      if (space <= 0) break;
      chunk.copy(this.buf, this.writePos, offset, offset + space);
      this.writePos = (this.writePos + space) % this.capacity;
      this.length += space;
      offset += space;
    }
  }

  /** @param {Buffer} out */
  read(out) {
    let filled = 0;
    while (filled < out.length && this.length > 0) {
      const n = Math.min(out.length - filled, this.capacity - this.readPos, this.length);
      this.buf.copy(out, filled, this.readPos, this.readPos + n);
      this.readPos = (this.readPos + n) % this.capacity;
      this.length -= n;
      filled += n;
    }
    if (filled < out.length) out.fill(0, filled);
    return filled;
  }

  clear() {
    this.readPos = 0;
    this.writePos = 0;
    this.length = 0;
  }
}

/** @type {Map<string, Renderer>} */
const renderers = new Map();
/** @type {string | null} */
let activeRendererId = null;
/** @type {http.ServerResponse[]} */
const streamClients = [];

let sampleRate = SAMPLE_RATE_DEFAULT;
let ring = new RingBuffer(SAMPLE_RATE_DEFAULT * CHANNELS * BYTES_PER_SAMPLE * RING_SECONDS);
let pcmBytesReceived = 0;
let lastPcmAt = 0;

function isTailscaleOrCgnat(ip) {
  const m = /^(\d+)\.(\d+)\./.exec(ip);
  if (!m) return false;
  const a = Number(m[1]);
  const b = Number(m[2]);
  // Tailscale / Carrier-grade NAT 100.64.0.0/10
  return a === 100 && b >= 64 && b <= 127;
}

/** Prefer LAN IP reachable by Phantoms (same subnet), never Tailscale CGNAT. */
function lanIPv4() {
  const nets = os.networkInterfaces();
  /** @type {string[]} */
  const candidates = [];
  for (const list of Object.values(nets)) {
    if (!list) continue;
    for (const n of list) {
      if (n.family === 'IPv4' && !n.internal) candidates.push(n.address);
    }
  }
  const rendererHosts = [...renderers.values()].map((r) => r.host);
  const scored = candidates
    .filter((ip) => !isTailscaleOrCgnat(ip))
    .map((ip) => {
      const prefix = ip.split('.').slice(0, 3).join('.');
      const sameSubnet = rendererHosts.some((h) => h.startsWith(prefix + '.'));
      const isPrivate = /^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(ip);
      return { ip, score: (sameSubnet ? 100 : 0) + (isPrivate ? 10 : 0) };
    })
    .sort((a, b) => b.score - a.score);
  return scored[0]?.ip || candidates.find((ip) => !isTailscaleOrCgnat(ip)) || candidates[0] || '127.0.0.1';
}

/** HEAD-only size hint (devices that insist on a length). GET is live, no Content-Length. */
const HEAD_HINT_SEC = 4;
/**
 * Devialet buffers ~this much before audible start. We flood that much silence ASAP,
 * then pause the pump until it would underrun so live PCM lines up with speakers.
 */
const PRIME_SEC = Number(process.env.UPNP_PRIME_SEC || 11.5);

function streamDataBytes(rate = sampleRate) {
  return Math.floor(rate * CHANNELS * BYTES_PER_SAMPLE * HEAD_HINT_SEC);
}

function streamUrl() {
  return `http://${lanIPv4()}:${PORT}/stream.wav`;
}

function streamUrlFresh() {
  return `${streamUrl()}?n=${Date.now()}`;
}

/** Live WAV: unknown length (0xFFFFFFFF) — not a finite “download then play” file. */
function wavHeaderLive(rate) {
  const header = Buffer.alloc(44);
  const byteRate = rate * CHANNELS * BYTES_PER_SAMPLE;
  header.write('RIFF', 0);
  header.writeUInt32LE(0xffffffff, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(CHANNELS, 22);
  header.writeUInt32LE(rate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(FRAME_BYTES, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(0xffffffff, 40);
  return header;
}

function absUrl(base, maybeRelative) {
  try {
    return new URL(maybeRelative, base).href;
  } catch {
    return maybeRelative;
  }
}

/**
 * @param {string} location
 * @returns {Promise<Renderer | null>}
 */
async function describeRenderer(location) {
  const res = await fetch(location, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) return null;
  const xml = await res.text();
  const name =
    xml.match(/<friendlyName>([^<]*)<\/friendlyName>/i)?.[1]?.trim() ||
    'MediaRenderer';
  const udn = xml.match(/<UDN>([^<]*)<\/UDN>/i)?.[1]?.trim() || location;

  // Prefer AVTransport service controlURL
  const serviceBlocks = [...xml.matchAll(/<service>([\s\S]*?)<\/service>/gi)].map((m) => m[1]);
  let controlPath = null;
  for (const block of serviceBlocks) {
    if (/AVTransport/i.test(block)) {
      controlPath = block.match(/<controlURL>([^<]*)<\/controlURL>/i)?.[1]?.trim() ?? null;
      if (controlPath) break;
    }
  }
  if (!controlPath) return null;

  return {
    id: udn,
    name,
    location,
    controlURL: absUrl(location, controlPath),
    host: new URL(location).hostname,
  };
}

async function discover(timeoutMs = 3500) {
  const client = new SsdpClient({ explicitSocketBind: true });
  /** @type {Set<string>} */
  const seen = new Set();

  client.on('response', async (headers) => {
    const loc = headers.LOCATION || headers.Location;
    if (!loc || seen.has(loc)) return;
    seen.add(loc);
    try {
      const r = await describeRenderer(loc);
      if (r) {
        renderers.set(r.id, r);
        console.log(`[upnp] found ${r.name} @ ${r.host}`);
      }
    } catch (e) {
      console.warn('[upnp] describe failed', loc, e instanceof Error ? e.message : e);
    }
  });

  client.search('urn:schemas-upnp-org:device:MediaRenderer:1');
  client.search('ssdp:all');

  await new Promise((r) => setTimeout(r, timeoutMs));
  try {
    client.stop();
  } catch {
    /* ignore */
  }
  return [...renderers.values()];
}

function escapeXml(s) {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function didl(uri, title) {
  const meta = `<?xml version="1.0" encoding="UTF-8"?>
<DIDL-Lite xmlns="urn:schemas-upnp-org:metadata-1-0/DIDL-Lite/"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:upnp="urn:schemas-upnp-org:metadata-1-0/upnp/">
  <item id="0" parentID="-1" restricted="1">
    <dc:title>${escapeXml(title)}</dc:title>
    <upnp:class>object.item.audioItem.audioBroadcast</upnp:class>
    <res protocolInfo="http-get:*:audio/wav:DLNA.ORG_PN=WAV;DLNA.ORG_OP=00;DLNA.ORG_CI=0;DLNA.ORG_FLAGS=01700000000000000000000000000000" sampleFrequency="${sampleRate}" bitsPerSample="16" nrAudioChannels="2">${escapeXml(uri)}</res>
  </item>
</DIDL-Lite>`;
  return meta;
}

/**
 * @param {Renderer} renderer
 * @param {string} action
 * @param {Record<string, string>} args
 */
async function soap(renderer, action, args) {
  const bodyArgs = Object.entries(args)
    .map(([k, v]) => `<${k}>${v}</${k}>`)
    .join('');
  const envelope = `<?xml version="1.0" encoding="utf-8"?>
<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
  <s:Body>
    <u:${action} xmlns:u="urn:schemas-upnp-org:service:AVTransport:1">${bodyArgs}</u:${action}>
  </s:Body>
</s:Envelope>`;

  const res = await fetch(renderer.controlURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml; charset="utf-8"',
      SOAPACTION: `"urn:schemas-upnp-org:service:AVTransport:1#${action}"`,
    },
    body: envelope,
    signal: AbortSignal.timeout(8000),
  });
  const text = await res.text();
  if (!res.ok) {
    const code = text.match(/<errorCode>(\d+)<\/errorCode>/)?.[1];
    const desc = text.match(/<errorDescription>([^<]*)<\/errorDescription>/)?.[1];
    throw new Error(
      `SOAP ${action} ${res.status}${code ? ` UPnP ${code}` : ''}${desc ? ` ${desc}` : ''}: ${text.slice(0, 320)}`,
    );
  }
  return text;
}

async function transportState(renderer) {
  try {
    const xml = await soap(renderer, 'GetTransportInfo', { InstanceID: '0' });
    return xml.match(/<CurrentTransportState>([^<]*)<\/CurrentTransportState>/i)?.[1] ?? '';
  } catch {
    return '';
  }
}

async function waitTransport(renderer, want, timeoutMs = 2500) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const st = await transportState(renderer);
    if (want.includes(st)) return st;
    await new Promise((r) => setTimeout(r, 150));
  }
  return transportState(renderer);
}

/** @param {Renderer} renderer */
async function playOn(renderer, { stopFirst = true, fresh = true } = {}) {
  const uri = fresh ? streamUrlFresh() : streamUrl();
  if (stopFirst) {
    try {
      await soap(renderer, 'Stop', { InstanceID: '0' });
    } catch {
      /* idle */
    }
    await waitTransport(renderer, ['STOPPED', 'NO_MEDIA_PRESENT', ''], 3500);
    await new Promise((r) => setTimeout(r, 250));
  }

  const attempts = [
    {
      CurrentURI: escapeXml(uri),
      CurrentURIMetaData: escapeXml(didl(uri, 'Cumbia Forge')),
    },
    { CurrentURI: escapeXml(uri), CurrentURIMetaData: '' },
  ];

  let lastErr = /** @type {unknown} */ (null);
  for (const args of attempts) {
    try {
      await soap(renderer, 'SetAVTransportURI', { InstanceID: '0', ...args });
      lastErr = null;
      break;
    } catch (e) {
      lastErr = e;
      console.warn(`[upnp] SetAVTransportURI failed on ${renderer.name}:`, e instanceof Error ? e.message : e);
    }
  }
  if (lastErr) throw lastErr;

  await waitTransport(renderer, ['STOPPED', 'NO_MEDIA_PRESENT', 'TRANSITIONING', ''], 2000);
  await new Promise((r) => setTimeout(r, 200));

  for (let i = 0; i < 4; i++) {
    try {
      await soap(renderer, 'Play', { InstanceID: '0', Speed: '1' });
      console.log(`[upnp] playing on ${renderer.name} ← ${uri}`);
      return;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.warn(`[upnp] Play attempt ${i + 1} failed:`, msg);
      // 701 Transition not available — wait until device leaves TRANSITIONING
      await waitTransport(renderer, ['STOPPED', 'PLAYING', 'NO_MEDIA_PRESENT'], 3000);
      await new Promise((r) => setTimeout(r, 500));
      if (i === 3) throw e;
    }
  }
}

/**
 * @param {Renderer[]} targets
 * @param {{ stopFirst?: boolean }} [opts]
 */
async function playOnMany(targets, opts = {}) {
  if (targets.length === 0) throw new Error('no renderer');
  const results = await Promise.allSettled(
    targets.map((r) => playOn(r, { stopFirst: opts.stopFirst !== false, fresh: true })),
  );
  const ok = results.filter((r) => r.status === 'fulfilled');
  if (ok.length === 0) {
    const first = results.find((r) => r.status === 'rejected');
    throw first && first.status === 'rejected' ? first.reason : new Error('play failed');
  }
  activeRendererId = targets.map((t) => t.id).join('|');
}

/** Serialize cast mutations — overlapping Play/refresh caused UPnP 701. */
let castLock = Promise.resolve();
function withCastLock(fn) {
  const run = castLock.then(fn, fn);
  castLock = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function stopActive() {
  if (!activeRendererId) return;
  const ids = activeRendererId.split('|');
  activeRendererId = null;
  await withCastLock(async () => {
    await Promise.allSettled(
      ids.map(async (id) => {
        const r = renderers.get(id);
        if (!r) return;
        try {
          await soap(r, 'Stop', { InstanceID: '0' });
          console.log(`[upnp] stopped ${r.name}`);
        } catch (e) {
          console.warn('[upnp] stop failed', e instanceof Error ? e.message : e);
        }
      }),
    );
  });
}

function pickPhantomPrimary() {
  const phantoms = [...renderers.values()].filter((r) => /devialet|phantom/i.test(r.name));
  if (phantoms.length === 0) return null;
  return phantoms.find((r) => /\bL\b|left/i.test(r.name)) || phantoms[0];
}

function json(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json', ...cors });
  res.end(JSON.stringify(data));
}

const dlnaStreamHeaders = {
  'Content-Type': 'audio/wav',
  Connection: 'close',
  'Cache-Control': 'no-cache, no-store',
  Pragma: 'no-cache',
  'transferMode.dlna.org': 'Streaming',
  // OP=00 = no byte-seek (live). OP=01 made Phantom treat it like a finite download.
  'contentFeatures.dlna.org':
    'DLNA.ORG_PN=WAV;DLNA.ORG_OP=00;DLNA.ORG_CI=0;DLNA.ORG_FLAGS=01700000000000000000000000000000',
  ...cors,
};

let clearRingNextStream = true;
/** After silence prime, don't pump until this time (ms) — lets Phantom drain into audible live. */
let liveAudioAt = 0;

function handleStream(req, res) {
  if (req.method === 'HEAD') {
    const dataBytes = streamDataBytes();
    res.writeHead(200, {
      ...dlnaStreamHeaders,
      'Content-Length': String(44 + dataBytes),
    });
    res.end();
    console.log(`[stream] HEAD ok ${req.socket.remoteAddress}`);
    return;
  }

  // Only one pull at a time — stacked GETs from refresh-spam broke Play (701).
  for (const old of [...streamClients]) {
    try {
      old.end();
    } catch {
      /* ignore */
    }
  }
  streamClients.length = 0;

  if (clearRingNextStream) {
    ring.clear();
    clearRingNextStream = false;
  }

  // Live body: no Content-Length, no chunked → client reads until we close.
  res.useChunkedEncodingByDefault = false;
  res.chunkedEncoding = false;
  res.writeHead(200, dlnaStreamHeaders);
  res.write(wavHeaderLive(sampleRate));

  // Flood ~PRIME_SEC silence at network speed so Devialet's pre-buffer fills in <1s wall time.
  const primeFrames = Math.max(1, Math.floor(sampleRate * PRIME_SEC));
  const oneSec = sampleRate * FRAME_BYTES;
  let left = primeFrames * FRAME_BYTES;
  while (left > 0) {
    const n = Math.min(left, oneSec);
    res.write(Buffer.alloc(n));
    left -= n;
  }
  liveAudioAt = Date.now() + Math.round(PRIME_SEC * 1000);
  ring.clear();

  streamClients.push(res);
  console.log(
    `[stream] client connected (${streamClients.length}) ${req.socket.remoteAddress} primed=${PRIME_SEC}s liveIn=${PRIME_SEC}s`,
  );

  const onClose = () => {
    const i = streamClients.indexOf(res);
    if (i >= 0) streamClients.splice(i, 1);
    console.log(`[stream] client gone (${streamClients.length})`);
    if (streamClients.length === 0) liveAudioAt = 0;
  };
  res.once('close', onClose);
}

/** Pump live PCM only after prime silence would have drained. */
let lastPumpAt = Date.now();
setInterval(() => {
  if (streamClients.length === 0) {
    lastPumpAt = Date.now();
    return;
  }
  const now = Date.now();
  if (liveAudioAt && now < liveAudioAt) {
    // Hold — do not append realtime silence or the 12s delay comes back.
    lastPumpAt = now;
    return;
  }
  let elapsed = (now - lastPumpAt) / 1000;
  lastPumpAt = now;
  if (elapsed > 0.25) elapsed = 0.25;
  if (elapsed < 0.005) return;
  const frames = Math.max(1, Math.floor(sampleRate * elapsed));
  const bytes = frames * FRAME_BYTES;
  const chunk = Buffer.alloc(bytes);
  ring.read(chunk);
  for (const res of [...streamClients]) {
    if (res.writableEnded || res.destroyed) continue;
    try {
      res.write(chunk);
    } catch {
      /* drop */
    }
  }
}, 10);

const server = http.createServer(async (req, res) => {
  if (!req.url || !req.method) {
    res.writeHead(400);
    res.end();
    return;
  }

  if (req.method === 'OPTIONS') {
    res.writeHead(204, cors);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://127.0.0.1:${PORT}`);

  if (req.method === 'GET' && url.pathname === '/health') {
    json(res, 200, {
      ok: true,
      port: PORT,
      lan: lanIPv4(),
      streamUrl: streamUrl(),
      sampleRate,
      renderers: renderers.size,
      activeRendererId,
      pcmBytesReceived,
      ringFill: ring.length,
      streamClients: streamClients.length,
      lastPcmAt,
      primeSec: PRIME_SEC,
      liveAudioAt,
      msUntilLive: liveAudioAt ? Math.max(0, liveAudioAt - Date.now()) : 0,
    });
    return;
  }

  if (req.method === 'GET' && url.pathname === '/renderers') {
    const refresh = url.searchParams.get('refresh') === '1';
    if (refresh || renderers.size === 0) await discover();
    const list = [...renderers.values()].map((r) => ({
      id: r.id,
      name: r.name,
      host: r.host,
      controlURL: r.controlURL,
    }));
    const phantoms = list.filter((r) => /devialet|phantom/i.test(r.name));
    if (phantoms.length >= 1) {
      const primary = pickPhantomPrimary();
      if (primary) {
        list.unshift({
          id: 'devialet-pair',
          name:
            phantoms.length >= 2
              ? `Phantom stereo → ${primary.name}`
              : primary.name,
          host: primary.host,
          controlURL: primary.controlURL || '',
        });
      }
    }
    json(res, 200, {
      streamUrl: streamUrl(),
      lan: lanIPv4(),
      renderers: list,
    });
    return;
  }

  if (req.method === 'POST' && url.pathname === '/play') {
    let body = '';
    for await (const c of req) body += c;
    /** @type {{ rendererId?: string }} */
    let parsed = {};
    try {
      parsed = body ? JSON.parse(body) : {};
    } catch {
      json(res, 400, { error: 'invalid json' });
      return;
    }
    if (renderers.size === 0) await discover();
    /** @type {Renderer[]} */
    let targets = [];
    if (parsed.rendererId) {
      // Stereo group: cast to one primary (L) — dual cast drops the HTTP stream.
      if (parsed.rendererId === 'devialet-pair') {
        const primary = pickPhantomPrimary();
        if (primary) targets = [primary];
      } else {
        const one = renderers.get(parsed.rendererId);
        if (one) targets = [one];
      }
    }
    if (targets.length === 0) {
      const primary = pickPhantomPrimary();
      targets = primary ? [primary] : [...renderers.values()].slice(0, 1);
    }
    if (targets.length === 0) {
      json(res, 404, { error: 'no UPnP renderer found — is Phantom on same WiFi?' });
      return;
    }
    // Drop backlog so Phantom starts near “now”, not 5 playlist bars behind.
    ring.clear();
    clearRingNextStream = true;
    try {
      await withCastLock(async () => {
        await playOnMany(targets);
      });
      json(res, 200, {
        ok: true,
        renderers: targets.map((r) => ({ id: r.id, name: r.name })),
        streamUrl: streamUrl(),
      });
    } catch (e) {
      json(res, 502, { error: e instanceof Error ? e.message : String(e) });
    }
    return;
  }

  if (req.method === 'POST' && url.pathname === '/stop') {
    await stopActive();
    json(res, 200, { ok: true });
    return;
  }

  if ((req.method === 'GET' || req.method === 'HEAD') && url.pathname === '/stream.wav') {
    handleStream(req, res);
    return;
  }

  json(res, 404, { error: 'not found' });
});

const wss = new WebSocketServer({ server, path: '/pcm' });

wss.on('connection', (ws) => {
  console.log('[pcm] browser connected');
  ws.on('message', (data, isBinary) => {
    if (!isBinary) {
      try {
        const msg = JSON.parse(String(data));
        if (msg.type === 'hello' && typeof msg.sampleRate === 'number') {
          const next = Math.round(msg.sampleRate);
          if (next > 0 && next !== sampleRate) {
            sampleRate = next;
            ring = new RingBuffer(sampleRate * CHANNELS * BYTES_PER_SAMPLE * RING_SECONDS);
            console.log(`[pcm] sampleRate → ${sampleRate}`);
          }
        }
      } catch {
        /* ignore */
      }
      return;
    }
    // Only keep PCM while a Phantom is pulling — otherwise the ring becomes a delay line.
    if (streamClients.length === 0) return;
    const buf = Buffer.isBuffer(data) ? data : Buffer.from(data);
    ring.write(buf);
    pcmBytesReceived += buf.length;
    lastPcmAt = Date.now();
  });
  ws.on('close', () => console.log('[pcm] browser disconnected'));
});

server.listen(PORT, '0.0.0.0', async () => {
  console.log(`[upnp-bridge] http://127.0.0.1:${PORT}  stream ${streamUrl()}`);
  console.log('[upnp-bridge] scanning for MediaRenderers…');
  await discover();
  console.log(`[upnp-bridge] ${renderers.size} renderer(s)`);
});

process.on('SIGINT', async () => {
  await stopActive();
  process.exit(0);
});
