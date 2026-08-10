import type { DesignElement, PlanProjection, ScaleConfig } from '../types/gardenDesigner';
import { convertUnit, pixelsToUnit, unitToPixels } from './unitUtils';
import type { Point } from './wallUtils';
import { wallBounds, wallPolygonFromCenterline } from './wallUtils';
import { projectElementBounds } from './planProjectionUtils';

export const DEFAULT_DOOR_WIDTH_CM = 90;
export const DEFAULT_WINDOW_WIDTH_CM = 120;
export const DEFAULT_DOOR_HEIGHT_CM = 210;
export const DEFAULT_WINDOW_SILL_CM = 90;
export const DEFAULT_WINDOW_HEIGHT_CM = 120;

export type OpeningKind = 'door' | 'window';

export interface WallCenterline {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface WallHit {
  wall: DesignElement;
  t: number;
  point: Point;
  angle: number;
  length: number;
  thicknessCm: number;
  /** Sill height in meters (from elevation click or defaults) */
  sillM?: number;
  openingHeightM?: number;
}

/** Recover centerline from stored data or wall polygon corners. */
export function getWallCenterline(wall: DesignElement): WallCenterline | null {
  const stored = wall.properties.wallCenterline;
  if (stored) return stored;

  const pts = wall.properties.points;
  if (!wall.properties.isWall || !pts || pts.length < 4) return null;

  const x1 = (pts[0].x + pts[3].x) / 2;
  const y1 = (pts[0].y + pts[3].y) / 2;
  const x2 = (pts[1].x + pts[2].x) / 2;
  const y2 = (pts[1].y + pts[2].y) / 2;
  return { x1, y1, x2, y2 };
}

function distToSegment(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): { dist: number; t: number; point: Point } {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq < 1e-8) {
    return { dist: Math.hypot(px - x1, py - y1), t: 0, point: { x: x1, y: y1 } };
  }
  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const qx = x1 + t * dx;
  const qy = y1 + t * dy;
  return { dist: Math.hypot(px - qx, py - qy), t, point: { x: qx, y: qy } };
}

/** Canvas Y in elevation view → height above ground (meters). */
export function elevationCanvasYToMeters(y: number, scale: ScaleConfig): number {
  const inScaleUnit = pixelsToUnit(y, scale);
  const cm = convertUnit(inScaleUnit, scale.unit, 'cm');
  return -cm / 100;
}

export function metersToElevationCanvasY(meters: number, scale: ScaleConfig): number {
  return -unitToPixels(meters * 100, 'cm', scale);
}

export function findNearestWallHit(
  elements: DesignElement[],
  x: number,
  y: number,
  maxDistPx: number
): WallHit | null {
  let best: WallHit | null = null;
  let bestDist = maxDistPx;

  for (const el of elements) {
    if (!el.visible || !el.properties.isWall) continue;
    const cl = getWallCenterline(el);
    if (!cl) continue;
    const { dist, t, point } = distToSegment(x, y, cl.x1, cl.y1, cl.x2, cl.y2);
    if (dist < bestDist) {
      const length = Math.hypot(cl.x2 - cl.x1, cl.y2 - cl.y1);
      bestDist = dist;
      best = {
        wall: el,
        t,
        point,
        angle: Math.atan2(cl.y2 - cl.y1, cl.x2 - cl.x1),
        length,
        thicknessCm: el.properties.wallThicknessCm ?? 20
      };
    }
  }
  return best;
}

/**
 * Hit-test walls in facade view. Click X → along wall, Click Y → sill height.
 */
export function findNearestWallHitInElevation(
  elements: DesignElement[],
  projection: PlanProjection,
  scale: ScaleConfig,
  x: number,
  y: number,
  maxDistPx: number,
  kind: OpeningKind
): WallHit | null {
  if (projection === 'top') {
    return findNearestWallHit(elements, x, y, maxDistPx);
  }

  let best: WallHit | null = null;
  let bestDist = maxDistPx;

  const defaultHeightM =
    kind === 'door' ? DEFAULT_DOOR_HEIGHT_CM / 100 : DEFAULT_WINDOW_HEIGHT_CM / 100;
  const sillFromClick = elevationCanvasYToMeters(y, scale);

  for (const el of elements) {
    if (!el.visible || !el.properties.isWall) continue;
    const cl = getWallCenterline(el);
    if (!cl) continue;
    const bounds = projectElementBounds(el, projection, scale);
    if (!bounds) continue;

    const cx = Math.max(bounds.minX, Math.min(bounds.maxX, x));
    const dx = x < bounds.minX ? bounds.minX - x : x > bounds.maxX ? x - bounds.maxX : 0;
    const dy = y < bounds.minY ? bounds.minY - y : y > bounds.maxY ? y - bounds.maxY : 0;
    const dist = Math.hypot(dx, dy);
    if (dist > bestDist) continue;

    const length = Math.hypot(cl.x2 - cl.x1, cl.y2 - cl.y1);
    if (length < 1) continue;

    let t = 0.5;
    if (projection === 'north' || projection === 'south') {
      const xA = cl.x1;
      const xB = cl.x2;
      if (Math.abs(xB - xA) > 1) {
        t = (cx - Math.min(xA, xB)) / Math.abs(xB - xA);
        if (xB < xA) t = 1 - t;
      }
    } else {
      const yA = cl.y1;
      const yB = cl.y2;
      if (Math.abs(yB - yA) > 1) {
        t = (cx - Math.min(yA, yB)) / Math.abs(yB - yA);
        if (yB < yA) t = 1 - t;
      }
    }
    t = Math.max(0, Math.min(1, t));

    const wallTopM = Math.max(el.elevation?.extrusionHeight ?? 2.4, defaultHeightM + 0.1);
    let sillM = kind === 'door' ? 0 : sillFromClick;
    if (kind === 'window') {
      sillM = Math.max(0.2, Math.min(wallTopM - defaultHeightM, sillFromClick));
    }

    const point = {
      x: cl.x1 + t * (cl.x2 - cl.x1),
      y: cl.y1 + t * (cl.y2 - cl.y1)
    };

    bestDist = dist;
    best = {
      wall: el,
      t,
      point,
      angle: Math.atan2(cl.y2 - cl.y1, cl.x2 - cl.x1),
      length,
      thicknessCm: el.properties.wallThicknessCm ?? 20,
      sillM,
      openingHeightM: defaultHeightM
    };
  }

  return best;
}

