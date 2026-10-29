import { midiToHz } from '../../midi';
import { stepDurationSec } from '../../types';
import { applyAdsr, applyAdsrHold, applyDrumEnvelope } from '../fx/envelopes';
import { makeDriveCurve } from '../fx/curves';
import { burstNoise } from '../fx/noise';
import type { HeldVoice, VoiceSynthHost } from '../types';
import { resolveAnalog, resolveBrass, resolveDrum, resolveGuitar, resolveWavetable } from './resolvers';

export function voiceHardKick(host: VoiceSynthHost, time: number, mixGain: number, sceneIdx: number) {
  if (!host.ctx) return;
  const ctx = host.ctx;
  const d = resolveDrum(host.project, 'kick', sceneIdx);
  const total = Math.max(0.14, Math.min(0.45, d.dur));
  const master = host.trackOut('kick');
  const peak = 0.62 * mixGain;

  const drive = ctx.createWaveShaper();
  drive.curve = makeDriveCurve(0.35 + d.drive * 0.65);
  drive.oversample = '2x';
  drive.connect(master);

  const out = ctx.createGain();
  applyDrumEnvelope(out, time, 0.001, Math.max(0.12, d.decay), peak, total);
  out.connect(drive);

  const sub = ctx.createOscillator();
  sub.type = 'sine';
  const fStart = Math.max(90, d.freq + d.pitch * 1.4);
  const fEnd = Math.max(38, d.freq * 0.72);
  sub.frequency.setValueAtTime(fStart, time);
  sub.frequency.exponentialRampToValueAtTime(fEnd, time + 0.085);
  const subG = ctx.createGain();
  subG.gain.setValueAtTime(1, time);
  subG.gain.exponentialRampToValueAtTime(0.0001, time + total);
  sub.connect(subG);
  subG.connect(out);
  sub.start(time);
  sub.stop(time + total + 0.02);

  const mid = ctx.createOscillator();
  mid.type = 'triangle';
  mid.frequency.setValueAtTime(Math.max(110, d.filter * 1.1), time);
  mid.frequency.exponentialRampToValueAtTime(55, time + 0.045);
  const midG = ctx.createGain();
  midG.gain.setValueAtTime(0.42, time);
  midG.gain.exponentialRampToValueAtTime(0.0001, time + 0.09);
  mid.connect(midG);
  midG.connect(out);
  mid.start(time);
  mid.stop(time + 0.1);

  const click = ctx.createOscillator();
  click.type = 'square';
  click.frequency.setValueAtTime(220, time);
  click.frequency.exponentialRampToValueAtTime(55, time + 0.018);
  const clickG = ctx.createGain();
  clickG.gain.setValueAtTime(0.22 + d.drive * 0.2, time);
  clickG.gain.exponentialRampToValueAtTime(0.0001, time + 0.022);
  click.connect(clickG);
  clickG.connect(out);
  click.start(time);
  click.stop(time + 0.03);

  burstNoise(ctx, time, 0.01, 2200, 0.7, 0.1 * d.noise * mixGain, out, 'highpass');
}

/** Layered warehouse clap — staggered noise + short body. */
export function voiceClap(host: VoiceSynthHost, time: number, mixGain: number, sceneIdx: number) {
  if (!host.ctx) return;
  const ctx = host.ctx;
  const d = resolveDrum(host.project, 'snare', sceneIdx);
  const total = Math.max(0.1, d.dur);
  const master = host.trackOut('snare');

  const hpf = ctx.createBiquadFilter();
  hpf.type = 'highpass';
  hpf.frequency.setValueAtTime(280, time);
  hpf.connect(master);

  const out = ctx.createGain();
  applyDrumEnvelope(out, time, 0.001, Math.max(0.08, d.decay), 0.5 * mixGain, total);
  out.connect(hpf);

  const center = Math.max(900, d.filter);
  for (const [offset, amp, q] of [
    [0, 0.55, 1.1],
    [0.011, 0.48, 1.3],
    [0.023, 0.38, 1.6],
    [0.038, 0.22, 0.9],
  ] as const) {
    burstNoise(
      ctx,
      time + offset,
      0.055,
      center * (0.85 + offset * 4),
      q,
      amp * d.noise * mixGain,
      out,
      'bandpass',
    );
  }

  const body = ctx.createOscillator();
  body.type = 'triangle';
  body.frequency.setValueAtTime(Math.max(140, d.freq), time);
  body.frequency.exponentialRampToValueAtTime(90, time + 0.06);
  const bodyG = ctx.createGain();
  bodyG.gain.setValueAtTime(0.14 * mixGain, time);
  bodyG.gain.exponentialRampToValueAtTime(0.0001, time + 0.09);
  body.connect(bodyG);
  bodyG.connect(out);
  body.start(time);
  body.stop(time + 0.1);
}

