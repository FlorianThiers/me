import type { FxChain, TrackId } from './types';
import { TRACK_IDS } from './types';

export const DEFAULT_FX: FxChain = {
  hpf: 0,
  compThreshold: -20,
  compRatio: 3,
  presence: 0,
  reverbSend: 0,
  delaySend: 0,
};

export const VOCAL_FX_PRESET: FxChain = {
  hpf: 100,
  compThreshold: -22,
  compRatio: 4,
  presence: 0.4,
  reverbSend: 0.28,
  delaySend: 0.1,
};

export function defaultFxMap(): Record<TrackId, FxChain> {
  const fx = {} as Record<TrackId, FxChain>;
  for (const id of TRACK_IDS) {
    fx[id] = id === 'vox' ? { ...VOCAL_FX_PRESET } : { ...DEFAULT_FX };
  }
  return fx;
}

export type TrackBusNodes = {
  input: GainNode;
  hpf: BiquadFilterNode;
  comp: DynamicsCompressorNode;
  presence: BiquadFilterNode;
  fader: GainNode;
  panner: StereoPannerNode;
  reverbSend: GainNode;
  delaySend: GainNode;
};

export type ReturnBusNodes = {
  reverb: ConvolverNode;
  reverbGain: GainNode;
  delay: DelayNode;
  delayFb: GainNode;
  delayGain: GainNode;
};

function makeImpulse(ctx: AudioContext, seconds: number, decay: number): AudioBuffer {
  const len = Math.floor(ctx.sampleRate * seconds);
  const impulse = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch += 1) {
    const data = impulse.getChannelData(ch);
    for (let i = 0; i < len; i += 1) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
  }
  return impulse;
}

export function createReturnBuses(ctx: AudioContext, master: AudioNode): ReturnBusNodes {
  const reverb = ctx.createConvolver();
  reverb.buffer = makeImpulse(ctx, 1.35, 2.4);
  const reverbGain = ctx.createGain();
  reverbGain.gain.value = 0.62;
  reverb.connect(reverbGain);
  reverbGain.connect(master);

  const delay = ctx.createDelay(2);
  delay.delayTime.value = 0.32;
  const delayFb = ctx.createGain();
  delayFb.gain.value = 0.35;
  const delayGain = ctx.createGain();
  delayGain.gain.value = 0.45;
  delay.connect(delayFb);
  delayFb.connect(delay);
  delay.connect(delayGain);
  delayGain.connect(master);

  return { reverb, reverbGain, delay, delayFb, delayGain };
}

export function createTrackBus(
  ctx: AudioContext,
  master: AudioNode,
  returns: ReturnBusNodes,
): TrackBusNodes {
  const input = ctx.createGain();
  const hpf = ctx.createBiquadFilter();
  hpf.type = 'highpass';
  const comp = ctx.createDynamicsCompressor();
  const presence = ctx.createBiquadFilter();
  presence.type = 'peaking';
  presence.frequency.value = 3800;
  presence.Q.value = 0.9;
  const fader = ctx.createGain();
  const panner = ctx.createStereoPanner();
  const reverbSend = ctx.createGain();
  const delaySend = ctx.createGain();

  input.connect(hpf);
  hpf.connect(comp);
  comp.connect(presence);
  presence.connect(fader);
  fader.connect(panner);
  panner.connect(master);
  presence.connect(reverbSend);
  reverbSend.connect(returns.reverb);
  presence.connect(delaySend);
  delaySend.connect(returns.delay);

  return { input, hpf, comp, presence, fader, panner, reverbSend, delaySend };
}

export function applyFxToBus(
  bus: TrackBusNodes,
  fx: FxChain,
  mixGain: number,
  muted: boolean,
  pan = 0,
) {
  const hpfOn = fx.hpf > 20;
  bus.hpf.frequency.value = hpfOn ? fx.hpf : 20;
  bus.hpf.Q.value = 0.7;

  bus.comp.threshold.value = fx.compThreshold;
  bus.comp.ratio.value = Math.max(1, fx.compRatio);
  bus.comp.knee.value = 8;
  bus.comp.attack.value = 0.004;
  bus.comp.release.value = 0.12;

  const presDb = fx.presence * 12;
  bus.presence.gain.value = presDb;

  bus.fader.gain.value = muted ? 0 : Math.max(0, Math.min(1, mixGain));
  bus.panner.pan.value = Math.max(-1, Math.min(1, pan));
  bus.reverbSend.gain.value = Math.max(0, Math.min(1, fx.reverbSend));
  bus.delaySend.gain.value = Math.max(0, Math.min(1, fx.delaySend));
}
