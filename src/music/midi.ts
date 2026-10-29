/** MIDI helpers + FL-style typing keyboard (Ctrl+T analogue). */

export function midiToHz(midi: number): number {
  return 440 * 2 ** ((midi - 69) / 12);
}

export function isBlackKey(midi: number): boolean {
  return [1, 3, 6, 8, 10].includes(((midi % 12) + 12) % 12);
}

export function noteName(midi: number): string {
  const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const n = Math.max(0, Math.min(127, Math.round(midi)));
  return `${names[n % 12]}${Math.floor(n / 12) - 1}`;
}

/**
 * FL typing-keyboard by *physical* key (`KeyboardEvent.code`).
 * Layout-independent: QWERTY and AZERTY (BE/FR) use the same finger positions.
 *
 * Bottom row KeyZ…KeyM = C…B of `octave`
 * Top row KeyQ…KeyI = C…C of octave+1
 *
 * AZERTY labels you see: w s x d c v g b h n j ,   ·   a z e r t y u i
 */
export const TYPING_CODE_SEMITONE: Record<string, number> = {
  KeyZ: 0,
  KeyS: 1,
  KeyX: 2,
  KeyD: 3,
  KeyC: 4,
  KeyV: 5,
  KeyG: 6,
  KeyB: 7,
  KeyH: 8,
  KeyN: 9,
  KeyJ: 10,
  KeyM: 11,
  Comma: 12,
  KeyL: 13,
  Period: 14,
  Semicolon: 15,
  Slash: 16,
  KeyQ: 12,
  Digit2: 13,
  KeyW: 14,
  Digit3: 15,
  KeyE: 16,
  KeyR: 17,
  Digit5: 18,
  KeyT: 19,
  Digit6: 20,
  KeyY: 21,
  Digit7: 22,
  KeyU: 23,
  KeyI: 24,
  Digit9: 25,
  KeyO: 26,
  Digit0: 27,
  KeyP: 28,
  BracketLeft: 29,
  Equal: 30,
  BracketRight: 31,
};

export function typingEventToMidi(e: Pick<KeyboardEvent, 'code' | 'key'>, octave: number): number | null {
  const rel = TYPING_CODE_SEMITONE[e.code];
  if (rel == null) return null;
  return Math.max(0, Math.min(127, (octave + 1) * 12 + rel));
}

/** @deprecated prefer typingEventToMidi */
export function typingKeyToMidi(key: string, octave: number): number | null {
  // Best-effort for legacy callers — physical codes preferred.
  const legacy: Record<string, string> = {
    z: 'KeyZ', s: 'KeyS', x: 'KeyX', d: 'KeyD', c: 'KeyC', v: 'KeyV',
    g: 'KeyG', b: 'KeyB', h: 'KeyH', n: 'KeyN', j: 'KeyJ', m: 'KeyM',
    w: 'KeyZ', // AZERTY bottom-left prints W, physical KeyZ
    a: 'KeyQ', // AZERTY top-left prints A, physical KeyQ
    q: 'KeyQ', e: 'KeyE', r: 'KeyR', t: 'KeyT', y: 'KeyY', u: 'KeyU', i: 'KeyI',
  };
  const code = legacy[key.toLowerCase()];
  if (!code) return null;
  return typingEventToMidi({ code, key }, octave);
}

export function isOctaveDownEvent(e: Pick<KeyboardEvent, 'code' | 'key'>): boolean {
  // Physical Minus (AZERTY: often ) °) + common glyphs
  return e.code === 'Minus' || e.key === '-' || e.key === '_' || e.key === ')' || e.key === '°';
}

export function isOctaveUpEvent(e: Pick<KeyboardEvent, 'code' | 'key'>): boolean {
  // Physical Equal / numpad +, AZERTY + via shift on Equal
  return e.code === 'Equal' || e.code === 'NumpadAdd' || e.key === '=' || e.key === '+';
}

export function typingBlocked(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  return Boolean(el.isContentEditable);
}
