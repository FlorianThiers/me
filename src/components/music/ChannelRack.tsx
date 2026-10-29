import React from 'react';
import { ChevronLeft, ChevronRight, Plus, Zap } from 'lucide-react';
import { TRACK_COLORS } from '../../music/defaults';
import { FL } from '../../music/flTerms';
import { patternLengthBars, rackChannelList, sceneCount } from '../../music/grid';
import type { PlayMode, MusicProject, TrackId } from '../../music/types';
import { TRACK_IDS } from '../../music/types';
import { useTrackLabels } from './MusicMetaContext';
import { STUDIO } from './studioTheme';

type Props = {
  project: MusicProject;
  selected: TrackId;
  paintScene: number;
  playMode: PlayMode;
  launchedScene: number;
  onSelectTrack: (id: TrackId) => void;
  onSelectScene: (scene: number) => void;
  onAddScene: () => void;
  onLaunchScene: (scene: number) => void;
  onAddChannel?: (id: TrackId) => void;
  onRemoveChannel?: (id: TrackId) => void;
};

/**
 * FL Channel Rack — channels in this project + Pattern selector.
 * Pattern = which clip you edit in the Piano roll.
 */
export const ChannelRack: React.FC<Props> = ({
  project,
  selected,
  paintScene,
  playMode,
  launchedScene,
  onSelectTrack,
  onSelectScene,
  onAddScene,
  onLaunchScene,
  onAddChannel,
  onRemoveChannel,
}) => {
  const TRACK_LABELS = useTrackLabels();
  const sceneIdx = Math.max(0, paintScene - 1);
  const scenes = sceneCount(project);
  const bars = patternLengthBars(project, selected, sceneIdx);
  const noteCount = project.notes?.[selected]?.[sceneIdx]?.length ?? 0;
  const channels = rackChannelList(project);
  const missing = TRACK_IDS.filter((id) => !channels.includes(id));

  const prevPattern = () => onSelectScene(Math.max(1, paintScene - 1));
  const nextPattern = () => onSelectScene(Math.min(scenes, paintScene + 1));

  return (
    <div className="flex h-full min-h-0 flex-col" style={{ background: STUDIO.panel }}>
      <div
        className="flex h-[26px] shrink-0 items-center gap-1 border-b px-2"
        style={{ borderColor: STUDIO.border, background: STUDIO.panelHeader }}
      >
        <span className="text-[9px] uppercase tracking-wide" style={{ color: STUDIO.textMuted }}>
          {FL.pattern}
        </span>
        <button type="button" onClick={prevPattern} className="p-0.5 hover:text-white" style={{ color: STUDIO.textDim }}>
          <ChevronLeft className="h-3 w-3" />
        </button>
        <span className="min-w-[2rem] text-center font-mono text-[11px] font-bold" style={{ color: STUDIO.accent }}>
          {paintScene}
        </span>
        <button type="button" onClick={nextPattern} className="p-0.5 hover:text-white" style={{ color: STUDIO.textDim }}>
          <ChevronRight className="h-3 w-3" />
        </button>
        <button
          type="button"
          onClick={onAddScene}
          className="p-0.5 hover:text-white"
          style={{ color: STUDIO.textMuted }}
          title="New Pattern"
        >
          <Plus className="h-3 w-3" />
        </button>
        {playMode === 'session' && (
          <button
            type="button"
            onClick={() => onLaunchScene(paintScene)}
            className="ml-auto flex h-5 items-center gap-0.5 px-1.5 text-[8px] font-bold uppercase"
            style={{
              background: launchedScene === paintScene ? STUDIO.accent : STUDIO.surface,
              color: launchedScene === paintScene ? STUDIO.accentText : STUDIO.textMuted,
            }}
            title="Play this Pattern (Pattern mode)"
          >
            <Zap className="h-2.5 w-2.5" />
            Launch
          </button>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {channels.map((id) => {
          const active = selected === id;
          const notes = project.notes?.[id]?.[sceneIdx]?.length ?? 0;
          return (
            <div
              key={id}
              className="flex w-full items-center gap-1 border-b px-1 py-1"
              style={{
                borderColor: STUDIO.border,
                background: active ? STUDIO.active : 'transparent',
              }}
            >
              <button
                type="button"
                onClick={() => onSelectTrack(id)}
                className="flex min-w-0 flex-1 items-center gap-2 px-1 py-0.5 text-left"
              >
                <span className="h-2.5 w-2.5 shrink-0 rounded-[2px]" style={{ background: TRACK_COLORS[id] }} />
                <span
                  className="min-w-0 flex-1 truncate text-[10px]"
                  style={{ color: active ? STUDIO.text : STUDIO.textMuted }}
                >
                  {TRACK_LABELS[id]}
                </span>
                <span className="font-mono text-[8px]" style={{ color: STUDIO.textDim }}>
                  {notes > 0 ? `${notes}n` : '—'}
                </span>
              </button>
              {onRemoveChannel && channels.length > 1 && (
                <button
                  type="button"
                  className="px-1 text-[9px] hover:text-white"
                  style={{ color: STUDIO.textDim }}
                  title={`Remove ${TRACK_LABELS[id]} from rack`}
                  onClick={() => onRemoveChannel(id)}
                >
                  ×
                </button>
              )}
            </div>
          );
        })}
      </div>

      {onAddChannel && missing.length > 0 && (
        <div className="shrink-0 border-t p-1.5" style={{ borderColor: STUDIO.border }}>
          <label className="flex items-center gap-1 text-[9px]" style={{ color: STUDIO.textMuted }}>
            <Plus className="h-3 w-3" />
            <select
              className="h-6 flex-1 border px-1 text-[10px] text-white outline-none"
              style={{ background: STUDIO.surface, borderColor: STUDIO.border }}
              defaultValue=""
              onChange={(e) => {
                const id = e.target.value as TrackId;
                if (id) onAddChannel(id);
                e.target.value = '';
              }}
            >
              <option value="">Add channel…</option>
              {missing.map((id) => (
                <option key={id} value={id}>
                  {TRACK_LABELS[id]}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      <div
        className="shrink-0 border-t p-2 text-[9px] leading-relaxed"
        style={{ borderColor: STUDIO.border, background: STUDIO.bg, color: STUDIO.textMuted }}
      >
        <p>
          <strong style={{ color: STUDIO.text }}>{TRACK_LABELS[selected]}</strong> · {FL.pattern} {paintScene} ·{' '}
          {bars} bar{bars === 1 ? '' : 's'} · {noteCount} note{noteCount === 1 ? '' : 's'}
        </p>
        <p className="mt-1" style={{ color: STUDIO.textDim }}>
          {FL.pianoRoll} = this {FL.pattern}. {FL.playlist} = Song arrangement.
        </p>
      </div>
    </div>
  );
};

export type ChannelRackTrack = TrackId;
