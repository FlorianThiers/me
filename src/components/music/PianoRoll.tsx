import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, LayoutList, Plus } from 'lucide-react';
import { TRACK_COLORS } from '../../music/defaults';
import { patternLengthBars, rackStepForTrack } from '../../music/grid';
import { FL } from '../../music/flTerms';
import { isBlackKey, noteName } from '../../music/midi';
import {
  STEPS_PER_BAR,
  type BeatInfo,
  type MidiNote,
  type MusicProject,
  type TrackId,
} from '../../music/types';
import { useTrackLabels } from './MusicMetaContext';
import { STUDIO } from './studioTheme';

type Props = {
  project: MusicProject;
  track: TrackId;
  scene: number;
  steps: number;
  clipBars: number;
  beatRef: React.RefObject<BeatInfo>;
  playing: boolean;
  snapSteps: 1 | 2 | 4;
  onChange: (notes: MidiNote[]) => void;
  onExtend: (addBars: number) => void;
  onSetLength: (steps: number) => void;
  onPreview: (midi: number) => void;
  onDropClip: () => void;
  onShowPlaylist?: () => void;
};

const MIDI_MIN = 24;
const MIDI_MAX = 108;
const DEFAULT_LOW = 36;
const DEFAULT_HIGH = 96;
const ROW_H = 16;
const COL_W = 20;
const KEY_W = 48;
const HEADER_H = 20;

/**
 * Performant FL-style piano roll:
 * - CSS background grid (no per-cell DOM)
 * - Only note blocks as elements
 * - Single pointer handler on the grid
 */
