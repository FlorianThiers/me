import type { ScaleConfig } from '../types/gardenDesigner';
import { unitToPixels } from './unitUtils';

export const DEFAULT_WALL_THICKNESS_CM = 20;

export type Point = { x: number; y: number };

/** Constrain endpoint to horizontal / vertical from start (90°). */
export function snapOrthogonal(start: Point, end: Point): Point {
  const dx = Math.abs(end.x - start.x);
  const dy = Math.abs(end.y - start.y);
  if (dx >= dy) {
    return { x: end.x, y: start.y };
  }
  return { x: start.x, y: end.y };
}

/**
 * Wall endpoint while drawing.
 * Default: 90° snap (renovation-friendly). Hold Alt for free angle.
 */
export function resolveWallEnd(
  start: Point,
  end: Point,
  opts: { freeAngle: boolean }
): Point {
  if (opts.freeAngle) return end;
  return snapOrthogonal(start, end);
}

/** Centerline → closed polygon (4 corners), thickness in canvas pixels. */
export function wallPolygonFromCenterline(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  thicknessPx: number
): Point[] {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  if (len < 1e-6) {
    const half = thicknessPx / 2;
    return [
      { x: x1 - half, y: y1 - half },
      { x: x1 + half, y: y1 - half },
      { x: x1 + half, y: y1 + half },
      { x: x1 - half, y: y1 + half }
    ];
  }
  const nx = (-dy / len) * (thicknessPx / 2);
  const ny = (dx / len) * (thicknessPx / 2);
  return [
    { x: x1 + nx, y: y1 + ny },
    { x: x2 + nx, y: y2 + ny },
    { x: x2 - nx, y: y2 - ny },
    { x: x1 - nx, y: y1 - ny }
  ];
}

export function wallBounds(points: Point[]): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
} {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of points) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  return { minX, minY, maxX, maxY };
}

export function wallLengthPx(x1: number, y1: number, x2: number, y2: number): number {
  return Math.hypot(x2 - x1, y2 - y1);
}

export function thicknessToPixels(thicknessCm: number, scale: ScaleConfig): number {
  return Math.max(unitToPixels(thicknessCm, 'cm', scale), 1);
}

export function createWallElementData(
  start: Point,
  end: Point,
  thicknessCm: number,
  scale: ScaleConfig
): Omit<import('../types/gardenDesigner').DesignElement, 'id' | 'name'> | null {
  const length = wallLengthPx(start.x, start.y, end.x, end.y);
  const thicknessPx = thicknessToPixels(thicknessCm, scale);
  if (length < Math.max(5, thicknessPx * 0.25)) return null;

  const points = wallPolygonFromCenterline(start.x, start.y, end.x, end.y, thicknessPx);
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
    properties: {
      points,
      fillColor: '#d1d5db',
      strokeColor: '#6b7280',
      strokeWidth: 1,
      isWall: true,
      wallThicknessCm: thicknessCm,
      wallCenterline: { x1: start.x, y1: start.y, x2: end.x, y2: end.y }
    }
  };
}
