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
  const displayUnit = element.properties.displayUnit;

  if (!dimensions) {
    return null;
  }

  const len = (px: number) => formatDimension(px, scale, displayUnit);
  const area = (px2: number) => formatArea(px2, scale, displayUnit);

  const renderDimension = () => {
    switch (element.type) {
      case 'line':
        if (dimensions.length) {
          return (
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Lengte:</span>
                <span className="text-neon-green font-medium">{len(dimensions.length)}</span>
              </div>
            </div>
          );
        }
        break;

      case 'circle':
        if (dimensions.diameter) {
          return (
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Diameter:</span>
                <span className="text-neon-green font-medium">{len(dimensions.diameter)}</span>
              </div>
              {dimensions.area != null && (
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Oppervlakte:</span>
                  <span className="text-neon-green font-medium">{area(dimensions.area)}</span>
                </div>
              )}
              {dimensions.perimeter != null && (
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Omtrek:</span>
                  <span className="text-neon-green font-medium">{len(dimensions.perimeter)}</span>
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
            {dimensions.width != null && (
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Breedte:</span>
                <span className="text-neon-green font-medium">{len(dimensions.width)}</span>
              </div>
            )}
            {dimensions.height != null && (
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Diepte:</span>
                <span className="text-neon-green font-medium">{len(dimensions.height)}</span>
              </div>
            )}
            {dimensions.area != null && (
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Oppervlakte:</span>
                <span className="text-neon-green font-medium">{area(dimensions.area)}</span>
              </div>
            )}
            {dimensions.perimeter != null && (
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Omtrek:</span>
                <span className="text-neon-green font-medium">{len(dimensions.perimeter)}</span>
              </div>
            )}
          </div>
        );

      case 'polygon':
        return (
          <div className="space-y-1">
            {dimensions.area != null && (
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Oppervlakte:</span>
                <span className="text-neon-green font-medium">{area(dimensions.area)}</span>
              </div>
            )}
            {dimensions.perimeter != null && (
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Omtrek:</span>
                <span className="text-neon-green font-medium">{len(dimensions.perimeter)}</span>
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
