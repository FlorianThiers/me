import React from 'react';
import { MandelbrotOrb } from './MandelbrotOrb';
import { FractalWebGLCanvas } from './FractalWebGLCanvas';
import { FRACTAL_OVERLAY } from './fractalOverlayStyles';
import type { MandelbrotViewConfig } from '../../data/pageMandelbrotConfig';

type Props = {
  view: MandelbrotViewConfig;
};

export const MandelbrotOrbBackground: React.FC<Props> = ({ view }) => (
  <FractalWebGLCanvas overlayClassName={FRACTAL_OVERLAY.mandelbrot}>
    <MandelbrotOrb view={view} />
  </FractalWebGLCanvas>
);
