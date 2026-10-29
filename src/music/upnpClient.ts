/** Browser client for the local MySpace UPnP bridge (Devialet / DLNA). */

export const UPNP_PREFIX = 'upnp:';
export const UPNP_BRIDGE_HTTP = 'http://127.0.0.1:8787';
export const UPNP_BRIDGE_WS = 'ws://127.0.0.1:8787/pcm';

export type UpnpRenderer = {
  id: string;
  name: string;
  host: string;
  controlURL: string;
};

export function isUpnpDeviceId(deviceId: string): boolean {
  return deviceId.startsWith(UPNP_PREFIX);
}

export function upnpDeviceId(rendererId: string): string {
  return `${UPNP_PREFIX}${rendererId}`;
}

export function rendererIdFromDeviceId(deviceId: string): string {
  return deviceId.slice(UPNP_PREFIX.length);
}

export async function bridgeHealth(): Promise<{ ok: boolean; streamUrl?: string; error?: string }> {
  try {
    const res = await fetch(`${UPNP_BRIDGE_HTTP}/health`, { signal: AbortSignal.timeout(1500) });
    if (!res.ok) return { ok: false, error: `bridge ${res.status}` };
    const data = (await res.json()) as { ok?: boolean; streamUrl?: string };
    return { ok: Boolean(data.ok), streamUrl: data.streamUrl };
  } catch {
    return { ok: false, error: 'bridge offline — run npm run upnp-bridge' };
  }
}

export async function listUpnpRenderers(refresh = false): Promise<{
  renderers: UpnpRenderer[];
  streamUrl?: string;
  error?: string;
}> {
  try {
    const q = refresh ? '?refresh=1' : '';
    const res = await fetch(`${UPNP_BRIDGE_HTTP}/renderers${q}`, {
      signal: AbortSignal.timeout(refresh ? 8000 : 3000),
    });
    if (!res.ok) return { renderers: [], error: `bridge ${res.status}` };
    const data = (await res.json()) as { renderers: UpnpRenderer[]; streamUrl?: string };
    return { renderers: data.renderers ?? [], streamUrl: data.streamUrl };
  } catch {
    return { renderers: [], error: 'bridge offline — run npm run upnp-bridge' };
  }
}

export async function bridgePlay(rendererId?: string): Promise<void> {
  const res = await fetch(`${UPNP_BRIDGE_HTTP}/play`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rendererId ? { rendererId } : {}),
  });
  const data = (await res.json()) as { error?: string };
  if (!res.ok) throw new Error(data.error || `play failed (${res.status})`);
}

/** Wait until Phantom is actually GETting /stream.wav (playhead must not run before this). */
export async function waitForStreamClient(timeoutMs = 12000): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${UPNP_BRIDGE_HTTP}/health`, { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        const data = (await res.json()) as { streamClients?: number };
        if ((data.streamClients ?? 0) > 0) return true;
      }
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 120));
  }
  return false;
}

/**
 * After stream connect, bridge primes ~11.5s silence then opens the live gate.
 * Wait for that gate so bar 1 hits the speakers instead of sitting in the buffer.
 */
export async function waitForLiveAudio(timeoutMs = 20000): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${UPNP_BRIDGE_HTTP}/health`, { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        const data = (await res.json()) as {
          streamClients?: number;
          msUntilLive?: number;
          liveAudioAt?: number;
        };
        if ((data.streamClients ?? 0) === 0) {
          await new Promise((r) => setTimeout(r, 120));
          continue;
        }
        if (!data.liveAudioAt || (data.msUntilLive ?? 0) <= 0) return true;
      }
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  return false;
}

export async function bridgeStop(): Promise<void> {
  try {
    await fetch(`${UPNP_BRIDGE_HTTP}/stop`, { method: 'POST', signal: AbortSignal.timeout(3000) });
  } catch {
    /* ignore */
  }
}
