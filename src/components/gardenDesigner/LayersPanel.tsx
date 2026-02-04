import React from 'react';
import type { LayerType } from '../../types/gardenDesigner';
import { Eye, EyeOff, Layers } from 'lucide-react';

interface LayersPanelProps {
  activeLayer: LayerType;
  layerVisibility: Record<string, boolean>;
  onLayerSelect: (layer: LayerType) => void;
  onLayerVisibilityToggle: (layer: LayerType) => void;
}

const layers: Array<{ type: LayerType; label: string; color: string }> = [
  { type: 'ground', label: 'Platte Grond', color: 'from-amber-600 to-orange-600' },
  { type: 'building', label: 'Bouw', color: 'from-gray-600 to-gray-800' },
  { type: 'plants', label: 'Planten', color: 'from-green-600 to-emerald-600' },
  { type: 'water', label: 'Water', color: 'from-blue-600 to-cyan-600' }
];

export const LayersPanel: React.FC<LayersPanelProps> = ({
  activeLayer,
  layerVisibility,
  onLayerSelect,
  onLayerVisibilityToggle
}) => {
  return (
    <div className="bg-dark-secondary/50 backdrop-blur-sm border border-white/10 rounded-xl p-4">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <Layers className="w-5 h-5 text-neon-green" />
        Werklagen
      </h3>
      <div className="space-y-2">
        {layers.map((layer) => {
          const isVisible = layerVisibility[layer.type] ?? true;
          const isActive = activeLayer === layer.type;
          
          return (
            <div
              key={layer.type}
              className={`p-3 rounded-lg border transition-all duration-300 ${
                isActive
                  ? `bg-gradient-to-r ${layer.color} border-neon-green`
                  : 'bg-dark-bg/50 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <button
                  onClick={() => onLayerSelect(layer.type)}
                  className="flex-1 text-left"
                >
                  <span className={`font-medium text-sm ${isActive ? 'text-white' : 'text-white/70'}`}>
                    {layer.label}
                  </span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onLayerVisibilityToggle(layer.type);
                  }}
                  className="ml-2 p-1 hover:bg-white/10 rounded transition-colors"
                  title={isVisible ? 'Verberg laag' : 'Toon laag'}
                >
                  {isVisible ? (
                    <Eye className={`w-4 h-4 ${isActive ? 'text-white' : 'text-white/60'}`} />
                  ) : (
                    <EyeOff className={`w-4 h-4 ${isActive ? 'text-white/50' : 'text-white/30'}`} />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
