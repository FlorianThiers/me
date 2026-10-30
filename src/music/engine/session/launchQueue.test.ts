import { describe, expect, it } from 'vitest';
import {
  applyPendingLaunches,
  shouldFlushLaunches,
  trackHasPatternInScene,
} from './launchQueue';
import { defaultProject, emptyProject } from '../../defaults';
import type { TrackId } from '../../types';

describe('shouldFlushLaunches', () => {
  it('waits for bar start when quant is bar and playing', () => {
    expect(shouldFlushLaunches('bar', 3, true, 1)).toBe(false);
    expect(shouldFlushLaunches('bar', 0, true, 1)).toBe(true);
  });

  it('waits for beat boundary when quant is beat and playing', () => {
    expect(shouldFlushLaunches('beat', 1, true, 1)).toBe(false);
    expect(shouldFlushLaunches('beat', 0, true, 1)).toBe(true);
    expect(shouldFlushLaunches('beat', 4, true, 1)).toBe(true);
  });

  it('flushes immediately when not playing or quant is immediate', () => {
    expect(shouldFlushLaunches('bar', 5, false, 1)).toBe(true);
    expect(shouldFlushLaunches('immediate', 5, true, 1)).toBe(true);
  });
});

describe('launchScene', () => {
  it('sets slots only for tracks with pattern content in that scene', () => {
    const project = defaultProject();
    const kickHasScene0 = trackHasPatternInScene(project, 'kick', 0);
    expect(kickHasScene0).toBe(true);

    const empty = new Map<TrackId, number>();
    const { sessionClips, releaseHeldVoices } = applyPendingLaunches(project, empty, [
      { kind: 'scene', sceneIdx: 0 },
    ]);

    expect(releaseHeldVoices).toBe(true);
    expect(sessionClips.get('kick')).toBe(1);
    for (const id of ['bass', 'wt'] as TrackId[]) {
      if (trackHasPatternInScene(project, id, 0)) {
        expect(sessionClips.get(id)).toBe(1);
      } else {
        expect(sessionClips.has(id)).toBe(false);
      }
    }
  });

  it('does not overwrite tracks with no pattern in the launched scene', () => {
    const project = emptyProject();
    project.patterns.wt = [[], [1, 0, 0, 0]];
    const prior = new Map<TrackId, number>([['wt', 2]]);
    const { sessionClips } = applyPendingLaunches(project, prior, [
      { kind: 'scene', sceneIdx: 0 },
    ]);
    expect(sessionClips.get('wt')).toBe(2);
  });

  it('stop marks track silent without removing map entry', () => {
    const project = defaultProject();
    const prior = new Map<TrackId, number>([['kick', 1]]);
    const { sessionClips } = applyPendingLaunches(project, prior, [
      { kind: 'stop', trackId: 'kick' },
    ]);
    expect(sessionClips.get('kick')).toBe(0);
  });
});