/** Tight metallic closed hat — partials + bright noise. */
export function voiceClosedHat(host: VoiceSynthHost, time: number, mixGain: number, sceneIdx: number) {
  if (!host.ctx) return;
  const ctx = host.ctx;
  const d = resolveDrum(host.project, 'hihat', sceneIdx);
  const total = Math.max(0.018, Math.min(0.08, d.dur));
  const master = host.trackOut('hihat');

  const hpf = ctx.createBiquadFilter();
  hpf.type = 'highpass';
  hpf.frequency.setValueAtTime(Math.max(5000, d.filter * 0.55), time);
  hpf.Q.setValueAtTime(0.7, time);
  hpf.connect(master);

  const out = ctx.createGain();
  applyDrumEnvelope(out, time, 0.001, Math.max(0.015, d.decay), 0.32 * mixGain, total);
  out.connect(hpf);

  const base = Math.max(400, d.freq);
  for (const [ratio, type, amp] of [
    [1, 'square', 0.18],
    [1.34, 'square', 0.12],
    [2.0, 'sawtooth', 0.1],
    [2.76, 'square', 0.08],
    [4.1, 'sawtooth', 0.06],
  ] as const) {
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(base * ratio, time);
    const g = ctx.createGain();
    g.gain.setValueAtTime(amp, time);
    g.gain.exponentialRampToValueAtTime(0.0001, time + total);
    osc.connect(g);
    g.connect(out);
    osc.start(time);
    osc.stop(time + total + 0.02);
  }

  burstNoise(
    ctx,
    time,
    total * 1.1,
    Math.max(7000, d.filter),
    0.55,
    0.45 * d.noise * mixGain,
    out,
    'highpass',
  );
}

/** Metallic open / ride scrap — dissonant ring + noise tail. */
export function voiceMetalOpen(host: VoiceSynthHost, time: number, mixGain: number, sceneIdx: number) {
  if (!host.ctx) return;
  const ctx = host.ctx;
  const d = resolveDrum(host.project, 'mc', sceneIdx);
  const total = Math.max(0.08, d.dur);
  const master = host.trackOut('mc');

  const out = ctx.createGain();
  applyDrumEnvelope(out, time, 0.001, Math.max(0.06, d.decay), 0.34 * mixGain, total);
  out.connect(master);

  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.setValueAtTime(Math.max(1800, d.filter), time);
  bp.frequency.exponentialRampToValueAtTime(Math.max(900, d.filter * 0.55), time + total * 0.8);
  bp.Q.setValueAtTime(3.5 + d.drive * 10, time);
  bp.connect(out);

  const base = Math.max(280, d.freq);
  for (const [ratio, amp] of [
    [1, 0.2],
    [1.41, 0.14],
    [1.73, 0.12],
    [2.15, 0.1],
    [2.91, 0.08],
    [3.61, 0.06],
  ] as const) {
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(base * ratio, time);
    const g = ctx.createGain();
    g.gain.setValueAtTime(amp, time);
    g.gain.exponentialRampToValueAtTime(0.0001, time + total);
    osc.connect(g);
    g.connect(bp);
    osc.start(time);
    osc.stop(time + total + 0.02);
  }

  burstNoise(ctx, time, total * 0.85, 6200, 1.1, 0.28 * d.noise * mixGain, out, 'highpass');
}

/** Resonant acid bass — 303-style filter scream + soft clip. */
export function voiceAcidBass(host: VoiceSynthHost, 
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
      ? Math.max(0.055, lengthSteps * stepDur * 0.97)
      : Math.max(0.07, d.dur);
  const master = host.trackOut('bass');
  const hz = midi != null ? midiToHz(midi) : Math.max(32, d.freq);

  const drive = ctx.createWaveShaper();
  drive.curve = makeDriveCurve(0.25 + d.drive * 0.7);
  drive.oversample = '2x';
  drive.connect(master);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  const fOpen = Math.max(280, d.filter * (3.2 + d.drive * 5));
  const fClosed = Math.max(70, d.filter * 0.35);
  filter.frequency.setValueAtTime(fOpen, time);
  filter.frequency.exponentialRampToValueAtTime(fClosed, time + Math.max(0.04, total * 0.55));
  filter.Q.setValueAtTime(10 + d.drive * 18, time);
  filter.connect(drive);

  const out = ctx.createGain();
  const peak = 0.4 * mixGain;
  out.gain.setValueAtTime(0.0001, time);
  out.gain.linearRampToValueAtTime(peak, time + Math.max(0.001, d.attack));
  out.gain.exponentialRampToValueAtTime(Math.max(0.0001, peak * 0.55), time + Math.max(0.03, d.decay));
  out.gain.exponentialRampToValueAtTime(0.0001, time + total);
  out.connect(filter);

  const osc = ctx.createOscillator();
  osc.type = d.type === 'square' ? 'square' : 'sawtooth';
  osc.frequency.setValueAtTime(hz * 0.92, time);
  osc.frequency.exponentialRampToValueAtTime(hz, time + 0.018);
  osc.connect(out);
  osc.start(time);
  osc.stop(time + total + 0.02);

  const sub = ctx.createOscillator();
  sub.type = 'sine';
  sub.frequency.setValueAtTime(hz * 0.5, time);
  const subG = ctx.createGain();
  subG.gain.setValueAtTime(0.28 * mixGain, time);
  subG.gain.exponentialRampToValueAtTime(0.0001, time + total);
  sub.connect(subG);
  subG.connect(master);
  sub.start(time);
  sub.stop(time + total + 0.02);
}

