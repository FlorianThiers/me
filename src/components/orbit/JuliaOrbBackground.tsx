import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { JuliaOrb } from './JuliaOrb';

type Props = {
  zoom?: number;
  center?: [number, number];
};

/**
 * fixed = altijd viewport-hoogte (niet meegroeien met lange pagina → verticaal gecentreerd).
 * top-20 = onder de nav, zelfde band als de zichtbare content.
 */
export const JuliaOrbBackground: React.FC<Props> = ({
  zoom = 2.9,
  center = [0.13, 0],
}) => (
  <div
    className="pointer-events-none fixed left-0 right-0 bottom-0 top-20 z-0"
    aria-hidden="true"
  >
    <Canvas
      className="!block !w-full !h-full"
      camera={{ position: [0, 0, 2], fov: 50 }}
      gl={{ antialias: true, alpha: true, premultipliedAlpha: false }}
      dpr={[1, 2]}
      style={{ width: '100%', height: '100%', display: 'block', background: 'transparent' }}
    >
      <Suspense fallback={null}>
        <JuliaOrb zoom={zoom} center={center} />
      </Suspense>
    </Canvas>
  </div>
);
