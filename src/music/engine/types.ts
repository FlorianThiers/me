import type { BeatInfo, DrumId, MusicProject, TrackId } from '../types';

export type EngineOpts = {
  onBeat: (info: BeatInfo) => void;
  onStop: () => void;
};

export type HeldVoice = {
  gain: GainNode;
  oscs: OscillatorNode[];
  release: number;
};

export type PercId = Exclude<DrumId, 'bass'>;

/** Minimal surface synth/voice modules need from the engine instance. */
export type VoiceSynthHost = {
  readonly ctx: AudioContext | null;
  readonly project: MusicProject;
  trackOut(id: TrackId): AudioNode;
};
