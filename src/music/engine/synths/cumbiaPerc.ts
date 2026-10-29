import { applyDrumEnvelope } from '../fx/envelopes';
import { burstNoise } from '../fx/noise';
import type { VoiceSynthHost } from '../types';
import { resolveDrum } from './resolvers';

export function voiceCajon(host: VoiceSynthHost, time: number, mixGain: number, sceneIdx: number) {
  if (!host.ctx) return;
  const ctx = host.ctx;
  const d = resolveDrum(host.project, 'kick', sceneIdx);
  const total = Math.max(0.1, d.dur);
  const master = host.trackOut('kick');
  const out = ctx.createGain();
  applyDrumEnvelope(out, time, 0.001, d.decay, 0.34 * mixGain, total);
  out.connect(master);

  const body = ctx.createOscillator();
  body.type = 'sine';
  const f0 = Math.max(55, d.freq + d.pitch);
  body.frequency.setValueAtTime(f0, time);
  body.frequency.exponentialRampToValueAtTime(Math.max(38, d.freq * 0.5), time + 0.09);
  const bodyG = ctx.createGain();
  bodyG.gain.setValueAtTime(0.9, time);
  body.connect(bodyG);
  bodyG.connect(out);

  const slap = ctx.createOscillator();
  slap.type = 'triangle';
  slap.frequency.setValueAtTime(240, time);
  slap.frequency.exponentialRampToValueAtTime(85, time + 0.028);
  const slapG = ctx.createGain();
  slapG.gain.setValueAtTime(0.42, time);
  slapG.gain.exponentialRampToValueAtTime(0.0001, time + 0.04);
  slap.connect(slapG);
  slapG.connect(out);

  burstNoise(ctx, time, 0.022, 900, 1.8, 0.18 * mixGain * (0.5 + d.noise), out);

  body.start(time);
  body.stop(time + total + 0.02);
  slap.start(time);
  slap.stop(time + 0.05);
}

/** Timbal â€” schel + rim, Colombiaanse backbeat. */
export function voiceTimbal(host: VoiceSynthHost, time: number, mixGain: number, sceneIdx: number) {
  if (!host.ctx) return;
  const ctx = host.ctx;
  const d = resolveDrum(host.project, 'snare', sceneIdx);
  const total = Math.max(0.06, d.dur);
  const master = host.trackOut('snare');
  const out = ctx.createGain();
  applyDrumEnvelope(out, time, 0.001, d.decay, 0.28 * mixGain, total);
  out.connect(master);

  const shell = ctx.createOscillator();
  shell.type = 'sine';
  shell.frequency.setValueAtTime(Math.max(180, d.freq + d.pitch), time);
  shell.frequency.exponentialRampToValueAtTime(Math.max(90, d.freq * 0.65), time + 0.06);
  const shellG = ctx.createGain();
  shellG.gain.setValueAtTime(0.55, time);
  shell.connect(shellG);
  shellG.connect(out);

  const ring = ctx.createOscillator();
  ring.type = 'triangle';
  ring.frequency.setValueAtTime(820, time);
  const ringG = ctx.createGain();
  ringG.gain.setValueAtTime(0.22, time);
  ringG.gain.exponentialRampToValueAtTime(0.0001, time + 0.045);
  ring.connect(ringG);
  ringG.connect(out);

  burstNoise(ctx, time, total * 0.75, 1400, 2.2, 0.38 * mixGain * d.noise, out, 'bandpass');

  shell.start(time);
  shell.stop(time + total + 0.02);
  ring.start(time);
  ring.stop(time + 0.06);
}

/** GÃ¼iro â€” geschuurde ritmische textuur. */
export function voiceGuiro(host: VoiceSynthHost, time: number, mixGain: number, sceneIdx: number) {
  if (!host.ctx) return;
  const ctx = host.ctx;
  const d = resolveDrum(host.project, 'hihat', sceneIdx);
  const total = Math.max(0.04, d.dur);
  const master = host.trackOut('hihat');
  const scrapes = 7;
  for (let s = 0; s < scrapes; s += 1) {
    const t0 = time + s * 0.0028;
    const len = Math.ceil(ctx.sampleRate * total * 0.42);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i += 1) {
      const env = 1 - i / len;
      data[i] = (Math.random() * 2 - 1) * env * env * env;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    const bpf = ctx.createBiquadFilter();
    bpf.type = 'bandpass';
    bpf.frequency.setValueAtTime(1800 + s * 420 + d.filter * 0.15, t0);
    bpf.Q.setValueAtTime(1.2 + s * 0.08, t0);
    const g = ctx.createGain();
    const peak = 0.11 * mixGain * d.noise * (0.55 + s * 0.07);
    g.gain.setValueAtTime(peak, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + total * 0.65);
    noise.connect(bpf);
    bpf.connect(g);
    g.connect(master);
    noise.start(t0);
    noise.stop(t0 + total);
  }
}

/** Maracas â€” korrelige shaker-burst. */
export function voiceMaracas(host: VoiceSynthHost, time: number, mixGain: number, sceneIdx: number) {
  if (!host.ctx) return;
  const ctx = host.ctx;
  const d = resolveDrum(host.project, 'mc', sceneIdx);
  const total = Math.max(0.03, d.dur);
  const master = host.trackOut('mc');
  const grains = 8;
  for (let g = 0; g < grains; g += 1) {
    const t0 = time + g * 0.0016 + Math.random() * 0.001;
    const len = Math.ceil(ctx.sampleRate * 0.018);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i += 1) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    const hpf = ctx.createBiquadFilter();
    hpf.type = 'highpass';
    hpf.frequency.setValueAtTime(2200 + g * 180, t0);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.09 * mixGain * d.noise * (0.7 + Math.random() * 0.35), t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.022);
    noise.connect(hpf);
    hpf.connect(gain);
    gain.connect(master);
    noise.start(t0);
    noise.stop(t0 + 0.03);
  }
  void total;
}

/** Contrabajo â€” pizzicato bas met hout-klik. */
