import type { HomeStockSnapshot, StockItem } from '../types/homeStock';
import type {
  PantryEvent,
  PantryItem,
  PantryItemInput,
  PantryLocation,
  PantryState,
} from '../types/pantry';
import { PANTRY_LOCATIONS } from '../types/pantry';
import type { StockSummary } from '../types/dashboardSnapshot';

/** Mapt Notion-locatie (Koelkast, Kast 3, Droogschap, Bergkot, ...) naar de 4 dashboard-locaties. */
export function pantryLocationOf(item: Pick<StockItem, 'location' | 'frozen'>): PantryLocation {
  const loc = (item.location ?? '').trim().toLowerCase();
  if (item.frozen || loc === 'diepvries') return 'diepvries';
  if (loc === 'koelkast') return 'koelkast';
  if (loc === 'droogschap' || loc === 'voorraad' || loc === 'voorraadkast' || loc.startsWith('kast')) {
    return 'kast';
  }
  return 'overig';
}

/** Leeftijd in hele dagen van een ISO-timestamp (null als onbekend). */
export function ageInDays(iso: string | null | undefined, now: Date = new Date()): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  return Math.max(0, Math.floor((now.getTime() - t) / 86_400_000));
}

/** Voorraad ouder dan dit aantal dagen heet "verouderd". */
export const STOCK_STALE_AFTER_DAYS = 7;
/** "Bijna over datum" = THT binnen zoveel dagen (niet-diepvries). */
export const EXPIRING_WITHIN_DAYS = 3;

export function emptyLocationCounts(): Record<PantryLocation, number> {
  return { koelkast: 0, diepvries: 0, kast: 0, overig: 0 };
}

/**
 * Samenvatting van de bestaande HomeStockSnapshot. Tuin-items (source 'garden') tellen niet mee
 * in de voorraad maar wel in gardenReady. Spiegel in workflow-os/scripts/export_dashboard_snapshot.py.
 */
export function summarizeStock(snap: HomeStockSnapshot): StockSummary {
  const byLocation = emptyLocationCounts();
  const byCategory: Record<string, number> = {};
  const byLocationCategory = Object.fromEntries(
    PANTRY_LOCATIONS.map((l) => [l, {} as Record<string, number>]),
  ) as Record<PantryLocation, Record<string, number>>;
  const expiring: StockSummary['expiringSoon'] = [];
  let total = 0;
  let gardenReady = 0;
  let expiredCount = 0;
  let expiringCount = 0;

  for (const section of snap.sections) {
    for (const item of section.items) {
      if (section.id === 'garden' || item.source === 'garden') {
        gardenReady += 1;
        continue;
      }
      const loc = pantryLocationOf(item);
      const cat = item.category || 'Overig';
      total += 1;
      byLocation[loc] += 1;
      byCategory[cat] = (byCategory[cat] ?? 0) + 1;
      byLocationCategory[loc][cat] = (byLocationCategory[loc][cat] ?? 0) + 1;
      const d = item.daysToExpiry;
      if (d != null && loc !== 'diepvries' && d <= EXPIRING_WITHIN_DAYS) {
        if (d < 0) expiredCount += 1;
        else expiringCount += 1;
        expiring.push({ name: item.name, location: loc, daysToExpiry: d });
      }
    }
  }
  expiring.sort((a, b) => a.daysToExpiry - b.daysToExpiry);

  return {
    total,
    byLocation,
    byCategory,
    byLocationCategory,
    expiringSoon: expiring.slice(0, 6),
    expiredCount,
    expiringCount,
    gardenReady,
    generatedAt: snap.generatedAt ?? null,
    isDemo: !!snap.isDemo,
  };
}

/* ---------------------------------------------------------------------------------------------
 * Pure update-functies voor het event-model. NIET aangesloten op UI of Notion (nog niet
 * geautomatiseerd); bedoeld als contract voor latere "avondmaal gekookt" / "boodschappenronde".
 * ------------------------------------------------------------------------------------------- */

function normName(s: string): string {
  return s.trim().toLowerCase();
}

function toItem(input: PantryItemInput, at: string, fallbackId: string): PantryItem {
  return { ...input, id: input.id ?? fallbackId, addedAt: at, updatedAt: at };
}

function addOrMerge(items: PantryItem[], input: PantryItemInput, at: string, seq: number): PantryItem[] {
  const idx = items.findIndex(
    (it) =>
      normName(it.name) === normName(input.name) &&
      it.location === input.location &&
      (it.unit ?? null) === (input.unit ?? null) &&
      (it.expiry ?? null) === (input.expiry ?? null),
  );
  if (idx === -1) return [...items, toItem(input, at, `${at}#${seq}`)];
  const next = items.slice();
  const cur = next[idx];
  next[idx] = {
    ...cur,
    quantity: cur.quantity == null || input.quantity == null ? cur.quantity ?? input.quantity : cur.quantity + input.quantity,
    updatedAt: at,
  };
  return next;
}

export function applyPantryEvent(state: PantryState, event: PantryEvent): PantryState {
  let items = state.items;
  switch (event.type) {
    case 'shopping_round':
      event.added.forEach((input, i) => {
        items = addOrMerge(items, input, event.at, i);
      });
      break;
    case 'meal_cooked':
      for (const used of event.consumed) {
        items = items
          .map((it) =>
            it.id === used.itemId && it.quantity != null
              ? { ...it, quantity: Math.max(0, it.quantity - used.quantity), updatedAt: event.at }
              : it,
          )
          .filter((it) => it.quantity == null || it.quantity > 0);
      }
      (event.leftovers ?? []).forEach((input, i) => {
        items = addOrMerge(items, input, event.at, 100 + i);
      });
      break;
    case 'manual_adjust':
      items = items
        .map((it) => (it.id === event.itemId ? { ...it, quantity: event.quantity ?? it.quantity, updatedAt: event.at } : it))
        .filter((it) => it.quantity == null || it.quantity > 0);
      break;
    case 'discard':
      items = items.filter((it) => it.id !== event.itemId);
      break;
  }
  return { ...state, items, updatedAt: event.at, events: [...state.events, event] };
}
