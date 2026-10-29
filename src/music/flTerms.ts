/**
 * FL Studio terminology we mirror in the UI.
 * Keep labels consistent — do not invent parallel names (session/arr/metro).
 *
 * | FL name            | Our panel / control                         |
 * |--------------------|---------------------------------------------|
 * | Channel Rack       | Channel rack (F6) — instruments / channels  |
 * | Playlist           | Playlist (F5) — song arrangement            |
 * | Piano roll         | Piano roll (F7) — notes inside a Pattern    |
 * | Mixer              | Mixer (F9)                                  |
 * | Pattern            | Pattern P# — musical idea of any length     |
 * | Pattern clip       | Clip on a Playlist track                    |
 * | Pattern mode       | Transport "Pattern" (loop current Pattern)  |
 * | Song mode          | Transport "Song" (play Playlist)            |
 * | Channel            | One instrument lane (Kick, Piano, …)        |
 * | Browser            | Left strip / song library                   |
 * | Transport          | Top bar Play / Stop / BPM / Click           |
 * | Click              | Metronome (default OFF)                     |
 * | Snap               | Grid snap (steps / bars)                    |
 * | Swing              | Groove / swing                              |
 *
 * Mental model (FL):
 * 1. Draw a long Pattern in the Piano roll (not 1-bar cells by default).
 * 2. Drop Pattern clips on the Playlist.
 * 3. Clip longer than Pattern content → FL wraps (loop). Classical may disable wrap.
 */

export const FL = {
  channelRack: 'Channel rack',
  playlist: 'Playlist',
  pianoRoll: 'Piano roll',
  mixer: 'Mixer',
  pattern: 'Pattern',
  patternClip: 'Pattern clip',
  patternMode: 'Pattern',
  songMode: 'Song',
  channel: 'Channel',
  browser: 'Browser',
  transport: 'Transport',
  click: 'Click',
  snap: 'Snap',
  swing: 'Swing',
  sound: 'Channel settings',
  scope: 'Oscilloscope',
  livecode: 'Livecode',
} as const;

export type FlTerm = (typeof FL)[keyof typeof FL];
