import React, { Suspense } from 'react';

import { Canvas } from '@react-three/fiber';

import { MandelbrotOrb } from './MandelbrotOrb';

import { FRACTAL_OVERLAY } from './fractalOverlayStyles';

import type { MandelbrotViewConfig } from '../../data/pageMandelbrotConfig';



type Props = {

  view: MandelbrotViewConfig;

};



/** Fixed viewport band under nav — same shell as JuliaOrbBackground. */

export const MandelbrotOrbBackground: React.FC<Props> = ({ view }) => (

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

        <MandelbrotOrb view={view} />

      </Suspense>

    </Canvas>

    <div className={FRACTAL_OVERLAY.mandelbrot} />

  </div>

);

