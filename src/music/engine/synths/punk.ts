import { midiToHz } from '../../midi';
import { stepDurationSec } from '../../types';
import { applyAdsr, applyAdsrHold, applyDrumEnvelope } from '../fx/envelopes';
import { makeDriveCurve } from '../fx/curves';
import { burstNoise } from '../fx/noise';
import type { HeldVoice, VoiceSynthHost } from '../types';
import { resolveAnalog, resolveBrass, resolveDrum, resolveGuitar, resolveWavetable } from './resolvers';

export function voicePunkKick(host: VoiceSynthHost, time: number, mixGain: number, sceneIdx: number) {
  if (!host.ctx) return;
  const ctx = host.ctx;
  const d = resolveDrum(host.project, 'kick', sceneIdx);
  const total = Math.max(0.12, d.dur);
  const master = host.trackOut('kick');
  const out = ctx.createGain();
  applyDrumEnvelope(out, time, 0.001, d.decay, 0.55 * mixGain, total);
  out.connect(master);

  const body = ctx.createOscillator();
  body.type = 'sine';
  const f0 = Math.max(80, d.freq + d.pitch);
  body.frequency.setValueAtTime(f0, time);
  body.frequency.exponentialRampToValueAtTime(Math.max(42, d.freq * 0.65), time + 0.06);
  body.connect(out);
  body.start(time);
  body.stop(time + total);

  const click = ctx.createOscillator();
  click.type = 'triangle';
  click.frequency.setValueAtTime(160, time);
  click.frequency.exponentialRampToValueAtTime(50, time + 0.02);
  const clickG = ctx.createGain();
  clickG.gain.setValueAtTime(0.25, time);
  clickG.gain.exponentialRampToValueAtTime(0.0001, time + 0.025);
  click.connect(clickG);
  clickG.connect(out);
  click.start(time);
  click.stop(time + 0.03);
  burstNoise(ctx, time, 0.008, 2500, 0.6, 0.08 * d.noise * mixGain, out, 'highpass');
}

export function voicePunkSnare(host: VoiceSynthHost, time: number, mixGain: number, sceneIdx: number) {
  if (!host.ctx) return;
  const ctx = host.ctx;
  const d = resolveDrum(host.project, 'snare', sceneIdx);
  const total = Math.max(0.1, d.dur);
  const master = host.trackOut('snare');
  const out = ctx.createGain();
  applyDrumEnvelope(out, time, 0.001, d.decay, 0.48 * mixGain, total);
  out.connect(master);

  const shell = ctx.createOscillator();
  shell.type = 'triangle';
  shell.frequency.setValueAtTime(Math.max(160, d.freq), time);
  shell.frequency.exponentialRampToValueAtTime(110, time + 0.05);
  const shellG = ctx.createGain();
  shellG.gain.setValueAtTime(0.35, time);
  shellG.gain.exponentialRampToValueAtTime(0.0001, time + 0.08);
  shell.connect(shellG);
  shellG.connect(out);
  shell.start(time);
  shell.stop(time + 0.1);

  burstNoise(ctx, time, total * 0.85, Math.max(1800, d.filter), 1.6, 0.55 * d.noise * mixGain, out, 'bandpass');
  burstNoise(ctx, time, 0.04, 6000, 0.7, 0.22 * mixGain, out, 'highpass');
}

export function voicePunkHat(host: VoiceSynthHost, time: number, mixGain: number, sceneIdx: number) {
  if (!host.ctx) return;
  const ctx = host.ctx;
  const d = resolveDrum(host.project, 'hihat', sceneIdx);
  const total = Math.max(0.02, d.dur);
  const master = host.trackOut('hihat');
  const out = ctx.createGain();
  applyDrumEnvelope(out, time, 0.001, d.decay, 0.28 * mixGain, total);
  out.connect(master);
  burstNoise(ctx, time, total, Math.max(6000, d.filter), 0.5, 0.5 * d.noise * mixGain, out, 'highpass');
}

