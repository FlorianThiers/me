import React from 'react';
import { JuliaOrb } from './JuliaOrb';
import { FractalWebGLCanvas } from './FractalWebGLCanvas';
import { shouldRenderFractalWebGL } from '../../lib/fractalPerformance';

type Props = {
  zoom?: number;
  center?: [number, number];
};

export const JuliaOrbBackground: React.FC<Props> = ({
  zoom = 2.9,
  center = [0.13, 0],
}) => {
  if (!shouldRenderFractalWebGL()) {
    return (
      <div
        className="pointer-events-none fixed left-0 right-0 bottom-0 top-20 z-0 bg-gradient-to-b from-dark-bg/90 via-dark-bg/80 to-dark-bg"
        aria-hidden="true"
      />
    );
  }

  return (
    <FractalWebGLCanvas>
      <JuliaOrb zoom={zoom} center={center} />
    </FractalWebGLCanvas>
  );
};
