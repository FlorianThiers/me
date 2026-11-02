import type { OpsUsagePayload, OpsUsageSources } from './types.js';
import {
  formatBrusselsDate,
  getCursorMonthlyCycle,
  getGrokWeeklyCycle,
} from './cycles.js';
import { forecastUsagePct } from './forecast.js';
import {
  aggregateGrokBots,
  grokRowsInCycle,
  mapToNamedAmounts,
  parseGrokUsageCsv,
  sumNamed,
  type GrokLogRow,
} from './parseGrokCsv.js';
import {
  cursorRowsInRange,
  dailyTokenTotals,
  mergeCursorRows,
  parseCursorUsageCsv,
  totalsByKind,
  totalsByModel,
  type CursorUsageRow,
} from './parseCursorCsv.js';
import { clampPct, usageWarningLevel } from './warningLevel.js';

export type { OpsUsageConfig, OpsUsageSources } from './types.js';

function latestGrokPctInCycle(rows: GrokLogRow[]): number {
  if (rows.length === 0) return 0;
  return rows[rows.length - 1].weekLimitPct;
}

function grokDailySeries(rows: GrokLogRow[]): { date: string; value: number }[] {
  return rows.map((r) => ({ date: r.date, value: r.weekLimitPct }));
}

function cursorDailySeries(rows: CursorUsageRow[]): { date: string; value: number }[] {
  const totals = dailyTokenTotals(rows);
  return [...totals.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({ date, value }));
}

export function buildOpsUsagePayload(sources: OpsUsageSources, now = new Date()): OpsUsagePayload {
  const grokRows = parseGrokUsageCsv(sources.grokCsv);
  const cursorRows = mergeCursorRows(sources.cursorCsvFiles.flatMap((f) => parseCursorUsageCsv(f)));

  const tokenLimit = sources.config?.cursorMonthlyTokenLimit ?? 500_000;

  const cursorCycle = getCursorMonthlyCycle(now);
  const grokCycle = getGrokWeeklyCycle(now);

  const grokInCycle = grokRowsInCycle(grokRows, grokCycle.start, grokCycle.end);
  const cursorInCycle = cursorRowsInRange(cursorRows, cursorCycle.start, cursorCycle.end);

  const grokCurrent = clampPct(latestGrokPctInCycle(grokInCycle));
  const grokForecast = forecastUsagePct(grokCurrent, grokCycle.start, grokCycle.end, now);

  const tokensUsed = cursorInCycle.reduce((sum, r) => sum + r.totalTokens, 0);
  const cursorCurrent = clampPct((tokensUsed / tokenLimit) * 100);
  const cursorForecast = forecastUsagePct(cursorCurrent, cursorCycle.start, cursorCycle.end, now);

  const botTotals = aggregateGrokBots(grokInCycle);
  const botSum = [...botTotals.values()].reduce((s, b) => s + b.total, 0) || 1;

  const routineMap = sumNamed(grokInCycle.flatMap((r) => r.topRoutines));

  const grokBots = [...botTotals.entries()]
    .map(([name, info]) => ({
      name,
      totalUses: info.total,
      sharePct: Math.round((info.total / botSum) * 1000) / 10,
      lastSeen: info.lastSeen,
    }))
    .sort((a, b) => b.totalUses - a.totalUses);

  const cursorResetLabel = `${formatBrusselsDate(cursorCycle.start)} → ${formatBrusselsDate(cursorCycle.end)}`;
  const grokResetLabel = `${formatBrusselsDate(grokCycle.start)} → ${formatBrusselsDate(grokCycle.end)} (vr 06:55)`;

  return {
    generatedAt: now.toISOString(),
    isDemo: sources.isDemo,
    exportNote: sources.config?.exportNote,
    cursor: {
      label: 'Cursor (maandcyclus)',
      currentPct: cursorCurrent,
      forecastPct: cursorForecast,
      warningLevel: usageWarningLevel(cursorCurrent, cursorForecast),
      cycleStart: cursorCycle.start.toISOString(),
      cycleEnd: cursorCycle.end.toISOString(),
      resetLabel: cursorResetLabel,
      dailyUsage: cursorDailySeries(cursorInCycle),
      byBot: mapToNamedAmounts(totalsByModel(cursorInCycle)),
      byRoutine: mapToNamedAmounts(totalsByKind(cursorInCycle)),
      monthlyTokenLimit: tokenLimit,
      tokensUsedInCycle: tokensUsed,
    },
    grok: {
      label: 'Grok Bot (weeklimiet)',
      currentPct: grokCurrent,
      forecastPct: grokForecast,
      warningLevel: usageWarningLevel(grokCurrent, grokForecast),
      cycleStart: grokCycle.start.toISOString(),
      cycleEnd: grokCycle.end.toISOString(),
      resetLabel: grokResetLabel,
      dailyUsage: grokDailySeries(grokInCycle),
      byBot: mapToNamedAmounts(sumNamed(grokInCycle.flatMap((r) => r.topBots))),
      byRoutine: mapToNamedAmounts(routineMap),
      bots: grokBots,
    },
  };
}
