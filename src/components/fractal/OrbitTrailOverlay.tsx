import React, { useMemo } from 'react';
import {
  type Complex,
  type FractalView,
  complexToPixel,
  goldenSpiralPoints,
  iterateOrbit,
} from '../../lib/fractalMath';

type Props = {
  c: Complex;
  z0: Complex;
  view: FractalView;
  width: number;
  height: number;
  step: number;
  showSpiralGuide: boolean;
  className?: string;
};

export const OrbitTrailOverlay: React.FC<Props> = ({
  c,
  z0,
  view,
  width,
  height,
  step,
  showSpiralGuide,
  className = '',
}) => {
  const orbit = useMemo(() => iterateOrbit(c, z0, 180), [c, z0]);
  const visibleStep = Math.min(step, orbit.length - 1);

  const toSvg = (z: Complex) => complexToPixel(z, width, height, view);

  const trailPoints = orbit.slice(0, visibleStep + 1);
  const polyline = trailPoints.map((z) => {
    const p = toSvg(z);
    return `${p.x},${p.y}`;
  }).join(' ');

  const spiral = showSpiralGuide ? goldenSpiralPoints(80, 1.2) : [];
  const spiralPoly = spiral.map((z) => {
    const p = toSvg(z);
    return `${p.x},${p.y}`;
  }).join(' ');

  const current = trailPoints[trailPoints.length - 1];
  const currentPx = current ? toSvg(current) : null;
  const startPx = toSvg(z0);

  return (
    <svg
      className={`pointer-events-none absolute inset-0 w-full h-full ${className}`}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {showSpiralGuide && spiralPoly && (
        <polyline
          points={spiralPoly}
          fill="none"
          stroke="rgba(255, 200, 80, 0.35)"
          strokeWidth="1.5"
          strokeDasharray="4 6"
        />
      )}
      {polyline && (
        <polyline
          points={polyline}
          fill="none"
          stroke="rgba(0, 255, 136, 0.85)"
          strokeWidth="2"
        />
      )}
      {trailPoints.slice(0, -1).map((z, i) => {
        const p = toSvg(z);
        return (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={i === 0 ? 4 : 2.5}
            fill={i === 0 ? 'rgba(0, 136, 255, 0.9)' : 'rgba(0, 255, 136, 0.65)'}
          />
        );
      })}
      {currentPx && (
        <circle cx={currentPx.x} cy={currentPx.y} r={5} fill="rgba(255, 80, 136, 0.95)" />
      )}
      <circle cx={startPx.x} cy={startPx.y} r={3.5} fill="rgba(255, 255, 255, 0.9)" />
    </svg>
  );
};
