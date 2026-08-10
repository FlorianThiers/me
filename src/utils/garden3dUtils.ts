import type { DesignElement, LayerType, ScaleConfig } from '../types/gardenDesigner';
import { getElementsBounds } from './viewUtils';
import { pixelsToUnit, type Unit } from './unitUtils';
import { getElevationValues } from './elevationUtils';

const UNIT_TO_METERS: Record<Unit, number> = {
  mm: 0.001,
  cm: 0.01,
  m: 1,
  km: 1000
};

export function pixelToMeters(pixels: number, scale: ScaleConfig): number {
  return pixelsToUnit(pixels, scale) * UNIT_TO_METERS[scale.unit];
}

export interface GardenMeshSpec {
  id: string;
  shape: 'box' | 'cylinder' | 'extrude';
  position: [number, number, number];
  size: [number, number, number];
  rotationY: number;
  color: string;
  opacity: number;
  points?: Array<{ x: number; y: number }>;
}

export function elementToMeshSpec(
  element: DesignElement,
  scale: ScaleConfig
): GardenMeshSpec | null {
  if (!element.visible) return null;

  const { baseZ, extrusionHeight } = getElevationValues(element);
  const heightM = Math.max(extrusionHeight, 0.04);
  const centerY = baseZ + heightM / 2;

  const color = element.properties.fillColor || layerColor(element.layer);
  const opacity = element.layer === 'water' ? 0.75 : 0.92;

  if (element.type === 'line') {
    const lengthPx = Math.hypot(element.width, element.height);
    const lengthM = pixelToMeters(lengthPx, scale);
    const cx = pixelToMeters(element.x + element.width / 2, scale);
    const cz = pixelToMeters(element.y + element.height / 2, scale);
    const rotationY = -Math.atan2(element.height, element.width);
    return {
      id: element.id,
      shape: 'box',
      position: [cx, centerY, cz],
      size: [lengthM, heightM, pixelToMeters(Math.max(element.properties.strokeWidth || 2, 4), scale)],
      rotationY,
      color: element.properties.strokeColor || color,
      opacity
    };
  }

  if (element.type === 'circle' || (element.type === 'library-item' && element.layer === 'plants')) {
    const radiusPx = Math.max(element.width, element.height) / 2;
    const radiusM = pixelToMeters(radiusPx, scale);
    const cx = pixelToMeters(element.x + element.width / 2, scale);
    const cz = pixelToMeters(element.y + element.height / 2, scale);
    const plantH = element.layer === 'plants' ? Math.max(heightM, radiusM * 1.6) : heightM;
    return {
      id: element.id,
      shape: 'cylinder',
      position: [cx, baseZ + plantH / 2, cz],
      size: [radiusM * 2, plantH, radiusM * 2],
      rotationY: ((element.rotation || 0) * Math.PI) / 180,
      color,
      opacity
    };
  }

  if (element.type === 'polygon' && element.properties.points && element.properties.points.length >= 3) {
    return {
      id: element.id,
      shape: 'extrude',
      position: [0, baseZ, 0],
      size: [0, heightM, 0],
      rotationY: ((element.rotation || 0) * Math.PI) / 180,
      color,
      opacity,
      points: element.properties.points
    };
  }

  if (element.type === 'freehand') {
    return null;
  }

  const widthM = pixelToMeters(element.width, scale);
  const depthM = pixelToMeters(element.height, scale);
  const cx = pixelToMeters(element.x + element.width / 2, scale);
  const cz = pixelToMeters(element.y + element.height / 2, scale);

  return {
    id: element.id,
    shape: 'box',
    position: [cx, centerY, cz],
    size: [widthM, heightM, depthM],
    rotationY: ((element.rotation || 0) * Math.PI) / 180,
    color,
    opacity
  };
}

function layerColor(layer: LayerType): string {
  switch (layer) {
    case 'ground':
      return '#b45309';
    case 'building':
      return '#9ca3af';
    case 'plants':
      return '#22c55e';
    case 'water':
      return '#2563eb';
    default:
      return '#00ff88';
  }
}

export function getSceneFocus(
  elements: DesignElement[],
  scale: ScaleConfig
): { center: [number, number, number]; distance: number } {
  const bounds = getElementsBounds(elements);
  if (!bounds) {
    return { center: [0, 1, 0], distance: 12 };
  }

  const cx = pixelToMeters((bounds.minX + bounds.maxX) / 2, scale);
  const cz = pixelToMeters((bounds.minY + bounds.maxY) / 2, scale);
  const spanX = pixelToMeters(bounds.maxX - bounds.minX, scale);
  const spanZ = pixelToMeters(bounds.maxY - bounds.minY, scale);
  const span = Math.max(spanX, spanZ, 4);

  return {
    center: [cx, 1.2, cz],
    distance: span * 1.35 + 4
  };
}

export function elementsToMeshSpecs(
  elements: DesignElement[],
  scale: ScaleConfig,
  layerVisibility: Record<string, boolean>
): GardenMeshSpec[] {
  return elements
    .filter(el => layerVisibility[el.layer] !== false)
    .map(el => elementToMeshSpec(el, scale))
    .filter((spec): spec is GardenMeshSpec => spec !== null);
}
