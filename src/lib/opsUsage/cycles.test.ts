import { describe, expect, it } from 'vitest';
import { getCursorMonthlyCycle, getGrokWeeklyCycle } from './cycles';

describe('getCursorMonthlyCycle', () => {
  it('gebruikt 27e als maandanker', () => {
    const ref = new Date('2025-11-01T12:00:00.000Z');
    const { start, end } = getCursorMonthlyCycle(ref);
    expect(start.getTime()).toBeLessThan(ref.getTime());
    expect(end.getTime()).toBeGreaterThan(ref.getTime());
    expect(end.getTime() - start.getTime()).toBeGreaterThan(28 * 24 * 60 * 60 * 1000);
  });
});

describe('getGrokWeeklyCycle', () => {
  it('geeft een week venster rond vrijdag 06:55', () => {
    const ref = new Date('2025-10-31T10:00:00.000Z');
    const { start, end } = getGrokWeeklyCycle(ref);
    expect(end.getTime() - start.getTime()).toBe(7 * 24 * 60 * 60 * 1000);
    expect(ref.getTime()).toBeGreaterThanOrEqual(start.getTime());
    expect(ref.getTime()).toBeLessThan(end.getTime());
  });
});
