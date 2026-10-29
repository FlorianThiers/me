import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { TRACK_COLORS } from '../../music/defaults';
import { FL } from '../../music/flTerms';
import {
  clipLoopCount,
  patternContentSteps,
  patternLengthBars,
  rackChannelList,
  songBarCount,
  trackLane,
} from '../../music/grid';
import type {
  AudioClip,
  BeatInfo,
  MidiNote,
  MusicProject,
  PlaylistClip,
  TrackId,
} from '../../music/types';
import { STEPS_PER_BAR } from '../../music/types';
import { isAudioTrack, isPercRollTrack } from '../../music/types';
import { useTrackLabels } from './MusicMetaContext';

type Props = {
  project: MusicProject;
  paintScene: number;
  paintTrack: TrackId;
  beatRef: React.RefObject<BeatInfo>;
  playing: boolean;
  snapBars: 1 | 2 | 4;
  selectedTrack: TrackId;
  onSelectTrack: (track: TrackId) => void;
  onChangeClips: (clips: PlaylistClip[]) => void;
  onChangeAudioClips: (clips: AudioClip[]) => void;
  onAddBars: (count: number) => void;
  onFocusClip: (track: TrackId, pattern: number) => void;
};

const CELL_W = 28;
const LANE_H = 52;
const LABEL_W = 96;
const RULER_H = 20;
const VOX_COLOR = TRACK_COLORS.vox;

/** FL-style mini piano-roll preview inside a Pattern clip. */
const ClipNotePreview: React.FC<{
  notes: MidiNote[];
  /** Pattern length in steps (e.g. 16 = 1 bar). */
  steps: number;
  /** Playlist clip length in bars. */
  clipBars: number;
  perc: boolean;
  /** FL wrap: tile pattern; classical clipWrap=false: show once. */
  wrap: boolean;
}> = ({ notes, steps, clipBars, perc, wrap }) => {
  if (!notes.length || steps <= 0 || clipBars <= 0) return null;
  const pitches = notes.map((n) => n.pitch);
  const lo = Math.min(...pitches);
  const hi = Math.max(...pitches);
  const span = Math.max(1, hi - lo);
  const patternBars = Math.max(1, steps / STEPS_PER_BAR);
  const repeats = wrap ? Math.max(1, Math.ceil(clipBars / patternBars)) : 1;
  const totalSteps = Math.max(steps, Math.round(clipBars * STEPS_PER_BAR));

  const tiles: { key: string; x: number; y: number; w: number; h: number }[] = [];
  for (let r = 0; r < repeats; r++) {
    const offset = r * steps;
    if (offset >= totalSteps) break;
    for (let i = 0; i < notes.length; i++) {
      const n = notes[i];
      const x = offset + n.start;
      if (x >= totalSteps) continue;
      const w = Math.min(Math.max(0.6, n.length), totalSteps - x);
      if (perc) {
        tiles.push({
          key: `${r}-${i}`,
          x,
          y: 38,
          w: Math.min(w, 1.2),
          h: 24,
        });
      } else {
        tiles.push({
          key: `${r}-${i}`,
          x,
          y: ((hi - n.pitch) / span) * 78 + 6,
          w,
          h: Math.max(8, 88 / (span + 2)),
        });
      }
    }
  }

  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox={`0 0 ${totalSteps} 100`}
      preserveAspectRatio="none"
      aria-hidden
    >
      {repeats > 1 &&
        Array.from({ length: repeats - 1 }, (_, i) => (
          <line
            key={`div-${i}`}
            x1={(i + 1) * steps}
            y1={4}
            x2={(i + 1) * steps}
            y2={96}
            stroke="#111"
            strokeOpacity={0.2}
            strokeWidth={0.4}
          />
        ))}
      {tiles.map((t) => (
        <rect
          key={t.key}
          x={t.x}
          y={t.y}
          width={t.w}
          height={t.h}
          rx={0.35}
          fill="#111"
          opacity={0.52}
        />
      ))}
    </svg>
  );
};

