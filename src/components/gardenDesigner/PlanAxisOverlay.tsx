import React from 'react';
import type { PlanProjection } from '../../types/gardenDesigner';
import { getProjectionAxisLabels } from '../../utils/planProjectionUtils';
import { PLAN_AXIS_LABELS } from '../../utils/planCoordinateUtils';

interface PlanAxisOverlayProps {
  className?: string;
  projection?: PlanProjection;
}

/** Screen-fixed XYZ compass for 2D plan — matches Garden3DScene (Y-up, plan Y → 3D Z). */
export const PlanAxisOverlay: React.FC<PlanAxisOverlayProps> = ({
  className = '',
  projection = 'top'
}) => {
  const axis = getProjectionAxisLabels(projection);
  const isTop = projection === 'top';

  return (
    <div className={`pointer-events-none select-none ${className}`}>
      {isTop ? (
        <>
          <span className="absolute top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-dark-secondary/70 border border-white/10 text-[10px] text-sky-300/80 font-mono tracking-wide">
            {PLAN_AXIS_LABELS.zNegative}
          </span>
          <span className="absolute bottom-14 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-dark-secondary/70 border border-white/10 text-[10px] text-sky-300/80 font-mono tracking-wide">
            {PLAN_AXIS_LABELS.zPositive}
          </span>
          <span className="absolute left-3 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded bg-dark-secondary/70 border border-white/10 text-[10px] text-rose-300/80 font-mono tracking-wide">
            {PLAN_AXIS_LABELS.xNegative}
          </span>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded bg-dark-secondary/70 border border-white/10 text-[10px] text-rose-300/80 font-mono tracking-wide">
            {PLAN_AXIS_LABELS.xPositive}
          </span>
        </>
      ) : (
        <>
          <span className="absolute top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-dark-secondary/70 border border-white/10 text-[10px] text-sky-300/80 font-mono tracking-wide">
            {axis.vertical} ↑
          </span>
          <span className="absolute bottom-14 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-dark-secondary/70 border border-white/10 text-[10px] text-rose-300/80 font-mono tracking-wide">
            {axis.horizontal}
          </span>
        </>
      )}

      {/* Corner axis gizmo */}
      <div className="absolute bottom-16 left-4 z-20">
        <div className="bg-dark-secondary/90 backdrop-blur-sm border border-white/15 rounded-lg px-3 py-2 shadow-lg">
          <p className="text-[9px] uppercase tracking-widest text-white/35 mb-2 text-center">
            {axis.title}
          </p>
          {isTop ? (
            <svg width="72" height="72" viewBox="0 0 72 72" aria-hidden>
            {/* origin */}
            <circle cx="36" cy="36" r="3" fill="#ffffff55" />
            {/* +X rechts */}
            <line x1="36" y1="36" x2="62" y2="36" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round" />
            <polygon points="62,36 54,32 54,40" fill="#f87171" />
            <text x="64" y="40" fill="#f87171" fontSize="10" fontFamily="monospace" fontWeight="600">
              X
            </text>
            {/* −Z boven (canvas up = decreasing plan Y = decreasing 3D Z) */}
            <line x1="36" y1="36" x2="36" y2="10" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
            <polygon points="36,10 32,18 40,18" fill="#38bdf8" />
            <text x="40" y="12" fill="#38bdf8" fontSize="10" fontFamily="monospace" fontWeight="600">
              Z
            </text>
            {/* Y hint — out of plane */}
            <text x="8" y="68" fill="#a3e635" fontSize="9" fontFamily="monospace">
              Y ↑ 3D
            </text>
          </svg>
          ) : (
            <div className="text-[10px] text-white/55 font-mono leading-relaxed px-1">
              <div>Gevel · doorsnede</div>
              <div className="text-amber-300/80 mt-1">Gele lijn = maaiveld (0 m)</div>
            </div>
          )}
          {isTop && (
          <div className="mt-1 space-y-0.5 text-[9px] text-white/45 font-mono leading-tight">
            <div>
              <span className="text-rose-300/90">X</span> links ↔ rechts
            </div>
            <div>
              <span className="text-sky-300/90">Z</span> boven ↔ onder
            </div>
            <div>
              <span className="text-lime-300/90">Y</span> hoogte (3D)
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
};
