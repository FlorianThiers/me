import { describe, expect, it } from 'vitest';
import { buildOpsUsagePayload } from './buildPayload';
import { readFileSync } from 'node:fs';
import path from 'node:path';

describe('buildOpsUsagePayload', () => {
  it('bouwt payload uit voorbeeld-CSV', () => {
    const root = process.cwd();
    const grokCsv = readFileSync(
      path.join(root, 'public/data/ops-usage/grok-usage.example.csv'),
      'utf8',
    );
    const cursorCsv = readFileSync(
      path.join(root, 'public/data/ops-usage/cursor-csv/usage-2025-10.example.csv'),
      'utf8',
    );
    const payload = buildOpsUsagePayload(
      {
        grokCsv,
        cursorCsvFiles: [cursorCsv],
        config: { cursorMonthlyTokenLimit: 500_000, exportNote: 'test' },
        isDemo: true,
      },
      new Date('2025-11-01T14:00:00.000Z'),
    );
    expect(payload.isDemo).toBe(true);
    expect(payload.grok.currentPct).toBeGreaterThan(0);
    expect(payload.cursor.tokensUsedInCycle).toBeGreaterThan(0);
    expect(payload.grok.bots.length).toBeGreaterThan(0);
  });
});
