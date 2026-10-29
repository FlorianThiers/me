import { DEFAULT_BARS, DEFAULT_LANES, DEFAULT_SCENES, DEFAULT_STEPS, TRACK_IDS } from './types';
import type {
  AnalogParams,
  DrumId,
  DrumSound,
  MidiNote,
  MixerChannel,
  MusicProject,
  SceneOverrides,
  TrackId,
  VoicePack,
  WavetableParams,
} from './types';
import { defaultFxMap } from './fxChain';

export { VOCAL_FX_PRESET } from './fxChain';
export { FL } from './flTerms';

export const DEFAULT_DRUMS: Record<DrumId, DrumSound> = {
  kick: {
    freq: 52,
    pitch: 28,
    dur: 0.72,
    attack: 0.002,
    decay: 0.52,
    type: 'sine',
    filter: 85,
    drive: 0.02,
    noise: 0.22,
  },
  snare: {
    freq: 210,
    pitch: 18,
    dur: 0.28,
    attack: 0.001,
    decay: 0.22,
    type: 'sine',
    filter: 520,
    drive: 0.02,
    noise: 0.72,
  },
  hihat: {
    freq: 280,
    pitch: 0,
    dur: 0.11,
    attack: 0.001,
    decay: 0.09,
    type: 'sine',
    filter: 2800,
    drive: 0.01,
    noise: 0.92,
  },
  mc: {
    freq: 480,
    pitch: 0,
    dur: 0.06,
    attack: 0.001,
    decay: 0.048,
    type: 'triangle',
    filter: 2600,
    drive: 0.02,
    noise: 0.96,
  },
  bass: {
    freq: 38,
    pitch: 0,
    dur: 0.95,
    attack: 0.006,
    decay: 0.62,
    type: 'triangle',
    filter: 140,
    drive: 0.02,
    noise: 0.08,
  },
};

export const DEFAULT_WAVETABLE: WavetableParams = {
  pitch: 110,
  cutoff: 420,
  res: 0.25,
  unison: 3,
  wave: 2,
  amp: 0.55,
  attack: 0.01,
  decay: 0.12,
  sustain: 0.65,
  release: 0.18,
  filterEnv: 0.45,
  lfoRate: 4,
  lfoDepth: 0.15,
};

export const DEFAULT_ANALOG: AnalogParams = {
  pitch: 55,
  cutoff: 800,
  res: 0.18,
  unison: 2,
  detune: 12,
  amp: 0.5,
  attack: 0.015,
  decay: 0.14,
  sustain: 0.55,
  release: 0.2,
  filterEnv: 0.35,
};

export const DEFAULT_BRASS: WavetableParams = {
  pitch: 165,
  cutoff: 2400,
  res: 0.32,
  unison: 2,
  wave: 1,
  amp: 0.52,
  attack: 0.018,
  decay: 0.09,
  sustain: 0.55,
  release: 0.14,
  filterEnv: 0.55,
  lfoRate: 5.5,
  lfoDepth: 0.08,
};

export const DEFAULT_GUITAR: AnalogParams = {
  pitch: 82,
  cutoff: 1400,
  res: 0.22,
  unison: 2,
  detune: 8,
  amp: 0.44,
  attack: 0.003,
  decay: 0.18,
  sustain: 0.12,
  release: 0.22,
  filterEnv: 0.48,
};

const emptyRow = () => Array(DEFAULT_STEPS).fill(0);

export const emptyPatterns = (): MusicProject['patterns'] => {
  const patterns = {} as Record<TrackId, number[][]>;
  for (const id of TRACK_IDS) {
    patterns[id] = Array.from({ length: DEFAULT_SCENES }, () => emptyRow());
  }
  return patterns;
};

export const defaultMixer = (): Record<TrackId, MixerChannel> => {
  const mixer = {} as Record<TrackId, MixerChannel>;
  // Wide-but-safe stereo image for Phantom L/R
  const pans: Partial<Record<TrackId, number>> = {
    kick: 0,
    snare: 0.12,
    hihat: -0.42,
    mc: 0.48,
    bass: 0,
    wt: -0.28,
    an: 0.32,
    tp: 0.58,
    rg: -0.55,
    vox: 0.05,
  };
  for (const id of TRACK_IDS) {
    mixer[id] = { gain: 0.8, pan: pans[id] ?? 0, mute: 0, solo: 0 };
  }
  return mixer;
};

const row = (hits: number[]) => {
  const r = emptyRow();
  hits.forEach((h, i) => {
    if (i < r.length) r[i] = h;
  });
  return r;
};

export const defaultPatterns = (): MusicProject['patterns'] => {
  const patterns = emptyPatterns();
  patterns.kick[0] = row([1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0]);
  patterns.snare[0] = row([0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0]);
  patterns.hihat[0] = row([1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0]);
  patterns.bass[0] = row([1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0]);
  patterns.wt[0] = row([1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0]);
  patterns.an[0] = row([0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0]);
  return patterns;
};

export const emptyNotes = (): Record<TrackId, MidiNote[][]> => {
  const notes = {} as Record<TrackId, MidiNote[][]>;
  for (const id of TRACK_IDS) {
    notes[id] = Array.from({ length: DEFAULT_SCENES }, () => []);
  }
  return notes;
};

