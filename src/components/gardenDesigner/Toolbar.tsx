import React from 'react';
import type { ToolType, LayerType } from '../../types/gardenDesigner';
import {
  Move,
  Hand,
  Square,
  Circle,
  Minus,
  Hexagon,
  PenTool,
  Layers,
  Mountain,
  BrickWall,
  DoorOpen,
  AppWindow,
  LayoutTemplate
} from 'lucide-react';
import { DEFAULT_WALL_THICKNESS_CM } from '../../utils/wallUtils';
import { DEFAULT_WINDOW_WIDTH_CM } from '../../utils/openingUtils';

interface ToolbarProps {
  activeTool: ToolType;
  activeLayer: LayerType;
  wallThicknessCm: number;
  doorWidthCm: number;
  windowWidthCm: number;
  onToolChange: (tool: ToolType) => void;
  onLayerChange: (layer: LayerType) => void;
  onWallThicknessChange: (cm: number) => void;
  onDoorWidthChange: (cm: number) => void;
  onWindowWidthChange: (cm: number) => void;
}

const tools: Array<{ type: ToolType; icon: React.ReactNode; label: string; shortcut?: string }> = [
  { type: 'select', icon: <Move className="w-5 h-5" />, label: 'Selecteren', shortcut: 'V' },
  { type: 'hand', icon: <Hand className="w-5 h-5" />, label: 'Hand', shortcut: 'H' },
  { type: 'wall', icon: <BrickWall className="w-5 h-5" />, label: 'Muur', shortcut: 'W' },
  { type: 'room', icon: <LayoutTemplate className="w-5 h-5" />, label: 'Kamer', shortcut: 'M' },
  { type: 'door', icon: <DoorOpen className="w-5 h-5" />, label: 'Deur', shortcut: 'D' },
  { type: 'window', icon: <AppWindow className="w-5 h-5" />, label: 'Raam', shortcut: 'I' },
  { type: 'rectangle', icon: <Square className="w-5 h-5" />, label: 'Rechthoek', shortcut: 'R' },
  { type: 'circle', icon: <Circle className="w-5 h-5" />, label: 'Cirkel' },
  { type: 'line', icon: <Minus className="w-5 h-5" />, label: 'Lijn', shortcut: 'L' },
  { type: 'contour', icon: <Mountain className="w-5 h-5" />, label: 'Hoogtelijn', shortcut: 'C' },
  { type: 'polygon', icon: <Hexagon className="w-5 h-5" />, label: 'Polygoon' },
  { type: 'freehand', icon: <PenTool className="w-5 h-5" />, label: 'Vrijhand' }
];

const layers: Array<{ type: LayerType; label: string; color: string }> = [
  { type: 'ground', label: 'Platte Grond', color: 'from-amber-600 to-orange-600' },
  { type: 'building', label: 'Bouw', color: 'from-gray-600 to-gray-800' },
  { type: 'plants', label: 'Planten', color: 'from-green-600 to-emerald-600' },
  { type: 'water', label: 'Water', color: 'from-blue-600 to-cyan-600' }
];

const THICKNESS_PRESETS = [10, 15, 20, 30, 40];
const DOOR_PRESETS = [70, 80, 90, 100];
const WINDOW_PRESETS = [60, 90, 120, 150];

