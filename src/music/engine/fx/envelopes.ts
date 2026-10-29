import type { SynthEnvelope } from '../../types';

export function applyAdsrHold(
  gain: GainNode,
  time: number,
  env: SynthEnvelope,
  peak: number,
) {
  const a = Math.max(0.002, env.attack);
  const d = Math.max(0.002, env.decay);
  const s = Math.max(0.0001, Math.min(1, env.sustain)) * peak;
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.linearRampToValueAtTime(peak, time + a);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, s), time + a + d);
}

export function applyAdsr(
  gain: GainNode,
  time: number,
  env: SynthEnvelope,
  peak: number,
  total: number,
) {
  const a = Math.max(0.002, env.attack);
  const d = Math.max(0.002, env.decay);
  const s = Math.max(0.0001, Math.min(1, env.sustain)) * peak;
  const r = Math.max(0.005, env.release);
  const sustainEnd = Math.max(a + d + 0.01, total - r);

  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.linearRampToValueAtTime(peak, time + a);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, s), time + a + d);
  gain.gain.setValueAtTime(Math.max(0.0001, s), time + sustainEnd);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + total);
}

export function applyDrumEnvelope(
  gain: GainNode,
  time: number,
  attack: number,
  decay: number,
  peak: number,
  total: number,
) {
  const a = Math.max(0.001, attack);
  const d = Math.max(0.005, decay);
  const hold = Math.max(0, total - a - d);

  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.linearRampToValueAtTime(peak, time + a);
  if (hold > 0.01) {
    gain.gain.setValueAtTime(peak * 0.8, time + a + hold * 0.2);
  }
  gain.gain.exponentialRampToValueAtTime(0.0001, time + total);
}

