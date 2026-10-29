/** Local audio-output discovery for the DAW (Windows BT headphones, speakers, …). */

export const OUTPUT_STORAGE_KEY = 'myspace-music-output-device';

export type AudioOutputDevice = {
  deviceId: string;
  label: string;
};

type SinkCapableContext = AudioContext & {
  setSinkId?: (sinkId: string) => Promise<void>;
  readonly sinkId?: string;
};

export function supportsSinkId(): boolean {
  if (typeof AudioContext === 'undefined') return false;
  return typeof (AudioContext.prototype as SinkCapableContext).setSinkId === 'function';
}

export function loadStoredOutputDeviceId(): string {
  try {
    return localStorage.getItem(OUTPUT_STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
}

export function saveOutputDeviceId(deviceId: string) {
  try {
    if (!deviceId) localStorage.removeItem(OUTPUT_STORAGE_KEY);
    else localStorage.setItem(OUTPUT_STORAGE_KEY, deviceId);
  } catch {
    /* ignore quota / private mode */
  }
}

/** Chrome often hides labels until the page has used media once. */
async function unlockDeviceLabels(): Promise<void> {
  if (!navigator.mediaDevices?.getUserMedia) return;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    for (const track of stream.getTracks()) track.stop();
  } catch {
    /* user denied mic — still list devices with generic labels */
  }
}

export async function listAudioOutputDevices(): Promise<AudioOutputDevice[]> {
  if (!navigator.mediaDevices?.enumerateDevices) return [];

  let devices = await navigator.mediaDevices.enumerateDevices();
  const outputs = () =>
    devices.filter((d) => d.kind === 'audiooutput');

  if (outputs().some((d) => !d.label)) {
    await unlockDeviceLabels();
    devices = await navigator.mediaDevices.enumerateDevices();
  }

  const list = outputs().map((d, i) => ({
    deviceId: d.deviceId,
    label: d.label || (d.deviceId === 'default' || d.deviceId === '' ? 'System default' : `Output ${i + 1}`),
  }));

  // Ensure a default option even if the browser only lists named sinks
  if (!list.some((d) => d.deviceId === '' || d.deviceId === 'default')) {
    list.unshift({ deviceId: '', label: 'System default' });
  }

  return list;
}

export async function applySinkId(ctx: AudioContext, deviceId: string): Promise<void> {
  const sink = ctx as SinkCapableContext;
  if (typeof sink.setSinkId !== 'function') {
    throw new Error('Audio output routing is not supported in this browser');
  }
  await sink.setSinkId(deviceId);
}

export function currentSinkId(ctx: AudioContext | null): string {
  if (!ctx) return '';
  return (ctx as SinkCapableContext).sinkId ?? '';
}
