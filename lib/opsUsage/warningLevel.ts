import type { UsageWarningLevel } from './types.js';

/** Waarschuwing vanaf 70% (amber) en 80% (rood); dubbele 80%-regel op huidig én prognose. */
export function usageWarningLevel(currentPct: number, forecastPct: number): UsageWarningLevel {
  const cur = clampPct(currentPct);
  const fc = clampPct(forecastPct);
  if (cur >= 80 || fc >= 80) return 'red';
  if (cur >= 70 || fc >= 70) return 'amber';
  return 'ok';
}

export function clampPct(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

export function warningBorderClass(level: UsageWarningLevel): string {
  switch (level) {
    case 'red':
      return 'border-rose-400/60 shadow-[0_0_24px_rgba(251,113,133,0.25)]';
    case 'amber':
      return 'border-amber-400/50 shadow-[0_0_20px_rgba(251,191,36,0.2)]';
    default:
      return 'border-orbit-cyan/30';
  }
}

export function warningTextClass(level: UsageWarningLevel): string {
  switch (level) {
    case 'red':
      return 'text-rose-300';
    case 'amber':
      return 'text-amber-200';
    default:
      return 'text-orbit-cyan';
  }
}
