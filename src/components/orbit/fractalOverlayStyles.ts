import type { FractalBackgroundKind } from '../../data/pageMandelbrotConfig';

/** Dark scrim over WebGL fractals — tuned per kind for text readability. */
export const FRACTAL_OVERLAY: Record<FractalBackgroundKind, string> = {
  mandelbrot:
    'absolute inset-0 bg-gradient-to-b from-dark-bg/80 via-dark-bg/65 to-dark-bg/90',
  mandelbrotMorph:
    'absolute inset-0 bg-gradient-to-b from-dark-bg/84 via-dark-bg/72 to-dark-bg/93',
  orbitTrap:
    'absolute inset-0 bg-gradient-to-b from-dark-bg/88 via-dark-bg/76 to-dark-bg/95',
};

/** Opaque panel for orbit strip + long-scroll footer transition. */
export const ORBIT_STRIP_PANEL =
  'rounded-t-2xl border-t border-white/10 bg-dark-bg/97 backdrop-blur-xl shadow-[0_-12px_40px_rgba(0,0,0,0.55)]';
