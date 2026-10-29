export const TRACK_IDS = ['kick', 'snare', 'hihat', 'mc', 'bass', 'wt', 'an', 'tp', 'rg', 'vox'] as const;
export type TrackId = (typeof TRACK_IDS)[number];

export const DRUM_IDS = ['kick', 'snare', 'hihat', 'mc', 'bass'] as const;
export type DrumId = (typeof DRUM_IDS)[number];

/** Percussion tracks painted as single-row hits in the piano roll. */
export const PERC_ROLL_TRACKS = ['kick', 'snare', 'hihat', 'mc'] as const;
export type PercRollTrack = (typeof PERC_ROLL_TRACKS)[number];

export const DRUM_HIT_PITCH = 60;

export function isPercRollTrack(id: TrackId): id is PercRollTrack {
  return (PERC_ROLL_TRACKS as readonly string[]).includes(id);
}

/** Audio-only track — no step patterns. */
export const AUDIO_TRACK_IDS = ['vox'] as const;
export type AudioTrackId = (typeof AUDIO_TRACK_IDS)[number];

export function isAudioTrack(id: TrackId): id is AudioTrackId {
  return (AUDIO_TRACK_IDS as readonly string[]).includes(id);
}

/** Soft defaults — grid grows with patterns in the buffer. */
export const DEFAULT_STEPS = 16;
/** New / empty Patterns start this long (FL: write long ideas, don't loop 1-bar cells). */
export const DEFAULT_PATTERN_BARS = 8;
export const DEFAULT_SCENES = 8;
export const DEFAULT_BARS = 8;
export const DEFAULT_LANES = 8;
/**
 * Steps per playlist bar (4/4). Each step = one 16th note.
 * A 16-step pattern = 1 bar (FL / cumbia grid).
 */
export const STEPS_PER_BAR = 16;
/** Empty piano-roll canvas length. */
export const DEFAULT_PATTERN_STEPS = DEFAULT_PATTERN_BARS * STEPS_PER_BAR;
/** 16th notes per quarter-note beat — metronome + swing. */
export const STEPS_PER_BEAT = 4;

/**
 * Seconds per sequencer step at the given BPM.
 * One step = one 16th note (STEPS_PER_BAR=16 → 1 bar in 4/4).
 */
export function stepDurationSec(bpm: number): number {
  return 60 / Math.max(40, bpm) / 4;
}

export type PlayMode = 'session' | 'arr';

/** Voice / label pack — switches synth + UI instrument names. */
export const VOICE_PACKS = ['cumbia', 'tekno', 'punk', 'classical'] as const;
export type VoicePack = (typeof VOICE_PACKS)[number];

export function isVoicePack(v: string): v is VoicePack {
  return (VOICE_PACKS as readonly string[]).includes(v);
}

export const WAVEFORMS = ['sine', 'triangle', 'sawtooth', 'square'] as const;
export type Waveform = (typeof WAVEFORMS)[number];

export type DrumSound = {
  freq: number;
  pitch: number;
  dur: number;
  attack: number;
  decay: number;
  type: Waveform;
  filter: number;
  drive: number;
  noise: number;
};

export type SynthEnvelope = {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
};

export type WavetableParams = SynthEnvelope & {
  pitch: number;
  cutoff: number;
  res: number;
  unison: number;
  wave: number;
  amp: number;
  filterEnv: number;
  lfoRate: number;
  lfoDepth: number;
};

export type AnalogParams = SynthEnvelope & {
  pitch: number;
  cutoff: number;
  res: number;
  unison: number;
  detune: number;
  amp: number;
  filterEnv: number;
};

/** Per-track insert chain + sends (Ableton/FL-style). */
export type FxChain = {
  hpf: number;
  compThreshold: number;
  compRatio: number;
  presence: number;
  reverbSend: number;
  delaySend: number;
};

export type MixerChannel = {
  gain: number;
  /** -1 = full L · 0 = center · 1 = full R */
  pan: number;
  mute: number;
  solo: number;
};

/** Sparse per-scene overrides — keys present = override, absent = use base. */
export type DrumOverride = Partial<DrumSound>;
export type WavetableOverride = Partial<WavetableParams>;
export type AnalogOverride = Partial<AnalogParams>;

export type SceneOverrides = {
  drums: Partial<Record<DrumId, DrumOverride>>;
  wavetable: WavetableOverride;
  analog: AnalogOverride;
  brass: WavetableOverride;
  guitar: AnalogOverride;
};

/** Piano-roll note inside a pattern (FL: notes live on the pattern, not the playlist lane). */
export type MidiNote = {
  pitch: number;
  start: number;
  length: number;
  /** 0..1 velocity / note gain (default 1). */
  vel?: number;
  /** -1..1 stereo pan relative to track bus (default 0). */
  pan?: number;
};

/**
 * FL-style playlist clip: one instrument + one pattern, stacked on that track's lane.
 * All instruments (incl. drums) are edited in the piano roll.
 */
export type PlaylistClip = {
  track: TrackId;
  pattern: number;
  start: number;
  length: number;
};

/** Recorded audio on the playlist — comping via `take` + `active`. */
export type AudioClip = {
  take: number;
  lane: number;
  start: number;
  length: number;
  sampleId: string;
  /** 1 = audible in comp, 0 = muted take */
  active: number;
};

export type MusicProject = {
  bpm: number;
  scene: number;
  playMode: PlayMode;
  /** Instrument voice pack (cumbia acoustic vs tekno electronic). */
  genre: VoicePack;
  /** Minimum playlist length in bars (extends past last clip). */
  timelineBars: number;
  /**
   * Channels visible in Channel rack + Playlist (FL: project only shows used channels).
   * Empty / missing = all TRACK_IDS.
   */
  rackChannels: TrackId[];
  /**
   * When a Playlist clip is longer than its Pattern: wrap like FL (true) or silence (false).
   * Classical / through-composed songs should set false.
   */
  clipWrap: boolean;
  patterns: Record<TrackId, number[][]>;
  /** Per track: scene index (1-based) per arrangement bar. 0 = rest. Legacy fallback. */
  arrangement: Record<TrackId, number[]>;
  /** Piano-roll notes per channel, per pattern (scene). */
  notes: Record<TrackId, MidiNote[][]>;
  /** Pattern clips on the playlist. Empty = use legacy per-track arrangement. */
  clips: PlaylistClip[];
  /** Vocal / audio takes on the playlist. */
  audioClips: AudioClip[];
  lanes: number;
  drums: Record<DrumId, DrumSound>;
  wavetable: WavetableParams;
  analog: AnalogParams;
  /** Trompeta — bright wavetable brass. */
  brass: WavetableParams;
  /** Requinto / guitarra — plucked analog. */
  guitar: AnalogParams;
  mixer: Record<TrackId, MixerChannel>;
  fx: Record<TrackId, FxChain>;
  /** Per-scene overrides — index = sceneIdx (0-based). */
  sceneOverrides: SceneOverrides[];
};

export type BeatInfo = {
  /** Beat inside the current bar (0 … STEPS_PER_BAR-1). */
  step: number;
  /** Step inside the active pattern row (0 … patternLen-1). */
  patternStep: number;
  bar: number;
  scene: number;
};

export type ParseResult = {
  project: MusicProject;
  errors: string[];
};

export type PatchResult = {
  code: string;
  line: number;
};

export type BindingValue = number | string | number[] | (number | string)[];
