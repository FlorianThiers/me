import { midiToHz } from '../../midi';
import { stepDurationSec } from '../../types';
import { applyAdsr, applyAdsrHold, applyDrumEnvelope } from '../fx/envelopes';
import { burstNoise } from '../fx/noise';
import type { HeldVoice, VoiceSynthHost } from '../types';
import { resolveAnalog, resolveBrass, resolveDrum, resolveGuitar, resolveWavetable } from './resolvers';

export function voiceTimpani(host: VoiceSynthHost, time: number, mixGain: number, sceneIdx: number) {
  if (!host.ctx) return;
  const ctx = host.ctx;
  const d = resolveDrum(host.project, 'kick', sceneIdx);
  const total = Math.max(0.35, d.dur);
  const master = host.trackOut('kick');
  const out = ctx.createGain();
  applyDrumEnvelope(out, time, 0.004, d.decay, 0.4 * mixGain, total);
  out.connect(master);

  const body = ctx.createOscillator();
  body.type = 'sine';
  const f0 = Math.max(55, d.freq + d.pitch * 0.3);
  body.frequency.setValueAtTime(f0 * 1.08, time);
  body.frequency.exponentialRampToValueAtTime(f0, time + 0.08);
  body.connect(out);
  body.start(time);
  body.stop(time + total);

  burstNoise(ctx, time, 0.03, 400, 1.2, 0.12 * d.noise * mixGain, out, 'bandpass');
}

export function voiceWoodblock(host: VoiceSynthHost, time: number, mixGain: number, sceneIdx: number) {
  if (!host.ctx) return;
  const ctx = host.ctx;
  const d = resolveDrum(host.project, 'snare', sceneIdx);
  const total = Math.max(0.06, d.dur * 0.6);
  const master = host.trackOut('snare');
  const out = ctx.createGain();
  applyDrumEnvelope(out, time, 0.001, d.decay, 0.3 * mixGain, total);
  out.connect(master);

  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(Math.max(400, d.freq * 2.2), time);
  osc.frequency.exponentialRampToValueAtTime(Math.max(280, d.freq * 1.4), time + 0.03);
  osc.connect(out);
  osc.start(time);
  osc.stop(time + total);
  burstNoise(ctx, time, 0.015, 2500, 2, 0.15 * mixGain, out, 'bandpass');
}

export function voiceTriangle(host: VoiceSynthHost, time: number, mixGain: number, sceneIdx: number) {
  if (!host.ctx) return;
  const ctx = host.ctx;
  const d = resolveDrum(host.project, 'hihat', sceneIdx);
  const total = Math.max(0.2, d.dur * 3);
  const master = host.trackOut('hihat');
  const out = ctx.createGain();
  applyDrumEnvelope(out, time, 0.001, Math.max(0.15, d.decay), 0.22 * mixGain, total);
  out.connect(master);

  for (const ratio of [1, 2.76, 5.4]) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(Math.max(1200, d.filter * 0.4) * ratio, time);
    const g = ctx.createGain();
    g.gain.setValueAtTime(ratio === 1 ? 0.4 : 0.15, time);
    g.gain.exponentialRampToValueAtTime(0.0001, time + total);
    osc.connect(g);
    g.connect(out);
    osc.start(time);
    osc.stop(time + total + 0.02);
  }
}

export function voiceSoftCymbal(host: VoiceSynthHost, time: number, mixGain: number, sceneIdx: number) {
  if (!host.ctx) return;
  const ctx = host.ctx;
  const d = resolveDrum(host.project, 'mc', sceneIdx);
  const total = Math.max(0.5, d.dur * 3);
  const master = host.trackOut('mc');
  const out = ctx.createGain();
  applyDrumEnvelope(out, time, 0.01, Math.max(0.35, d.decay), 0.2 * mixGain, total);
  out.connect(master);
  burstNoise(ctx, time, total * 0.9, Math.max(4000, d.filter), 0.4, 0.35 * d.noise * mixGain, out, 'highpass');
}

