import type { TFunction } from 'i18next';
import type { StockItem } from '../types/homeStock';

const CATEGORY_KEY: Record<string, string> = {
  Fruit: 'fruit',
  Groente: 'groente',
  Vlees: 'vlees',
  Vis: 'vis',
  Zuivel: 'zuivel',
  Overig: 'overig',
};

export function stockSectionLabel(sectionId: string, t: TFunction): string {
  return t(`stock.sections.${sectionId}`, { defaultValue: sectionId });
}

export function stockCategoryLabel(category: string | null | undefined, t: TFunction): string {
  if (!category) return '';
  const key = CATEGORY_KEY[category] ?? category.toLowerCase();
  return t(`stock.categories.${key}`, { defaultValue: category });
}

export function stockUnitLabel(unit: string | null | undefined, t: TFunction): string {
  if (!unit) return '';
  const normalized = unit.trim().toLowerCase();
  return t(`stock.units.${normalized}`, { defaultValue: unit });
}

export function stockQuantityLine(item: StockItem, t: TFunction): string | null {
  const parts: string[] = [];
  if (item.subLocation) {
    parts.push(t(`stock.subLocations.${item.subLocation}`, { defaultValue: item.subLocation }));
  }
  if (item.quantity != null) {
    const unit = stockUnitLabel(item.unit, t);
    parts.push(unit ? `${item.quantity} ${unit}` : String(item.quantity));
  }
  return parts.length ? parts.join(' · ') : null;
}

export function stockExpiryLabel(
  item: StockItem,
  t: TFunction,
): string | null {
  if (item.daysToExpiry == null) {
    return item.expiry ?? null;
  }
  if (item.daysToExpiry < 0) return t('stock.expired');
  if (item.daysToExpiry === 0) return t('stock.expiresToday');
  if (item.daysToExpiry <= 3) return t('stock.expiresIn', { days: item.daysToExpiry });
  if (item.expiry) return t('stock.expiresOn', { date: item.expiry });
  return null;
}
