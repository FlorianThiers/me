import type { MusicProject, TrackId } from '../../types';
import { STEPS_PER_BEAT, isAudioTrack, TRACK_IDS } from '../../types';

export type LaunchQuantization = 'bar' | 'beat' | 'immediate';

export type PendingLaunch =
  | { kind: 'launch'; trackId: TrackId; slot: number }
  | { kind: 'stop'; trackId: TrackId }
  | { kind: 'scene'; sceneIdx: number };

export function trackHasPatternInScene(
  project: MusicProject,
  track: TrackId,
  sceneIdx: number,
): boolean {
  if (sceneIdx < 0) return false;
  const rows = project.patterns[track];
  if (!rows || sceneIdx >= rows.length) return false;
  const notes = project.notes?.[track]?.[sceneIdx] ?? [];
  if (notes.length > 0) return true;
  const row = rows[sceneIdx];
  return row?.some((v) => v > 0) ?? false;
}

export function shouldFlushLaunches(
  quant: LaunchQuantization,
  stepInBar: number,
  playing: boolean,
  pendingCount: number,
): boolean {
  if (pendingCount <= 0) return false;
  if (!playing || quant === 'immediate') return true;
  if (quant === 'bar') return stepInBar === 0;
  return stepInBar % STEPS_PER_BEAT === 0;
}

export type AppliedLaunch = {
  sessionClips: Map<TrackId, number>;
  releaseHeldVoices: boolean;
};

/** Apply queued launches to a copy of session clip slots (1-based pattern #). */
export function applyPendingLaunches(
  project: MusicProject,
  sessionClips: Map<TrackId, number>,
  pending: PendingLaunch[],
): AppliedLaunch {
  const next = new Map(sessionClips);
  let releaseHeldVoices = false;

  for (const action of pending) {
    if (action.kind === 'launch') {
      next.set(action.trackId, Math.max(1, Math.round(action.slot)));
    } else if (action.kind === 'stop') {
      next.set(action.trackId, 0);
    } else if (action.kind === 'scene') {
      releaseHeldVoices = true;
      const sceneIdx = Math.max(0, Math.round(action.sceneIdx));
      for (const id of TRACK_IDS) {
        if (isAudioTrack(id)) continue;
        if (trackHasPatternInScene(project, id, sceneIdx)) {
          next.set(id, sceneIdx + 1);
        }
      }
    }
  }

  return { sessionClips: next, releaseHeldVoices };
}

/** Scene index (0-based) for a track in session mode. null = do not fire. */
export function sessionSceneIdxForTrack(
  sessionClips: Map<TrackId, number>,
  trackId: TrackId,
  fallbackScene1: number,
): number | null {
  const slot = sessionClips.get(trackId);
  if (slot !== undefined) {
    if (slot <= 0) return null;
    return Math.max(0, Math.round(slot) - 1);
  }
  return Math.max(0, Math.round(fallbackScene1) - 1);
}
