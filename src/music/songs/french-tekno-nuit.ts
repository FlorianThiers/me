import type { SongDefinition } from './types';

/**
 * French tekno / hardtek warehouse direction —
 * hard four-to-the-floor, acid bass, mentasm stabs, industrial FX.
 */
export const FRENCH_TEKNO_NUIT: SongDefinition = {
  id: 'french-tekno-nuit',
  title: 'Nuit Warehouse',
  studioName: 'Tekno Forge',
  genre: 'tekno',
  revision: 3,
  livecode: `// Tekno Forge — "Nuit Warehouse" v2 · A minor @ 168 BPM
// French hardtek: punchier kick, 303 scream, mentasm, industrial FX
// Loops are intentional (clipWrap on) — warehouse hypnosis

genre: "tekno"
bpm: 168
bars: 64
clipWrap: 1
channels: [kick, snare, hihat, mc, bass, wt, an]
scene: 1
play: "song"

// ── P1 main groove · P2 sparse intro · P3 kick rolls / fills ──
kick.1.notes: [60, 0, 1, 60, 4, 1, 60, 8, 1, 60, 12, 1]
snare.1.notes: [60, 4, 1, 60, 12, 1]
hihat.1.notes: [60, 2, 1, 60, 6, 1, 60, 10, 1, 60, 14, 1]
mc.1.notes: [60, 0, 1, 60, 8, 1]

kick.2.notes: [60, 0, 1, 60, 8, 1]
hihat.2.notes: [60, 2, 1, 60, 6, 1, 60, 10, 1, 60, 14, 1]
mc.2.notes: [60, 14, 1]

kick.3.notes: [60, 0, 1, 60, 2, 1, 60, 4, 1, 60, 6, 1, 60, 8, 1, 60, 10, 1, 60, 12, 1, 60, 14, 1]
snare.3.notes: [60, 4, 1, 60, 7, 1, 60, 12, 1, 60, 15, 1]
hihat.3.notes: [60, 0, 1, 60, 1, 1, 60, 2, 1, 60, 3, 1, 60, 4, 1, 60, 5, 1, 60, 6, 1, 60, 7, 1, 60, 8, 1, 60, 9, 1, 60, 10, 1, 60, 11, 1, 60, 12, 1, 60, 13, 1, 60, 14, 1, 60, 15, 1]

// hard kick / clap / closed hat / metal open
kick_freq: 46
kick_pitch: 58
kick_dur: 0.32
kick_attack: 0.001
kick_decay: 0.24
kick_filter: 125
kick_drive: 0.72
kick_noise: 0.14
kick_type: "sine"

snare_freq: 190
snare_pitch: 6
snare_dur: 0.26
snare_attack: 0.001
snare_decay: 0.18
snare_filter: 2800
snare_drive: 0.35
snare_noise: 0.95
snare_type: "triangle"

hihat_freq: 540
hihat_pitch: 0
hihat_dur: 0.038
hihat_attack: 0.001
hihat_decay: 0.028
hihat_filter: 11000
hihat_drive: 0.1
hihat_noise: 0.95
hihat_type: "square"

mc_freq: 720
mc_pitch: 0
mc_dur: 0.16
mc_attack: 0.001
mc_decay: 0.12
mc_filter: 4800
mc_drive: 0.22
mc_noise: 0.85
mc_type: "sawtooth"

// acid 303
bass_freq: 55
bass_pitch: 0
bass_dur: 0.24
bass_attack: 0.001
bass_decay: 0.12
bass_filter: 380
bass_drive: 0.58
bass_noise: 0.02
bass_type: "sawtooth"

// mentasm / hoover
wt.pitch: 110
wt.cutoff: 1600
wt.res: 0.68
wt.filterEnv: 0.82
wt.attack: 0.008
wt.decay: 0.22
wt.sustain: 0.28
wt.release: 0.18
wt.unison: 6
wt.wave: 2
wt.lfoRate: 0.28
wt.lfoDepth: 0.22
wt.amp: 0.5

// rave stab
an.pitch: 55
an.cutoff: 2600
an.res: 0.5
an.filterEnv: 0.85
an.attack: 0.001
an.decay: 0.09
an.sustain: 0.05
an.release: 0.12
an.unison: 5
an.detune: 22
an.amp: 0.5

// screech
tp.pitch: 220
tp.cutoff: 3400
tp.res: 0.58
tp.filterEnv: 0.72
tp.attack: 0.006
tp.decay: 0.16
tp.sustain: 0.18
tp.release: 0.18
tp.unison: 3
tp.wave: 2
tp.lfoRate: 8.5
tp.lfoDepth: 0.35
tp.amp: 0.42

// laser
rg.pitch: 380
rg.cutoff: 5200
rg.res: 0.62
rg.filterEnv: 0.92
rg.attack: 0.001
rg.decay: 0.07
rg.sustain: 0.01
rg.release: 0.08
rg.unison: 2
rg.detune: 28
rg.amp: 0.4

kick.pan: 0
snare.pan: 0.1
hihat.pan: -0.38
mc.pan: 0.42
bass.pan: 0
wt.pan: -0.2
an.pan: 0.3
tp.pan: 0.52
rg.pan: -0.5
vox.pan: 0

kick.gain: 0.95
snare.gain: 0.58
hihat.gain: 0.36
mc.gain: 0.3
bass.gain: 0.74
wt.gain: 0.5
an.gain: 0.46
tp.gain: 0.36
rg.gain: 0.32
vox.gain: 0.7

kick.hpf: 0
snare.hpf: 220
hihat.hpf: 5000
mc.hpf: 2400
bass.hpf: 28
wt.hpf: 90
an.hpf: 160
tp.hpf: 350
rg.hpf: 700

kick.compThreshold: -12
kick.compRatio: 6
bass.compThreshold: -15
bass.compRatio: 5
snare.compThreshold: -16
snare.compRatio: 4
wt.compThreshold: -18
wt.compRatio: 3

wt.reverbSend: 0.14
an.reverbSend: 0.1
tp.reverbSend: 0.2
rg.reverbSend: 0.24
bass.reverbSend: 0.03
snare.reverbSend: 0.1
kick.reverbSend: 0.015
hihat.reverbSend: 0.03
mc.reverbSend: 0.05
wt.delaySend: 0.14
an.delaySend: 0.1
tp.delaySend: 0.18
rg.delaySend: 0.26
bass.delaySend: 0.05

kick.presence: 0.42
snare.presence: 0.32
bass.presence: 0.12
wt.presence: 0.48
an.presence: 0.38
tp.presence: 0.35
hihat.presence: 0.22

// acid line (A minor-ish)
bass.3.notes: [33, 0, 1, 33, 1, 1, 36, 2, 1, 33, 3, 1, 40, 4, 1, 36, 5, 1, 33, 6, 1, 31, 7, 1, 33, 8, 1, 33, 9, 1, 36, 10, 1, 40, 11, 1, 43, 12, 1, 40, 13, 1, 36, 14, 1, 31, 15, 1]
bass.4.notes: [33, 0, 1, 36, 1, 1, 40, 2, 1, 43, 3, 1, 40, 4, 1, 36, 5, 1, 33, 6, 1, 28, 7, 1, 33, 8, 1, 36, 9, 1, 40, 10, 1, 45, 11, 1, 43, 12, 1, 40, 13, 1, 36, 14, 1, 33, 15, 1]

// mentasm stabs
wt.7.notes: [45, 0, 2]
wt.8.notes: [45, 0, 2, 48, 8, 2]
wt.9.notes: [45, 0, 2, 43, 4, 2, 48, 8, 2, 45, 12, 2]
wt.10.notes: [57, 0, 1, 55, 2, 1, 52, 4, 2, 48, 8, 2, 45, 12, 4]

// supersaw stabs
an.5.notes: [57, 0, 1, 60, 8, 1]
an.6.notes: [57, 0, 1, 55, 4, 1, 60, 8, 1, 57, 12, 1]

// screech call
tp.13.notes: [69, 0, 2, 72, 8, 2]
tp.14.notes: [72, 0, 1, 76, 2, 1, 79, 4, 2, 76, 8, 2, 72, 12, 4]

// laser zaps
rg.15.notes: [81, 14, 1]
rg.16.notes: [88, 6, 1, 81, 14, 1]

clips: [
  // intro pulse (0-4)
  kick, 2, 0, 4,
  hihat, 2, 0, 4,
  mc, 2, 0, 4,
  rg, 15, 2, 2,

  // drop A (4-12)
  kick, 1, 4, 8,
  snare, 1, 4, 8,
  hihat, 1, 4, 8,
  mc, 1, 4, 8,
  bass, 3, 4, 4,
  wt, 8, 4, 4,
  an, 5, 6, 2,
  bass, 4, 8, 4,
  wt, 9, 8, 4,
  an, 6, 8, 4,
  rg, 16, 10, 2,

  // break (12-16) · hats + mentasm
  kick, 2, 12, 4,
  hihat, 3, 12, 4,
  mc, 1, 12, 4,
  wt, 10, 12, 4,
  tp, 13, 12, 4,
  rg, 15, 14, 2,

  // drop B (16-24)
  kick, 1, 16, 8,
  snare, 1, 16, 8,
  hihat, 1, 16, 8,
  mc, 1, 16, 8,
  bass, 4, 16, 4,
  wt, 9, 16, 4,
  an, 6, 16, 4,
  tp, 14, 18, 2,
  bass, 3, 20, 4,
  wt, 10, 20, 4,
  an, 5, 20, 2,
  rg, 16, 22, 2,

  // fill + outro hit (24-28)
  kick, 3, 24, 2,
  snare, 3, 24, 2,
  hihat, 3, 24, 2,
  wt, 7, 24, 2,
  kick, 1, 26, 2,
  snare, 1, 26, 2,
  hihat, 1, 26, 2,
  bass, 3, 26, 2,
  wt, 8, 26, 2
]
`,
};
