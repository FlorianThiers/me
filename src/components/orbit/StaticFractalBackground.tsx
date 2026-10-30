import React, { useEffect, useState } from 'react';
import { FRACTAL_OVERLAY } from './fractalOverlayStyles';
import type { MandelbrotViewConfig } from '../../data/pageMandelbrotConfig';
import { renderMandelbrot, type FractalView } from '../../lib/fractalMath';

const imageCache = new Map<string, string>();

function viewToFractalView(view: MandelbrotViewConfig): FractalView {
  return {
    centerRe: view.centerX,
    centerIm: view.centerY,
    span: 3.2 / view.zoomLevel,
  };
}

function cacheKey(view: MandelbrotViewConfig): string {
  return `${view.spotId}:${view.centerX}:${view.centerY}:${view.zoomLevel}`;
}

function bakeMandelbrotImage(view: MandelbrotViewConfig): string {
  const key = cacheKey(view);
  const cached = imageCache.get(key);
  if (cached) return cached;

  const w = 640;
  const h = 480;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const image = ctx.createImageData(w, h);
  renderMandelbrot(image, viewToFractalView(view), 64);
  ctx.putImageData(image, 0, 0);
  const url = canvas.toDataURL('image/jpeg', 0.82);
  imageCache.set(key, url);
  return url;
}

type Props = {
  view: MandelbrotViewConfig;
  /** Hero uses full viewport; orbit pages use nav offset via parent. */
  insetClassName?: string;
};

/** One-shot CPU fractal — no Three.js, no animation loop. */
export const StaticFractalBackground: React.FC<Props> = ({
  view,
  insetClassName = 'top-20',
}) => {
  const [bgUrl, setBgUrl] = useState(() => imageCache.get(cacheKey(view)) ?? '');

  useEffect(() => {
    const url = bakeMandelbrotImage(view);
    if (url) setBgUrl(url);
  }, [view]);

  return (
    <div
      className={`pointer-events-none fixed left-0 right-0 bottom-0 ${insetClassName} z-0`}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0 bg-dark-bg bg-cover bg-center"
        style={bgUrl ? { backgroundImage: `url(${bgUrl})` } : undefined}
      />
      <div className={FRACTAL_OVERLAY.mandelbrot} />
    </div>
  );
};
