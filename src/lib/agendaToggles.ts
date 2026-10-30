import type { AgendaCalendarMeta, AgendaItem } from '../types/agenda';

const STORAGE_KEY = 'agenda-layer-toggles-v1';

export type LayerToggles = Record<string, boolean>;

export function defaultToggles(calendars: AgendaCalendarMeta[]): LayerToggles {
  const toggles: LayerToggles = {
    notion: true,
    todoist: true,
  };
  for (const cal of calendars) {
    const key = `google:${cal.id}`;
    toggles[key] = cal.primary;
  }
  return toggles;
}

export function loadToggles(calendars: AgendaCalendarMeta[]): LayerToggles {
  const base = defaultToggles(calendars);
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return base;
    const saved = JSON.parse(raw) as LayerToggles;
    return { ...base, ...saved };
  } catch {
    return base;
  }
}

export function saveToggles(toggles: LayerToggles): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(toggles));
}

export function googleIdsFromToggles(toggles: LayerToggles): string[] {
  return Object.entries(toggles)
    .filter(([k, on]) => on && k.startsWith('google:'))
    .map(([k]) => k.slice('google:'.length));
}

export function itemIsMuted(item: AgendaItem, calendars: AgendaCalendarMeta[]): boolean {
  if (item.source !== 'google' || !item.calendarId) return false;
  const cal = calendars.find((c) => c.id === item.calendarId);
  return cal ? !cal.primary : true;
}

export function layerKeyForItem(item: AgendaItem): string {
  if (item.source === 'google' && item.calendarId) return `google:${item.calendarId}`;
  return item.source;
}

export function filterVisibleItems(
  items: AgendaItem[],
  toggles: LayerToggles,
): AgendaItem[] {
  return items.filter((item) => {
    const key = layerKeyForItem(item);
    return toggles[key] !== false;
  });
}
