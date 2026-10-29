import { midiToHz } from '../../midi';
import { stepDurationSec } from '../../types';
import { applyDrumEnvelope } from '../fx/envelopes';
import { burstNoise } from '../fx/noise';
import type { VoiceSynthHost } from '../types';
import { resolveDrum } from './resolvers';

export function voiceContrabajo(host: VoiceSynthHost, 
  time: number,
  mixGain: number,
  sceneIdx: number,
  midi?: number,
  lengthSteps?: number,
) {
  if (!host.ctx) return;
  const ctx = host.ctx;
  const d = resolveDrum(host.project, 'bass', sceneIdx);
  const stepDur = stepDurationSec(host.project.bpm);
  const total =
    midi != null && lengthSteps
      ? Math.max(0.12, lengthSteps * stepDur * 0.92)
      : Math.max(0.14, d.dur);
  const master = host.trackOut('bass');
  const hz = midi != null ? midiToHz(midi) : Math.max(32, d.freq);

  const out = ctx.createGain();
  out.connect(master);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(Math.max(80, d.filter) * 2.2, time);
  filter.frequency.exponentialRampToValueAtTime(Math.max(60, d.filter), time + 0.06);
  filter.frequency.exponentialRampToValueAtTime(Math.max(45, d.filter * 0.7), time + total * 0.85);
  filter.Q.setValueAtTime(0.9, time);
  filter.connect(out);

  applyDrumEnvelope(out, time, 0.004, Math.min(d.decay, total * 0.35), 0.3 * mixGain, total);

  burstNoise(ctx, time, 0.012, 600, 1.4, 0.14 * mixGain, filter);

  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(hz * 1.015, time);
  osc.frequency.exponentialRampToValueAtTime(hz, time + 0.025);
  const oscG = ctx.createGain();
  oscG.gain.setValueAtTime(0.75, time);
  osc.connect(oscG);
  oscG.connect(filter);

  const sub = ctx.createOscillator();
  sub.type = 'sine';
  sub.frequency.setValueAtTime(hz * 0.5, time);
  const subG = ctx.createGain();
  subG.gain.setValueAtTime(0.35, time);
  sub.connect(subG);
  subG.connect(filter);

  osc.start(time);
  osc.stop(time + total + 0.02);
  sub.start(time);
  sub.stop(time + total + 0.02);
}

