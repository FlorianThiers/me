import type { TrackId } from './types';
import { TRACK_IDS } from './types';

/** Physical key codes for scene launch (1…8 → scene index 0…7). */
export const LIVE_SET_SCENE_CODES = [
  'Digit1',
  'Digit2',
  'Digit3',
  'Digit4',
  'Digit5',
  'Digit6',
  'Digit7',
  'Digit8',
] as const;

/** Q-, A-, Z-row physical codes; one column per TRACK_IDS entry (slot 1…3). */
export const LIVE_SET_CLIP_ROWS: readonly (readonly string[])[] = [
  ['KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU', 'KeyI', 'KeyO', 'KeyP'],
  ['KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ', 'KeyK', 'KeyL', 'Quote'],
  ['KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM', 'Comma', 'Period', 'Slash'],
];

export type LiveSetKeyAction =
  | { type: 'launchClip'; trackId: TrackId; slot: number }
  | { type: 'stopClip'; trackId: TrackId }
  | { type: 'launchScene'; sceneIdx: number };

export type LiveSetKeyBinding = { track: TrackId; slot: number };

/** QWERTY finger-position label for a physical `KeyboardEvent.code`. */
export const LIVE_SET_CODE_LABEL: Record<string, string> = {
  Digit1: '1',
  Digit2: '2',
  Digit3: '3',
  Digit4: '4',
  Digit5: '5',
  Digit6: '6',
  Digit7: '7',
  Digit8: '8',
  KeyQ: 'Q',
  KeyW: 'W',
  KeyE: 'E',
  KeyR: 'R',
  KeyT: 'T',
  KeyY: 'Y',
  KeyU: 'U',
  KeyI: 'I',
  KeyO: 'O',
  KeyP: 'P',
  KeyA: 'A',
  KeyS: 'S',
  KeyD: 'D',
  KeyF: 'F',
  KeyG: 'G',
  KeyH: 'H',
  KeyJ: 'J',
  KeyK: 'K',
  KeyL: 'L',
  Quote: "'",
  KeyZ: 'Z',
  KeyX: 'X',
  KeyC: 'C',
  KeyV: 'V',
  KeyB: 'B',
  KeyN: 'N',
  KeyM: 'M',
  Comma: ',',
  Period: '.',
  Slash: '/',
};

const ALIAS_TO_CODE: Record<string, string> = {
  '1': 'Digit1',
  '2': 'Digit2',
  '3': 'Digit3',
  '4': 'Digit4',
  '5': 'Digit5',
  '6': 'Digit6',
  '7': 'Digit7',
  '8': 'Digit8',
  q: 'KeyQ',
  w: 'KeyW',
  e: 'KeyE',
  r: 'KeyR',
  t: 'KeyT',
  y: 'KeyY',
  u: 'KeyU',
  i: 'KeyI',
  o: 'KeyO',
  p: 'KeyP',
  a: 'KeyA',
  s: 'KeyS',
  d: 'KeyD',
  f: 'KeyF',
  g: 'KeyG',
  h: 'KeyH',
  j: 'KeyJ',
  k: 'KeyK',
  l: 'KeyL',
  "'": 'Quote',
  z: 'KeyZ',
  x: 'KeyX',
  c: 'KeyC',
  v: 'KeyV',
  b: 'KeyB',
  n: 'KeyN',
  m: 'KeyM',
  ',': 'Comma',
  '.': 'Period',
  '/': 'Slash',
};

export function liveSetCodeLabel(code: string): string {
  return LIVE_SET_CODE_LABEL[code] ?? code.replace(/^Key/, '');
}

/** Parse bind target token (`kick.2`) or return null. */
export function parseLiveSetBindTarget(raw: string): LiveSetKeyBinding | null {
  const m = raw.trim().match(/^([\w]+)\.(\d+)$/i);
  if (!m) return null;
  const track = m[1].toLowerCase();
  if (!(TRACK_IDS as readonly string[]).includes(track)) return null;
  const slot = Math.max(1, Math.round(Number(m[2])));
  return { track: track as TrackId, slot };
}

/** Map REPL / bind token to a physical key code. */
export function parseLiveSetKeyToken(raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;
  if (t.startsWith('Key') || t.startsWith('Digit') || t === 'Quote' || t === 'Comma' || t === 'Period' || t === 'Slash') {
    return t;
  }
  if (t.length === 1) {
    const code = ALIAS_TO_CODE[t.toLowerCase()] ?? ALIAS_TO_CODE[t];
    return code ?? null;
  }
  return ALIAS_TO_CODE[t.toLowerCase()] ?? null;
}

export function defaultClipBindingForCode(code: string): LiveSetKeyBinding | null {
  for (let slot = 0; slot < LIVE_SET_CLIP_ROWS.length; slot += 1) {
    const row = LIVE_SET_CLIP_ROWS[slot];
    const col = row.indexOf(code);
    if (col >= 0 && col < TRACK_IDS.length) {
      return { track: TRACK_IDS[col], slot: slot + 1 };
    }
  }
  return null;
}

export function resolveLiveSetAction(
  code: string,
  shift: boolean,
  overrides: Record<string, LiveSetKeyBinding>,
): LiveSetKeyAction | null {
  const clip =
    overrides[code] ??
    defaultClipBindingForCode(code);

  if (shift) {
    if (clip) return { type: 'stopClip', trackId: clip.track };
    return null;
  }

  const sceneIdx = LIVE_SET_SCENE_CODES.indexOf(code as (typeof LIVE_SET_SCENE_CODES)[number]);
  if (sceneIdx >= 0) return { type: 'launchScene', sceneIdx };

  if (clip) return { type: 'launchClip', trackId: clip.track, slot: clip.slot };
  return null;
}

/** Default key label shown in grid cell (track × slot). */
export function defaultKeyLabelForCell(trackIdx: number, slot: number): string | null {
  const row = LIVE_SET_CLIP_ROWS[slot - 1];
  if (!row || trackIdx < 0 || trackIdx >= row.length) return null;
  return liveSetCodeLabel(row[trackIdx]);
}
