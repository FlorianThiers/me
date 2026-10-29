/** Master output level for the DAW (local + UPnP / Phantom). */

export const MASTER_VOLUME_STORAGE_KEY = 'myspace-music-master-volume';

/** Default — quiet enough for living-room Phantoms. */
export const DEFAULT_MASTER_VOLUME = 0.35;

/**
 * Hard UI/engine cap. Prevents cranking past ~-2.5 dB linear.
 * Safety limiter + soft-clip still sit after this.
 */
export const MAX_MASTER_VOLUME = 0.75;

export function clampMasterVolume(v: number): number {
  if (!Number.isFinite(v)) return DEFAULT_MASTER_VOLUME;
  return Math.min(MAX_MASTER_VOLUME, Math.max(0, v));
}

export function loadMasterVolume(): number {
  try {
    const raw = localStorage.getItem(MASTER_VOLUME_STORAGE_KEY);
    if (raw == null) return DEFAULT_MASTER_VOLUME;
    return clampMasterVolume(Number(raw));
  } catch {
    return DEFAULT_MASTER_VOLUME;
  }
}

export function saveMasterVolume(v: number) {
  try {
    localStorage.setItem(MASTER_VOLUME_STORAGE_KEY, String(clampMasterVolume(v)));
  } catch {
    /* ignore */
  }
}

export function masterVolumePercent(v: number): number {
  return Math.round((clampMasterVolume(v) / MAX_MASTER_VOLUME) * 100);
}

export function masterVolumeFromPercent(pct: number): number {
  return clampMasterVolume((pct / 100) * MAX_MASTER_VOLUME);
}
