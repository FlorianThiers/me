import { Refrigerator, Snowflake, Archive, Package, type LucideIcon } from 'lucide-react';
import type { HomeStockSnapshot, StockItem } from '../../types/homeStock';
import type { StockSummary } from '../../types/dashboardSnapshot';
import { PANTRY_LOCATIONS, type PantryLocation } from '../../types/pantry';
import { STOCK_STALE_AFTER_DAYS, pantryLocationOf, summarizeStock } from '../../lib/pantry';
import { daysSince, formatDateNl } from '../../lib/dashboardFreshness';
import type { BlockStatus } from './DashboardBlock';

export const LOCATION_ICONS: Record<PantryLocation, LucideIcon> = {
  koelkast: Refrigerator,
  diepvries: Snowflake,
  kast: Archive,
  overig: Package,
};

/** Kiest de nieuwste bron: home-stock.json (via bestaand HomeStockSnapshot-type) of de snapshot-samenvatting. */
export function pickStockSource(
  homeStock: HomeStockSnapshot | null,
  snapshotStock: StockSummary | null,
): { stock: StockSummary | null; fromHome: boolean } {
  const fromHome = homeStock ? summarizeStock(homeStock) : null;
  if (fromHome && snapshotStock) {
    const a = new Date(fromHome.generatedAt ?? 0).getTime();
    const b = new Date(snapshotStock.generatedAt ?? 0).getTime();
    return b > a ? { stock: snapshotStock, fromHome: false } : { stock: fromHome, fromHome: true };
  }
  return fromHome ? { stock: fromHome, fromHome: true } : { stock: snapshotStock, fromHome: false };
}

export function pickStock(homeStock: HomeStockSnapshot | null, snapshotStock: StockSummary | null): StockSummary | null {
  return pickStockSource(homeStock, snapshotStock).stock;
}

export function stockStatus(stock: StockSummary | null): { status: BlockStatus; age: number | null; notice?: string } {
  const age = daysSince(stock?.generatedAt);
  let status: BlockStatus = 'empty';
  if (stock) {
    status = stock.isDemo ? 'demo' : age == null ? 'unknown' : age > STOCK_STALE_AFTER_DAYS ? 'stale' : 'live';
    if (stock.total === 0 && !stock.isDemo) status = age != null && age > STOCK_STALE_AFTER_DAYS ? 'stale' : 'empty';
  }
  const notice = !stock
    ? undefined
    : stock.isDemo
      ? 'DEMO: voorbeeldvoorraad, niet je echte voorraad. Draai export_home_stock.py met Notion-toegang.'
      : status === 'stale' || status === 'unknown'
        ? `Verouderd: laatste export ${formatDateNl(stock.generatedAt)}${age != null ? ` (${age} dagen geleden)` : ''}.`
        : undefined;
  return { status, age, notice };
}

/** Items per dashboard-locatie (zonder tuin-items), gesorteerd op THT. */
export function itemsByLocation(homeStock: HomeStockSnapshot | null): Record<PantryLocation, StockItem[]> {
  const out: Record<PantryLocation, StockItem[]> = { koelkast: [], diepvries: [], kast: [], overig: [] };
  for (const section of homeStock?.sections ?? []) {
    for (const item of section.items) {
      if (section.id === 'garden' || item.source === 'garden') continue;
      out[pantryLocationOf(item)].push(item);
    }
  }
  for (const loc of PANTRY_LOCATIONS) {
    out[loc].sort((a, b) => (a.daysToExpiry ?? 9999) - (b.daysToExpiry ?? 9999) || a.name.localeCompare(b.name, 'nl'));
  }
  return out;
}

export const expiryLabel = (d: number) => (d < 0 ? 'Over datum' : d === 0 ? 'Vandaag' : d === 1 ? 'Morgen' : `${d} dagen`);