/** Mentasm / hoover — wide detuned saws + resonant scoop. */
export function voiceMentasm(host: VoiceSynthHost, 
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
      ? Math.max(0.08, lengthSteps * stepDur + p.release)
      : p.attack + p.decay + 0.12 + p.release;
  const master = host.trackOut('wt');
  const hz = midi != null ? midiToHz(midi) : p.pitch;
  const voices = Math.max(4, Math.min(8, Math.round(p.unison)));

  const drive = ctx.createWaveShaper();
  drive.curve = makeDriveCurve(0.45);
  drive.oversample = '2x';
  drive.connect(master);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  const fBase = Math.max(280, p.cutoff);
  filter.frequency.setValueAtTime(fBase * (1.4 + p.filterEnv * 2.6), time);
  filter.frequency.exponentialRampToValueAtTime(fBase * 0.4, time + p.attack + p.decay * 1.2);
  filter.Q.setValueAtTime(2.5 + p.res * 12, time);
  filter.connect(drive);

  const out = ctx.createGain();
  const peak = (0.1 * p.amp * mixGain) / Math.sqrt(voices);
  if (hold) applyAdsrHold(out, time, p, peak);
  else applyAdsr(out, time, p, peak, total);
  out.connect(filter);

  const oscs: OscillatorNode[] = [];
  const detuneSpread = 18 + p.lfoDepth * 28;
  for (let i = 0; i < voices; i += 1) {
    const osc = ctx.createOscillator();
    osc.type = i % 2 === 0 ? 'sawtooth' : 'square';
    const octave = i >= voices - 2 ? 2.004 : 1;
    osc.frequency.setValueAtTime(hz * octave * 1.06, time);
    osc.frequency.exponentialRampToValueAtTime(hz * octave, time + 0.05);
    osc.detune.setValueAtTime((i - (voices - 1) / 2) * detuneSpread, time);
    const g = ctx.createGain();
    g.gain.setValueAtTime(octave > 1 ? 0.22 : 0.5, time);
    osc.connect(g);
    g.connect(out);
    osc.start(time);
    if (!hold) osc.stop(time + total + 0.02);
    oscs.push(osc);
  }

  if (p.lfoRate > 0.05) {
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(Math.max(0.08, p.lfoRate), time);
    const lfoG = ctx.createGain();
    lfoG.gain.setValueAtTime(fBase * 0.45 * p.lfoDepth, time);
    lfo.connect(lfoG);
    lfoG.connect(filter.frequency);
    lfo.start(time);
    if (!hold) lfo.stop(time + total + 0.02);
    oscs.push(lfo);
  }

  if (hold) return { gain: out, oscs, release: p.release };
}

/** Short supersaw / rave stab — punchy + wide. */
export function voiceTeknoStab(host: VoiceSynthHost, 
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
      ? Math.max(0.045, lengthSteps * stepDur + p.release * 0.5)
      : Math.max(0.06, p.attack + p.decay + p.release);
  const master = host.trackOut('an');
  const hz = midi != null ? midiToHz(midi) : p.pitch;
  const voices = Math.max(3, Math.min(7, Math.round(p.unison)));

  const drive = ctx.createWaveShaper();
  drive.curve = makeDriveCurve(0.4);
  drive.connect(master);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  const fBase = Math.max(220, p.cutoff);
  filter.frequency.setValueAtTime(fBase * (1.2 + p.filterEnv * 3.5), time);
  filter.frequency.exponentialRampToValueAtTime(fBase * 0.22, time + Math.max(0.035, p.decay));
  filter.Q.setValueAtTime(1.2 + p.res * 9, time);
  filter.connect(drive);

  const out = ctx.createGain();
  applyAdsr(
    out,
    time,
    { ...p, sustain: p.sustain * 0.25, release: Math.min(p.release, 0.14) },
    (0.12 * p.amp * mixGain) / Math.sqrt(voices),
    total,
  );
  out.connect(filter);

  for (let i = 0; i < voices; i += 1) {
    const osc = ctx.createOscillator();
    osc.type = i % 3 === 0 ? 'square' : 'sawtooth';
    osc.frequency.setValueAtTime(hz * 1.04, time);
    osc.frequency.exponentialRampToValueAtTime(hz, time + 0.02);
    osc.detune.setValueAtTime((i - (voices - 1) / 2) * Math.max(10, p.detune), time);
    osc.connect(out);
    osc.start(time);
    osc.stop(time + total + 0.02);
  }

  burstNoise(ctx, time, 0.015, 1800, 1.2, 0.06 * mixGain, filter, 'bandpass');
}