export function createOpeningElementData(
  hit: WallHit,
  kind: OpeningKind,
  widthCm: number,
  scale: ScaleConfig,
  opts?: { sillM?: number; heightM?: number }
): Omit<DesignElement, 'id' | 'name'> | null {
  const cl = getWallCenterline(hit.wall);
  if (!cl) return null;

  const widthPx = unitToPixels(widthCm, 'cm', scale);
  const thicknessPx = unitToPixels(hit.thicknessCm, 'cm', scale);
  const len = hit.length;
  if (len < widthPx + 4) return null;

  const half = widthPx / (2 * len);
  let t = hit.t;
  t = Math.max(half, Math.min(1 - half, t));

  const dx = (cl.x2 - cl.x1) / len;
  const dy = (cl.y2 - cl.y1) / len;
  const cx = cl.x1 + t * (cl.x2 - cl.x1);
  const cy = cl.y1 + t * (cl.y2 - cl.y1);
  const hx = (dx * widthPx) / 2;
  const hy = (dy * widthPx) / 2;

  const points = wallPolygonFromCenterline(
    cx - hx,
    cy - hy,
    cx + hx,
    cy + hy,
    Math.max(thicknessPx, 4)
  );
  const bounds = wallBounds(points);

  const isDoor = kind === 'door';
  const sillM =
    opts?.sillM ?? hit.sillM ?? (isDoor ? 0 : DEFAULT_WINDOW_SILL_CM / 100);
  const heightM =
    opts?.heightM ??
    hit.openingHeightM ??
    (isDoor ? DEFAULT_DOOR_HEIGHT_CM / 100 : DEFAULT_WINDOW_HEIGHT_CM / 100);

  return {
    type: 'polygon',
    layer: 'building',
    x: bounds.minX,
    y: bounds.minY,
    width: bounds.maxX - bounds.minX,
    height: bounds.maxY - bounds.minY,
    visible: true,
    locked: false,
    elevation: {
      baseZ: sillM,
      extrusionHeight: heightM
    },
    properties: {
      points,
      fillColor: isDoor ? '#92400e' : '#bfdbfe',
      strokeColor: isDoor ? '#78350f' : '#3b82f6',
      strokeWidth: 1,
      isOpening: true,
      openingKind: kind,
      openingWidthCm: widthCm,
      openingSillCm: Math.round(sillM * 100),
      openingHeightCm: Math.round(heightM * 100),
      hostWallId: hit.wall.id,
      openingT: t,
      openingAngle: hit.angle,
      openingCenter: { x: cx, y: cy },
      openingSwing: isDoor
    }
  };
}

export function openingPreviewPoints(
  hit: WallHit,
  widthCm: number,
  scale: ScaleConfig,
  kind: OpeningKind = 'door'
): Point[] | null {
  const draft = createOpeningElementData(hit, kind, widthCm, scale);
  return draft?.properties.points ?? null;
}

export function applyOpeningElevation(
  element: DesignElement,
  sillCm: number,
  heightCm: number
): DesignElement {
  return {
    ...element,
    elevation: {
      baseZ: sillCm / 100,
      extrusionHeight: heightCm / 100
    },
    properties: {
      ...element.properties,
      openingSillCm: sillCm,
      openingHeightCm: heightCm
    }
  };
}

export function createRoomElementData(
  points: Point[]
): Omit<DesignElement, 'id' | 'name'> | null {
  if (points.length < 3) return null;
  const bounds = wallBounds(points);
  return {
    type: 'polygon',
    layer: 'building',
    x: bounds.minX,
    y: bounds.minY,
    width: bounds.maxX - bounds.minX,
    height: bounds.maxY - bounds.minY,
    visible: true,
    locked: false,
    elevation: { baseZ: 0, extrusionHeight: 0 },
    properties: {
      points: [...points],
      fillColor: 'rgba(99, 102, 241, 0.22)',
      strokeColor: '#818cf8',
      strokeWidth: 2,
      isRoom: true
    }
  };
}
