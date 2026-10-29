import React from 'react';
import type { PageFractalConfig } from '../../data/pageMandelbrotConfig';
import { StaticFractalBackground } from './StaticFractalBackground';

type Props = {
  config: PageFractalConfig;
};

/** Route-scoped fractal bg — static image by default (no WebGL). */
export const OrbitFractalBackground: React.FC<Props> = ({ config }) => {
  if (config.kind === 'none') {
    return <div className="pointer-events-none fixed inset-0 z-0 bg-dark-bg" aria-hidden="true" />;
  }

  if (config.kind === 'static') {
    return <StaticFractalBackground view={config.view} />;
  }

  // Legacy live WebGL kinds — fallback to static if ever referenced
  return <StaticFractalBackground view={config.view} />;
};
