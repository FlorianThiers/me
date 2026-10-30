const TZ = 'Europe/Brussels';
const LOCALE = 'nl-BE';

export function startOfWeekMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function startOfMonth(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfMonth(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  return d;
}

export function formatWeekRange(anchor: Date): string {
  const start = startOfWeekMonday(anchor);
  const end = addDays(start, 6);
  const fmt = (d: Date) =>
    d.toLocaleDateString(LOCALE, { day: 'numeric', month: 'short', timeZone: TZ });
  return `${fmt(start)} – ${fmt(end)}`;
}

export function formatMonthTitle(anchor: Date): string {
  return anchor.toLocaleDateString(LOCALE, { month: 'long', year: 'numeric', timeZone: TZ });
}

export function formatDayHeader(d: Date): string {
  return d.toLocaleDateString(LOCALE, { weekday: 'short', day: 'numeric', timeZone: TZ });
}

export function formatTimeRange(item: { start: string; end?: string; allDay?: boolean }): string {
  if (item.allDay) return 'Hele dag';
  const start = new Date(item.start);
  const opts: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', timeZone: TZ };
  const startStr = start.toLocaleTimeString(LOCALE, opts);
  if (!item.end) return startStr;
  const end = new Date(item.end);
  const endStr = end.toLocaleTimeString(LOCALE, opts);
  return `${startStr} – ${endStr}`;
}

export function weekDays(anchor: Date): Date[] {
  const start = startOfWeekMonday(anchor);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function monthGridDays(anchor: Date): Date[] {
  const first = startOfMonth(anchor);
  const gridStart = startOfWeekMonday(first);
  const days: Date[] = [];
  for (let i = 0; i < 42; i += 1) {
    days.push(addDays(gridStart, i));
  }
  return days;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function toIsoRangeStart(d: Date): string {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy.toISOString();
}

export function toIsoRangeEnd(d: Date): string {
  const copy = new Date(d);
  copy.setHours(23, 59, 59, 999);
  return copy.toISOString();
}

export function itemDayKey(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
