import React from 'react';
import type { LayerType, ToolType, ScaleConfig } from '../../types/gardenDesigner';
import { formatZoomPercent } from '../../utils/viewUtils';
import { formatPlanPosition } from '../../utils/planCoordinateUtils';

interface CanvasStatusBarProps {
  activeLayer: LayerType;
  activeTool: ToolType;
  objectCount: number;
  zoom: number;
  cursorWorld?: { x: number; y: number } | null;
  scale: ScaleConfig;
  isSpacePan: boolean;
}

const layerLabels: Record<LayerType, string> = {
  ground: 'Platte Grond',
  building: 'Bouw',
  plants: 'Planten',
  water: 'Water'
};

const toolLabels: Record<ToolType, string> = {
  select: 'Selecteren',
  hand: 'Hand',
  rectangle: 'Rechthoek',
  circle: 'Cirkel',
  line: 'Lijn',
  contour: 'Hoogtelijn',
  polygon: 'Polygoon',
  freehand: 'Vrijhand',
  wall: 'Muur',
  room: 'Kamer',
  door: 'Deur',
  window: 'Raam'
};

export const CanvasStatusBar: React.FC<CanvasStatusBarProps> = ({
  activeLayer,
  activeTool,
  objectCount,
  zoom,
  cursorWorld,
  scale,
  isSpacePan
}) => {
  const cursorLabel =
    cursorWorld != null
      ? formatPlanPosition(cursorWorld.x, cursorWorld.y, scale)
      : null;

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-dark-secondary/80 backdrop-blur-sm border-t border-white/10 px-4 py-2 z-20">
      <div className="flex items-center justify-between text-sm text-white/60 gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <span className="text-neon-green">Laag:</span> {layerLabels[activeLayer]}
          </div>
          <div>
            <span className="text-neon-green">Tool:</span> {toolLabels[activeTool]}
            {isSpacePan && <span className="text-white/40 ml-1">(pan)</span>}
          </div>
          {cursorLabel && (
            <div className="font-mono text-xs text-white/50">{cursorLabel}</div>
          )}
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <span className="font-mono text-xs">{formatZoomPercent(zoom)}</span>
          <span className="text-white/40">
            {objectCount} {objectCount === 1 ? 'object' : 'objecten'}
          </span>
          <span className="text-white/30 text-xs hidden sm:inline">
            Scroll=pan · Ctrl+scroll=zoom · Space+drag=pan
            {activeTool === 'wall' ? ' · Muur: 90° · Alt=vrij' : ''}
          </span>
        </div>
      </div>
    </div>
  );
};
