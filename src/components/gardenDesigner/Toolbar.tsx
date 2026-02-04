import React from 'react';
import type { ToolType, LayerType } from '../../types/gardenDesigner';
import { Move, Square, Circle, Minus, Hexagon, PenTool, Layers } from 'lucide-react';

interface ToolbarProps {
  activeTool: ToolType;
  activeLayer: LayerType;
  onToolChange: (tool: ToolType) => void;
  onLayerChange: (layer: LayerType) => void;
}

const tools: Array<{ type: ToolType; icon: React.ReactNode; label: string }> = [
  { type: 'select', icon: <Move className="w-5 h-5" />, label: 'Selecteren' },
  { type: 'rectangle', icon: <Square className="w-5 h-5" />, label: 'Rechthoek' },
  { type: 'circle', icon: <Circle className="w-5 h-5" />, label: 'Cirkel' },
  { type: 'line', icon: <Minus className="w-5 h-5" />, label: 'Lijn' },
  { type: 'polygon', icon: <Hexagon className="w-5 h-5" />, label: 'Polygoon' },
  { type: 'freehand', icon: <PenTool className="w-5 h-5" />, label: 'Vrijhand' }
];

const layers: Array<{ type: LayerType; label: string; color: string }> = [
  { type: 'ground', label: 'Platte Grond', color: 'from-amber-600 to-orange-600' },
  { type: 'building', label: 'Bouw', color: 'from-gray-600 to-gray-800' },
  { type: 'plants', label: 'Planten', color: 'from-green-600 to-emerald-600' },
  { type: 'water', label: 'Water', color: 'from-blue-600 to-cyan-600' }
];

export const Toolbar: React.FC<ToolbarProps> = ({
  activeTool,
  activeLayer,
  onToolChange,
  onLayerChange
}) => {
  return (
    <div className="bg-dark-secondary/50 backdrop-blur-sm border border-white/10 rounded-xl p-4 space-y-6">
      {/* Tools */}
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
              title={tool.label}
            >
              {tool.icon}
              <span className="text-xs">{tool.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Layers */}
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