/**
 * Performant FL-style playlist:
 * - CSS bar grid (no per-cell buttons)
 * - Clip blocks only as DOM nodes
 * - Playhead updated imperatively (no React re-render per beat)
 */
export const PlaylistGrid: React.FC<Props> = React.memo(
  ({
    project,
    paintScene,
    paintTrack,
    beatRef,
    playing,
    snapBars,
    selectedTrack,
    onSelectTrack,
    onChangeClips,
    onChangeAudioClips,
    onAddBars,
    onFocusClip,
  }) => {
    const TRACK_LABELS = useTrackLabels();
    const bars = Math.max(songBarCount(project), 16);
    const clips = project.clips ?? [];
    const audioClips = project.audioClips ?? [];
    const song = project.playMode === 'arr';
    const wrap = project.clipWrap !== false;
    const channels = rackChannelList(project);
    const gridW = bars * CELL_W;
    const playheadRef = useRef<HTMLDivElement>(null);

    const [drag, setDrag] = useState<{
      index: number;
      fromTrack: TrackId;
      fromStart: number;
      grabBar: number;
      kind: 'pattern' | 'audio';
    } | null>(null);

    const gridBg = useMemo(
      () =>
        [
          `repeating-linear-gradient(90deg, #191919 0, #191919 ${CELL_W - 1}px, #111 ${CELL_W - 1}px, #111 ${CELL_W}px)`,
          `repeating-linear-gradient(90deg, transparent 0, transparent ${4 * CELL_W - 1}px, rgba(255,140,0,0.05) ${4 * CELL_W - 1}px, rgba(255,140,0,0.05) ${4 * CELL_W}px)`,
        ].join(', '),
      [],
    );

    const quantizeBar = useCallback(
      (bar: number) => Math.max(0, Math.round(bar / snapBars) * snapBars),
      [snapBars],
    );

    const place = useCallback(
      (track: TrackId, bar: number) => {
        if (isAudioTrack(track)) return;
        const qBar = quantizeBar(bar);
        const hit = clips.findIndex(
          (c) => c.track === track && qBar >= c.start && qBar < c.start + c.length,
        );
        if (hit >= 0) {
          onChangeClips(clips.filter((_, i) => i !== hit));
          return;
        }
        onChangeClips([
          ...clips,
          { track, pattern: paintScene, start: qBar, length: Math.max(1, snapBars) },
        ]);
        onSelectTrack(track);
      },
      [clips, onChangeClips, onSelectTrack, paintScene, quantizeBar, snapBars],
    );

    const movePatternClip = useCallback(
      (index: number, track: TrackId, start: number) => {
        if (isAudioTrack(track)) return;
        onChangeClips(
          clips.map((c, i) =>
            i === index ? { ...c, track, start: quantizeBar(start) } : c,
          ),
        );
      },
      [clips, onChangeClips, quantizeBar],
    );

    const moveAudioClip = useCallback(
      (index: number, lane: number, start: number) => {
        onChangeAudioClips(
          audioClips.map((c, i) =>
            i === index ? { ...c, lane, start: quantizeBar(start) } : c,
          ),
        );
      },
      [audioClips, onChangeAudioClips, quantizeBar],
    );

    const toggleTake = useCallback(
      (index: number) => {
        const clip = audioClips[index];
        if (!clip) return;
        const activating = clip.active <= 0;
        onChangeAudioClips(
          audioClips.map((c, i) => {
            if (i === index) return { ...c, active: activating ? 1 : 0 };
            if (activating && c.lane === clip.lane && c.start === clip.start) {
              return { ...c, active: 0 };
            }
            return c;
          }),
        );
      },
      [audioClips, onChangeAudioClips],
    );

    const barFromEvent = (e: React.PointerEvent<HTMLElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      return Math.floor((e.clientX - rect.left) / CELL_W);
    };

    const onLanePointerUp = useCallback(
      (track: TrackId, lane: number, e: React.PointerEvent<HTMLElement>) => {
        if (!drag) return;
        const bar = barFromEvent(e);
        const start = Math.max(0, drag.fromStart + (bar - drag.grabBar));
        if (drag.kind === 'pattern') movePatternClip(drag.index, track, start);
        else moveAudioClip(drag.index, lane, start);
        setDrag(null);
      },
      [drag, moveAudioClip, movePatternClip],
    );

    useEffect(() => {
      const el = playheadRef.current;
      if (!el) return;

      if (!playing || !song) {
        el.style.display = 'none';
        return;
      }

      el.style.display = 'block';
      let raf = 0;
      const tick = () => {
        const beat = beatRef.current;
        if (beat) {
          const px = (beat.bar + beat.step / STEPS_PER_BAR) * CELL_W;
          el.style.transform = `translateX(${px}px)`;
        }
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    }, [beatRef, playing, song]);

    return (
      <div className="flex h-full min-h-0 flex-col bg-[#161616]">
        <div className="flex h-7 shrink-0 items-center gap-2 border-b border-[#2a2a2a] px-2">
          <span className="text-[10px] text-[#8a8a8a]">
            {FL.playlist} · {bars} bars · {clips.length} clips · paint {TRACK_LABELS[paintTrack]} P{paintScene}
            {!wrap ? ' · no wrap' : ''}
          </span>
          <span className="text-[10px] text-[#3a3a3a]">
            Pattern clip = 1 channel · {FL.pianoRoll} for notes
          </span>
          <button
            type="button"
            onClick={() => onAddBars(4)}
            className="ml-auto flex h-5 items-center gap-1 bg-[#242424] px-1.5 text-[9px] text-[#9a9a9a] hover:text-white"
          >
            <Plus className="h-3 w-3" /> 4 bars
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-auto p-2" style={{ maxHeight: '100%' }}>
          <div style={{ minWidth: LABEL_W + gridW, minHeight: channels.length * (LANE_H + 4) + RULER_H }}>
            <div
              className="relative mb-1 flex pl-[96px]"
              style={{ height: RULER_H }}
            >
              {Array.from({ length: bars }, (_, i) => (
                <div
                  key={i}
                  className="shrink-0 text-center text-[8px] leading-5"
                  style={{ width: CELL_W, color: '#5a5a5a' }}
                >
                  {i + 1}
                </div>
              ))}
            </div>

            <div className="relative">
              {channels.map((track) => {
                const lane = trackLane(track);
                const label = TRACK_LABELS[track];
                const color = TRACK_COLORS[track];
                const isVox = isAudioTrack(track);
                return (
                  <div key={track} className="relative mb-1 flex items-stretch">
                    <button
                      type="button"
                      onClick={() => onSelectTrack(track)}
                      className="w-[96px] shrink-0 truncate text-left text-[10px]"
                      style={{ color: selectedTrack === track ? '#fff' : color }}
                      title={isVox ? 'Vocal takes' : `${label} lane`}
                    >
                      {label}
                    </button>
                    <div
                      data-role="lane"
                      className="relative touch-none"
                      style={{
                        width: gridW,
                        height: LANE_H,
                        background: `${gridBg}, ${selectedTrack === track ? '#1a1a1a' : '#141414'}`,
                        cursor: isVox ? 'default' : 'crosshair',
                      }}
                      onPointerDown={(e) => {
                        if ((e.target as HTMLElement).closest('[data-role="clip"]')) return;
                        if (isVox) return;
                        place(track, barFromEvent(e));
                      }}
                      onPointerUp={(e) => onLanePointerUp(track, lane, e)}
                    >
                      {!isVox &&
                        clips
                          .map((clip, index) => ({ clip, index }))
                          .filter(({ clip }) => clip.track === track)
                          .map(({ clip, index }) => (
                            <div
                              key={`p-${clip.track}-${clip.start}-${index}`}
                              data-role="clip"
                              role="button"
                              tabIndex={0}
                              className="absolute top-1 overflow-hidden border border-[#111] text-left font-mono text-[8px] text-[#111]"
                              style={{
                                left: clip.start * CELL_W + 1,
                                width: Math.max(CELL_W - 2, clip.length * CELL_W - 2),
                                height: LANE_H - 8,
                                background: color,
                              }}
                              onPointerDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const bar = Math.floor(
                                  (e.nativeEvent.offsetX + clip.start * CELL_W) / CELL_W,
                                );
                                setDrag({
                                  index,
                                  fromTrack: track,
                                  fromStart: clip.start,
                                  grabBar: bar,
                                  kind: 'pattern',
                                });
                                onSelectTrack(track);
                                onFocusClip(track, clip.pattern);
                              }}
                              onDoubleClick={(e) => {
                                e.stopPropagation();
                                onChangeClips(clips.filter((_, i) => i !== index));
                              }}
                            >
                              <ClipNotePreview
                                notes={project.notes?.[track]?.[clip.pattern - 1] ?? []}
                                steps={patternContentSteps(project, track, clip.pattern - 1)}
                                clipBars={clip.length}
                                perc={isPercRollTrack(track)}
                                wrap={wrap}
                              />
                              <span className="relative z-[1] px-1 font-semibold drop-shadow-sm">
                                P{clip.pattern}
                                {(() => {
                                  const pb = patternLengthBars(project, track, clip.pattern - 1);
                                  const loops = clipLoopCount(clip.length, pb);
                                  if (wrap && loops > 1) return ` ·×${loops}`;
                                  if (!wrap && clip.length > pb) return ' ·once';
                                  return '';
                                })()}
                              </span>
                            </div>
                          ))}

                      {isVox &&
                        audioClips
                          .map((clip, index) => ({ clip, index }))
                          .filter(({ clip }) => clip.lane === lane)
                          .map(({ clip, index }) => (
                            <div
                              key={`a-${clip.lane}-${clip.start}-${clip.take}-${index}`}
                              data-role="clip"
                              role="button"
                              tabIndex={0}
                              className="absolute top-1 overflow-hidden border px-1 text-left font-mono text-[9px]"
                              style={{
                                left: clip.start * CELL_W + 1,
                                width: Math.max(CELL_W - 2, clip.length * CELL_W - 2),
                                height: LANE_H - 8,
                                background: VOX_COLOR,
                                color: '#111',
                                borderColor: clip.active > 0 ? '#fff' : '#444',
                                opacity: clip.active > 0 ? 1 : 0.35,
                              }}
                              title={
                                clip.active > 0 ? 'active take' : 'muted take · click to comp'
                              }
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleTake(index);
                              }}
                              onPointerDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const bar = Math.floor(
                                  (e.nativeEvent.offsetX + clip.start * CELL_W) / CELL_W,
                                );
                                setDrag({
                                  index,
                                  fromTrack: 'vox',
                                  fromStart: clip.start,
                                  grabBar: bar,
                                  kind: 'audio',
                                });
                                onSelectTrack('vox');
                              }}
                              onDoubleClick={(e) => {
                                e.stopPropagation();
                                onChangeAudioClips(audioClips.filter((_, i) => i !== index));
                              }}
                            >
                              T{clip.take}
                            </div>
                          ))}
                    </div>
                  </div>
                );
              })}

              {song && (
                <div
                  ref={playheadRef}
                  className="pointer-events-none absolute bottom-0 top-0 z-20 w-0.5"
                  style={{
                    left: LABEL_W,
                    background: '#ff8c00',
                    boxShadow: '0 0 6px #ff8c00',
                    display: 'none',
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  },
);

PlaylistGrid.displayName = 'PlaylistGrid';
