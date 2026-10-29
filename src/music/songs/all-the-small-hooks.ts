import type { SongDefinition } from './types';

/**
 * Pop-punk in the Blink-182 lane —
 * driving 4/4, power chords, palm mutes, hooky lead, stereo drums.
 */
export const BLINK_LIKE_PUNK: SongDefinition = {
  id: 'all-the-small-hooks',
  title: 'All the Small Hooks',
  studioName: 'Punk Forge',
  genre: 'punk',
  revision: 3,
  livecode: `// Punk Forge — "All the Small Hooks" · E major @ 178 BPM
// Pop-punk: kick/snare drive, power chords, palm mutes, lead hook
// Notes: [pitch, start, length, vel?, pan?]
// Short form + 5 channels — not a full orchestra rack

genre: "punk"
bpm: 178
bars: 24
clipWrap: 1
channels: [kick, snare, hihat, bass, wt, an]
scene: 1
play: "song"

// drums
kick.1.notes: [60, 0, 1, 1, 0, 60, 4, 1, 0.92, 0, 60, 8, 1, 1, 0, 60, 12, 1, 0.88, 0]
snare.1.notes: [60, 4, 1, 1, 0.08, 60, 12, 1, 0.95, -0.06]
hihat.1.notes: [60, 0, 1, 0.55, -0.45, 60, 2, 1, 0.7, -0.35, 60, 4, 1, 0.55, -0.45, 60, 6, 1, 0.72, -0.3, 60, 8, 1, 0.55, -0.45, 60, 10, 1, 0.7, -0.35, 60, 12, 1, 0.55, -0.45, 60, 14, 1, 0.75, -0.28]
mc.1.notes: [60, 0, 2, 0.85, 0.35]

kick.2.notes: [60, 0, 1, 0.7, 0, 60, 8, 1, 0.65, 0]
hihat.2.notes: [60, 2, 1, 0.45, -0.4, 60, 6, 1, 0.5, -0.35, 60, 10, 1, 0.45, -0.4, 60, 14, 1, 0.55, -0.3]

kick.3.notes: [60, 0, 1, 1, 0, 60, 2, 1, 0.8, 0, 60, 4, 1, 1, 0, 60, 6, 1, 0.75, 0, 60, 8, 1, 1, 0, 60, 10, 1, 0.8, 0, 60, 12, 1, 1, 0, 60, 14, 1, 0.9, 0]
snare.3.notes: [60, 4, 1, 1, 0.1, 60, 7, 1, 0.7, -0.05, 60, 12, 1, 1, 0.08, 60, 15, 1, 0.85, 0.05]

kick_freq: 50
kick_pitch: 36
kick_dur: 0.28
kick_decay: 0.2
kick_filter: 120
kick_drive: 0.25
kick_noise: 0.12

snare_freq: 200
snare_dur: 0.2
snare_decay: 0.14
snare_filter: 3200
snare_drive: 0.2
snare_noise: 0.9

hihat_freq: 700
hihat_dur: 0.04
hihat_decay: 0.03
hihat_filter: 10000
hihat_noise: 0.95

mc_freq: 500
mc_dur: 0.45
mc_decay: 0.35
mc_filter: 4500
mc_noise: 0.85

bass_freq: 55
bass_dur: 0.22
bass_decay: 0.16
bass_filter: 280
bass_drive: 0.2

wt.pitch: 82
wt.cutoff: 2400
wt.res: 0.28
wt.filterEnv: 0.35
wt.attack: 0.008
wt.decay: 0.18
wt.sustain: 0.45
wt.release: 0.16
wt.unison: 4
wt.amp: 0.55

an.pitch: 82
an.cutoff: 1600
an.res: 0.35
an.filterEnv: 0.7
an.attack: 0.002
an.decay: 0.08
an.sustain: 0.05
an.release: 0.06
an.unison: 2
an.detune: 8
an.amp: 0.5

tp.pitch: 330
tp.cutoff: 3200
tp.res: 0.3
tp.filterEnv: 0.45
tp.attack: 0.01
tp.decay: 0.14
tp.sustain: 0.4
tp.release: 0.18
tp.unison: 3
tp.lfoRate: 5.5
tp.lfoDepth: 0.15
tp.amp: 0.48

rg.pitch: 220
rg.cutoff: 2800
rg.res: 0.22
rg.filterEnv: 0.4
rg.attack: 0.004
rg.decay: 0.16
rg.sustain: 0.2
rg.release: 0.2
rg.amp: 0.4

kick.pan: 0
snare.pan: 0.06
hihat.pan: -0.4
mc.pan: 0.38
bass.pan: 0
wt.pan: -0.18
an.pan: 0.22
tp.pan: 0.28
rg.pan: -0.32

kick.gain: 0.9
snare.gain: 0.62
hihat.gain: 0.34
mc.gain: 0.4
bass.gain: 0.72
wt.gain: 0.58
an.gain: 0.48
tp.gain: 0.42
rg.gain: 0.36

kick.hpf: 0
snare.hpf: 160
hihat.hpf: 4500
mc.hpf: 2000
bass.hpf: 35
wt.hpf: 80
an.hpf: 120
tp.hpf: 200
rg.hpf: 250

kick.compThreshold: -12
kick.compRatio: 5
snare.compThreshold: -14
snare.compRatio: 4
bass.compThreshold: -15
bass.compRatio: 4
wt.compThreshold: -16
wt.compRatio: 3

wt.reverbSend: 0.12
an.reverbSend: 0.08
tp.reverbSend: 0.18
rg.reverbSend: 0.2
snare.reverbSend: 0.1
mc.reverbSend: 0.22
bass.reverbSend: 0.04
kick.reverbSend: 0.02
hihat.reverbSend: 0.04

tp.delaySend: 0.14
rg.delaySend: 0.12
wt.delaySend: 0.06
an.delaySend: 0.04

kick.presence: 0.3
snare.presence: 0.35
wt.presence: 0.28
tp.presence: 0.4

// bass lines (root motion)
bass.3.notes: [40, 0, 2, 0.95, 0, 40, 2, 2, 0.75, 0, 47, 4, 2, 0.9, 0.05, 47, 6, 2, 0.7, 0, 45, 8, 2, 0.9, -0.05, 45, 10, 2, 0.7, 0, 42, 12, 2, 0.9, 0, 42, 14, 2, 0.75, 0]
bass.4.notes: [40, 0, 2, 1, 0, 47, 4, 2, 0.95, 0.04, 45, 8, 2, 0.9, -0.04, 42, 12, 1, 0.85, 0, 40, 14, 2, 0.8, 0]

// power chords (roots)
wt.7.notes: [52, 0, 4, 0.9, -0.2, 59, 4, 4, 0.85, -0.15, 57, 8, 4, 0.88, -0.22, 54, 12, 4, 0.82, -0.18]
wt.8.notes: [52, 0, 2, 1, -0.2, 52, 2, 2, 0.75, -0.15, 59, 4, 2, 0.95, -0.18, 59, 6, 2, 0.7, -0.12, 57, 8, 2, 0.95, -0.22, 57, 10, 2, 0.7, -0.16, 54, 12, 2, 0.9, -0.2, 54, 14, 2, 0.7, -0.14]

// palm mutes
an.5.notes: [52, 0, 1, 0.7, 0.25, 52, 1, 1, 0.55, 0.2, 52, 2, 1, 0.7, 0.25, 52, 3, 1, 0.5, 0.18, 59, 4, 1, 0.7, 0.28, 59, 5, 1, 0.55, 0.22, 59, 6, 1, 0.7, 0.28, 59, 7, 1, 0.5, 0.2, 57, 8, 1, 0.7, 0.24, 57, 9, 1, 0.55, 0.2, 57, 10, 1, 0.7, 0.24, 57, 11, 1, 0.5, 0.18, 54, 12, 1, 0.7, 0.26, 54, 13, 1, 0.55, 0.2, 54, 14, 1, 0.7, 0.26, 54, 15, 1, 0.5, 0.18]
an.6.notes: [52, 0, 1, 0.85, 0.3, 59, 4, 1, 0.8, 0.28, 57, 8, 1, 0.8, 0.26, 54, 12, 1, 0.85, 0.3]

// lead hook
tp.13.notes: [71, 0, 2, 0.9, 0.35, 69, 2, 2, 0.75, 0.28, 67, 4, 2, 0.85, 0.32, 64, 6, 2, 0.7, 0.25, 67, 8, 2, 0.9, 0.38, 69, 10, 2, 0.8, 0.3, 71, 12, 4, 0.95, 0.4]
tp.14.notes: [76, 0, 2, 0.85, 0.42, 74, 2, 2, 0.7, 0.35, 71, 4, 4, 0.9, 0.38, 69, 8, 2, 0.75, 0.3, 67, 10, 2, 0.7, 0.28, 64, 12, 4, 0.85, 0.35]

rg.15.notes: [76, 12, 2, 0.6, -0.4, 83, 14, 2, 0.7, -0.35]
rg.16.notes: [71, 0, 1, 0.55, -0.38, 76, 8, 1, 0.6, -0.42, 83, 14, 2, 0.75, -0.3]

clips: [
  // intro
  kick, 2, 0, 4,
  hihat, 2, 0, 4,
  bass, 3, 2, 2,
  an, 5, 2, 2,

  // verse
  kick, 1, 4, 8,
  snare, 1, 4, 8,
  hihat, 1, 4, 8,
  bass, 3, 4, 4,
  wt, 7, 4, 4,
  an, 5, 4, 4,
  bass, 4, 8, 4,
  wt, 8, 8, 4,
  an, 5, 8, 4,
  rg, 15, 10, 2,

  // pre
  kick, 1, 12, 4,
  snare, 1, 12, 4,
  hihat, 1, 12, 4,
  mc, 1, 12, 2,
  bass, 4, 12, 4,
  wt, 8, 12, 4,
  an, 6, 12, 4,
  tp, 13, 12, 4,

  // chorus
  kick, 1, 16, 8,
  snare, 1, 16, 8,
  hihat, 1, 16, 8,
  mc, 1, 16, 2,
  bass, 3, 16, 4,
  wt, 8, 16, 4,
  an, 5, 16, 4,
  tp, 14, 16, 4,
  bass, 4, 20, 4,
  wt, 7, 20, 4,
  an, 6, 20, 4,
  tp, 13, 20, 4,
  rg, 16, 22, 2,

  // fill + outro
  kick, 3, 24, 2,
  snare, 3, 24, 2,
  hihat, 1, 24, 2,
  wt, 8, 24, 2,
  kick, 1, 26, 2,
  snare, 1, 26, 2,
  bass, 3, 26, 2,
  wt, 7, 26, 2,
  tp, 14, 26, 2
]
`,
};
