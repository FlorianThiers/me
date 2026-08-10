import React from 'react';
import type { PlanProjection } from '../../types/gardenDesigner';
import { PLAN_PROJECTIONS } from '../../utils/planProjectionUtils';
import { Map, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

interface PlanProjectionToggleProps {
  projection: PlanProjection;
  onChange: (projection: PlanProjection) => void;
}

const icons: Record<PlanProjection, React.ReactNode> = {
  top: <Map className="w-3.5 h-3.5" />,
  north: <ArrowUp className="w-3.5 h-3.5" />,
  south: <ArrowDown className="w-3.5 h-3.5" />,
  west: <ArrowLeft className="w-3.5 h-3.5" />,
  east: <ArrowRight className="w-3.5 h-3.5" />
};

export const PlanProjectionToggle: React.FC<PlanProjectionToggleProps> = ({
  projection,
  onChange
}) => {
  return (
    <div className="flex flex-wrap items-center gap-1 bg-dark-secondary/90 backdrop-blur-sm border border-white/10 rounded-lg p-1 shadow-lg max-w-[280px]">
      {PLAN_PROJECTIONS.map((mode) => (
        <button
          key={mode.id}
          type="button"
          onClick={() => onChange(mode.id)}
          className={`flex items-center gap-1 px-2 py-1.5 rounded text-[11px] font-medium transition-colors ${
            projection === mode.id
              ? 'bg-sky-500/20 text-sky-300 border border-sky-400/40'
              : 'text-white/55 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
          title={mode.label}
        >
          {icons[mode.id]}
          <span>{mode.short}</span>
        </button>
      ))}
    </div>
  );
};
