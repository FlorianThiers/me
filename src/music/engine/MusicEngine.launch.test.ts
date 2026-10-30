import { describe, expect, it, vi } from 'vitest';
import { MusicEngine } from './MusicEngine';
import { defaultProject } from '../defaults';

describe('MusicEngine clip launch API', () => {
  it('applies launchClip when transport is stopped', () => {
    const engine = new MusicEngine(defaultProject(), {
      onBeat: vi.fn(),
      onStop: vi.fn(),
    });
    engine.setLaunchQuantization('bar');
    engine.launchClip('kick', 2);
    expect(engine.getSessionClipSlot('kick')).toBe(2);
  });

  it('respects bar quantization while playing', () => {
    const project = defaultProject();
    project.playMode = 'session';
    const engine = new MusicEngine(project, {
      onBeat: vi.fn(),
      onStop: vi.fn(),
    });
    engine.setLaunchQuantization('bar');
    (engine as unknown as { playing: boolean }).playing = true;
    (engine as unknown as { beat: number }).beat = 3;
    engine.launchClip('snare', 2);
    expect(engine.getSessionClipSlot('snare')).toBeUndefined();
    (engine as unknown as { tryFlushPendingLaunches: (s: number) => void }).tryFlushPendingLaunches(0);
    expect(engine.getSessionClipSlot('snare')).toBe(2);
  });
});
