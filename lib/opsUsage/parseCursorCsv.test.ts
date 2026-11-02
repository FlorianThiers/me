import { describe, expect, it } from 'vitest';
import { parseCursorUsageCsv } from './parseCursorCsv.js';

const SAMPLE = `Date,Kind,Model,Max Mode,Input (w/ Cache Write),Input (w/o Cache Write),Cache Read,Output Tokens,Total Tokens,Cost
2025-10-28,Included in Pro,claude-4-sonnet,No,900,2800,600,1800,6100,0.00`;

describe('parseCursorUsageCsv', () => {
  it('herkent Cursor export kolommen', () => {
    const rows = parseCursorUsageCsv(SAMPLE);
    expect(rows).toHaveLength(1);
    expect(rows[0].date).toBe('2025-10-28');
    expect(rows[0].totalTokens).toBe(6100);
    expect(rows[0].model).toBe('claude-4-sonnet');
  });
});