/** Industrial screech — rising dissonance + vibrato. */
export function voiceScreech(host: VoiceSynthHost, 
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
  drive.curve = makeDriveCurve(0.55);
  drive.connect(master);

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  const f0 = Math.max(600, p.cutoff);
  filter.frequency.setValueAtTime(f0 * 0.7, time);
  filter.frequency.exponentialRampToValueAtTime(f0 * (1.1 + p.filterEnv * 0.6), time + total * 0.55);
  filter.Q.setValueAtTime(4 + p.res * 14, time);
  filter.connect(drive);

  const out = ctx.createGain();
  const peak = 0.13 * p.amp * mixGain;
  if (hold) applyAdsrHold(out, time, p, peak);
  else applyAdsr(out, time, p, peak, total);
  out.connect(filter);

  const oscs: OscillatorNode[] = [];
  for (const [ratio, amp, type] of [
    [1, 0.5, 'sawtooth'],
    [1.5, 0.28, 'square'],
    [2.01, 0.2, 'sawtooth'],
    [2.99, 0.12, 'square'],
  ] as const) {
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(hz * ratio * 0.9, time);
    osc.frequency.exponentialRampToValueAtTime(hz * ratio * 1.08, time + Math.min(0.2, total * 0.5));
    const g = ctx.createGain();
    g.gain.setValueAtTime(amp, time);
    osc.connect(g);
    g.connect(out);
    osc.start(time);
    if (!hold) osc.stop(time + total + 0.02);
    oscs.push(osc);
  }

  const lfo = ctx.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.setValueAtTime(Math.max(4.5, p.lfoRate), time);
  const lfoG = ctx.createGain();
  lfoG.gain.setValueAtTime(hz * 0.045 * (0.5 + p.lfoDepth), time);
  lfo.connect(lfoG);
  for (const osc of oscs) lfoG.connect(osc.frequency);
  lfo.start(time);
  if (!hold) lfo.stop(time + total + 0.02);
  oscs.push(lfo);

  burstNoise(ctx, time, 0.04, 3200, 1.8, 0.1 * mixGain, filter, 'bandpass');
  if (hold) return { gain: out, oscs, release: p.release };
}

/** Laser / zap — steep pitch fall + noise spark. */
export function voiceLaser(host: VoiceSynthHost, 
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
      ? Math.max(0.035, lengthSteps * stepDur * 0.65)
      : Math.max(0.045, p.attack + p.decay + 0.03);
  const master = host.trackOut('rg');
  const hz = midi != null ? midiToHz(midi) : p.pitch;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(Math.max(900, p.cutoff * (1.2 + p.filterEnv)), time);
  filter.frequency.exponentialRampToValueAtTime(Math.max(180, p.cutoff * 0.15), time + total);
  filter.Q.setValueAtTime(6 + p.res * 16, time);
  filter.connect(master);

  const out = ctx.createGain();
  applyAdsr(out, time, { ...p, sustain: 0.02, release: Math.min(p.release, 0.1) }, 0.16 * p.amp * mixGain, total);
  out.connect(filter);

  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(hz * 2.4, time);
  osc.frequency.exponentialRampToValueAtTime(Math.max(40, hz * 0.25), time + total);
  osc.connect(out);
  osc.start(time);
  osc.stop(time + total + 0.02);

  const osc2 = ctx.createOscillator();
  osc2.type = 'square';
  osc2.frequency.setValueAtTime(hz * 2.55, time);
  osc2.frequency.exponentialRampToValueAtTime(Math.max(50, hz * 0.3), time + total);
  const g2 = ctx.createGain();
  g2.gain.setValueAtTime(0.35, time);
  osc2.connect(g2);
  g2.connect(out);
  osc2.start(time);
  osc2.stop(time + total + 0.02);

  burstNoise(ctx, time, total * 0.9, 7500, 0.8, 0.28 * mixGain, filter, 'highpass');
}

// ── Pop-punk / Blink-182 voices ─────────────────────────────────────

