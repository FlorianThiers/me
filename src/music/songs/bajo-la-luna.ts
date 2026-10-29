import type { SongDefinition } from './types';

/** Cumbia romántica — first finished direction for Cumbia Forge. */
export const BAJO_LA_LUNA: SongDefinition = {
  id: 'bajo-la-luna',
  title: 'Bajo la Luna',
  studioName: 'Cumbia Forge',
  genre: 'cumbia',
  revision: 3,
  livecode: `// Cumbia Forge — "Bajo la Luna" · G minor @ 92 BPM
// pattern-lengte = piano roll · clip-lengte ≈ pattern (niet 10× loopen in één blok)

genre: "cumbia"
bpm: 92
bars: 32
clipWrap: 1
channels: [kick, snare, hihat, mc, bass, wt, an, tp, rg, vox]
scene: 1
play: "song"
// Grid: 16 steps/bar = 16ths at labeled BPM (was half-speed 8ths — fixed)

// ── P1 tumbao (2 bars) · P2 short intro · P3 timbal fills ──
kick.1.notes: [60, 0, 1, 60, 6, 1, 60, 8, 1, 60, 14, 1, 60, 16, 1, 60, 22, 1, 60, 24, 1, 60, 30, 1]
snare.1.notes: [60, 4, 1, 60, 12, 1, 60, 20, 1, 60, 28, 1]
hihat.1.notes: [60, 0, 1, 60, 2, 1, 60, 4, 1, 60, 6, 1, 60, 8, 1, 60, 10, 1, 60, 12, 1, 60, 14, 1, 60, 16, 1, 60, 18, 1, 60, 20, 1, 60, 22, 1, 60, 24, 1, 60, 26, 1, 60, 28, 1, 60, 30, 1]
mc.1.notes: [60, 2, 1, 60, 6, 1, 60, 10, 1, 60, 14, 1, 60, 18, 1, 60, 22, 1, 60, 26, 1, 60, 30, 1]
kick.2.notes: [60, 0, 1, 60, 12, 1]
hihat.2.notes: [60, 0, 1, 60, 4, 1, 60, 8, 1, 60, 12, 1]
mc.2.notes: [60, 12, 1]

kick.3.notes: [60, 6, 1, 60, 10, 1, 60, 14, 1, 60, 22, 1, 60, 26, 1, 60, 30, 1]
snare.3.notes: [60, 2, 1, 60, 6, 1, 60, 10, 1, 60, 14, 1, 60, 18, 1, 60, 22, 1, 60, 26, 1, 60, 30, 1]

// perc — cajón / timbal / güiro / maracas / contrabajo
kick_freq: 52
kick_pitch: 28
kick_dur: 0.72
kick_attack: 0.002
kick_decay: 0.52
kick_filter: 85
kick_drive: 0.02
kick_noise: 0.22
kick_type: "sine"

snare_freq: 210
snare_pitch: 18
snare_dur: 0.28
snare_attack: 0.001
snare_decay: 0.22
snare_filter: 520
snare_drive: 0.02
snare_noise: 0.72
snare_type: "sine"

hihat_freq: 280
hihat_pitch: 0
hihat_dur: 0.11
hihat_attack: 0.001
hihat_decay: 0.09
hihat_filter: 2800
hihat_drive: 0.01
hihat_noise: 0.92
hihat_type: "sine"

mc_freq: 480
mc_pitch: 0
mc_dur: 0.06
mc_attack: 0.001
mc_decay: 0.048
mc_filter: 2600
mc_drive: 0.02
mc_noise: 0.96
mc_type: "triangle"

bass_freq: 38
bass_pitch: 0
bass_dur: 0.95
bass_attack: 0.006
bass_decay: 0.62
bass_filter: 140
bass_drive: 0.02
bass_noise: 0.08
bass_type: "triangle"
// -- ui-bindings
wt.pitch: 110
wt.cutoff: 720
wt.res: 0.18
wt.filterEnv: 0.32
wt.attack: 0.04
wt.decay: 0.28
wt.sustain: 0.82
wt.release: 0.42
wt.unison: 3
wt.wave: 0
wt.lfoRate: 6.4
wt.lfoDepth: 0.22
wt.amp: 0.58

an.pitch: 55
an.cutoff: 780
an.res: 0.14
an.filterEnv: 0.48
an.attack: 0.003
an.decay: 0.22
an.sustain: 0.18
an.release: 0.32
an.unison: 1
an.detune: 6
an.amp: 0.5

tp.pitch: 165
tp.cutoff: 2200
tp.res: 0.28
tp.filterEnv: 0.55
tp.attack: 0.022
tp.decay: 0.12
tp.sustain: 0.58
tp.release: 0.28
tp.unison: 2
tp.wave: 0
tp.lfoRate: 5.5
tp.lfoDepth: 0.06
tp.amp: 0.52

rg.pitch: 82
rg.cutoff: 1400
rg.res: 0.2
rg.filterEnv: 0.52
rg.attack: 0.002
rg.decay: 0.18
rg.sustain: 0.04
rg.release: 0.22
rg.unison: 1
rg.detune: 5
rg.amp: 0.44

// stereo image (Phantom L/R)
kick.pan: 0
snare.pan: 0.12
hihat.pan: -0.42
mc.pan: 0.48
bass.pan: 0
wt.pan: -0.28
an.pan: 0.32
tp.pan: 0.58
rg.pan: -0.55
vox.pan: 0.05

kick.gain: 0.8
snare.gain: 0.42
hihat.gain: 0.24
mc.gain: 0.2
bass.gain: 0.68
wt.gain: 0.58
an.gain: 0.48
tp.gain: 0.5
rg.gain: 0.4
vox.gain: 0.88

wt.reverbSend: 0.32
an.reverbSend: 0.24
tp.reverbSend: 0.34
rg.reverbSend: 0.22
bass.reverbSend: 0.12
snare.reverbSend: 0.1
kick.reverbSend: 0.04
hihat.reverbSend: 0.02
wt.delaySend: 0.04
tp.delaySend: 0.08
// ── melodie (kies P via playlist-clip) ──
bass.3.notes: [43, 0, 4, 46, 4, 4, 41, 8, 4, 43, 12, 4]
bass.4.notes: [43, 0, 4, 46, 4, 4, 50, 8, 4, 48, 12, 4]

an.5.notes: [55, 0, 4, 58, 4, 4, 55, 8, 4, 58, 12, 4]
an.6.notes: [55, 0, 2, 58, 2, 2, 62, 4, 2, 58, 6, 2, 55, 8, 2, 58, 10, 2, 62, 12, 2, 58, 14, 2]

rg.15.notes: [58, 0, 2, 62, 2, 2, 65, 4, 2, 62, 6, 2, 58, 8, 2, 62, 10, 2, 65, 12, 2, 62, 14, 2]
rg.16.notes: [67, 0, 2, 70, 2, 2, 74, 4, 2, 70, 6, 2, 67, 8, 2, 70, 10, 2, 74, 12, 2, 70, 14, 2]

wt.7.notes: [70, 0, 8, 72, 8, 8]
wt.8.notes: [67, 0, 2, 69, 2, 2, 70, 4, 4, 69, 8, 2, 67, 10, 2, 67, 16, 2, 65, 18, 2, 63, 20, 4, 62, 24, 4, 70, 32, 2, 72, 34, 2, 74, 36, 4, 75, 40, 4, 74, 48, 2, 72, 50, 2, 70, 52, 4, 67, 56, 8]
wt.9.notes: [74, 0, 4, 75, 4, 4, 77, 8, 4, 79, 12, 4, 77, 16, 4, 74, 20, 4, 72, 24, 8]
wt.10.notes: [79, 0, 2, 77, 2, 2, 74, 4, 4, 72, 8, 4, 70, 12, 4, 67, 16, 8]
wt.11.notes: [67, 0, 12, 65, 12, 4]

tp.13.notes: [74, 0, 3, 77, 3, 3, 79, 6, 6, 77, 12, 4, 74, 16, 4, 72, 20, 4, 70, 24, 8]
tp.14.notes: [79, 0, 2, 81, 2, 2, 79, 4, 4, 77, 8, 4, 74, 12, 4, 72, 16, 8]

clips: [
  // intro (0-2) · sparse
  kick, 2, 0, 2,
  snare, 2, 0, 2,
  hihat, 2, 0, 2,
  mc, 2, 0, 2,
  wt, 7, 0, 2,

  // A groove (2-10) · clip ≈ pattern (P1 = 2 bars → max 2 loops)
  kick, 1, 2, 4,
  snare, 1, 2, 4,
  hihat, 1, 2, 4,
  mc, 1, 2, 4,
  bass, 3, 2, 2,
  an, 5, 2, 2,
  rg, 15, 2, 2,
  wt, 8, 2, 4,

  kick, 3, 6, 2,
  snare, 3, 6, 2,
  hihat, 1, 6, 2,
  mc, 1, 6, 2,
  bass, 4, 4, 2,
  an, 6, 4, 2,
  rg, 15, 4, 2,
  bass, 3, 6, 2,
  an, 5, 6, 2,
  rg, 15, 6, 2,
  wt, 8, 6, 2,

  kick, 1, 8, 2,
  snare, 1, 8, 2,
  hihat, 1, 8, 2,
  mc, 1, 8, 2,
  bass, 3, 8, 2,
  an, 5, 8, 2,
  rg, 16, 8, 2,
  wt, 9, 8, 2,

  // B lift (10-18)
  kick, 1, 10, 4,
  snare, 1, 10, 4,
  hihat, 1, 10, 4,
  mc, 1, 10, 4,
  bass, 4, 10, 2,
  an, 6, 10, 2,
  rg, 16, 10, 2,
  wt, 9, 10, 4,
  tp, 13, 10, 4,

  kick, 1, 14, 2,
  snare, 1, 14, 2,
  hihat, 1, 14, 2,
  mc, 1, 14, 2,
  bass, 3, 12, 2,
  an, 5, 12, 2,
  rg, 16, 12, 2,
  bass, 3, 14, 2,
  an, 5, 14, 2,
  wt, 10, 14, 2,
  tp, 13, 14, 2,

  kick, 3, 16, 2,
  snare, 3, 16, 2,
  hihat, 1, 16, 2,
  mc, 1, 16, 2,
  bass, 4, 16, 2,
  an, 6, 16, 2,
  wt, 10, 16, 2,
  tp, 14, 16, 2,

  // outro hit (18-24)
  kick, 1, 18, 4,
  snare, 1, 18, 4,
  hihat, 1, 18, 4,
  mc, 1, 18, 4,
  bass, 3, 18, 2,
  an, 5, 18, 2,
  rg, 15, 18, 2,
  wt, 11, 18, 2,

  bass, 4, 20, 2,
  an, 6, 20, 2,
  rg, 16, 20, 2,
  wt, 11, 20, 2,
  tp, 14, 20, 2,

  kick, 2, 22, 2,
  snare, 2, 22, 2,
  hihat, 2, 22, 2,
  mc, 2, 22, 2,
  wt, 7, 22, 2
]
`,
};
