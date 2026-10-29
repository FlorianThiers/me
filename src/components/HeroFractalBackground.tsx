import React from 'react';
import { MandelbrotBackground } from './MandelbrotBackground';
import { FractalWebGLCanvas } from './orbit/FractalWebGLCanvas';

type Props = {
  /** Pause GPU when hero scrolls out of view. */
  active?: boolean;
};

/** Hero-only fractal — lazy-loaded so Three.js stays out of the initial route chunk. */
export const HeroFractalBackground: React.FC<Props> = ({ active = true }) => (
  <FractalWebGLCanvas insetClassName="inset-0" camera={{ position: [0, 0, 1] }} active={active}>
    <MandelbrotBackground />
  </FractalWebGLCanvas>
);
