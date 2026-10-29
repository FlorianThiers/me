import {
  arrangementLength,
  patternContentSteps,
  songBarCount,
  stepCount,
} from '../../grid';
import type { MusicProject } from '../../types';
import { DEFAULT_STEPS, STEPS_PER_BAR, TRACK_IDS, isAudioTrack } from '../../types';

/** Pattern mode: loop length = longest row in the active scene. */
export function stepsInLoop(project: MusicProject, sessionScene: number | null): number {
  const sceneIdx = Math.max(
    0,
    (sessionScene !== null ? sessionScene : project.scene) - 1,
  );
  let max = DEFAULT_STEPS;
  for (const id of TRACK_IDS) {
    if (isAudioTrack(id)) continue;
    max = Math.max(max, patternContentSteps(project, id, sceneIdx));
  }
  return max;
}

export function songLengthSteps(project: MusicProject): number {
  if ((project.clips?.length ?? 0) > 0) {
    return songBarCount(project) * STEPS_PER_BAR;
  }
  return arrangementLength(project) * stepCount(project);
}