export const defaultArrangement = (): Record<TrackId, number[]> => {
  const arrangement = {} as Record<TrackId, number[]>;
  for (const id of TRACK_IDS) {
    arrangement[id] = Array.from({ length: DEFAULT_BARS }, (_, i) => (i < 4 ? 1 : 2));
  }
  return arrangement;
};

export const emptyOverrides = (): SceneOverrides => ({
  drums: {},
  wavetable: {},
  analog: {},
  brass: {},
  guitar: {},
});

export const DRUM_RACK_TRACKS = ['kick', 'snare', 'hihat', 'mc'] as const satisfies readonly TrackId[];

/** Blank slate for livecode parse — no phantom steps on unused tracks. */
export const emptyProject = (): MusicProject => ({
  bpm: 120,
  scene: 1,
  playMode: 'session',
  genre: 'cumbia',
  timelineBars: 0,
  rackChannels: [...TRACK_IDS],
  clipWrap: true,
  patterns: emptyPatterns(),
  arrangement: defaultArrangement(),
  notes: emptyNotes(),
  clips: [],
  audioClips: [],
  lanes: DEFAULT_LANES,
  drums: structuredClone(DEFAULT_DRUMS),
  wavetable: { ...DEFAULT_WAVETABLE },
  analog: { ...DEFAULT_ANALOG },
  brass: { ...DEFAULT_BRASS },
  guitar: { ...DEFAULT_GUITAR },
  mixer: defaultMixer(),
  fx: defaultFxMap(),
  sceneOverrides: [],
});

export const defaultProject = (): MusicProject => ({
  ...emptyProject(),
  playMode: 'arr',
  patterns: defaultPatterns(),
  clips: [
    { track: 'kick', pattern: 1, start: 0, length: 4 },
    { track: 'bass', pattern: 2, start: 0, length: 4 },
    { track: 'wt', pattern: 3, start: 4, length: 4 },
  ],
});

/** Norteño / cumbia romántica mapping */
export const TRACK_LABELS_CUMBIA: Record<TrackId, string> = {
  kick: 'Cajón',
  snare: 'Timbal',
  hihat: 'Güiro',
  mc: 'Maracas',
  bass: 'Contrabajo',
  wt: 'Acordeón',
  an: 'Bajo Sexto',
  tp: 'Trompeta',
  rg: 'Requinto',
  vox: 'Voz',
};

/** French tekno / hardtek mapping */
export const TRACK_LABELS_TEKNO: Record<TrackId, string> = {
  kick: 'Hard Kick',
  snare: 'Clap',
  hihat: 'Closed Hat',
  mc: 'Metal Open',
  bass: 'Acid Bass',
  wt: 'Mentasm',
  an: 'Stab',
  tp: 'Screech',
  rg: 'Laser',
  vox: 'Vox',
};

/** Pop-punk / Blink-182 mapping */
export const TRACK_LABELS_PUNK: Record<TrackId, string> = {
  kick: 'Kick',
  snare: 'Snare',
  hihat: 'Hi-Hat',
  mc: 'Crash',
  bass: 'Punk Bass',
  wt: 'Power Chord',
  an: 'Palm Mute',
  tp: 'Lead Guitar',
  rg: 'Octave Fill',
  vox: 'Vox',
};

/** Classical / piano-dance mapping (Constantini-style) */
export const TRACK_LABELS_CLASSICAL: Record<TrackId, string> = {
  kick: 'Timpani',
  snare: 'Woodblock',
  hihat: 'Triangle',
  mc: 'Soft Cymbal',
  bass: 'Cello Bass',
  wt: 'Grand Piano',
  an: 'Violin',
  tp: 'Clarinet',
  rg: 'Harp',
  vox: 'Voice',
};

const LABELS_BY_GENRE: Record<VoicePack, Record<TrackId, string>> = {
  cumbia: TRACK_LABELS_CUMBIA,
  tekno: TRACK_LABELS_TEKNO,
  punk: TRACK_LABELS_PUNK,
  classical: TRACK_LABELS_CLASSICAL,
};

/** Default = cumbia (backward compatible import). Prefer trackLabels(genre). */
export const TRACK_LABELS = TRACK_LABELS_CUMBIA;

export function trackLabels(genre: VoicePack = 'cumbia'): Record<TrackId, string> {
  return LABELS_BY_GENRE[genre] ?? TRACK_LABELS_CUMBIA;
}

export const TRACK_COLORS: Record<TrackId, string> = {
  kick: '#c45c4a',
  snare: '#d4a04a',
  hihat: '#4aa8c4',
  mc: '#8ab84a',
  bass: '#6b5cae',
  wt: '#c46b9a',
  an: '#5cae7a',
  tp: '#e8c44a',
  rg: '#c49a6b',
  vox: '#e8a0c8',
};

export const DRUM_PARAM_KEYS: (keyof DrumSound)[] = [
  'freq',
  'pitch',
  'dur',
  'attack',
  'decay',
  'filter',
  'drive',
  'noise',
];
