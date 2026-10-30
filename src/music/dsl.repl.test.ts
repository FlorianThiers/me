import { describe, expect, it } from 'vitest';
import { parseRepl } from './dsl';

describe('parseRepl live-set commands', () => {
  it('parses launch track slot', () => {
    expect(parseRepl('launch kick 2')).toEqual({ replLaunch: { track: 'kick', slot: 2 } });
  });

  it('keeps legacy launch N for paint scene', () => {
    expect(parseRepl('launch 3')).toEqual({ launch: 3 });
  });

  it('parses scene, stop, bind, quant', () => {
    expect(parseRepl('scene 2')).toEqual({ replScene: { scene1: 2 } });
    expect(parseRepl('stop snare')).toEqual({ replStop: { track: 'snare' } });
    expect(parseRepl('bind q bass.1')).toEqual({ replBind: { code: 'KeyQ', track: 'bass', slot: 1 } });
    expect(parseRepl('quant bar')).toEqual({ replQuant: 'bar' });
    expect(parseRepl('quant now')).toEqual({ replQuant: 'immediate' });
    expect(parseRepl('quant beat')).toEqual({ replQuant: 'beat' });
  });

  it('rejects unknown track', () => {
    expect(parseRepl('stop xyzzy')).toEqual({ error: 'unknown track: xyzzy' });
  });
});
