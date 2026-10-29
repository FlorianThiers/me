import React from 'react';
import { OrbitTrapOrb } from './OrbitTrapOrb';
import { FractalWebGLCanvas } from './FractalWebGLCanvas';
import { FRACTAL_OVERLAY } from './fractalOverlayStyles';
import type { OrbitTrapSettings } from '../../data/orbitTrapPresets';

type Props = OrbitTrapSettings;

export const OrbitTrapOrbBackground: React.FC<Props> = (settings) => (
  <FractalWebGLCanvas overlayClassName={FRACTAL_OVERLAY.orbitTrap}>
    <OrbitTrapOrb {...settings} />
  </FractalWebGLCanvas>
);
