import type { DesignElement, ScaleConfig } from '../types/gardenDesigner';
import {
  getElevationValues,
  elevationToPlanOffset,
  applyElevationTint,
  formatElevationLabel,
  hasElevationVisual
} from './elevationUtils';
import { formatArea } from './unitUtils';
import { unitToPixels } from './unitUtils';

export const GRID_SIZE = 20;

/** Pick world-space grid step so lines sit ~40–80 screen px apart at current zoom */
export function getAdaptiveGridStep(zoom: number, baseStep = GRID_SIZE): number {
  const minScreenPx = 32;
  const steps = [
    baseStep,
    baseStep * 2.5,
    baseStep * 5,
    baseStep * 10,
    baseStep * 25,
    baseStep * 50,
    baseStep * 100,
    baseStep * 250,
    baseStep * 500
  ];
  for (const step of steps) {
    if (step * zoom >= minScreenPx) return step;
  }
  return steps[steps.length - 1];
}

export function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  gridSize: number = GRID_SIZE
) {
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 1;
  
  for (let x = 0; x <= width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  
  for (let y = 0; y <= height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

export function snapToGrid(value: number, gridSize: number = GRID_SIZE): number {
  return Math.round(value / gridSize) * gridSize;
}

export function getCanvasCoordinates(
  e: React.MouseEvent<HTMLCanvasElement>,
  canvas: HTMLCanvasElement
): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY
  };
}

export function isPointInElement(
  x: number,
  y: number,
  element: DesignElement
): boolean {
  if (element.type === 'freehand' && element.properties.path) {
    // Check if point is near any segment of the path
    const path = element.properties.path;
    for (let i = 0; i < path.length - 1; i++) {
      const dist = distanceToLineSegment(
        x, y,
        path[i].x, path[i].y,
        path[i + 1].x, path[i + 1].y
      );
      if (dist < 5) return true;
    }
    return false;
  }
  
  if (element.type === 'line') {
    const dist = distanceToLineSegment(
      x, y,
      element.x, element.y,
      element.x + element.width,
      element.y + element.height
    );
    return dist < 5;
  }
  
  if (element.type === 'circle') {
    const centerX = element.x + element.width / 2;
    const centerY = element.y + element.height / 2;
    const radius = Math.max(element.width, element.height) / 2;
    const dist = Math.sqrt(
      Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
    );
    return dist <= radius;
  }

  const polyPoints = element.properties.points;
  if (element.type === 'polygon' && polyPoints && polyPoints.length >= 3) {
    return pointInPolygon(x, y, polyPoints);
  }
  
  // Rectangle, library-item
  return (
    x >= element.x &&
    x <= element.x + element.width &&
    y >= element.y &&
    y <= element.y + element.height
  );
}

function pointInPolygon(x: number, y: number, points: Array<{ x: number; y: number }>): boolean {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const xi = points[i].x;
    const yi = points[i].y;
    const xj = points[j].x;
    const yj = points[j].y;
    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi + 1e-12) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function distanceToLineSegment(
  px: number, py: number,
  x1: number, y1: number,
  x2: number, y2: number
): number {
  const A = px - x1;
  const B = py - y1;
  const C = x2 - x1;
  const D = y2 - y1;
  
  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;
  
  if (lenSq !== 0) param = dot / lenSq;
  
  let xx: number, yy: number;
  
  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }
  
  const dx = px - xx;
  const dy = py - yy;
  return Math.sqrt(dx * dx + dy * dy);
}

export function drawElement(
  ctx: CanvasRenderingContext2D,
  element: DesignElement,
  isSelected: boolean = false,
  layerVisible: boolean = true,
  scale?: ScaleConfig
) {
  if (!element.visible || !layerVisible) return;

  const { baseZ, extrusionHeight, topZ } = getElevationValues(element);
  const showElevation = scale && hasElevationVisual(element);

  ctx.save();

  if (showElevation) {
    drawElevationShadow(ctx, element, topZ, scale!);
  }

  // Apply rotation if needed
  if (element.rotation) {
    const centerX = element.x + element.width / 2;
    const centerY = element.y + element.height / 2;
    ctx.translate(centerX, centerY);
    ctx.rotate((element.rotation * Math.PI) / 180);
    ctx.translate(-centerX, -centerY);
  }

  let fillColor = element.properties.fillColor || '#00ff88';
  if (showElevation) {
    fillColor = applyElevationTint(fillColor, baseZ, extrusionHeight);
  }
  const strokeColor = element.properties.strokeColor || '#00ff88';
  const strokeWidth = element.properties.strokeWidth || 2;

  ctx.fillStyle = fillColor;
  ctx.strokeStyle = isSelected ? '#00ff88' : strokeColor;
  ctx.lineWidth = isSelected ? 3 : strokeWidth;

  if (element.type === 'freehand' && element.properties.path) {
    drawFreehandPath(ctx, element.properties.path, fillColor, strokeColor, strokeWidth);
  } else if (element.type === 'line') {
    drawLine(ctx, element);
  } else if (element.type === 'circle') {
    drawCircle(ctx, element);
  } else if (element.type === 'polygon' && element.properties.points) {
    drawPolygon(ctx, element.properties.points, fillColor, strokeColor, strokeWidth);
    if (element.properties.isOpening && element.properties.openingSwing && element.properties.openingCenter) {
      drawDoorSwing(ctx, element, scale);
    }
  } else {
    drawRectangle(ctx, element);
  }

  ctx.restore();

  drawElementLabel(ctx, element, scale, isSelected);

  if (isSelected) {
    drawSelectionHandles(ctx, element);
    if (showElevation) {
      drawElevationBadge(ctx, element, baseZ);
    }
  }
}

