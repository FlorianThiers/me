import { clipsAtBar } from '../../grid';
import type { MusicProject, PlaylistClip } from '../../types';

export type ArrangementBeatPlan =
  | { mode: 'playlist'; clips: PlaylistClip[] }
  | { mode: 'legacy'; bar: number }
  | { mode: 'silent' };

/** Single decision point: playlist clips vs legacy per-bar arrangement. */
export function planArrangementBeat(project: MusicProject, bar: number): ArrangementBeatPlan {
  const clipMode = (project.clips?.length ?? 0) > 0;
  if (!clipMode) return { mode: 'legacy', bar };
  const clips = clipsAtBar(project, bar);
  if (clips.length === 0) return { mode: 'silent' };
  return { mode: 'playlist', clips };
}

export function usesPlaylistClips(project: MusicProject): boolean {
  return (project.clips?.length ?? 0) > 0;
}
