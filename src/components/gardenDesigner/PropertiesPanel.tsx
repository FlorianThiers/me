import React from 'react';
import type { DesignElement, ScaleConfig } from '../../types/gardenDesigner';
import { Lock, Unlock } from 'lucide-react';
import { DimensionDisplay } from './DimensionDisplay';

interface PropertiesPanelProps {
  selectedElements: DesignElement[];
  scale: ScaleConfig;
  onElementUpdate: (elementId: string, updates: Partial<DesignElement>) => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedElements,
  scale,
  onElementUpdate
}) => {
  if (selectedElements.length === 0) {
    return (
      <div className="bg-dark-secondary/50 backdrop-blur-sm border border-white/10 rounded-xl p-4">
        <h3 className="text-lg font-bold text-white mb-4">Eigenschappen</h3>
        <p className="text-white/40 text-sm text-center py-8">
          Selecteer een object om eigenschappen te bewerken
        </p>
      </div>
    );
  }

  const element = selectedElements[0]; // For now, only edit first selected element
  const isMultiple = selectedElements.length > 1;

  const handleUpdate = (updates: Partial<DesignElement>) => {
    selectedElements.forEach(el => {
      onElementUpdate(el.id, updates);
    });
  };

  const handlePropertyUpdate = (property: string, value: any) => {
    handleUpdate({
      properties: {
        ...element.properties,
        [property]: value
      }
    });
  };

  return (
    <div className="bg-dark-secondary/50 backdrop-blur-sm border border-white/10 rounded-xl p-4 space-y-4">
      <h3 className="text-lg font-bold text-white mb-4">
        Eigenschappen {isMultiple && `(${selectedElements.length})`}
      </h3>

      {/* Name */}
      <div>
        <label className="block text-white/80 text-sm font-medium mb-2">Naam</label>
        <input
          type="text"
          value={element.name}
          onChange={(e) => handleUpdate({ name: e.target.value })}
          className="w-full px-3 py-2 bg-dark-bg border border-white/20 rounded-lg text-white text-sm focus:border-neon-green focus:outline-none focus:ring-2 focus:ring-neon-green/20 transition-all"
          disabled={isMultiple}
        />
      </div>

      {/* Position */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">X</label>
          <input
            type="number"
            value={Math.round(element.x)}
            onChange={(e) => handleUpdate({ x: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 bg-dark-bg border border-white/20 rounded-lg text-white text-sm focus:border-neon-green focus:outline-none focus:ring-2 focus:ring-neon-green/20 transition-all"
          />
        </div>
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">Y</label>
          <input
            type="number"
            value={Math.round(element.y)}
            onChange={(e) => handleUpdate({ y: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 bg-dark-bg border border-white/20 rounded-lg text-white text-sm focus:border-neon-green focus:outline-none focus:ring-2 focus:ring-neon-green/20 transition-all"
          />
        </div>
      </div>

      {/* Size */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">Breedte</label>
          <input
            type="number"
            value={Math.round(element.width)}
            onChange={(e) => handleUpdate({ width: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 bg-dark-bg border border-white/20 rounded-lg text-white text-sm focus:border-neon-green focus:outline-none focus:ring-2 focus:ring-neon-green/20 transition-all"
            min="1"
          />
        </div>
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">Hoogte</label>
          <input
            type="number"
            value={Math.round(element.height)}
            onChange={(e) => handleUpdate({ height: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 bg-dark-bg border border-white/20 rounded-lg text-white text-sm focus:border-neon-green focus:outline-none focus:ring-2 focus:ring-neon-green/20 transition-all"
            min="1"
          />
        </div>
      </div>

      {/* Dimensions Display */}
      {!isMultiple && <DimensionDisplay element={element} scale={scale} />}

      {/* Rotation */}
      <div>
        <label className="block text-white/80 text-sm font-medium mb-2">
          Rotatie: {element.rotation || 0}°
        </label>
        <input
          type="range"
          min="0"
          max="360"
          value={element.rotation || 0}
          onChange={(e) => handleUpdate({ rotation: parseFloat(e.target.value) })}
          className="w-full"
        />
      </div>

      {/* Colors */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">Vulkleur</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={element.properties.fillColor || '#00ff88'}
              onChange={(e) => handlePropertyUpdate('fillColor', e.target.value)}
              className="w-12 h-10 rounded border border-white/20 cursor-pointer"
            />
            <input
              type="text"
              value={element.properties.fillColor || '#00ff88'}
              onChange={(e) => handlePropertyUpdate('fillColor', e.target.value)}
              className="flex-1 px-3 py-2 bg-dark-bg border border-white/20 rounded-lg text-white text-sm focus:border-neon-green focus:outline-none focus:ring-2 focus:ring-neon-green/20 transition-all"
            />
          </div>
        </div>
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">Lijnkleur</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={element.properties.strokeColor || '#00ff88'}
              onChange={(e) => handlePropertyUpdate('strokeColor', e.target.value)}
              className="w-12 h-10 rounded border border-white/20 cursor-pointer"
            />
            <input
              type="text"
              value={element.properties.strokeColor || '#00ff88'}
              onChange={(e) => handlePropertyUpdate('strokeColor', e.target.value)}
              className="flex-1 px-3 py-2 bg-dark-bg border border-white/20 rounded-lg text-white text-sm focus:border-neon-green focus:outline-none focus:ring-2 focus:ring-neon-green/20 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Stroke Width */}
      <div>
        <label className="block text-white/80 text-sm font-medium mb-2">
          Lijndikte: {element.properties.strokeWidth || 2}px
        </label>
        <input
          type="range"
          min="1"
          max="20"
          value={element.properties.strokeWidth || 2}
          onChange={(e) => handlePropertyUpdate('strokeWidth', parseFloat(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Type-specific properties */}
      {element.properties.plantType && (
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">Plant Type</label>
          <select
            value={element.properties.plantType}
            onChange={(e) => handlePropertyUpdate('plantType', e.target.value)}
            className="w-full px-3 py-2 bg-dark-bg border border-white/20 rounded-lg text-white text-sm focus:border-neon-green focus:outline-none focus:ring-2 focus:ring-neon-green/20 transition-all"
          >
            <option value="houseplant">Huisplant</option>
            <option value="vegetable">Groente</option>
            <option value="perennial">Vaste Plant</option>
            <option value="climber">Klimmer</option>
            <option value="grass">Gras</option>
            <option value="mulch">Mulch</option>
          </select>
        </div>
      )}

      {element.properties.waterType && (
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">Water Type</label>
          <select
            value={element.properties.waterType}
            onChange={(e) => handlePropertyUpdate('waterType', e.target.value)}
            className="w-full px-3 py-2 bg-dark-bg border border-white/20 rounded-lg text-white text-sm focus:border-neon-green focus:outline-none focus:ring-2 focus:ring-neon-green/20 transition-all"
          >
            <option value="pipe">Leiding</option>
            <option value="channel">Kanaal</option>
            <option value="pond">Vijver</option>
          </select>
        </div>
      )}

      {/* Lock/Unlock */}
      <div>
        <button
          onClick={() => handleUpdate({ locked: !element.locked })}
          className={`w-full px-4 py-2 rounded-lg border transition-all duration-300 flex items-center justify-center gap-2 ${
            element.locked
              ? 'bg-red-500/20 border-red-500/50 text-red-400'
              : 'bg-neon-green/20 border-neon-green/50 text-neon-green'
          }`}
        >
          {element.locked ? (
            <>
              <Lock className="w-4 h-4" />
              Vergrendeld
            </>
          ) : (
            <>
              <Unlock className="w-4 h-4" />
              Ontgrendeld
            </>
          )}
        </button>
      </div>
    </div>
  );
};
