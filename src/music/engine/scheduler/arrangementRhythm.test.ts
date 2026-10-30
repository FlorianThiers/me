import { describe, expect, it } from 'vitest';
import { planArrangementBeat } from './arrangementRhythm';
import { defaultProject } from '../../defaults';

describe('planArrangementBeat', () => {
  it('uses legacy arrangement when playlist is empty', () => {
    const project = defaultProject();
    project.clips = [];
    expect(planArrangementBeat(project, 0)).toEqual({ mode: 'legacy', bar: 0 });
  });

  it('returns silent when playlist has no clip at bar', () => {
    const project = defaultProject();
    project.clips = [{ track: 'kick', pattern: 1, start: 4, length: 2 }];
    expect(planArrangementBeat(project, 0)).toEqual({ mode: 'silent' });
  });

  it('returns playlist clips at bar', () => {
    const project = defaultProject();
    const clip = { track: 'kick' as const, pattern: 1, start: 0, length: 4 };
    project.clips = [clip];
    const plan = planArrangementBeat(project, 1);
    expect(plan.mode).toBe('playlist');
    if (plan.mode === 'playlist') {
      expect(plan.clips).toEqual([clip]);
    }
  });
});