export const PianoRoll: React.FC<Props> = React.memo(
  ({
    project,
    track,
    scene,
    steps,
    clipBars,
    beatRef,
    playing,
    snapSteps,
    onChange,
    onExtend,
    onSetLength,
    onPreview,
    onDropClip,
    onShowPlaylist,
  }) => {
    const TRACK_LABELS = useTrackLabels();
    const sceneIdx = Math.max(0, scene - 1);
    const notes = project.notes?.[track]?.[sceneIdx] ?? [];
    const color = TRACK_COLORS[track];
    const bars = patternLengthBars(project, track, sceneIdx);
    const scrollRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);
    const playheadRef = useRef<HTMLDivElement>(null);

    const [low, setLow] = useState(DEFAULT_LOW);
    const [high, setHigh] = useState(DEFAULT_HIGH);
    const [ghost, setGhost] = useState<{ pitch: number; start: number; length: number } | null>(null);

    const drag = useRef<{ pitch: number; start: number; erase: boolean } | null>(null);
    const endDrag = useRef<{ startX: number; startSteps: number } | null>(null);
    const lengthRaf = useRef(0);

    useEffect(() => {
      const el = playheadRef.current;
      if (!el) return;

      if (!playing) {
        el.style.display = 'none';
        return;
      }

      el.style.display = 'block';
      const stepLen = Math.max(1, steps);
      let raf = 0;
      const tick = () => {
        const beat = beatRef.current;
        if (beat) {
          const rackStep = rackStepForTrack(project, track, beat);
          const playStep = ((rackStep % stepLen) + stepLen) % stepLen;
          const x = playStep * COL_W;
          el.style.transform = `translateX(${x}px)`;
          const scroller = scrollRef.current;
          if (scroller) {
            const view = scroller.clientWidth - KEY_W;
            if (x < scroller.scrollLeft + 40 || x > scroller.scrollLeft + view - 40) {
              scroller.scrollLeft = Math.max(0, x - view * 0.35);
            }
          }
        }
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    }, [beatRef, playing, project, steps, track]);

    const pitches = useMemo(() => {
      const rows: number[] = [];
      const top = Math.min(MIDI_MAX, high);
      const bot = Math.max(MIDI_MIN, low);
      for (let p = top; p >= bot; p -= 1) rows.push(p);
      return rows;
    }, [low, high]);

    const pitchIndex = useMemo(() => {
      const map = new Map<number, number>();
      pitches.forEach((p, i) => map.set(p, i));
      return map;
    }, [pitches]);

    const displaySteps = steps;
    const gridW = displaySteps * COL_W;
    const gridH = pitches.length * ROW_H;

    const gridBg = useMemo(() => {
      // Horizontal row stripes + vertical bar/step lines via layered gradients
      return [
        // bar lines
        `repeating-linear-gradient(90deg, transparent 0, transparent ${STEPS_PER_BAR * COL_W - 1}px, #2a2a2a ${STEPS_PER_BAR * COL_W - 1}px, #2a2a2a ${STEPS_PER_BAR * COL_W}px)`,
        // beat lines (every 4 steps)
        `repeating-linear-gradient(90deg, transparent 0, transparent ${4 * COL_W - 1}px, #1c1c1c ${4 * COL_W - 1}px, #1c1c1c ${4 * COL_W}px)`,
        // step lines
        `repeating-linear-gradient(90deg, transparent 0, transparent ${COL_W - 1}px, #141414 ${COL_W - 1}px, #141414 ${COL_W}px)`,
        // row lines
        `repeating-linear-gradient(180deg, transparent 0, transparent ${ROW_H - 1}px, #111 ${ROW_H - 1}px, #111 ${ROW_H}px)`,
        // black-key rows (approximate: odd rows darker — real black keys via overlay rows is heavy; solid base)
        `#171717`,
      ].join(', ');
    }, []);

    useEffect(() => {
      const el = scrollRef.current;
      if (!el) return;
      const focusPitch =
        notes.length > 0
          ? Math.round(notes.reduce((s, n) => s + n.pitch, 0) / notes.length)
          : 60;
      const row = pitchIndex.get(focusPitch);
      if (row == null) return;
      el.scrollTop = Math.max(0, row * ROW_H - el.clientHeight * 0.35);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [track, scene, low, high]);

    const quantizeStep = useCallback(
      (value: number) => Math.max(0, Math.round(value / snapSteps) * snapSteps),
      [snapSteps],
    );

    const cellFromEvent = useCallback(
      (e: React.PointerEvent | PointerEvent) => {
        const el = gridRef.current;
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const step = Math.max(0, Math.min(displaySteps - 1, Math.floor(x / COL_W)));
        const row = Math.max(0, Math.min(pitches.length - 1, Math.floor(y / ROW_H)));
        return { step, pitch: pitches[row], row };
      },
      [displaySteps, pitches],
    );

    const paint = useCallback(
      (pitch: number, start: number, length: number) => {
        const qStart = quantizeStep(start);
        const qLen = Math.max(snapSteps, Math.round(length / snapSteps) * snapSteps);
        const needed = qStart + qLen;
        if (needed > steps) onSetLength(needed);
        const next = notes.filter(
          (n) => !(n.pitch === pitch && n.start < qStart + qLen && n.start + n.length > qStart),
        );
        onChange([...next, { pitch, start: qStart, length: qLen }]);
      },
      [notes, onChange, onSetLength, quantizeStep, snapSteps, steps],
    );

    const eraseAt = useCallback(
      (pitch: number, start: number) => {
        onChange(
          notes.filter((n) => !(n.pitch === pitch && start >= n.start && start < n.start + n.length)),
        );
      },
      [notes, onChange],
    );

    const onGridPointerDown = (e: React.PointerEvent) => {
      if (e.button === 1) return;
      e.preventDefault();
      const cell = cellFromEvent(e);
      if (!cell) return;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

      if (e.button === 2 || e.shiftKey) {
        drag.current = { pitch: cell.pitch, start: cell.step, erase: true };
        eraseAt(cell.pitch, cell.step);
        return;
      }

      drag.current = { pitch: cell.pitch, start: cell.step, erase: false };
      setGhost({ pitch: cell.pitch, start: cell.step, length: 1 });
      onPreview(cell.pitch);
    };

    const onGridPointerMove = (e: React.PointerEvent) => {
      const d = drag.current;
      if (!d) return;
      const cell = cellFromEvent(e);
      if (!cell) return;
      if (d.erase) {
        if (cell.pitch === d.pitch) eraseAt(cell.pitch, cell.step);
        return;
      }
      if (cell.pitch !== d.pitch) return;
      setGhost({
        pitch: d.pitch,
        start: d.start,
        length: Math.max(1, cell.step - d.start + 1),
      });
    };

    const onGridPointerUp = () => {
      const d = drag.current;
      if (!d) return;
      if (!d.erase && ghost) {
        paint(d.pitch, d.start, ghost.length);
      }
      drag.current = null;
      setGhost(null);
    };

    const scheduleSetLength = (next: number) => {
      cancelAnimationFrame(lengthRaf.current);
      lengthRaf.current = requestAnimationFrame(() => onSetLength(next));
    };

    const barCount = Math.ceil(displaySteps / STEPS_PER_BAR);

    return (
      <div className="flex h-full min-h-0 flex-col" style={{ background: '#121212' }}>
        <div
          className="flex h-8 shrink-0 items-center gap-2 border-b px-2"
          style={{ borderColor: STUDIO.border }}
        >
          <span className="text-[11px] font-medium" style={{ color: STUDIO.text }}>
            {TRACK_LABELS[track]} · P{scene}
          </span>
          <span className="text-[10px]" style={{ color: STUDIO.textMuted }}>
            {notes.length} notes · {bars} bars
          </span>
          {clipBars > 0 && (
            <span className="text-[10px]" style={{ color: STUDIO.accent }}>
              clip ×{clipBars}
            </span>
          )}
          {onShowPlaylist && (
            <button
              type="button"
              onClick={onShowPlaylist}
              className="ml-1 flex h-6 items-center gap-1 px-2 text-[10px]"
              style={{ background: STUDIO.surface, color: STUDIO.textMuted }}
            >
              <LayoutList className="h-3 w-3" />
              Playlist
            </button>
          )}
          <div className="ml-auto flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => setHigh((h) => Math.min(MIDI_MAX, h + 12))}
              className="flex h-6 w-6 items-center justify-center"
              style={{ background: STUDIO.surface, color: STUDIO.textMuted }}
              title="+ octaaf hoog"
            >
              <ChevronUp className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setLow((l) => Math.max(MIDI_MIN, l - 12))}
              className="flex h-6 w-6 items-center justify-center"
              style={{ background: STUDIO.surface, color: STUDIO.textMuted }}
              title="+ octaaf laag"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onExtend(8)}
              className="flex h-6 items-center gap-1 px-2 text-[10px] font-semibold"
              style={{ background: STUDIO.accent, color: STUDIO.accentText }}
              title="Extend Pattern by 8 bars (FL: write long ideas)"
            >
              <Plus className="h-3 w-3" />8 bars
            </button>
            <button
              type="button"
              onClick={() => onExtend(1)}
              className="ml-1 flex h-6 items-center gap-1 px-2 text-[10px]"
              style={{ background: STUDIO.surface, color: STUDIO.textMuted }}
            >
              <Plus className="h-3 w-3" />1
            </button>
            <button
              type="button"
              onClick={() => onExtend(4)}
              className="flex h-6 items-center gap-1 px-2 text-[10px]"
              style={{ background: STUDIO.surface, color: STUDIO.textMuted }}
            >
              <Plus className="h-3 w-3" />4
            </button>
            <button
              type="button"
              onClick={onDropClip}
              className="h-6 px-2 text-[10px] font-semibold"
              style={{ background: STUDIO.surface, color: STUDIO.text }}
            >
              → {FL.playlist}
            </button>
          </div>
        </div>

        <div ref={scrollRef} className="min-h-0 flex-1 overflow-auto">
          <div className="flex" style={{ minWidth: KEY_W + gridW }}>
            {/* Piano keys — only ~60 elements */}
            <div
              className="sticky left-0 z-20 shrink-0"
              style={{ width: KEY_W, background: '#161616' }}
            >
              <div style={{ height: HEADER_H, background: '#141414' }} />
              {pitches.map((p) => (
                <button
                  key={p}
                  type="button"
                  onMouseDown={() => onPreview(p)}
                  className="block w-full truncate border-b border-[#111] pr-1.5 text-right font-mono text-[9px]"
                  style={{
                    height: ROW_H,
                    background: isBlackKey(p) ? '#1a1a1a' : '#242424',
                    color: p % 12 === 0 ? '#e0e0e0' : '#6a6a6a',
                  }}
                >
                  {p % 12 === 0 ? noteName(p) : ''}
                </button>
              ))}
            </div>

            <div className="relative shrink-0" style={{ width: gridW }}>
              {/* Bar ruler */}
              <div
                className="sticky top-0 z-10 flex border-b"
                style={{ height: HEADER_H, borderColor: '#222', background: '#141414' }}
              >
                {Array.from({ length: barCount }, (_, bar) => (
                  <div
                    key={bar}
                    className="shrink-0 border-r text-center text-[9px] leading-5"
                    style={{
                      width: STEPS_PER_BAR * COL_W,
                      borderColor: '#222',
                      color: bar < bars ? '#9a9a9a' : '#444',
                    }}
                  >
                    {bar + 1}
                  </div>
                ))}
              </div>

              {/* Grid surface — ONE interactive layer */}
              <div
                ref={gridRef}
                className="relative touch-none"
                style={{
                  width: gridW,
                  height: gridH,
                  background: gridBg,
                  cursor: 'crosshair',
                }}
                onContextMenu={(e) => e.preventDefault()}
                onPointerDown={onGridPointerDown}
                onPointerMove={onGridPointerMove}
                onPointerUp={onGridPointerUp}
                onPointerCancel={onGridPointerUp}
              >
                {/* Black-key row tint (CSS, few rows) */}
                {pitches.map((p, row) =>
                  isBlackKey(p) ? (
                    <div
                      key={`bk-${p}`}
                      className="pointer-events-none absolute left-0 right-0"
                      style={{
                        top: row * ROW_H,
                        height: ROW_H,
                        background: 'rgba(0,0,0,0.22)',
                      }}
                    />
                  ) : null,
                )}

                {/* Notes only */}
                {notes.map((n, i) => {
                  const rowIdx = pitchIndex.get(n.pitch);
                  if (rowIdx == null) return null;
                  return (
                    <div
                      key={`${n.pitch}-${n.start}-${i}`}
                      className="absolute z-[1] rounded-[1px] border border-black/50"
                      style={{
                        left: n.start * COL_W + 1,
                        top: rowIdx * ROW_H + 1,
                        width: Math.max(COL_W - 2, n.length * COL_W - 2),
                        height: ROW_H - 2,
                        background: color,
                        pointerEvents: 'none',
                      }}
                    />
                  );
                })}

                {ghost && (
                  <div
                    className="pointer-events-none absolute z-[2] rounded-[1px] border"
                    style={{
                      left: ghost.start * COL_W + 1,
                      top: (pitchIndex.get(ghost.pitch) ?? 0) * ROW_H + 1,
                      width: Math.max(COL_W - 2, ghost.length * COL_W - 2),
                      height: ROW_H - 2,
                      background: color,
                      opacity: 0.4,
                      borderColor: STUDIO.accent,
                    }}
                  />
                )}

                {/* Playhead — updated imperatively (no beat re-renders) */}
                <div
                  ref={playheadRef}
                  className="pointer-events-none absolute bottom-0 top-0 z-[4] w-0.5"
                  style={{
                    left: 0,
                    background: STUDIO.accent,
                    boxShadow: `0 0 6px ${STUDIO.accent}`,
                    display: 'none',
                  }}
                />

                {/* Pattern end handle */}
                <div
                  className="absolute bottom-0 top-0 z-[5] w-3 -translate-x-1/2 cursor-ew-resize"
                  style={{ left: steps * COL_W }}
                  title="Sleep = pattern lengte"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    endDrag.current = { startX: e.clientX, startSteps: steps };
                    const onMove = (ev: PointerEvent) => {
                      if (!endDrag.current) return;
                      const dx = ev.clientX - endDrag.current.startX;
                      scheduleSetLength(
                        Math.max(
                          STEPS_PER_BAR,
                          endDrag.current.startSteps + Math.round(dx / COL_W),
                        ),
                      );
                    };
                    const onUp = () => {
                      endDrag.current = null;
                      window.removeEventListener('pointermove', onMove);
                      window.removeEventListener('pointerup', onUp);
                    };
                    window.addEventListener('pointermove', onMove);
                    window.addEventListener('pointerup', onUp);
                  }}
                >
                  <div
                    className="absolute bottom-0 top-0 left-1/2 w-0.5 -translate-x-1/2"
                    style={{ background: STUDIO.accent }}
                  />
                  <div
                    className="absolute top-0 left-1/2 h-3 w-3 -translate-x-1/2 rounded-sm"
                    style={{ background: STUDIO.accent }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

PianoRoll.displayName = 'PianoRoll';
