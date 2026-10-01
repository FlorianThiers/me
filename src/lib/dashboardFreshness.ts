import type { BlockMeta } from '../types/dashboardSnapshot';

export type Freshness = 'demo' | 'stale' | 'live' | 'unknown';

/** Hele dagen sinds een ISO-timestamp; null bij onbekend/ongeldig. */
export function daysSince(iso: string | null | undefined, now: Date = new Date()): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  return Math.max(0, Math.floor((now.getTime() - t) / 86_400_000));
}

/** demo > stale (ouder dan maxAgeDays) > live. Onbekende tijd = 'unknown' (behandeld als verouderd in de UI). */
export function freshnessOf(
  meta: Pick<BlockMeta, 'isDemo' | 'asOf'> | { isDemo: boolean; asOf: string | null },
  maxAgeDays: number,
  now: Date = new Date(),
): Freshness {
  if (meta.isDemo) return 'demo';
  const d = daysSince(meta.asOf, now);
  if (d == null) return 'unknown';
  return d > maxAgeDays ? 'stale' : 'live';
}

export function formatDateNl(iso: string | null | undefined): string {
  if (!iso) return 'onbekend';
  const d = new Date(iso.length === 10 ? `${iso}T12:00:00` : iso);
  if (Number.isNaN(d.getTime())) return 'onbekend';
  return d.toLocaleDateString('nl-BE', { day: 'numeric', month: 'short', year: 'numeric' });
}
