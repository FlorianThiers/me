import { describe, expect, it } from 'vitest';
import { usageWarningLevel } from './warningLevel.js';

describe('usageWarningLevel', () => {
  it('blijft ok onder 70%', () => {
    expect(usageWarningLevel(40, 55)).toBe('ok');
  });

  it('wordt amber vanaf 70% op huidig of prognose', () => {
    expect(usageWarningLevel(70, 50)).toBe('amber');
    expect(usageWarningLevel(50, 72)).toBe('amber');
  });

  it('dubbele 80%-regel: rood als huidig of prognose ≥ 80%', () => {
    expect(usageWarningLevel(79, 81)).toBe('red');
    expect(usageWarningLevel(82, 60)).toBe('red');
  });
});
