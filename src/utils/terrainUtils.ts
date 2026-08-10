import type { DesignElement, ScaleConfig } from '../types/gardenDesigner';
import { pixelToMeters } from './garden3dUtils';

export interface ContourSample {
  x: number;
  y: number;
  elevation: number;
}

const SAMPLE_SPACING_PX = 24;

export function getContourElements(elements: DesignElement[]): DesignElement[] {
  return elements.filter(
    (el) => el.visible && el.properties.isContour && el.type === 'line'
  );
}

/** Sample points along contour polylines for terrain interpolation */
export function buildContourSamples(elements: DesignElement[]): ContourSample[] {
  const samples: ContourSample[] = [];
  for (const el of getContourElements(elements)) {
    const elev = el.properties.contourElevation ?? 0;
    const x1 = el.x;
    const y1 = el.y;
    const x2 = el.x + el.width;
    const y2 = el.y + el.height;
    const length = Math.hypot(x2 - x1, y2 - y1);
    const steps = Math.max(2, Math.ceil(length / SAMPLE_SPACING_PX));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      samples.push({
        x: x1 + (x2 - x1) * t,
        y: y1 + (y2 - y1) * t,
        elevation: elev
      });
    }
  }
  return samples;
}

/** Inverse-distance height at plan pixel (RhinoLands / Sandbox lite) */
export function sampleTerrainHeightPx(
  xPx: number,
  yPx: number,
  samples: ContourSample[],
  fallback = 0
): number {
  if (samples.length === 0) return fallback;

  let weightSum = 0;
  let heightSum = 0;
  const power = 2;

  for (const s of samples) {
    const d = Math.hypot(xPx - s.x, yPx - s.y);
    if (d < 2) return s.elevation;
    const w = 1 / Math.pow(d, power);
    weightSum += w;
    heightSum += w * s.elevation;
  }

  return weightSum > 0 ? heightSum / weightSum : fallback;
}


/** Simpler grid: sample in pixel space then convert to meters */
export function buildTerrainMeshData(
  elements: DesignElement[],
  scale: ScaleConfig,
  boundsCenterPx: { x: number; y: number },
  spanPx: number,
  segments = 32
): { positions: Float32Array; indices: number[] } | null {
  const samples = buildContourSamples(elements);
  if (samples.length === 0) return null;

  const seg = segments;
  const half = spanPx / 2;
  const verts = (seg + 1) * (seg + 1);
  const positions = new Float32Array(verts * 3);
  const indices: number[] = [];

  for (let iz = 0; iz <= seg; iz++) {
    for (let ix = 0; ix <= seg; ix++) {
      const xPx = boundsCenterPx.x - half + (ix / seg) * spanPx;
      const yPx = boundsCenterPx.y - half + (iz / seg) * spanPx;
      const h = sampleTerrainHeightPx(xPx, yPx, samples, 0);
      const worldX = pixelToMeters(xPx, scale);
      const worldZ = pixelToMeters(yPx, scale);

      const idx = (iz * (seg + 1) + ix) * 3;
      positions[idx] = worldX;
      positions[idx + 1] = h;
      positions[idx + 2] = worldZ;
    }
  }

  for (let iz = 0; iz < seg; iz++) {
    for (let ix = 0; ix < seg; ix++) {
      const a = iz * (seg + 1) + ix;
      const b = a + 1;
      const c = a + (seg + 1);
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }

  return { positions, indices };
}
