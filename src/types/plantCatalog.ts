import type { PlantType } from './gardenDesigner';

export type SunExposure = 'full' | 'partial' | 'shade';
export type WaterNeed = 'low' | 'medium' | 'high';

export interface PlantCatalogLibrary {
  icon: string;
  fillColor: string;
  strokeColor: string;
  widthCm: number;
  heightCm: number;
}

export interface PlantCatalogEntry {
  slug: string;
  name: string;
  category: string;
  plantType: PlantType;
  active: boolean;
  sun: SunExposure;
  water?: WaterNeed;
  soil?: string[];
  sowIndoorsWeeks?: string | null;
  sowOutdoorsWeeks?: string | null;
  harvestWindow?: string | null;
  daysToHarvest?: number | null;
  frostSensitive?: boolean;
  spacingCm?: number | null;
  library: PlantCatalogLibrary;
}

export interface GardenCropEntry {
  id: string;
  name: string;
  catalogSlug: string;
  cultivar?: string | null;
  zone?: string | null;
  status?: string;
  sowedOn?: string | null;
  harvestFrom?: string | null;
  harvestTo?: string | null;
}

export interface PlantCatalogData {
  version: string;
  exportedAt: string;
  source: 'seed' | 'notion' | 'merged';
  plants: PlantCatalogEntry[];
  gardenCrops: GardenCropEntry[];
}
