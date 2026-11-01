const BRUSSELS = 'Europe/Brussels';

type ZonedParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

function zonedParts(date: Date, timeZone: string): ZonedParts {
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  const parts = fmt.formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value ?? '0');
  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour: get('hour'),
    minute: get('minute'),
    second: get('second'),
  };
}

/** Zet een lokale Brussels-datum/tijd om naar UTC Date (benadering via offset-zoek). */
export function zonedDateTimeToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
  timeZone: string = BRUSSELS,
): Date {
  let guess = Date.UTC(year, month - 1, day, hour, minute, second);
  for (let i = 0; i < 3; i++) {
    const p = zonedParts(new Date(guess), timeZone);
    const desiredAsUtc = Date.UTC(year, month - 1, day, hour, minute, second);
    const actualAsUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
    guess += desiredAsUtc - actualAsUtc;
  }
  return new Date(guess);
}

export type CycleBounds = { start: Date; end: Date };

/** Cursor-maandcyclus: reset op de 27e (Brussels), bv. 27/10 → 27/11. */
export function getCursorMonthlyCycle(reference: Date, timeZone = BRUSSELS): CycleBounds {
  const p = zonedParts(reference, timeZone);
  const anchorDay = 27;
  let startYear = p.year;
  let startMonth = p.month;
  if (p.day < anchorDay) {
    startMonth -= 1;
    if (startMonth < 1) {
      startMonth = 12;
      startYear -= 1;
    }
  }
  const start = zonedDateTimeToUtc(startYear, startMonth, anchorDay, 0, 0, 0, timeZone);
  let endMonth = startMonth + 1;
  let endYear = startYear;
  if (endMonth > 12) {
    endMonth = 1;
    endYear += 1;
  }
  const end = zonedDateTimeToUtc(endYear, endMonth, anchorDay, 0, 0, 0, timeZone);
  return { start, end };
}

/** Grok Bot: wekelijkse reset vrijdag 06:55 Europe/Brussels. */
export function getGrokWeeklyCycle(reference: Date, timeZone = BRUSSELS): CycleBounds {
  const p = zonedParts(reference, timeZone);
  const weekdayFmt = new Intl.DateTimeFormat('en-US', { timeZone, weekday: 'short' });
  const weekdayShort = weekdayFmt.format(reference);
  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  const dow = weekdayMap[weekdayShort] ?? 0;
  const friday = 5;
  let daysBack = (dow - friday + 7) % 7;
  const beforeReset =
    daysBack === 0 && (p.hour < 6 || (p.hour === 6 && p.minute < 55));
  if (beforeReset) daysBack = 7;

  const refUtc = reference.getTime();
  const dayMs = 24 * 60 * 60 * 1000;
  const brusselsMidnight = zonedDateTimeToUtc(p.year, p.month, p.day, 0, 0, 0, timeZone);
  const targetDay = new Date(brusselsMidnight.getTime() - daysBack * dayMs);
  const tp = zonedParts(targetDay, timeZone);
  const start = zonedDateTimeToUtc(tp.year, tp.month, tp.day, 6, 55, 0, timeZone);
  const end = new Date(start.getTime() + 7 * dayMs);
  if (reference.getTime() < start.getTime() && refUtc >= start.getTime() - 7 * dayMs) {
    return {
      start: new Date(start.getTime() - 7 * dayMs),
      end: start,
    };
  }
  return { start, end };
}

export function formatBrusselsDate(date: Date): string {
  return new Intl.DateTimeFormat('nl-BE', {
    timeZone: BRUSSELS,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function formatBrusselsDateTime(date: Date): string {
  return new Intl.DateTimeFormat('nl-BE', {
    timeZone: BRUSSELS,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
