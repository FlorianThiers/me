import type { DesignElement, ElevationConfig, LayerType, ScaleConfig } from '../types/gardenDesigner';
import { unitToPixels } from './unitUtils';

/** Elevation stored in meters (BIM convention) */
export const ELEVATION_UNIT = 'm' as const;

export function getElevationValues(element: DesignElement): {
  baseZ: number;
  extrusionHeight: number;
  topZ: number;
} {
  const baseZ = element.elevation?.baseZ ?? 0;
  const extrusionHeight = element.elevation?.extrusionHeight ?? 0;
  return { baseZ, extrusionHeight, topZ: baseZ + extrusionHeight };
}

export function hasElevationVisual(element: DesignElement): boolean {
  const { baseZ, extrusionHeight } = getElevationValues(element);
  return Math.abs(baseZ) > 0.001 || extrusionHeight > 0.001;
}

/** Default elevation by layer/type (SketchUp push/pull presets) */
export function getDefaultElevation(
  el: Pick<DesignElement, 'layer' | 'type' | 'properties'>
): ElevationConfig {
  const water = el.properties.waterType;
  if (water === 'pond') return { baseZ: -0.3, extrusionHeight: 0.3 };
  if (water === 'pipe') return { baseZ: -0.6, extrusionHeight: 0.08 };
  if (water === 'channel') return { baseZ: -0.15, extrusionHeight: 0.15 };

  if (el.layer === 'building') {
    if (el.properties.isRoom) return { baseZ: 0, extrusionHeight: 0 };
    if (el.properties.isOpening) {
      if (el.properties.openingKind === 'window') return { baseZ: 0.9, extrusionHeight: 1.2 };
      return { baseZ: 0, extrusionHeight: 2.1 };
    }
    if (el.properties.furnitureType) return { baseZ: 0, extrusionHeight: 0.85 };
    if (el.type === 'line') return { baseZ: 0, extrusionHeight: 2.4 };
    return { baseZ: 0, extrusionHeight: 2.4 };
  }

  if (el.layer === 'plants') {
    const pt = el.properties.plantType;
    if (pt === 'climber') return { baseZ: 0, extrusionHeight: 2.5 };
    if (pt === 'perennial') return { baseZ: 0, extrusionHeight: 1.5 };
    if (pt === 'houseplant') return { baseZ: 0, extrusionHeight: 0.6 };
    return { baseZ: 0, extrusionHeight: 0.45 };
  }

  if (el.layer === 'ground') {
    if (el.properties.foundationType) return { baseZ: -0.8, extrusionHeight: 0.8 };
    if (el.type === 'polygon' || el.type === 'rectangle') {
      return { baseZ: 0, extrusionHeight: 0.15 };
    }
    return { baseZ: 0, extrusionHeight: 0 };
  }

  return { baseZ: 0, extrusionHeight: 0 };
}

export function formatElevationMeters(meters: number): string {
  const abs = Math.abs(meters);
  const sign = meters < -0.001 ? '−' : meters > 0.001 ? '+' : '';
  if (abs >= 1) return `${sign}${abs.toFixed(2)} m`;
  if (abs < 0.001) return '0';
  return `${sign}${Math.round(abs * 100)} cm`;
}

export function formatElevationLabel(element: DesignElement): string | null {
  const { baseZ, extrusionHeight, topZ } = getElevationValues(element);
  if (!hasElevationVisual(element)) return null;
  if (Math.abs(baseZ) > 0.001 && extrusionHeight > 0.001) {
    return `↕ ${formatElevationMeters(baseZ)} → ${formatElevationMeters(topZ)}`;
  }
  if (extrusionHeight > 0.001) return `H ${formatElevationMeters(extrusionHeight)}`;
  return `Z ${formatElevationMeters(baseZ)}`;
}

/** Plan-view pseudo-3D shadow offset in pixels */
export function elevationToPlanOffset(meters: number, scale: ScaleConfig): number {
  if (Math.abs(meters) < 0.001) return 0;
  const cm = meters * 100;
  const px = unitToPixels(cm, 'cm', scale);
  return Math.sign(meters) * Math.min(Math.abs(px) * 0.4, 48);
}

/** Tint fill for height: buried = cooler, raised = warmer */
export function applyElevationTint(hex: string, baseZ: number, extrusionHeight: number): string {
  const total = baseZ + extrusionHeight * 0.5;
  if (Math.abs(total) < 0.01) return hex;

  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  let nr = r;
  let ng = g;
  let nb = b;

  if (total < 0) {
    const t = Math.min(Math.abs(total) * 0.3, 0.35);
    nb = Math.round(b + (255 - b) * t);
    nr = Math.round(r * (1 - t * 0.5));
    ng = Math.round(g * (1 - t * 0.3));
  } else {
    const t = Math.min(total * 0.15, 0.25);
    nr = Math.round(r + (255 - r) * t);
    ng = Math.round(g + (255 - g) * t * 0.8);
  }

  return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`;
}

export const ELEVATION_PRESETS: Array<{
  id: string;
  label: string;
  elevation: ElevationConfig;
  layers?: LayerType[];
}> = [
  { id: 'flat', label: 'Vlak (grond)', elevation: { baseZ: 0, extrusionHeight: 0 } },
  { id: 'bed', label: 'Verhoogd bed', elevation: { baseZ: 0, extrusionHeight: 0.4 } },
  { id: 'terrace', label: 'Terras (+20 cm)', elevation: { baseZ: 0.2, extrusionHeight: 0.15 } },
  { id: 'wall', label: 'Muur (2,4 m)', elevation: { baseZ: 0, extrusionHeight: 2.4 } },
  { id: 'plant', label: 'Plant (~45 cm)', elevation: { baseZ: 0, extrusionHeight: 0.45 } },
  { id: 'tree', label: 'Boom (~3 m)', elevation: { baseZ: 0, extrusionHeight: 3 } },
  { id: 'pond', label: 'Vijver (ingegraven)', elevation: { baseZ: -0.3, extrusionHeight: 0.3 } },
  { id: 'pipe', label: 'Leiding (ondergronds)', elevation: { baseZ: -0.6, extrusionHeight: 0.08 } }
];

export function mergeElevation(
  current: ElevationConfig | undefined,
  patch: Partial<ElevationConfig>
): ElevationConfig {
  return {
    baseZ: patch.baseZ ?? current?.baseZ ?? 0,
    extrusionHeight: patch.extrusionHeight ?? current?.extrusionHeight ?? 0,
    slopeDeg: patch.slopeDeg ?? current?.slopeDeg
  };
}
