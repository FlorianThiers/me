import React, { Suspense } from 'react';
import { OrbitFractalBackground } from './OrbitFractalBackground';
import { FractalOrbitStrip } from './FractalOrbitStrip';
import { ORBIT_STRIP_PANEL } from './fractalOverlayStyles';
import { getPageFractalConfig } from '../../data/pageMandelbrotConfig';
import { Outlet, useLocation } from 'react-router-dom';

/** Per-route fractal background + fractal strip. Backgrounds lazy-load Three.js. */
export const OrbitLayout: React.FC = () => {
  const { pathname } = useLocation();
  const config = getPageFractalConfig(pathname);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <Suspense fallback={null}>
        <OrbitFractalBackground config={config} />
      </Suspense>

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
