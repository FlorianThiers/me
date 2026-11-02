import { describe, expect, it } from 'vitest';
import { forecastUsagePct } from './forecast.js';

describe('forecastUsagePct', () => {
  it('extrapoleert lineair tot reset', () => {
    const start = new Date('2025-10-27T00:00:00.000Z');
    const end = new Date('2025-11-27T00:00:00.000Z');
    const now = new Date('2025-11-01T00:00:00.000Z');
    const forecast = forecastUsagePct(10, start, end, now);
    expect(forecast).toBeGreaterThan(10);
    expect(forecast).toBeLessThanOrEqual(100);
  });
});
