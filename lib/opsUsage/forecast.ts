import { clampPct } from './warningLevel';

/** Prognose: huidig % + (gemiddelde per dag sinds reset × resterende dagen). */
export function forecastUsagePct(
  currentPct: number,
  cycleStart: Date,
  cycleEnd: Date,
  now: Date,
): number {
  const cur = clampPct(currentPct);
  const elapsedMs = now.getTime() - cycleStart.getTime();
  const remainingMs = cycleEnd.getTime() - now.getTime();
  if (elapsedMs <= 0 || remainingMs <= 0) return cur;

  const dayMs = 24 * 60 * 60 * 1000;
  const daysElapsed = elapsedMs / dayMs;
  const daysRemaining = remainingMs / dayMs;
  if (daysElapsed < 1 / 24) return cur;

  const avgPerDay = cur / daysElapsed;
  return clampPct(cur + avgPerDay * daysRemaining);
}
