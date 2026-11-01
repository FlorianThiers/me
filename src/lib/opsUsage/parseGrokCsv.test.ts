import { describe, expect, it } from 'vitest';
import { parseGrokUsageCsv } from './parseGrokCsv';

const SAMPLE = `datum;weeklimiet_pct;reset;top_bots;top_routines;dag_aandeel;prognose_pct
2025-10-28;24;2025-10-31 06:55;BotA:8|BotB:4;RoutineX:5;1.2;26`;

describe('parseGrokUsageCsv', () => {
  it('parseert semicolon kolommen', () => {
    const rows = parseGrokUsageCsv(SAMPLE);
    expect(rows).toHaveLength(1);
    expect(rows[0].weekLimitPct).toBe(24);
    expect(rows[0].topBots).toEqual([
      { name: 'BotA', count: 8 },
      { name: 'BotB', count: 4 },
    ]);
  });
});