export function voiceCelloBass(host: VoiceSynthHost, 
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
      ? Math.max(0.15, lengthSteps * stepDur * 0.95)
      : Math.max(0.2, d.dur);
  const master = host.trackOut('bass');
  const hz = midi != null ? midiToHz(midi) : Math.max(40, d.freq);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(Math.max(180, d.filter * 1.8), time);
  filter.frequency.exponentialRampToValueAtTime(Math.max(100, d.filter), time + 0.12);
  filter.Q.setValueAtTime(0.9, time);
  filter.connect(master);

  const out = ctx.createGain();
  applyAdsr(
    out,
    time,
    { attack: 0.02, decay: 0.2, sustain: 0.55, release: 0.25 },
    0.32 * mixGain,
    total,
  );
  out.connect(filter);

  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(hz * 1.01, time);
  osc.frequency.exponentialRampToValueAtTime(hz, time + 0.04);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.55, time);
  osc.connect(g);
  g.connect(out);
  osc.start(time);
  osc.stop(time + total + 0.02);

  const warm = ctx.createOscillator();
  warm.type = 'sine';
  warm.frequency.setValueAtTime(hz, time);
  const warmG = ctx.createGain();
  warmG.gain.setValueAtTime(0.45, time);
  warm.connect(warmG);
  warmG.connect(out);
  warm.start(time);
  warm.stop(time + total + 0.02);

  burstNoise(ctx, time, 0.015, 500, 1, 0.08 * mixGain, filter, 'bandpass');
}

export function voiceGrandPiano(host: VoiceSynthHost, 
  time: number,
  mixGain: number,
  sceneIdx: number,
  midi?: number,
  lengthSteps?: number,
  hold = false,
): HeldVoice | void {
  if (!host.ctx) return;
  const ctx = host.ctx;
  const p = resolveWavetable(host.project, sceneIdx);
  const stepDur = stepDurationSec(host.project.bpm);
  const total =
    midi != null && lengthSteps
      ? Math.max(0.2, lengthSteps * stepDur + p.release * 1.4)
      : p.attack + p.decay + 0.4 + p.release;
  const master = host.trackOut('wt');
  const hz = midi != null ? midiToHz(midi) : p.pitch;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  const bright = Math.max(900, p.cutoff * (1.2 + p.filterEnv));
  filter.frequency.setValueAtTime(bright, time);
  filter.frequency.exponentialRampToValueAtTime(bright * 0.35, time + Math.max(0.2, total * 0.5));
  filter.Q.setValueAtTime(0.6, time);
  filter.connect(master);

  const out = ctx.createGain();
  const peak = 0.14 * p.amp * mixGain;
  const env = { attack: 0.004, decay: 0.35, sustain: 0.25, release: Math.max(0.2, p.release) };
  if (hold) applyAdsrHold(out, time, env, peak);
  else applyAdsr(out, time, env, peak, total);
  out.connect(filter);

  const oscs: OscillatorNode[] = [];
  // Hammered partials: fundamental + soft harmonics
  for (const [ratio, amp, type] of [
    [1, 0.55, 'triangle'],
    [2, 0.22, 'sine'],
    [3, 0.1, 'sine'],
    [4.02, 0.06, 'sine'],
  ] as const) {
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(hz * ratio * 1.01, time);
    osc.frequency.exponentialRampToValueAtTime(hz * ratio, time + 0.02);
    const g = ctx.createGain();
    g.gain.setValueAtTime(amp, time);
    osc.connect(g);
    g.connect(out);
    osc.start(time);
    if (!hold) osc.stop(time + total + 0.05);
    oscs.push(osc);
  }

  burstNoise(ctx, time, 0.012, 1800, 1.2, 0.08 * mixGain, filter, 'bandpass');
  if (hold) return { gain: out, oscs, release: env.release };
}

