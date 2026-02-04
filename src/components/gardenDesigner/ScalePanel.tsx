import React from 'react';
import type { ScaleConfig, Unit, DisplayFormat } from '../../types/gardenDesigner';
import { Ruler } from 'lucide-react';
import { formatDimension } from '../../utils/unitUtils';

interface ScalePanelProps {
  scale: ScaleConfig;
  onScaleChange: (scale: ScaleConfig) => void;
}

export const ScalePanel: React.FC<ScalePanelProps> = ({
  scale,
  onScaleChange
}) => {
  const handlePixelsPerUnitChange = (value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      onScaleChange({
        ...scale,
        pixelsPerUnit: numValue
      });
    }
  };

  const handleUnitChange = (unit: Unit) => {
    onScaleChange({
      ...scale,
      unit
    });
  };

  const handleDisplayFormatChange = (format: DisplayFormat) => {
    onScaleChange({
      ...scale,
      displayFormat: format
    });
  };

  // Preview: 100 pixels = X units
  const previewPixels = 100;
  // const previewValue = pixelsToUnit(previewPixels, scale);
  const previewFormatted = formatDimension(previewPixels, scale);

  return (
    <div className="bg-dark-secondary/50 backdrop-blur-sm border border-white/10 rounded-xl p-4">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <Ruler className="w-5 h-5 text-neon-green" />
        Schaal
      </h3>

      <div className="space-y-4">
        {/* Pixels per Unit */}
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">
            1 pixel =
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={scale.pixelsPerUnit}
              onChange={(e) => handlePixelsPerUnitChange(e.target.value)}
              min="0.1"
              step="0.1"
              className="flex-1 px-3 py-2 bg-dark-bg border border-white/20 rounded-lg text-white text-sm focus:border-neon-green focus:outline-none focus:ring-2 focus:ring-neon-green/20 transition-all"
            />
            <select
              value={scale.unit}
              onChange={(e) => handleUnitChange(e.target.value as Unit)}
              className="px-3 py-2 bg-dark-bg border border-white/20 rounded-lg text-white text-sm focus:border-neon-green focus:outline-none focus:ring-2 focus:ring-neon-green/20 transition-all"
            >
              <option value="mm">mm</option>
              <option value="cm">cm</option>
              <option value="m">m</option>
              <option value="km">km</option>
            </select>
          </div>
        </div>

        {/* Display Format */}
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">
            Weergave Format
          </label>
          <select
            value={scale.displayFormat}
            onChange={(e) => handleDisplayFormatChange(e.target.value as DisplayFormat)}
            className="w-full px-3 py-2 bg-dark-bg border border-white/20 rounded-lg text-white text-sm focus:border-neon-green focus:outline-none focus:ring-2 focus:ring-neon-green/20 transition-all"
          >
            <option value="auto">Auto (beste eenheid)</option>
            <option value="mm">Millimeters</option>
            <option value="cm">Centimeters</option>
            <option value="m">Meters</option>
          </select>
        </div>

        {/* Preview */}
        <div className="pt-3 border-t border-white/10">
          <p className="text-white/60 text-xs mb-1">Preview:</p>
          <p className="text-neon-green text-sm font-medium">
            {previewPixels} pixels = {previewFormatted}
          </p>
        </div>
      </div>
    </div>
  );
};
