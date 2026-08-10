import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { MandelbrotOrbBackground } from './MandelbrotOrbBackground';
import { MandelbrotMorphOrbBackground } from './MandelbrotMorphOrbBackground';
import { OrbitTrapOrbBackground } from './OrbitTrapOrbBackground';
import { FractalOrbitStrip } from './FractalOrbitStrip';
import { ORBIT_STRIP_PANEL } from './fractalOverlayStyles';
import { getPageFractalConfig } from '../../data/pageMandelbrotConfig';

/** Per-route fractal background + fractal strip. */
export const OrbitLayout: React.FC = () => {
  const { pathname } = useLocation();
  const config = getPageFractalConfig(pathname);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {config.kind === 'mandelbrotMorph' && <MandelbrotMorphOrbBackground />}
      {config.kind === 'orbitTrap' && config.orbitTrap && (
        <OrbitTrapOrbBackground {...config.orbitTrap} />
      )}
      {config.kind === 'mandelbrot' && <MandelbrotOrbBackground view={config.view} />}

      <div className="relative z-10 pt-20 min-h-screen flex flex-col">
        <div className="flex-1">
          <Outlet />
        </div>

        <div className={`relative mt-10 ${ORBIT_STRIP_PANEL}`}>
          <FractalOrbitStrip
            pagePath={pathname}
            view={config.view}
            fractalKind={config.kind}
            orbitTrap={config.orbitTrap}
            className="container-custom px-4 py-8 pb-10"
          />
        </div>
      </div>
    </div>
  );
};
