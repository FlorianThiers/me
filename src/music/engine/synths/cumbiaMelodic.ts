import { midiToHz } from '../../midi';
import { stepDurationSec } from '../../types';
import { applyAdsr, applyAdsrHold } from '../fx/envelopes';
import { burstNoise } from '../fx/noise';
import type { HeldVoice, VoiceSynthHost } from '../types';
import { resolveBrass, resolveWavetable } from './resolvers';
import { voicePluckedString } from './plucked';

export function voiceAcordeon(host: VoiceSynthHost, 
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
  const hz = midi != null ? midiToHz(midi) : p.pitch;
  const voices = Math.max(2, Math.min(4, Math.round(p.unison)));

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  const fBase = Math.max(120, p.cutoff);
  filter.frequency.setValueAtTime(fBase * (1 + p.filterEnv * 1.8), time);
  filter.frequency.exponentialRampToValueAtTime(fBase, time + p.attack + p.decay);
  filter.Q.setValueAtTime(0.4 + p.res * 5, time);

  const out = ctx.createGain();
  const peak = (0.11 * p.amp * mixGain) / Math.sqrt(voices);
  if (hold) applyAdsrHold(out, time, p, peak);
  else applyAdsr(out, time, p, peak, total);

  const tremGain = ctx.createGain();
  tremGain.gain.setValueAtTime(0.82, time);
  filter.connect(tremGain);
  tremGain.connect(out);
  out.connect(master);

  const oscs: OscillatorNode[] = [];
  const trem = ctx.createOscillator();
  trem.type = 'sine';
  trem.frequency.setValueAtTime(6.2 + p.lfoRate * 0.15, time);
  const tremDepth = ctx.createGain();
  tremDepth.gain.setValueAtTime(0.18 + p.lfoDepth * 0.35, time);
  trem.connect(tremDepth);
  tremDepth.connect(tremGain.gain);
  trem.start(time);
  if (!hold) trem.stop(time + total + 0.02);
  oscs.push(trem);

  for (let i = 0; i < voices; i += 1) {
    const osc = ctx.createOscillator();
    osc.type = i === 0 ? 'square' : 'triangle';
    const det = (i - (voices - 1) / 2) * 11;
    osc.frequency.setValueAtTime(hz, time);
    osc.detune.setValueAtTime(det, time);
    const reed = ctx.createGain();
    reed.gain.setValueAtTime(i === 0 ? 0.55 : 0.38, time);
    osc.connect(reed);
    reed.connect(filter);
    osc.start(time);
    if (!hold) osc.stop(time + total + 0.02);
    oscs.push(osc);

    if (midi != null) {
      const vib = ctx.createOscillator();
      vib.type = 'sine';
      vib.frequency.setValueAtTime(5.8, time);
      const vibG = ctx.createGain();
      vibG.gain.setValueAtTime(6, time);
      vib.connect(vibG);
      vibG.connect(osc.detune);
      vib.start(time);
      if (!hold) vib.stop(time + total + 0.02);
      oscs.push(vib);
    }
  }

  burstNoise(ctx, time, 0.035, 400, 0.8, 0.012 * mixGain, filter, 'highpass');
  if (hold) return { gain: out, oscs, release: p.release };
}

/** Bajo sexto â€” getokkelde nylon snaar. */
export function voiceBajoSexto(host: VoiceSynthHost, 
  time: number,
  mixGain: number,
  sceneIdx: number,
  midi?: number,
  lengthSteps?: number,
) {
  voicePluckedString(host, 'an', time, mixGain, sceneIdx, midi, lengthSteps, {
    brightness: 1.1,
    pluckMs: 0.008,
    bodyHz: 180,
  });
}

/** Requinto â€” heldere lead-gitaar. */
export function voiceRequinto(host: VoiceSynthHost, 
  time: number,
  mixGain: number,
  sceneIdx: number,
  midi?: number,
  lengthSteps?: number,
) {
  voicePluckedString(host, 'rg', time, mixGain, sceneIdx, midi, lengthSteps, {
    brightness: 1.55,
    pluckMs: 0.004,
    bodyHz: 320,
  });
}


/** Trompeta — brass met scoop + harmonischen. */
export function voiceTrompeta(
  host: VoiceSynthHost,
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
  const voices = Math.max(1, Math.min(3, Math.round(p.unison)));

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  const fBase = Math.max(200, p.cutoff);
  filter.frequency.setValueAtTime(fBase * (1 + p.filterEnv * 2.5), time);
  filter.frequency.exponentialRampToValueAtTime(fBase, time + p.attack + p.decay);
  filter.Q.setValueAtTime(0.55 + p.res * 6, time);

  const out = ctx.createGain();
  const peak = (0.09 * p.amp * mixGain) / Math.sqrt(voices);
  if (hold) applyAdsrHold(out, time, p, peak);
  else applyAdsr(out, time, p, peak, total);
  filter.connect(out);
  out.connect(master);

  const oscs: OscillatorNode[] = [];
  for (let i = 0; i < voices; i += 1) {
    const osc = ctx.createOscillator();
    osc.type = i === 0 ? 'sawtooth' : 'square';
    osc.frequency.setValueAtTime(hz * (i === 0 ? 1 : 2.01), time);
    if (midi != null) {
      osc.frequency.setValueAtTime(hz * 0.97, time);
      osc.frequency.exponentialRampToValueAtTime(hz * 1.02, time + 0.05);
      osc.frequency.exponentialRampToValueAtTime(hz, time + 0.12);
    }
    osc.detune.setValueAtTime((i - 1) * 7, time);
    const g = ctx.createGain();
    g.gain.setValueAtTime(i === 0 ? 0.7 : 0.22, time);
    osc.connect(g);
    g.connect(filter);
    osc.start(time);
    if (!hold) osc.stop(time + total + 0.02);
    oscs.push(osc);
  }

  burstNoise(ctx, time, 0.025, 1200, 1.5, 0.04 * mixGain, filter, 'bandpass');
  if (hold) return { gain: out, oscs, release: p.release };
}