export function voicePunkCrash(host: VoiceSynthHost, time: number, mixGain: number, sceneIdx: number) {
  if (!host.ctx) return;
  const ctx = host.ctx;
  const d = resolveDrum(host.project, 'mc', sceneIdx);
  const total = Math.max(0.25, d.dur * 1.8);
  const master = host.trackOut('mc');
  const out = ctx.createGain();
  applyDrumEnvelope(out, time, 0.002, Math.max(0.2, d.decay), 0.32 * mixGain, total);
  out.connect(master);

  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.setValueAtTime(Math.max(2200, d.filter), time);
  bp.Q.setValueAtTime(0.8, time);
  bp.connect(out);

  for (const ratio of [1, 1.38, 1.72, 2.15, 2.9]) {
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(Math.max(300, d.freq) * ratio, time);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.1, time);
    g.gain.exponentialRampToValueAtTime(0.0001, time + total);
    osc.connect(g);
    g.connect(bp);
    osc.start(time);
    osc.stop(time + total + 0.02);
  }
  burstNoise(ctx, time, total * 0.7, 8000, 0.6, 0.35 * d.noise * mixGain, out, 'highpass');
}

export function voicePunkBass(host: VoiceSynthHost, 
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
      ? Math.max(0.08, lengthSteps * stepDur * 0.95)
      : Math.max(0.1, d.dur);
  const master = host.trackOut('bass');
  const hz = midi != null ? midiToHz(midi) : Math.max(40, d.freq);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(Math.max(200, d.filter * 2.2), time);
  filter.frequency.exponentialRampToValueAtTime(Math.max(120, d.filter), time + 0.05);
  filter.Q.setValueAtTime(1.2, time);
  filter.connect(master);

  const out = ctx.createGain();
  applyDrumEnvelope(out, time, 0.004, d.decay, 0.42 * mixGain, total);
  out.connect(filter);

  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(hz, time);
  osc.connect(out);
  osc.start(time);
  osc.stop(time + total + 0.02);

  const sub = ctx.createOscillator();
  sub.type = 'sine';
  sub.frequency.setValueAtTime(hz * 0.5, time);
  const subG = ctx.createGain();
  subG.gain.setValueAtTime(0.3 * mixGain, time);
  subG.gain.exponentialRampToValueAtTime(0.0001, time + total);
  sub.connect(subG);
  subG.connect(master);
  sub.start(time);
  sub.stop(time + total + 0.02);

  burstNoise(ctx, time, 0.008, 800, 1, 0.06 * mixGain, filter, 'bandpass');
}

export function voicePowerChord(host: VoiceSynthHost, 
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
      ? Math.max(0.1, lengthSteps * stepDur + p.release)
      : p.attack + p.decay + 0.15 + p.release;
  const master = host.trackOut('wt');
  const root = midi != null ? midiToHz(midi) : p.pitch;

  const drive = ctx.createWaveShaper();
  drive.curve = makeDriveCurve(0.55 + p.res * 0.3);
  drive.connect(master);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(Math.max(400, p.cutoff * (1 + p.filterEnv)), time);
  filter.frequency.exponentialRampToValueAtTime(Math.max(250, p.cutoff * 0.55), time + p.decay);
  filter.Q.setValueAtTime(0.8 + p.res * 3, time);
  filter.connect(drive);

  const out = ctx.createGain();
  const peak = 0.11 * p.amp * mixGain;
  if (hold) applyAdsrHold(out, time, p, peak);
  else applyAdsr(out, time, p, peak, total);
  out.connect(filter);

  const oscs: OscillatorNode[] = [];
  // Power chord: root + fifth (+ octave)
  for (const [ratio, amp, det] of [
    [1, 0.55, -7],
    [1, 0.5, 7],
    [1.498, 0.42, -5],
    [1.498, 0.38, 5],
    [2, 0.28, 0],
  ] as const) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(root * ratio, time);
    osc.detune.setValueAtTime(det, time);
    const g = ctx.createGain();
    g.gain.setValueAtTime(amp, time);
    osc.connect(g);
    g.connect(out);
    osc.start(time);
    if (!hold) osc.stop(time + total + 0.02);
    oscs.push(osc);
  }
  if (hold) return { gain: out, oscs, release: p.release };
}

