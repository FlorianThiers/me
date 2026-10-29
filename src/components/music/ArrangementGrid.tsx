import React from 'react';
import { Plus } from 'lucide-react';
import { TRACK_COLORS, TRACK_LABELS } from '../../music/defaults';
import { arrangementLength, sceneCount } from '../../music/grid';
import type { MusicProject, TrackId } from '../../music/types';
import { TRACK_IDS } from '../../music/types';

type Props = {
  project: MusicProject;
  selected: TrackId;
  paintScene: number;
  currentBar: number;
  currentBeat: number;
  playing: boolean;
  onSelectTrack: (id: TrackId) => void;
  onPaintClip: (track: TrackId, bar: number, scene: number) => void;
  onAddBars: (count: number) => void;
};

export const ArrangementGrid: React.FC<Props> = ({
  project,
  selected,
  paintScene,
  currentBar,
  currentBeat,
  playing,
  onSelectTrack,
  onPaintClip,
  onAddBars,
}) => {
  const bars = arrangementLength(project);
  const scenes = sceneCount(project);
  const cellW = 36;
  const song = project.playMode === 'arr';

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#161616]">
      <div className="flex h-7 shrink-0 items-center gap-2 border-b border-[#2a2a2a] px-2">
        <span className="text-[10px] text-[#8a8a8a]">
          {bars} blocks · paint session {paintScene}
        </span>
        <span className="text-[10px] text-[#3a3a3a]">click place · click again clear</span>
        <button
          type="button"
          onClick={() => onAddBars(4)}
          className="ml-auto flex h-5 items-center gap-1 bg-[#242424] px-1.5 text-[9px] text-[#9a9a9a] hover:text-white"
        >
          <Plus className="h-3 w-3" /> 4 blocks
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-2">
        <div style={{ minWidth: 72 + bars * cellW }}>
          <div className="mb-1 flex pl-[72px]">
            {Array.from({ length: bars }, (_, i) => (
              <div
                key={i}
                className="shrink-0 text-center text-[8px]"
                style={{
                  width: cellW,
                  color: song && playing && currentBar === i ? '#c4783a' : '#5a5a5a',
                }}
              >
                {i + 1}
              </div>
            ))}
          </div>
          <div className="space-y-1">
            {TRACK_IDS.map((id) => (
              <div key={id} className="flex items-center">
                <button
                  type="button"
                  onClick={() => onSelectTrack(id)}
                  className="w-[72px] shrink-0 truncate text-left text-[10px]"
                  style={{ color: selected === id ? '#fff' : TRACK_COLORS[id] }}
                >
                  {TRACK_LABELS[id]}
                </button>
                {project.arrangement[id].slice(0, bars).map((clip, bar) => {
                  const onBar = song && playing && currentBar === bar;
                  const scene = Math.max(0, Math.min(scenes, clip));
                  return (
                    <button
                      key={bar}
                      type="button"
                      onClick={() =>
                        onPaintClip(id, bar, scene === paintScene ? 0 : paintScene)
                      }
                      className="h-8 shrink-0 border border-[#111] text-[9px] font-mono"
                      style={{
                        width: cellW,
                        background: scene
                          ? TRACK_COLORS[id]
                          : onBar
                            ? '#2a2a2a'
                            : bar % 4 === 0
                              ? '#1c1c1c'
                              : '#161616',
                        opacity: scene ? (onBar ? 1 : 0.85) : 1,
                        color: scene ? '#111' : 'transparent',
                        outline: onBar ? '1px solid #c4783a' : 'none',
                        boxShadow:
                          onBar && scene
                            ? `inset ${Math.round((currentBeat / Math.max(1, project.patterns[id][0].length)) * cellW)}px 0 0 0 rgba(255,255,255,0.18)`
                            : undefined,
                      }}
                    >
                      {scene || ''}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
