import type { DesignElement } from '../types/gardenDesigner';

export const GRID_SIZE = 20;

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
  
  // Rectangle, polygon, library-item
  return (
    x >= element.x &&
    x <= element.x + element.width &&
    y >= element.y &&
    y <= element.y + element.height
  );
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
  layerVisible: boolean = true
) {
  if (!element.visible || !layerVisible) return;
  
  ctx.save();
  
  // Apply rotation if needed
  if (element.rotation) {
    const centerX = element.x + element.width / 2;
    const centerY = element.y + element.height / 2;
    ctx.translate(centerX, centerY);
    ctx.rotate((element.rotation * Math.PI) / 180);
    ctx.translate(-centerX, -centerY);
  }
  
  // Set colors
  const fillColor = element.properties.fillColor || '#00ff88';
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
  } else {
    // Rectangle or library-item
    drawRectangle(ctx, element);
  }
  
  ctx.restore();
  
  // Draw selection handles
  if (isSelected) {
    drawSelectionHandles(ctx, element);
  }
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
  ctx.beginPath();
  ctx.moveTo(element.x, element.y);
  ctx.lineTo(element.x + element.width, element.y + element.height);
  ctx.stroke();
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
  
  handles.forEach(handle => {
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
