const STORAGE_KEY = 'myspace-audio-samples-v1';

type StoreShape = Record<string, number[]>;

function readStore(): StoreShape {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as StoreShape;
  } catch {
    return {};
  }
}

function writeStore(data: StoreShape) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* quota */
  }
}

export function newSampleId(): string {
  return `s${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

export function saveSample(id: string, samples: Float32Array) {
  const store = readStore();
  store[id] = Array.from(samples);
  writeStore(store);
}

export function loadSample(id: string): Float32Array | null {
  const store = readStore();
  const row = store[id];
  if (!row?.length) return null;
  return Float32Array.from(row);
}

export function deleteSample(id: string) {
  const store = readStore();
  delete store[id];
  writeStore(store);
}

export async function decodeBlobToMono(ctx: AudioContext, blob: Blob): Promise<Float32Array> {
  const buf = await blob.arrayBuffer();
  const decoded = await ctx.decodeAudioData(buf.slice(0));
  const ch0 = decoded.getChannelData(0);
  if (decoded.numberOfChannels === 1) return Float32Array.from(ch0);
  const ch1 = decoded.getChannelData(1);
  const mono = new Float32Array(decoded.length);
  for (let i = 0; i < decoded.length; i += 1) {
    mono[i] = (ch0[i] + ch1[i]) * 0.5;
  }
  return mono;
}

export function samplesToAudioBuffer(ctx: AudioContext, samples: Float32Array, sampleRate?: number): AudioBuffer {
  const rate = sampleRate ?? ctx.sampleRate;
  const buffer = ctx.createBuffer(1, samples.length, rate);
  buffer.copyToChannel(samples, 0);
  return buffer;
}
