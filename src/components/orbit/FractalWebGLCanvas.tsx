import React, { Suspense } from 'react';
import { Canvas, type CanvasProps } from '@react-three/fiber';
import { useGpuFrameloop } from '../../hooks/useGpuFrameloop';
import { FRACTAL_GL, getFractalDpr } from '../../lib/fractalPerformance';

type Props = {
  children: React.ReactNode;
  overlayClassName?: string;
  /** `top-20` under nav, or `inset-0` for hero. */
  insetClassName?: string;
  camera?: CanvasProps['camera'];
  /** When false, frameloop stops (route leave, hero scrolled away). */
  active?: boolean;
};

export const FractalWebGLCanvas: React.FC<Props> = ({
  children,
  overlayClassName,
  insetClassName = 'top-20',
  camera = { position: [0, 0, 2], fov: 50 },
  active = true,
}) => {
  const frameloop = useGpuFrameloop(active);
  const dpr = getFractalDpr();

  return (
    <div
      className={`pointer-events-none fixed left-0 right-0 bottom-0 ${insetClassName} z-0`}
      aria-hidden="true"
    >
      <Canvas
        className="!block !w-full !h-full"
        camera={camera}
        frameloop={frameloop}
        dpr={dpr}
        gl={FRACTAL_GL}
        style={{ width: '100%', height: '100%', display: 'block', background: 'transparent' }}
      >
        <Suspense fallback={null}>{children}</Suspense>
      </Canvas>
      {overlayClassName ? <div className={overlayClassName} /> : null}
    </div>
  );
};
