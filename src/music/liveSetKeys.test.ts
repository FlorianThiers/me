import { describe, expect, it } from 'vitest';
import {
  defaultClipBindingForCode,
  defaultKeyLabelForCell,
  parseLiveSetBindTarget,
  parseLiveSetKeyToken,
  resolveLiveSetAction,
} from './liveSetKeys';

describe('liveSetKeys', () => {
  it('maps Q-row to slot 1 by track column', () => {
    expect(defaultClipBindingForCode('KeyQ')).toEqual({ track: 'kick', slot: 1 });
    expect(defaultClipBindingForCode('KeyW')).toEqual({ track: 'snare', slot: 1 });
  });

  it('maps A-row to slot 2 and Z-row to slot 3', () => {
    expect(defaultClipBindingForCode('KeyA')).toEqual({ track: 'kick', slot: 2 });
    expect(defaultClipBindingForCode('KeyZ')).toEqual({ track: 'kick', slot: 3 });
  });

  it('maps digit keys to scenes 1–8', () => {
    expect(resolveLiveSetAction('Digit3', false, {})).toEqual({ type: 'launchScene', sceneIdx: 2 });
  });

  it('shift converts clip key to stop for that track', () => {
    expect(resolveLiveSetAction('KeyE', true, {})).toEqual({ type: 'stopClip', trackId: 'hihat' });
  });

  it('custom bind overrides default for that code', () => {
    const action = resolveLiveSetAction('KeyQ', false, { KeyQ: { track: 'bass', slot: 2 } });
    expect(action).toEqual({ type: 'launchClip', trackId: 'bass', slot: 2 });
  });

  it('parses bind tokens', () => {
    expect(parseLiveSetBindTarget('kick.3')).toEqual({ track: 'kick', slot: 3 });
    expect(parseLiveSetKeyToken('q')).toBe('KeyQ');
    expect(parseLiveSetKeyToken('KeyW')).toBe('KeyW');
  });

  it('labels grid cells from physical codes', () => {
    expect(defaultKeyLabelForCell(0, 1)).toBe('Q');
    expect(defaultKeyLabelForCell(2, 3)).toBe('C');
  });
});
