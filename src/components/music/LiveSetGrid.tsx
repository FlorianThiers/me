import React from 'react';
import { TRACK_COLORS } from '../../music/defaults';
import { patternContentSteps, rackChannelList, sceneCount } from '../../music/grid';
import { trackHasPatternInScene } from '../../music/engine/session/launchQueue';
import type { MusicEngine } from '../../music/engine';
import {
  defaultKeyLabelForCell,
  liveSetCodeLabel,
  type LiveSetKeyBinding,
} from '../../music/liveSetKeys';
import type { BeatInfo, MusicProject, TrackId } from '../../music/types';
import { TRACK_IDS } from '../../music/types';
import { useTrackLabels } from './MusicMetaContext';
import { STUDIO } from './studioTheme';

type Props = {
  project: MusicProject;
  engine: MusicEngine | null;
  playing: boolean;
  beat: BeatInfo;
  bindings: Record<string, LiveSetKeyBinding>;
  refreshToken?: number;
  onLaunch: (track: TrackId, slot: number) => void;
};

function cellArmed(
  pending: ReturnType<MusicEngine['getPendingLaunches']>,
  track: TrackId,
  slot: number,
): boolean {
  return pending.some((p) => p.kind === 'launch' && p.trackId === track && p.slot === slot);
}

export const LiveSetGrid: React.FC<Props> = ({
  project,
  engine,
  playing,
  beat,
  bindings,
  refreshToken = 0,
  onLaunch,
}) => {
  const TRACK_LABELS = useTrackLabels();
  const channels = rackChannelList(project);
  const slots = Math.min(8, Math.max(3, sceneCount(project)));

  void refreshToken;
  const sessionSlots = engine?.getSessionClipSlots() ?? new Map<TrackId, number>();
  const pending = engine?.getPendingLaunches() ?? [];

  const keyLabel = (trackIdx: number, slot: number): string => {
    const track = TRACK_IDS[trackIdx];
    if (!track) return '';
    for (const [code, bind] of Object.entries(bindings)) {
      if (bind.track === track && bind.slot === slot) return liveSetCodeLabel(code);
    }
    return defaultKeyLabelForCell(trackIdx, slot) ?? '';
  };

  return (
    <div
      className="shrink-0 border-t p-2"
      style={{ borderColor: STUDIO.border, background: STUDIO.bg }}
    >
      <div className="mb-1 flex items-center justify-between text-[9px]" style={{ color: STUDIO.textMuted }}>
        <span className="uppercase tracking-wide">Live set</span>
        <span style={{ color: STUDIO.textDim }}>1–8 scene · Q/A/Z rows · Shift stop</span>
      </div>
      <div className="overflow-x-auto">
        <div
          className="inline-grid gap-px"
          style={{
            gridTemplateColumns: `72px repeat(${slots}, minmax(36px, 1fr))`,
          }}
        >
          <div />
          {Array.from({ length: slots }, (_, i) => (
            <div
              key={`h-${i}`}
              className="px-1 text-center font-mono text-[8px]"
              style={{ color: STUDIO.textDim }}
            >
              {i + 1}
            </div>
          ))}
          {channels.map((track) => {
            const trackIdx = TRACK_IDS.indexOf(track);
            return (
              <React.Fragment key={track}>
                <div
                  className="flex items-center gap-1 truncate pr-1 text-[9px]"
                  style={{ color: STUDIO.textMuted }}
                  title={TRACK_LABELS[track]}
                >
                  <span className="h-2 w-2 shrink-0 rounded-[2px]" style={{ background: TRACK_COLORS[track] }} />
                  <span className="truncate">{TRACK_LABELS[track]}</span>
                </div>
                {Array.from({ length: slots }, (_, slotIdx) => {
                  const slot = slotIdx + 1;
                  const sceneIdx = slot - 1;
                  const filled = trackHasPatternInScene(project, track, sceneIdx);
                  const activeSlot = sessionSlots.get(track);
                  const active = activeSlot === slot;
                  const stopped = activeSlot === 0;
                  const armed = cellArmed(pending, track, slot);
                  const len = filled ? patternContentSteps(project, track, sceneIdx) : 0;
                  const stepInClip =
                    active && playing && len > 0 ? beat.patternStep % len : null;

                  let bg: string = STUDIO.surface;
                  if (!filled) bg = '#141414';
                  else if (active) bg = TRACK_COLORS[track];
                  else if (stopped && filled) bg = '#1e1e1e';

                  return (
                    <button
                      key={`${track}-${slot}`}
                      type="button"
                      disabled={!filled}
                      onClick={() => onLaunch(track, slot)}
                      className="relative flex h-9 min-w-[36px] flex-col items-center justify-center border text-[8px] transition-opacity"
                      style={{
                        borderColor: STUDIO.border,
                        background: bg,
                        color: active ? STUDIO.accentText : STUDIO.textDim,
                        opacity: filled ? 1 : 0.35,
                        boxShadow: armed ? `0 0 0 1px ${STUDIO.accent}` : undefined,
                        animation: armed ? 'liveSetArm 0.45s ease-in-out infinite alternate' : undefined,
                      }}
                      title={
                        filled
                          ? `${TRACK_LABELS[track]} slot ${slot}`
                          : `${TRACK_LABELS[track]} · empty`
                      }
                    >
                      <span className="font-mono text-[7px] opacity-80">{keyLabel(trackIdx, slot)}</span>
                      {active && stepInClip != null && (
                        <span
                          className="absolute bottom-0 left-0 h-0.5 rounded-full"
                          style={{
                            width: `${Math.max(8, ((stepInClip + 1) / len) * 100)}%`,
                            background: active ? 'rgba(0,0,0,0.35)' : STUDIO.accent,
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>
      </div>
      <style>{`
        @keyframes liveSetArm {
          from { filter: brightness(1); }
          to { filter: brightness(1.45); }
        }
      `}</style>
    </div>
  );
};
