import React from 'react';
import { Minus, Plus, Maximize2, Target, Home } from 'lucide-react';
import { formatZoomPercent } from '../../utils/viewUtils';

interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomFit: () => void;
  onZoomSelection: () => void;
  onZoom100: () => void;
  hasSelection: boolean;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomFit,
  onZoomSelection,
  onZoom100,
  hasSelection
}) => {
  return (
    <div className="flex items-center gap-1 bg-dark-secondary/90 backdrop-blur-sm border border-white/10 rounded-lg p-1 shadow-lg">
      <button
        type="button"
        onClick={onZoomOut}
        className="p-1.5 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors"
        title="Uitzoomen (Ctrl+-)"
      >
        <Minus className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={onZoom100}
        className="px-2 py-1 min-w-[3.5rem] text-xs font-mono text-white/80 hover:text-neon-green hover:bg-white/5 rounded transition-colors"
        title="100% (Ctrl+1)"
      >
        {formatZoomPercent(zoom)}
      </button>
      <button
        type="button"
        onClick={onZoomIn}
        className="p-1.5 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors"
        title="Inzoomen (Ctrl++)"
      >
        <Plus className="w-4 h-4" />
      </button>
      <div className="w-px h-5 bg-white/10 mx-0.5" />
      <button
        type="button"
        onClick={onZoomFit}
        className="p-1.5 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors"
        title="Alles tonen (Ctrl+0)"
      >
        <Maximize2 className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={onZoomSelection}
        disabled={!hasSelection}
        className="p-1.5 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        title="Zoom naar selectie (Ctrl+2)"
      >
        <Target className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={onZoom100}
        className="p-1.5 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors"
        title="100% zoom, centrum"
      >
        <Home className="w-4 h-4" />
      </button>
    </div>
  );
};
