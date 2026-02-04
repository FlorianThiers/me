import type { DesignElement } from '../types/gardenDesigner';
import {
  calculatePolygonArea,
  calculatePerimeter,
  calculateLineLength,
  calculateRectangleArea,
  calculateRectanglePerimeter,
  calculateCircleArea,
  calculateCirclePerimeter,
  calculateCircleDiameter
} from './areaUtils';

/**
 * Bereken en update dimensions voor een element
 */
export function calculateElementDimensions(element: DesignElement): Partial<DesignElement['properties']> {
  const dimensions: DesignElement['properties']['dimensions'] = {};

  switch (element.type) {
    case 'line':
      dimensions.length = calculateLineLength(
        element.x,
        element.y,
        element.x + element.width,
        element.y + element.height
      );
      break;

    case 'rectangle':
    case 'library-item':
      dimensions.width = element.width;
      dimensions.height = element.height;
      dimensions.area = calculateRectangleArea(element.width, element.height);
      dimensions.perimeter = calculateRectanglePerimeter(element.width, element.height);
      break;

    case 'circle':
      const radius = Math.max(element.width, element.height) / 2;
      dimensions.diameter = calculateCircleDiameter(element.width, element.height);
      dimensions.area = calculateCircleArea(radius);
      dimensions.perimeter = calculateCirclePerimeter(radius);
      break;

    case 'polygon':
      if (element.properties.points && element.properties.points.length >= 3) {
        dimensions.area = calculatePolygonArea(element.properties.points);
        dimensions.perimeter = calculatePerimeter(element.properties.points);
      }
      break;

    case 'freehand':
      // Voor freehand kunnen we oppervlakte berekenen als het een gesloten pad is
      if (element.properties.path && element.properties.path.length >= 3) {
        // Check of pad gesloten is (eerste en laatste punt dichtbij)
        const first = element.properties.path[0];
        const last = element.properties.path[element.properties.path.length - 1];
        const dx = last.x - first.x;
        const dy = last.y - first.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 5) {
          // Gesloten pad - bereken oppervlakte
          dimensions.area = calculatePolygonArea(element.properties.path);
          dimensions.perimeter = calculatePerimeter(element.properties.path);
        }
      }
      break;
  }

  return {
    dimensions: Object.keys(dimensions).length > 0 ? dimensions : undefined
  };
}

/**
 * Update element met berekende dimensions
 */
export function updateElementDimensions(element: DesignElement): DesignElement {
  const calculated = calculateElementDimensions(element);
  return {
    ...element,
    properties: {
      ...element.properties,
      ...calculated
    }
  };
}
