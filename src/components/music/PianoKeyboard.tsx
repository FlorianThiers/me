import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  isBlackKey,
  isOctaveDownEvent,
  isOctaveUpEvent,
  noteName,
  typingBlocked,
  typingEventToMidi,
} from '../../music/midi';

type Props = {
  enabled: boolean;
  octave: number;
  onOctave: (octave: number) => void;
  onNoteOn: (midi: number) => void;
  onNoteOff: (midi: number) => void;
};

const WHITE = [0, 2, 4, 5, 7, 9, 11];

export const PianoKeyboard: React.FC<Props> = ({
  enabled,
  octave,
  onOctave,
  onNoteOn,
  onNoteOff,
}) => {
  const [held, setHeld] = useState<Set<number>>(() => new Set());
  const heldRef = useRef(held);
  heldRef.current = held;
  // Physical codes so keyup stays correct on AZERTY (e.key can differ).
  const codeToMidi = useRef(new Map<string, number>());

  const start = (octave + 1) * 12;
  const whites: number[] = [];
  for (let o = 0; o < 2; o += 1) {
    for (const w of WHITE) whites.push(start + o * 12 + w);
  }

  const press = useCallback(
    (midi: number) => {
      if (heldRef.current.has(midi)) return;
      setHeld((prev) => new Set(prev).add(midi));
      onNoteOn(midi);
    },
    [onNoteOn],
  );

  const release = useCallback(
    (midi: number) => {
      if (!heldRef.current.has(midi)) return;
      setHeld((prev) => {
        const next = new Set(prev);
        next.delete(midi);
        return next;
      });
      onNoteOff(midi);
    },
    [onNoteOff],
  );

  useEffect(() => {
    if (!enabled) return;
    const down = (e: KeyboardEvent) => {
      if (e.repeat || typingBlocked(e.target)) return;
      if (isOctaveDownEvent(e)) {
        e.preventDefault();
        onOctave(Math.max(1, octave - 1));
        return;
      }
      if (isOctaveUpEvent(e)) {
        e.preventDefault();
        onOctave(Math.min(7, octave + 1));
        return;
      }
      const midi = typingEventToMidi(e, octave);
      if (midi == null) return;
      e.preventDefault();
      codeToMidi.current.set(e.code, midi);
      press(midi);
    };
    const up = (e: KeyboardEvent) => {
      const mapped = codeToMidi.current.get(e.code);
      if (mapped != null) {
        codeToMidi.current.delete(e.code);
        release(mapped);
        return;
      }
      const midi = typingEventToMidi(e, octave);
      if (midi == null) return;
      release(midi);
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [enabled, octave, onOctave, press, release]);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 text-[9px] text-[#6a6a6a]">
        <span className={enabled ? 'text-[#c4783a]' : ''}>{enabled ? 'keys on' : 'keys off'}</span>
        <span title="Physical keys — same fingers on QWERTY/AZERTY">azerty: w–, · a–i · )/+ octaaf</span>
        <button
          type="button"
          onClick={() => onOctave(Math.max(1, octave - 1))}
          className="h-4 w-4 bg-[#242424] text-[#9a9a9a] hover:text-white"
        >
          −
        </button>
        <span className="font-mono text-[#c8c8c8]">C{octave}</span>
        <button
          type="button"
          onClick={() => onOctave(Math.min(7, octave + 1))}
          className="h-4 w-4 bg-[#242424] text-[#9a9a9a] hover:text-white"
        >
          +
        </button>
      </div>
      <div className="relative h-16">
        <div className="absolute inset-0 flex">
          {whites.map((midi) => (
            <button
              key={midi}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                press(midi);
              }}
              onMouseUp={() => release(midi)}
              onMouseLeave={() => release(midi)}
              className="relative min-w-0 flex-1 border border-[#111] text-[8px]"
              style={{
                background: held.has(midi) ? '#c4783a' : '#ece6d8',
                color: '#111',
              }}
            >
              {midi % 12 === 0 ? noteName(midi) : ''}
            </button>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-0 flex">
          {whites.map((midi) => {
            const black = midi + 1;
            const show = isBlackKey(black) && black % 12 !== 5 && black % 12 !== 0;
            const width = 100 / whites.length;
            return (
              <div key={`b-${midi}`} className="relative h-full" style={{ width: `${width}%` }}>
                {show && (
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      press(black);
                    }}
                    onMouseUp={(e) => {
                      e.stopPropagation();
                      release(black);
                    }}
                    onMouseLeave={() => release(black)}
                    className="pointer-events-auto absolute left-[62%] top-0 z-10 h-[58%] w-[70%] border border-[#111]"
                    style={{ background: held.has(black) ? '#e8a06a' : '#1a1a1a' }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
