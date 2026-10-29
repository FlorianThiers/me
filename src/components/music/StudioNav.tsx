import React from 'react';
import { TRACK_COLORS } from '../../music/defaults';
import { FL } from '../../music/flTerms';
import { rackChannelList } from '../../music/grid';
import type { MusicProject, TrackId } from '../../music/types';
import { useTrackLabels } from './MusicMetaContext';
import { STUDIO } from './studioTheme';

type Props = {
  project: MusicProject;
  selected: TrackId;
  onSelectTrack: (id: TrackId) => void;
  onOpenSound: (id: TrackId) => void;
};

/** FL Browser strip — channels in this project only */
export const StudioNav: React.FC<Props> = ({ project, selected, onSelectTrack, onOpenSound }) => {
  const TRACK_LABELS = useTrackLabels();
  const channels = rackChannelList(project);
  return (
    <div
      className="flex h-full w-[88px] shrink-0 flex-col gap-0.5 overflow-y-auto border-r p-1"
      style={{ background: STUDIO.bg, borderColor: STUDIO.border }}
    >
      <div className="mb-1 px-1 text-[9px] uppercase tracking-wider" style={{ color: STUDIO.textMuted }}>
        {FL.browser}
      </div>
      {channels.map((id) => (
        <button
          key={id}
          type="button"
          onClick={() => onSelectTrack(id)}
          onDoubleClick={() => onOpenSound(id)}
          className="flex items-center gap-1 rounded-sm px-1 py-1 text-left text-[10px]"
          style={{
            background: selected === id ? STUDIO.active : 'transparent',
            color: selected === id ? STUDIO.accent : STUDIO.textDim,
            borderLeft: `3px solid ${TRACK_COLORS[id]}`,
          }}
          title="Double-click → Channel settings"
        >
          <span className="truncate">{TRACK_LABELS[id]}</span>
        </button>
      ))}
    </div>
  );
};
