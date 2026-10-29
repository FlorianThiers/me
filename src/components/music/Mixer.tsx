import React from 'react';
import { TRACK_COLORS } from '../../music/defaults';
import { rackChannelList } from '../../music/grid';
import type { MusicProject, TrackId } from '../../music/types';
import { useTrackLabels } from './MusicMetaContext';
import { STUDIO } from './studioTheme';

type Props = {
  project: MusicProject;
  selected: TrackId;
  onSelect: (id: TrackId) => void;
  onGain: (id: TrackId, gain: number) => void;
  onPan: (id: TrackId, pan: number) => void;
  onMute: (id: TrackId) => void;
  onSolo: (id: TrackId) => void;
};

function gainLabel(gain: number): string {
  if (gain <= 0.001) return '-∞';
  const db = 20 * Math.log10(gain);
  return `${db >= 0 ? '+' : ''}${db.toFixed(1)} dB`;
}

function panLabel(pan: number): string {
  if (Math.abs(pan) < 0.02) return 'C';
  return pan < 0 ? `L${Math.round(Math.abs(pan) * 100)}` : `R${Math.round(pan * 100)}`;
}

export const Mixer: React.FC<Props> = ({
  project,
  selected,
  onSelect,
  onGain,
  onPan,
  onMute,
  onSolo,
}) => {
  const TRACK_LABELS = useTrackLabels();
  const channels = rackChannelList(project);
  return (
  <div className="flex h-full min-h-0 overflow-x-auto" style={{ background: STUDIO.panel }}>
    {channels.map((id) => {
      const ch = project.mixer[id];
      const fx = project.fx[id];
      const active = selected === id;
      const pan = ch.pan ?? 0;
      return (
        <div
          key={id}
          className="flex w-[76px] shrink-0 flex-col border-r"
          style={{
            borderColor: STUDIO.border,
            background: active ? '#1f1f1f' : STUDIO.bg,
            boxShadow: active ? `inset 0 2px 0 ${TRACK_COLORS[id]}` : undefined,
          }}
        >
          <button
            type="button"
            onClick={() => onSelect(id)}
            className="truncate px-1 py-1 text-center text-[9px] font-semibold uppercase tracking-wide"
            style={{ color: TRACK_COLORS[id] }}
            title={TRACK_LABELS[id]}
          >
            {TRACK_LABELS[id]}
          </button>

          <div className="flex flex-1 flex-col items-center justify-end gap-1 px-1 pb-1">
            <span className="font-mono text-[8px]" style={{ color: STUDIO.textMuted }}>
              {gainLabel(ch.gain)}
            </span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={ch.gain}
              onChange={(e) => onGain(id, Number(e.target.value))}
              className="w-full flex-1 min-h-[40px] max-h-[64px] cursor-pointer appearance-none accent-[#ff8c00]"
              style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
              title={`Volume ${Math.round(ch.gain * 100)}%`}
            />
            <span className="font-mono text-[8px]" style={{ color: STUDIO.textDim }}>
              {Math.round(ch.gain * 100)}%
            </span>
          </div>

          <div className="px-1 pb-1">
            <div className="mb-0.5 flex items-center justify-between text-[7px]" style={{ color: STUDIO.textDim }}>
              <span>L</span>
              <span className="font-mono" style={{ color: STUDIO.textMuted }}>
                {panLabel(pan)}
              </span>
              <span>R</span>
            </div>
            <input
              type="range"
              min={-1}
              max={1}
              step={0.01}
              value={pan}
              onChange={(e) => onPan(id, Number(e.target.value))}
              className="h-3 w-full accent-[#ff8c00]"
              title={`Pan ${panLabel(pan)}`}
            />
          </div>

          <div className="flex flex-col gap-0.5 px-1 pb-1 text-[7px]" style={{ color: STUDIO.textDim }}>
            <div className="flex items-center justify-between">
              <span>Rev</span>
              <span>{Math.round(fx.reverbSend * 100)}</span>
            </div>
            <div className="h-1 overflow-hidden rounded-sm" style={{ background: STUDIO.surface }}>
              <div className="h-full bg-[#5a8aaa]" style={{ width: `${fx.reverbSend * 100}%` }} />
            </div>
            <div className="flex items-center justify-between">
              <span>Dly</span>
              <span>{Math.round(fx.delaySend * 100)}</span>
            </div>
            <div className="h-1 overflow-hidden rounded-sm" style={{ background: STUDIO.surface }}>
              <div className="h-full bg-[#aa8a5a]" style={{ width: `${fx.delaySend * 100}%` }} />
            </div>
          </div>

          <div className="flex gap-0.5 p-1">
            <button
              type="button"
              onClick={() => onMute(id)}
              className="h-5 flex-1 text-[8px] font-bold uppercase"
              style={{
                background: ch.mute > 0 ? '#a04038' : STUDIO.surface,
                color: ch.mute > 0 ? '#fff' : STUDIO.textMuted,
              }}
              title="Mute"
            >
              M
            </button>
            <button
              type="button"
              onClick={() => onSolo(id)}
              className="h-5 flex-1 text-[8px] font-bold uppercase"
              style={{
                background: ch.solo > 0 ? STUDIO.accent : STUDIO.surface,
                color: ch.solo > 0 ? STUDIO.accentText : STUDIO.textMuted,
              }}
              title="Solo"
            >
              S
            </button>
          </div>
        </div>
      );
    })}
  </div>
  );
};
