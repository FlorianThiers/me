/**
 * Bereken oppervlakte van een polygoon met Shoelace formula
 */
export function calculatePolygonArea(points: Array<{x: number, y: number}>): number {
  if (points.length < 3) return 0;
  
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }
  return Math.abs(area) / 2;
}

/**
 * Bereken omtrek van een polygoon
 */
export function calculatePerimeter(points: Array<{x: number, y: number}>): number {
  if (points.length < 2) return 0;
  
  let perimeter = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    const dx = points[j].x - points[i].x;
    const dy = points[j].y - points[i].y;
    perimeter += Math.sqrt(dx * dx + dy * dy);
  }
  return perimeter;
}

/**
 * Bereken lengte van een lijn
 */
export function calculateLineLength(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Bereken oppervlakte van een rechthoek
 */
export function calculateRectangleArea(width: number, height: number): number {
  return width * height;
}

/**
 * Bereken omtrek van een rechthoek
 */
export function calculateRectanglePerimeter(width: number, height: number): number {
  return 2 * (width + height);
}

/**
 * Bereken oppervlakte van een cirkel
 */
export function calculateCircleArea(radius: number): number {
  return Math.PI * radius * radius;
}

/**
 * Bereken omtrek van een cirkel
 */
export function calculateCirclePerimeter(radius: number): number {
  return 2 * Math.PI * radius;
}

/**
 * Bereken diameter van een cirkel (van width/height)
 */
export function calculateCircleDiameter(width: number, height: number): number {
  return Math.max(width, height);
}

/**
 * Check of een punt dichtbij een ander punt is (voor polygon closing)
 */
export function isPointNear(
  point1: {x: number, y: number},
  point2: {x: number, y: number},
  threshold: number = 10
): boolean {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < threshold;
}
