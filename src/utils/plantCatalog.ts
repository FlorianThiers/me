import type { LibraryItem } from '../types/gardenDesigner';
import type { PlantCatalogData, PlantCatalogEntry, SunExposure } from '../types/plantCatalog';
import { staticLibraryItems } from '../data/libraryItems';

const SUN_LABELS: Record<SunExposure, string> = {
  full: 'Volle zon',
  partial: 'Halfschaduw',
  shade: 'Schaduw'
};

export function catalogEntryToLibraryItem(entry: PlantCatalogEntry): LibraryItem {
  const lib = entry.library;
  return {
    id: entry.slug,
    name: entry.name,
    category: 'plants',
    icon: lib.icon,
    defaultLayer: 'plants',
    defaultSize: {
      width: lib.widthCm,
      height: lib.heightCm
    },
    defaultProperties: {
      fillColor: lib.fillColor,
      strokeColor: lib.strokeColor,
      strokeWidth: 2,
      plantType: entry.plantType,
      catalogSlug: entry.slug
    },
    catalogMeta: {
      category: entry.category,
      sun: entry.sun,
      water: entry.water,
      sowOutdoorsWeeks: entry.sowOutdoorsWeeks,
      harvestWindow: entry.harvestWindow,
      frostSensitive: entry.frostSensitive
    }
  };
}

export function mergeLibraryItems(catalog: PlantCatalogData | null): LibraryItem[] {
  const nonPlants = staticLibraryItems.filter(item => item.category !== 'plants');
  if (!catalog?.plants?.length) {
    return staticLibraryItems;
  }
  const activePlants = catalog.plants
    .filter(p => p.active !== false)
    .map(catalogEntryToLibraryItem);
  return [...activePlants, ...nonPlants];
}

export function getCatalogBySlug(
  catalog: PlantCatalogData | null,
  slug: string | undefined
): PlantCatalogEntry | undefined {
  if (!catalog || !slug) return undefined;
  return catalog.plants.find(p => p.slug === slug);
}

export function formatSunLabel(sun: SunExposure | undefined): string {
  if (!sun) return '—';
  return SUN_LABELS[sun] ?? sun;
}

export function isSowWindowActive(weeks: string | null | undefined, week: number): boolean {
  if (!weeks) return false;
  const normalized = weeks.replace('–', '-').replace(' ', '');
  const parts = normalized.split('-');
  if (parts.length !== 2) return false;
  try {
    const start = parseInt(parts[0], 10);
    const end = parseInt(parts[1], 10);
    if (Number.isNaN(start) || Number.isNaN(end)) return false;
    if (start <= end) {
      return start <= week && week <= end;
    }
    return week >= start || week <= end;
  } catch {
    return false;
  }
}

export function getIsoWeek(date = new Date()): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function getSowHint(entry: PlantCatalogEntry): string | null {
  const week = getIsoWeek();
  if (entry.sowOutdoorsWeeks && isSowWindowActive(entry.sowOutdoorsWeeks, week)) {
    return 'Zaai buiten nu';
  }
  if (entry.sowIndoorsWeeks && isSowWindowActive(entry.sowIndoorsWeeks, week)) {
    return 'Zaai binnen nu';
  }
  return null;
}

export function sunMatchesZone(plantSun: SunExposure, zoneSun: SunExposure | undefined): boolean {
  if (!zoneSun) return true;
  if (plantSun === zoneSun) return true;
  if (zoneSun === 'partial') return true;
  if (zoneSun === 'full' && plantSun === 'partial') return true;
  return false;
}
