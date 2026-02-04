import React from 'react';
import type { DesignElement, ScaleConfig } from '../../types/gardenDesigner';
import { formatDimension, formatArea } from '../../utils/unitUtils';

interface DimensionDisplayProps {
  element: DesignElement;
  scale: ScaleConfig;
}

export const DimensionDisplay: React.FC<DimensionDisplayProps> = ({
  element,
  scale
}) => {
  const dimensions = element.properties.dimensions;
  const displayUnit = element.properties.displayUnit || scale.unit;

  if (!dimensions) {
    return null;
  }

  const renderDimension = () => {
    switch (element.type) {
      case 'line':
        if (dimensions.length) {
          return (
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Lengte:</span>
                <span className="text-neon-green font-medium">
                  {formatDimension(dimensions.length, { ...scale, unit: displayUnit }, displayUnit)}
                </span>
              </div>
            </div>
          );
        }
        break;

      case 'circle':
        if (dimensions.diameter) {
          // const radius = dimensions.diameter / 2;
          return (
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Diameter:</span>
                <span className="text-neon-green font-medium">
                  {formatDimension(dimensions.diameter, { ...scale, unit: displayUnit }, displayUnit)}
                </span>
              </div>
              {dimensions.area && (
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Oppervlakte:</span>
                  <span className="text-neon-green font-medium">
                    {formatArea(dimensions.area, { ...scale, unit: displayUnit }, displayUnit)}
                  </span>
                </div>
              )}
              {dimensions.perimeter && (
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Omtrek:</span>
                  <span className="text-neon-green font-medium">
                    {formatDimension(dimensions.perimeter, { ...scale, unit: displayUnit }, displayUnit)}
                  </span>
                </div>
              )}
            </div>
          );
        }
        break;

      case 'rectangle':
      case 'library-item':
        return (
          <div className="space-y-1">
            {dimensions.width && (
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Breedte:</span>
                <span className="text-neon-green font-medium">
                  {formatDimension(dimensions.width, { ...scale, unit: displayUnit }, displayUnit)}
                </span>
              </div>
            )}
            {dimensions.height && (
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Hoogte:</span>
                <span className="text-neon-green font-medium">
                  {formatDimension(dimensions.height, { ...scale, unit: displayUnit }, displayUnit)}
                </span>
              </div>
            )}
            {dimensions.area && (
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Oppervlakte:</span>
                <span className="text-neon-green font-medium">
                  {formatArea(dimensions.area, { ...scale, unit: displayUnit }, displayUnit)}
                </span>
              </div>
            )}
            {dimensions.perimeter && (
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Omtrek:</span>
                <span className="text-neon-green font-medium">
                  {formatDimension(dimensions.perimeter, { ...scale, unit: displayUnit }, displayUnit)}
                </span>
              </div>
            )}
          </div>
        );

      case 'polygon':
        return (
          <div className="space-y-1">
            {dimensions.area && (
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Oppervlakte:</span>
                <span className="text-neon-green font-medium">
                  {formatArea(dimensions.area, { ...scale, unit: displayUnit }, displayUnit)}
                </span>
              </div>
            )}
            {dimensions.perimeter && (
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Omtrek:</span>
                <span className="text-neon-green font-medium">
                  {formatDimension(dimensions.perimeter, { ...scale, unit: displayUnit }, displayUnit)}
                </span>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const content = renderDimension();
  if (!content) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-white/80 uppercase tracking-wide">
        Afmetingen
      </h4>
      {content}
    </div>
  );
};