export function voiceViolin(host: VoiceSynthHost, 
  time: number,
  mixGain: number,
  sceneIdx: number,
  midi?: number,
  lengthSteps?: number,
  hold = false,
): HeldVoice | void {
  if (!host.ctx) return;
  const ctx = host.ctx;
  const p = resolveAnalog(host.project, sceneIdx);
  const stepDur = stepDurationSec(host.project.bpm);
  const total =
    midi != null && lengthSteps
      ? Math.max(0.15, lengthSteps * stepDur + p.release)
      : p.attack + p.decay + 0.25 + p.release;
  const master = host.trackOut('an');
  const hz = midi != null ? midiToHz(midi) : p.pitch;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(Math.max(500, p.cutoff), time);
  filter.Q.setValueAtTime(1.5 + p.res * 4, time);
  filter.connect(master);

  const out = ctx.createGain();
  const peak = 0.1 * p.amp * mixGain;
  const env = { attack: Math.max(0.04, p.attack), decay: p.decay, sustain: 0.7, release: p.release };
  if (hold) applyAdsrHold(out, time, env, peak);
  else applyAdsr(out, time, env, peak, total);
  out.connect(filter);

  const oscs: OscillatorNode[] = [];
  for (const det of [-4, 0, 5]) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(hz, time);
    osc.detune.setValueAtTime(det, time);
    const g = ctx.createGain();
    g.gain.setValueAtTime(det === 0 ? 0.5 : 0.22, time);
    osc.connect(g);
    g.connect(out);
    osc.start(time);
    if (!hold) osc.stop(time + total + 0.02);
    oscs.push(osc);
  }

  const vibrato = ctx.createOscillator();
  vibrato.type = 'sine';
  vibrato.frequency.setValueAtTime(5.2, time);
  const vibG = ctx.createGain();
  vibG.gain.setValueAtTime(hz * 0.004, time);
  vibrato.connect(vibG);
  for (const osc of oscs) vibG.connect(osc.frequency);
  vibrato.start(time);
  if (!hold) vibrato.stop(time + total + 0.02);
  oscs.push(vibrato);

  if (hold) return { gain: out, oscs, release: env.release };
}

export function voiceClarinet(host: VoiceSynthHost, 
  time: number,
  mixGain: number,
  sceneIdx: number,
  midi?: number,
  lengthSteps?: number,
  hold = false,
): HeldVoice | void {
  if (!host.ctx) return;
  const ctx = host.ctx;
  const p = resolveBrass(host.project, sceneIdx);
  const stepDur = stepDurationSec(host.project.bpm);
  const total =
    midi != null && lengthSteps
      ? Math.max(0.12, lengthSteps * stepDur + p.release)
      : p.attack + p.decay + 0.2 + p.release;
  const master = host.trackOut('tp');
  const hz = midi != null ? midiToHz(midi) : p.pitch;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(Math.max(700, p.cutoff), time);
  filter.Q.setValueAtTime(0.8 + p.res * 2, time);
  filter.connect(master);

  const out = ctx.createGain();
  const peak = 0.1 * p.amp * mixGain;
  const env = { attack: Math.max(0.03, p.attack), decay: p.decay, sustain: 0.65, release: p.release };
  if (hold) applyAdsrHold(out, time, env, peak);
  else applyAdsr(out, time, env, peak, total);
  out.connect(filter);

  const oscs: OscillatorNode[] = [];
  // Odd harmonics = clarinet-ish
  for (const [ratio, amp] of [
    [1, 0.55],
    [3, 0.22],
    [5, 0.1],
  ] as const) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(hz * ratio, time);
    const g = ctx.createGain();
    g.gain.setValueAtTime(amp, time);
    osc.connect(g);
    g.connect(out);
    osc.start(time);
    if (!hold) osc.stop(time + total + 0.02);
    oscs.push(osc);
  }
  if (hold) return { gain: out, oscs, release: env.release };
}

export function voiceHarp(host: VoiceSynthHost, 
  time: number,
  mixGain: number,
  sceneIdx: number,
  midi?: number,
  lengthSteps?: number,
) {
  if (!host.ctx) return;
  const ctx = host.ctx;
  const p = resolveGuitar(host.project, sceneIdx);
  const stepDur = stepDurationSec(host.project.bpm);
  const total =
    midi != null && lengthSteps
      ? Math.max(0.2, lengthSteps * stepDur + p.release)
      : p.attack + p.decay + 0.5 + p.release;
  const master = host.trackOut('rg');
  const hz = midi != null ? midiToHz(midi) : p.pitch;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(Math.max(1200, p.cutoff * (1.5 + p.filterEnv)), time);
  filter.frequency.exponentialRampToValueAtTime(p.cutoff * 0.3, time + total * 0.55);
  filter.Q.setValueAtTime(0.7, time);
  filter.connect(master);

  const out = ctx.createGain();
  applyAdsr(out, time, { attack: 0.002, decay: 0.45, sustain: 0.15, release: 0.4 }, 0.12 * p.amp * mixGain, total);
  out.connect(filter);

  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(hz * 1.02, time);
  osc.frequency.exponentialRampToValueAtTime(hz, time + 0.015);
  osc.connect(out);
  osc.start(time);
  osc.stop(time + total + 0.02);

  burstNoise(ctx, time, 0.008, 2200, 1.4, 0.1 * mixGain, filter, 'bandpass');
}