export const Toolbar: React.FC<ToolbarProps> = ({
  activeTool,
  activeLayer,
  wallThicknessCm,
  doorWidthCm,
  windowWidthCm,
  onToolChange,
  onLayerChange,
  onWallThicknessChange,
  onDoorWidthChange,
  onWindowWidthChange
}) => {
  return (
    <div className="bg-dark-secondary/50 backdrop-blur-sm border border-white/10 rounded-xl p-4 space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-white/60 mb-3 uppercase tracking-wide">
          Gereedschappen
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {tools.map((tool) => (
            <button
              key={tool.type}
              onClick={() => onToolChange(tool.type)}
              className={`p-3 rounded-lg border transition-all duration-300 flex flex-col items-center gap-2 ${
                activeTool === tool.type
                  ? 'bg-neon-green/20 border-neon-green text-neon-green'
                  : 'bg-dark-bg/50 border-white/10 text-white/70 hover:border-white/20'
              }`}
              title={`${tool.label}${tool.shortcut ? ` (${tool.shortcut})` : ''}`}
            >
              {tool.icon}
              <span className="text-xs">{tool.label}</span>
            </button>
          ))}
        </div>
      </div>

      {(activeTool === 'wall' || wallThicknessCm !== DEFAULT_WALL_THICKNESS_CM) && (
        <div>
          <h3 className="text-sm font-semibold text-white/60 mb-2 uppercase tracking-wide">
            Muurdikte
          </h3>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {THICKNESS_PRESETS.map((cm) => (
              <button
                key={cm}
                type="button"
                onClick={() => onWallThicknessChange(cm)}
                className={`px-2 py-1 rounded text-xs border ${
                  wallThicknessCm === cm
                    ? 'border-neon-green text-neon-green bg-neon-green/10'
                    : 'border-white/15 text-white/60 hover:border-white/30'
                }`}
              >
                {cm} cm
              </button>
            ))}
          </div>
          <p className="text-white/35 text-[10px]">Sleep centerline · 90° · Alt = vrij</p>
        </div>
      )}

      {activeTool === 'door' && (
        <div>
          <h3 className="text-sm font-semibold text-white/60 mb-2 uppercase tracking-wide">
            Deurbreedte
          </h3>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {DOOR_PRESETS.map((cm) => (
              <button
                key={cm}
                type="button"
                onClick={() => onDoorWidthChange(cm)}
                className={`px-2 py-1 rounded text-xs border ${
                  doorWidthCm === cm
                    ? 'border-neon-green text-neon-green bg-neon-green/10'
                    : 'border-white/15 text-white/60 hover:border-white/30'
                }`}
              >
                {cm} cm
              </button>
            ))}
          </div>
          <p className="text-white/35 text-[10px]">
            Plan: klik muur · Gevel (N/Z/W/O): Y = dorpelhoogte
          </p>
        </div>
      )}

      {activeTool === 'window' && (
        <div>
          <h3 className="text-sm font-semibold text-white/60 mb-2 uppercase tracking-wide">
            Raambreedte
          </h3>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {WINDOW_PRESETS.map((cm) => (
              <button
                key={cm}
                type="button"
                onClick={() => onWindowWidthChange(cm)}
                className={`px-2 py-1 rounded text-xs border ${
                  windowWidthCm === cm
                    ? 'border-neon-green text-neon-green bg-neon-green/10'
                    : 'border-white/15 text-white/60 hover:border-white/30'
                }`}
              >
                {cm} cm
              </button>
            ))}
          </div>
          <p className="text-white/35 text-[10px]">
            Plan: klik muur · Gevel: Y = dorpel · default {DEFAULT_WINDOW_WIDTH_CM} cm
          </p>
        </div>
      )}

      {activeTool === 'room' && (
        <p className="text-white/40 text-xs">
          Kamer: klik hoeken · dubbelklik of klik eerste punt om te sluiten · toont m²
        </p>
      )}

      <div>
        <h3 className="text-sm font-semibold text-white/60 mb-3 uppercase tracking-wide flex items-center gap-2">
          <Layers className="w-4 h-4" />
          Werklagen
        </h3>
        <div className="space-y-2">
          {layers.map((layer) => (
            <button
              key={layer.type}
              onClick={() => onLayerChange(layer.type)}
              className={`w-full p-3 rounded-lg border transition-all duration-300 text-left ${
                activeLayer === layer.type
                  ? `bg-gradient-to-r ${layer.color} border-neon-green text-white`
                  : 'bg-dark-bg/50 border-white/10 text-white/70 hover:border-white/20'
              }`}
            >
              <span className="font-medium text-sm">{layer.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
