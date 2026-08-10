import type { ScaleConfig } from '../types/gardenDesigner';
import { formatDimension } from './unitUtils';

/**
 * Plan ↔ 3D axis contract (top-down orthographic plan, Three.js Y-up):
 * - Plan X (canvas → right)  = 3D +X  (rechts)
 * - Plan Y (canvas → down)   = 3D +Z  (onder / voor op plan)
 * - Elevation                = 3D +Y  (hoogte)
 */
export function formatPlanPosition(planX: number, planY: number, scale: ScaleConfig): string {
  return `X ${formatDimension(planX, scale)} · Z ${formatDimension(planY, scale)}`;
}

export const PLAN_AXIS_LABELS = {
  xPositive: '+X rechts',
  xNegative: '−X links',
  zPositive: '+Z onder',
  zNegative: '−Z boven',
  yUp: '+Y hoogte'
} as const;
