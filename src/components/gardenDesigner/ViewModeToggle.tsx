import React from 'react';
import type { ViewMode } from '../../types/gardenDesigner';
import { Map, Columns2, Box } from 'lucide-react';

interface ViewModeToggleProps {
  viewMode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

const modes: Array<{ id: ViewMode; label: string; icon: React.ReactNode }> = [
  { id: 'plan', label: 'Plan', icon: <Map className="w-3.5 h-3.5" /> },
  { id: 'split', label: 'Split', icon: <Columns2 className="w-3.5 h-3.5" /> },
  { id: 'iso', label: '3D', icon: <Box className="w-3.5 h-3.5" /> }
];

export const ViewModeToggle: React.FC<ViewModeToggleProps> = ({ viewMode, onChange }) => {
  return (
    <div className="flex items-center gap-1 bg-dark-secondary/90 backdrop-blur-sm border border-white/10 rounded-lg p-1 shadow-lg">
      {modes.map((mode) => (
        <button
          key={mode.id}
          type="button"
          onClick={() => onChange(mode.id)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-colors ${
            viewMode === mode.id
              ? 'bg-neon-green/20 text-neon-green border border-neon-green/40'
              : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
          title={mode.label}
        >
          {mode.icon}
          <span className="hidden sm:inline">{mode.label}</span>
        </button>
      ))}
    </div>
  );
};
