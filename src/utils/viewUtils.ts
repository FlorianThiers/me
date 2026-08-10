import type { DesignElement, ViewState } from '../types/gardenDesigner';

export const DEFAULT_VIEW: ViewState = { zoom: 1, panX: 0, panY: 0 };
/** Large sites (e.g. 30m+ at 10px/cm) need ~0.01 fit zoom on a ~500px panel */
export const ZOOM_MIN = 0.002;
export const ZOOM_MAX = 10;

/** Predictable zoom stops (Figma / Miro ladder) */
export const ZOOM_LADDER = [
  0.002, 0.005, 0.01, 0.015, 0.02, 0.05,
  0.1, 0.125, 0.25, 0.33, 0.5, 0.67, 0.75, 1, 1.25, 1.5, 2, 3, 4, 6, 8, 10
];

export function clampZoom(zoom: number): number {
  return Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, zoom));
}

export function snapZoomToLadder(zoom: number): number {
  return ZOOM_LADDER.reduce((best, step) =>
    Math.abs(step - zoom) < Math.abs(best - zoom) ? step : best
  );
}

export function stepZoomOnLadder(current: number, direction: 'in' | 'out'): number {
  const z = snapZoomToLadder(current);
  const idx = ZOOM_LADDER.indexOf(z);
  if (idx === -1) {
    return clampZoom(direction === 'in' ? current * 1.25 : current / 1.25);
  }
  const next = direction === 'in'
    ? ZOOM_LADDER[Math.min(idx + 1, ZOOM_LADDER.length - 1)]
    : ZOOM_LADDER[Math.max(idx - 1, 0)];
  return next;
}

/** Smooth exponential zoom from wheel delta (trackpad + mouse) */
export function wheelZoomFactor(deltaY: number, deltaMode: number): number {
  let dy = deltaY;
  if (deltaMode === 1) dy *= 16;
  else if (deltaMode === 2) dy *= canvasHeightFallback();
  return Math.exp(-dy * 0.002);
}

function canvasHeightFallback(): number {
  return typeof window !== 'undefined' ? window.innerHeight * 0.85 : 800;
}

/**
 * Figma-style wheel:
 * - ctrl/meta or pinch → zoom to cursor
 * - plain wheel / trackpad two-finger → pan
 */
export function applyWheelNavigation(
  e: Pick<WheelEvent, 'deltaX' | 'deltaY' | 'deltaMode' | 'ctrlKey' | 'metaKey'>,
  view: ViewState,
  screenX: number,
  screenY: number
): ViewState {
  const wantsZoom = e.ctrlKey || e.metaKey;

  if (wantsZoom) {
    const factor = wheelZoomFactor(e.deltaY, e.deltaMode);
    return zoomAtPoint(view, screenX, screenY, factor);
  }

  let dx = e.deltaX;
  let dy = e.deltaY;
  if (e.deltaMode === 1) {
    dx *= 16;
    dy *= 16;
  } else if (e.deltaMode === 2) {
    dx *= 120;
    dy *= 120;
  }

  return {
    ...view,
    panX: view.panX - dx,
    panY: view.panY - dy
  };
}

export function stepZoomAtPoint(
  view: ViewState,
  screenX: number,
  screenY: number,
  direction: 'in' | 'out'
): ViewState {
  const target = stepZoomOnLadder(view.zoom, direction);
  const factor = target / view.zoom;
  return zoomAtPoint(view, screenX, screenY, factor);
}

export function screenToWorld(
  screenX: number,
  screenY: number,
  view: ViewState
): { x: number; y: number } {
  return {
    x: (screenX - view.panX) / view.zoom,
    y: (screenY - view.panY) / view.zoom
  };
}

export function worldToScreen(
  worldX: number,
  worldY: number,
  view: ViewState
): { x: number; y: number } {
  return {
    x: worldX * view.zoom + view.panX,
    y: worldY * view.zoom + view.panY
  };
}

export function zoomAtPoint(
  view: ViewState,
  screenX: number,
  screenY: number,
  factor: number
): ViewState {
  const newZoom = clampZoom(view.zoom * factor);
  const worldX = (screenX - view.panX) / view.zoom;
  const worldY = (screenY - view.panY) / view.zoom;
  return {
    zoom: newZoom,
    panX: screenX - worldX * newZoom,
    panY: screenY - worldY * newZoom
  };
}

export interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export function getElementBounds(el: DesignElement): Bounds {
  if (el.properties.points && el.properties.points.length > 0) {
    const xs = el.properties.points.map(p => p.x);
    const ys = el.properties.points.map(p => p.y);
    return { minX: Math.min(...xs), minY: Math.min(...ys), maxX: Math.max(...xs), maxY: Math.max(...ys) };
  }
  if (el.properties.path && el.properties.path.length > 0) {
    const xs = el.properties.path.map(p => p.x);
    const ys = el.properties.path.map(p => p.y);
    return { minX: Math.min(...xs), minY: Math.min(...ys), maxX: Math.max(...xs), maxY: Math.max(...ys) };
  }
  return {
    minX: el.x,
    minY: el.y,
    maxX: el.x + el.width,
    maxY: el.y + el.height
  };
}

export function getElementsBounds(elements: DesignElement[]): Bounds | null {
  if (elements.length === 0) return null;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const el of elements) {
    const b = getElementBounds(el);
    minX = Math.min(minX, b.minX);
    minY = Math.min(minY, b.minY);
    maxX = Math.max(maxX, b.maxX);
    maxY = Math.max(maxY, b.maxY);
  }
  return { minX, minY, maxX, maxY };
}

export function zoomToBounds(
  bounds: Bounds,
  canvasWidth: number,
  canvasHeight: number,
  padding = 64
): ViewState {
  const width = Math.max(bounds.maxX - bounds.minX, 80);
  const height = Math.max(bounds.maxY - bounds.minY, 80);
  const zoom = clampZoom(
    Math.min((canvasWidth - padding * 2) / width, (canvasHeight - padding * 2) / height)
  );
  const centerX = (bounds.minX + bounds.maxX) / 2;
  const centerY = (bounds.minY + bounds.maxY) / 2;
  return {
    zoom,
    panX: canvasWidth / 2 - centerX * zoom,
    panY: canvasHeight / 2 - centerY * zoom
  };
}

export function zoomToFit(
  elements: DesignElement[],
  canvasWidth: number,
  canvasHeight: number
): ViewState {
  const bounds = getElementsBounds(elements);
  if (!bounds) {
    return { zoom: 1, panX: canvasWidth / 2, panY: canvasHeight / 2 };
  }
  return zoomToBounds(bounds, canvasWidth, canvasHeight);
}

export function formatZoomPercent(zoom: number): string {
  const snapped = snapZoomToLadder(zoom);
  const pct = Math.round(snapped * 100);
  return Math.abs(snapped - zoom) < 0.02 ? `${pct}%` : `${Math.round(zoom * 100)}%`;
}
