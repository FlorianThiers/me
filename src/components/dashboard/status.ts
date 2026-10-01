import { freshnessOf, formatDateNl, type Freshness } from '../../lib/dashboardFreshness';
import type { DashboardSnapshot } from '../../types/dashboardSnapshot';
import type { BlockStatus } from './DashboardBlock';

export type Snap = DashboardSnapshot | null;

export function statusOf(
  snap: Snap,
  meta: { isDemo: boolean; asOf: string | null; source: string } | undefined,
  maxAgeDays: number,
  hasData: boolean,
): BlockStatus {
  if (!snap || !meta) return 'empty';
  const f: Freshness = freshnessOf(meta, maxAgeDays);
  if (f === 'demo') return 'demo';
  if (!hasData && f === 'live') return 'empty';
  return f;
}

export function noticeOf(label: string, status: BlockStatus, meta?: { asOf: string | null; note?: string }): string | undefined {
  if (status === 'demo') return `DEMO: voorbeelddata voor ${label}.`;
  if (status === 'stale' || status === 'unknown') return `Verouderd: laatste meting ${formatDateNl(meta?.asOf)}.`;
  return undefined;
}

export const foot = (src: string, meta?: { asOf: string | null }) => `bron: ${src} · ${formatDateNl(meta?.asOf)}`;