function drawElevationShadow(
  ctx: CanvasRenderingContext2D,
  element: DesignElement,
  topZ: number,
  scale: ScaleConfig
) {
  const offset = elevationToPlanOffset(topZ, scale);
  if (offset < 1) return;

  const dx = offset;
  const dy = offset;

  ctx.save();
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = '#000000';
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.lineWidth = 1;

  if (element.rotation) {
    const centerX = element.x + element.width / 2;
    const centerY = element.y + element.height / 2;
    ctx.translate(centerX, centerY);
    ctx.rotate((element.rotation * Math.PI) / 180);
    ctx.translate(-centerX, -centerY);
  }

  ctx.translate(dx, dy);

  if (element.type === 'circle') {
    const centerX = element.x + element.width / 2;
    const centerY = element.y + element.height / 2;
    const radius = Math.max(element.width, element.height) / 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (element.type === 'polygon' && element.properties.points) {
    const pts = element.properties.points;
    if (pts.length >= 3) {
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  } else if (element.type !== 'line' && element.type !== 'freehand') {
    ctx.fillRect(element.x, element.y, element.width, element.height);
    ctx.strokeRect(element.x, element.y, element.width, element.height);
  }

  ctx.restore();
}

function drawElevationBadge(
  ctx: CanvasRenderingContext2D,
  element: DesignElement,
  baseZ: number
) {
  const label = formatElevationLabel(element);
  if (!label) return;

  const bx = element.x + element.width + 6;
  const by = element.y - 8;

  ctx.save();
  ctx.font = '10px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'bottom';
  const metrics = ctx.measureText(label);
  const pad = 4;
  ctx.fillStyle = baseZ < 0 ? 'rgba(30,64,175,0.85)' : 'rgba(10,10,10,0.85)';
  ctx.fillRect(bx - pad, by - 12 - pad, metrics.width + pad * 2, 14 + pad);
  ctx.fillStyle = baseZ < 0 ? '#93c5fd' : '#00ff88';
  ctx.fillText(label, bx, by);
  ctx.restore();
}

function drawFreehandPath(
  ctx: CanvasRenderingContext2D,
  path: Array<{x: number, y: number}>,
  _fillColor: string,
  strokeColor: string,
  strokeWidth: number
) {
  if (path.length < 2) return;
  
  ctx.beginPath();
  ctx.moveTo(path[0].x, path[0].y);
  
  for (let i = 1; i < path.length; i++) {
    ctx.lineTo(path[i].x, path[i].y);
  }
  
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = strokeWidth;
  ctx.stroke();
}

function drawLine(
  ctx: CanvasRenderingContext2D,
  element: DesignElement
) {
  const isContour = element.properties.isContour;
  if (isContour) {
    ctx.setLineDash([8, 6]);
    ctx.strokeStyle = element.properties.strokeColor || '#f59e0b';
    ctx.lineWidth = (element.properties.strokeWidth || 3);
  }
  ctx.beginPath();
  ctx.moveTo(element.x, element.y);
  ctx.lineTo(element.x + element.width, element.y + element.height);
  ctx.stroke();
  if (isContour) {
    ctx.setLineDash([]);
    const elev = element.properties.contourElevation ?? 0;
    const label = `${elev >= 0 ? '+' : ''}${elev.toFixed(2)} m`;
    const mx = element.x + element.width / 2;
    const my = element.y + element.height / 2;
    ctx.save();
    ctx.font = '10px system-ui, sans-serif';
    ctx.fillStyle = '#fbbf24';
    ctx.strokeStyle = 'rgba(0,0,0,0.7)';
    ctx.lineWidth = 3;
    ctx.strokeText(label, mx + 6, my - 6);
    ctx.fillText(label, mx + 6, my - 6);
    ctx.restore();
  }
}

function drawCircle(
  ctx: CanvasRenderingContext2D,
  element: DesignElement
) {
  const centerX = element.x + element.width / 2;
  const centerY = element.y + element.height / 2;
  const radius = Math.max(element.width, element.height) / 2;
  
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

function drawPolygon(
  ctx: CanvasRenderingContext2D,
  points: Array<{x: number, y: number}>,
  fillColor: string,
  strokeColor: string,
  strokeWidth: number
) {
  if (points.length < 3) return;
  
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  
  ctx.closePath();
  ctx.fillStyle = fillColor;
  ctx.fill();
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = strokeWidth;
  ctx.stroke();
}

function drawRectangle(
  ctx: CanvasRenderingContext2D,
  element: DesignElement
) {
  ctx.fillRect(element.x, element.y, element.width, element.height);
  ctx.strokeRect(element.x, element.y, element.width, element.height);
}

function drawDoorSwing(
  ctx: CanvasRenderingContext2D,
  element: DesignElement,
  scale?: ScaleConfig
) {
  const center = element.properties.openingCenter;
  const angle = element.properties.openingAngle ?? 0;
  const widthCm = element.properties.openingWidthCm ?? 90;
  if (!center) return;
  const radius = scale ? unitToPixels(widthCm, 'cm', scale) : element.width;

  ctx.save();
  ctx.strokeStyle = 'rgba(146, 64, 14, 0.7)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.arc(center.x, center.y, radius, angle - Math.PI / 2, angle, false);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(center.x, center.y);
  ctx.lineTo(
    center.x + Math.cos(angle - Math.PI / 2) * radius,
    center.y + Math.sin(angle - Math.PI / 2) * radius
  );
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

function drawElementLabel(
  ctx: CanvasRenderingContext2D,
  element: DesignElement,
  scale?: ScaleConfig,
  isSelected = false
) {
  const isZone = element.layer === 'ground' && element.properties.zoneName;
  const isPlant = element.properties.catalogSlug || element.properties.plantType;
  const isRoom = !!element.properties.isRoom;
  const isOpening = !!element.properties.isOpening;
  const elevLabel = scale ? formatElevationLabel(element) : null;
  if (!isZone && !isPlant && !elevLabel && !isRoom && !isOpening) return;

  const cx = element.x + element.width / 2;
  const cy = element.y + element.height / 2;

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (isRoom && scale) {
    const areaPx = element.properties.dimensions?.area;
    const areaLabel = areaPx != null ? formatArea(areaPx, scale) : '';
    ctx.font = 'bold 12px system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.strokeStyle = 'rgba(0,0,0,0.55)';
    ctx.lineWidth = 3;
    ctx.strokeText(element.name, cx, cy - (areaLabel ? 8 : 0));
    ctx.fillText(element.name, cx, cy - (areaLabel ? 8 : 0));
    if (areaLabel) {
      ctx.font = '11px system-ui, sans-serif';
      ctx.fillStyle = 'rgba(165, 180, 252, 0.95)';
      ctx.strokeText(areaLabel, cx, cy + 10);
      ctx.fillText(areaLabel, cx, cy + 10);
    }
    ctx.restore();
    return;
  }

  if (isOpening) {
    const kind = element.properties.openingKind === 'window' ? 'Raam' : 'Deur';
    const w = element.properties.openingWidthCm;
    const text = w ? `${kind} ${w}cm`: kind;
    ctx.font = '10px system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.strokeStyle = 'rgba(0,0,0,0.55)';
    ctx.lineWidth = 3;
    ctx.strokeText(text, cx, cy);
    ctx.fillText(text, cx, cy);
    ctx.restore();
    return;
  }

  const label = isZone ? element.properties.zoneName! : element.name;
  const sub =
    isZone && element.properties.sunExposure
      ? element.properties.sunExposure === 'full'
        ? 'sun'
        : element.properties.sunExposure === 'shade'
          ? 'shd'
          : '◐'
      : null;

  ctx.font = '11px system-ui, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.strokeStyle = 'rgba(0,0,0,0.6)';
  ctx.lineWidth = 3;
  const text = sub ? `${label} ${sub}`: label;
  ctx.strokeText(text, cx, cy);
  ctx.fillText(text, cx, cy);

  if (elevLabel && !isSelected) {
    ctx.font = '9px system-ui, sans-serif';
    ctx.fillStyle = 'rgba(0,255,136,0.9)';
    ctx.strokeText(elevLabel, cx, cy + 14);
    ctx.fillText(elevLabel, cx, cy + 14);
  }
  ctx.restore();
}

function drawSelectionHandles(
  ctx: CanvasRenderingContext2D,
  element: DesignElement
) {
  const handleSize = 8;
  const handles = [
    { x: element.x, y: element.y }, // top-left
    { x: element.x + element.width, y: element.y }, // top-right
    { x: element.x + element.width, y: element.y + element.height }, // bottom-right
    { x: element.x, y: element.y + element.height }, // bottom-left
  ];
  
  ctx.fillStyle = '#00ff88';
  ctx.strokeStyle = '#0a0a0a';
  ctx.lineWidth = 2;
  
  handles.forEach(handle =>{
    ctx.fillRect(
      handle.x - handleSize / 2,
      handle.y - handleSize / 2,
      handleSize,
      handleSize
    );
    ctx.strokeRect(
      handle.x - handleSize / 2,
      handle.y - handleSize / 2,
      handleSize,
      handleSize
    );
  });
}
