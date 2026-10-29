import React from 'react';
import { MandelbrotMorphOrb } from './MandelbrotMorphOrb';
import { FractalWebGLCanvas } from './FractalWebGLCanvas';
import { FRACTAL_OVERLAY } from './fractalOverlayStyles';

export const MandelbrotMorphOrbBackground: React.FC = () => (
  <FractalWebGLCanvas overlayClassName={FRACTAL_OVERLAY.mandelbrotMorph}>
    <MandelbrotMorphOrb />
  </FractalWebGLCanvas>
);
