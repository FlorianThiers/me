import { midiToHz } from '../../midi';
import { stepDurationSec } from '../../types';
import { applyAdsr } from '../fx/envelopes';
import { burstNoise } from '../fx/noise';
import type { VoiceSynthHost } from '../types';
import { resolveAnalog, resolveGuitar } from './resolvers';

export function voicePluckedString(host: VoiceSynthHost,
  id: 'an' | 'rg',
  time: number,
  mixGain: number,
  sceneIdx: number,
  midi: number | undefined,
  lengthSteps: number | undefined,
  opts: { brightness: number; pluckMs: number; bodyHz: number },
) {
  if (!host.ctx) return;
  const ctx = host.ctx;
  const p = id === 'rg' ? resolveGuitar(host.project, sceneIdx) : resolveAnalog(host.project, sceneIdx);
  const stepDur = stepDurationSec(host.project.bpm);
  const total =
    midi != null && lengthSteps
      ? Math.max(0.06, lengthSteps * stepDur + p.release * 0.85)
      : p.attack + p.decay + p.release;
  const master = host.trackOut(id);
  const hz = midi != null ? midiToHz(midi) : p.pitch;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  const fBase = Math.max(80, p.cutoff * opts.brightness);
  filter.frequency.setValueAtTime(fBase * (1 + p.filterEnv * 3), time);
  filter.frequency.exponentialRampToValueAtTime(fBase * 0.35, time + 0.05);
  filter.frequency.exponentialRampToValueAtTime(fBase * 0.2, time + total * 0.7);
  filter.Q.setValueAtTime(0.5 + p.res * 4, time);

  const out = ctx.createGain();
  const peak = 0.1 * p.amp * mixGain;
  applyAdsr(out, time, { ...p, sustain: p.sustain * 0.65 }, peak, total);
  filter.connect(out);
  out.connect(master);

  burstNoise(ctx, time, opts.pluckMs, opts.bodyHz, 1.2, 0.16 * mixGain, filter);

  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(hz * 1.03, time);
  osc.frequency.exponentialRampToValueAtTime(hz, time + 0.018);
  osc.connect(filter);
  osc.start(time);
  osc.stop(time + total + 0.02);
}

