import type { DesignElement, Folder, PlanProjection, ScaleConfig } from '../types/gardenDesigner';
import { getDefaultElevation, getElevationValues } from './elevationUtils';
import { getElementBounds, getElementsBounds, type Bounds } from './viewUtils';
import { unitToPixels } from './unitUtils';
import { isElementVisible } from './designUtils';

export const PLAN_PROJECTIONS: Array<{ id: PlanProjection; label: string; short: string }> = [
  { id: 'top', label: 'Bovenaanzicht', short: 'Plan' },
  { id: 'north', label: 'Noordgevel (van straat)', short: 'Noord' },
  { id: 'south', label: 'Zuidgevel (achtertuin)', short: 'Zuid' },
  { id: 'west', label: 'Westgevel', short: 'West' },
  { id: 'east', label: 'Oostgevel', short: 'Oost' }
];

function elevationToCanvasY(meters: number, scale: ScaleConfig): number {
  return -unitToPixels(meters * 100, 'cm', scale);
}

function resolveElevation(el: DesignElement): { baseZ: number; topZ: number } {
  const fromEl = getElevationValues(el);
  if (Math.abs(fromEl.topZ) > 0.001 || Math.abs(fromEl.baseZ) > 0.001) {
    return fromEl;
  }
  const defaults = getDefaultElevation(el);
  const baseZ = defaults.baseZ ?? 0;
  const extrusionHeight = defaults.extrusionHeight ?? 0;
  return { baseZ, topZ: baseZ + extrusionHeight };
}

/** Project one element into 2D elevation/plan bounds for rendering & hit tests */
export function projectElementBounds(
  el: DesignElement,
  projection: PlanProjection,
  scale: ScaleConfig
): Bounds | null {
  const plan = getElementBounds(el);
  const depth = Math.max(plan.maxY - plan.minY, 1);

  if (projection === 'top') {
    return plan;
  }

  const { baseZ, topZ } = resolveElevation(el);
  const minY = elevationToCanvasY(topZ, scale);
  const maxY = elevationToCanvasY(baseZ, scale);
  const height = Math.max(maxY - minY, 1);

  switch (projection) {
    case 'north':
    case 'south':
      return {
        minX: plan.minX,
        maxX: plan.maxX,
        minY,
        maxY: minY + height
      };
    case 'west':
    case 'east':
      return {
        minX: plan.minY,
        maxX: plan.minY + depth,
        minY,
        maxY: minY + height
      };
    default:
      return plan;
  }
}

export function elementForProjection(
  el: DesignElement,
  projection: PlanProjection,
  scale: ScaleConfig
): DesignElement | null {
  if (projection === 'top') return el;

  const bounds = projectElementBounds(el, projection, scale);
  if (!bounds) return null;

  const w = bounds.maxX - bounds.minX;
  const h = bounds.maxY - bounds.minY;
  if (w < 0.5 && h < 0.5) return null;

  return {
    ...el,
    type: 'rectangle',
    x: bounds.minX,
    y: bounds.minY,
    width: w,
    height: h,
    rotation: 0,
    properties: {
      ...el.properties,
      points: undefined,
      path: undefined,
      isContour: false
    }
  };
}

export function getVisibleElementsForView(
  elements: DesignElement[],
  folders: Folder[],
  layerVisibility: Record<string, boolean>,
  projection: PlanProjection,
  scale: ScaleConfig
): DesignElement[] {
  return elements
    .filter(el => isElementVisible(el, folders, layerVisibility))
    .map(el => elementForProjection(el, projection, scale))
    .filter((el): el is DesignElement => el !== null);
}

export function getProjectionBounds(
  elements: DesignElement[],
  folders: Folder[],
  layerVisibility: Record<string, boolean>,
  projection: PlanProjection,
  scale: ScaleConfig
): Bounds | null {
  const projected = getVisibleElementsForView(elements, folders, layerVisibility, projection, scale);
  return getElementsBounds(projected);
}

export function getProjectionAxisLabels(projection: PlanProjection): {
  title: string;
  horizontal: string;
  vertical: string;
} {
  switch (projection) {
    case 'north':
      return { title: 'Noordgevel', horizontal: 'X (O ↔ W)', vertical: 'Y hoogte' };
    case 'south':
      return { title: 'Zuidgevel', horizontal: 'X (O ↔ W)', vertical: 'Y hoogte' };
    case 'west':
      return { title: 'Westgevel', horizontal: 'Z (N ↔ S)', vertical: 'Y hoogte' };
    case 'east':
      return { title: 'Oostgevel', horizontal: 'Z (N ↔ S)', vertical: 'Y hoogte' };
    default:
      return { title: 'Bovenaanzicht', horizontal: 'X (O ↔ W)', vertical: 'Z (N ↔ S)' };
  }
}