export function voicePalmMute(host: VoiceSynthHost, 
  time: number,
  mixGain: number,
  sceneIdx: number,
  midi?: number,
  lengthSteps?: number,
) {
  if (!host.ctx) return;
  const ctx = host.ctx;
  const p = resolveAnalog(host.project, sceneIdx);
  const stepDur = stepDurationSec(host.project.bpm);
  const total =
    midi != null && lengthSteps
      ? Math.max(0.04, lengthSteps * stepDur * 0.55)
      : Math.max(0.05, p.attack + p.decay * 0.6);
  const master = host.trackOut('an');
  const hz = midi != null ? midiToHz(midi) : p.pitch;

  const drive = ctx.createWaveShaper();
  drive.curve = makeDriveCurve(0.4);
  drive.connect(master);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(Math.max(500, p.cutoff * 1.2), time);
  filter.frequency.exponentialRampToValueAtTime(180, time + Math.min(0.08, total));
  filter.Q.setValueAtTime(2 + p.res * 4, time);
  filter.connect(drive);

  const out = ctx.createGain();
  applyAdsr(out, time, { ...p, sustain: 0.05, release: 0.04 }, 0.12 * p.amp * mixGain, total);
  out.connect(filter);

  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(hz, time);
  osc.connect(out);
  osc.start(time);
  osc.stop(time + total + 0.02);

  burstNoise(ctx, time, 0.012, 1200, 1.5, 0.1 * mixGain, filter, 'bandpass');
}

export function voicePunkLead(host: VoiceSynthHost, 
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
      ? Math.max(0.08, lengthSteps * stepDur + p.release)
      : p.attack + p.decay + 0.12 + p.release;
  const master = host.trackOut('tp');
  const hz = midi != null ? midiToHz(midi) : p.pitch;

  const drive = ctx.createWaveShaper();
  drive.curve = makeDriveCurve(0.35);
  drive.connect(master);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(Math.max(800, p.cutoff * (1 + p.filterEnv)), time);
  filter.Q.setValueAtTime(1 + p.res * 4, time);
  filter.connect(drive);

  const out = ctx.createGain();
  const peak = 0.1 * p.amp * mixGain;
  if (hold) applyAdsrHold(out, time, p, peak);
  else applyAdsr(out, time, p, peak, total);
  out.connect(filter);

  const oscs: OscillatorNode[] = [];
  for (const det of [-8, 0, 9]) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(hz, time);
    osc.detune.setValueAtTime(det, time);
    const g = ctx.createGain();
    g.gain.setValueAtTime(det === 0 ? 0.55 : 0.28, time);
    osc.connect(g);
    g.connect(out);
    osc.start(time);
    if (!hold) osc.stop(time + total + 0.02);
    oscs.push(osc);
  }

  const lfo = ctx.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.setValueAtTime(5.5 + p.lfoRate * 0.2, time);
  const lfoG = ctx.createGain();
  lfoG.gain.setValueAtTime(hz * 0.008 * (0.4 + p.lfoDepth), time);
  lfo.connect(lfoG);
  for (const osc of oscs) lfoG.connect(osc.frequency);
  lfo.start(time);
  if (!hold) lfo.stop(time + total + 0.02);
  oscs.push(lfo);

  if (hold) return { gain: out, oscs, release: p.release };
}

export function voiceOctaveFill(host: VoiceSynthHost, 
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
      ? Math.max(0.05, lengthSteps * stepDur * 0.8)
      : p.attack + p.decay + p.release;
  const master = host.trackOut('rg');
  const hz = midi != null ? midiToHz(midi) : p.pitch;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(Math.max(600, p.cutoff * (1 + p.filterEnv)), time);
  filter.frequency.exponentialRampToValueAtTime(p.cutoff * 0.4, time + total * 0.6);
  filter.Q.setValueAtTime(0.8 + p.res * 3, time);
  filter.connect(master);

  const out = ctx.createGain();
  applyAdsr(out, time, p, 0.1 * p.amp * mixGain, total);
  out.connect(filter);

  for (const ratio of [1, 2]) {
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(hz * ratio, time);
    const g = ctx.createGain();
    g.gain.setValueAtTime(ratio === 1 ? 0.55 : 0.35, time);
    osc.connect(g);
    g.connect(out);
    osc.start(time);
    osc.stop(time + total + 0.02);
  }
}

// ── Classical / Constantini-style dance ─────────────────────────────

