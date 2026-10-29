import React, { useEffect, useState } from 'react';
import { renderJulia, type Complex, type FractalView } from '../../lib/fractalMath';

const JULIA_C: Complex = { re: -0.8, im: 0.156 };
const JULIA_VIEW: FractalView = { centerRe: 0, centerIm: 0, span: 2.8 };
let juliaCache: string | null = null;

function bakeJuliaImage(): string {
  if (juliaCache) return juliaCache;
  const w = 640;
  const h = 480;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const image = ctx.createImageData(w, h);
  renderJulia(image, JULIA_C, JULIA_VIEW, 64);
  ctx.putImageData(image, 0, 0);
  juliaCache = canvas.toDataURL('image/jpeg', 0.82);
  return juliaCache;
}

/** Static Julia backdrop for /julia — replaces animated WebGL orb. */
export const StaticJuliaBackground: React.FC = () => {
  const [bgUrl, setBgUrl] = useState(juliaCache ?? '');

  useEffect(() => {
    const url = bakeJuliaImage();
    if (url) setBgUrl(url);
  }, []);

  return (
    <div
      className="pointer-events-none fixed left-0 right-0 bottom-0 top-20 z-0"
      aria-hidden="true"
    >
      <div
        className="absolute inset-0 bg-dark-bg bg-cover bg-center"
        style={bgUrl ? { backgroundImage: `url(${bgUrl})` } : undefined}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-dark-bg/88 via-dark-bg/76 to-dark-bg/95" />
    </div>
  );
};
