/** Mic / audio-input discovery for the vocal recorder. */

export const INPUT_STORAGE_KEY = 'myspace-music-input-device';

export type AudioInputDevice = {
  deviceId: string;
  label: string;
};

export function loadStoredInputDeviceId(): string {
  try {
    return localStorage.getItem(INPUT_STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
}

export function saveInputDeviceId(deviceId: string) {
  try {
    if (!deviceId) localStorage.removeItem(INPUT_STORAGE_KEY);
    else localStorage.setItem(INPUT_STORAGE_KEY, deviceId);
  } catch {
    /* ignore */
  }
}

/** Chrome hides labels until getUserMedia has been granted once. */
async function unlockInputLabels(): Promise<void> {
  if (!navigator.mediaDevices?.getUserMedia) return;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    for (const track of stream.getTracks()) track.stop();
  } catch {
    /* denied */
  }
}

export async function listAudioInputDevices(): Promise<AudioInputDevice[]> {
  if (!navigator.mediaDevices?.enumerateDevices) return [];

  let devices = await navigator.mediaDevices.enumerateDevices();
  const inputs = () => devices.filter((d) => d.kind === 'audioinput');

  if (inputs().some((d) => !d.label)) {
    await unlockInputLabels();
    devices = await navigator.mediaDevices.enumerateDevices();
  }

  return inputs().map((d, i) => ({
    deviceId: d.deviceId,
    label:
      d.label ||
      (d.deviceId === 'default' || d.deviceId === '' ? 'System default mic' : `Mic ${i + 1}`),
  }));
}
