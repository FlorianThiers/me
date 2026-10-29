import { MANDELBROT_SPOTS, type MandelbrotSpotId } from './pageMandelbrotConfig';
import { cardioidPoint, GOLDEN_TURN, type Complex } from '../lib/fractalMath';

export type FractalExplorerPreset = {
  id: string;
  c: Complex;
  labelKey: string;
  /** Optional site route linked to this valley */
  link?: string;
  spotId?: MandelbrotSpotId;
  /** Fibonacci internal angle (numerator/denominator) for educational label */
  fibonacci?: { num: number; den: number };
};

const spotPreset = (spotId: MandelbrotSpotId, link?: string): FractalExplorerPreset => {
  const s = MANDELBROT_SPOTS[spotId];
  return {
    id: spotId,
    c: { re: s.centerX, im: s.centerY },
    labelKey: s.nameKey,
    link,
    spotId,
  };
};

const FIBonacci_ANGLES: { num: number; den: number }[] = [
  { num: 1, den: 2 },
  { num: 2, den: 3 },
  { num: 3, den: 5 },
  { num: 5, den: 8 },
  { num: 8, den: 13 },
];

export const FRACTAL_EXPLORER_PRESETS: FractalExplorerPreset[] = [
  spotPreset('seahorse', '/skills'),
  spotPreset('elephant', '/journey'),
  spotPreset('spiral', '/sports'),
  {
    id: 'golden-mean',
    c: cardioidPoint(GOLDEN_TURN),
    labelKey: 'mandelbrot.explorer.presets.goldenMean',
  },
  ...FIBonacci_ANGLES.map(({ num, den }) => ({
    id: `fib-${num}-${den}`,
    c: cardioidPoint(num / den),
    labelKey: 'mandelbrot.explorer.presets.fibonacci',
    fibonacci: { num, den },
  })),
];

export const MANDELBROT_EXPLORER_VIEW = {
  centerRe: -0.55,
  centerIm: 0,
  span: 3.2,
};

export const JULIA_EXPLORER_VIEW = {
  centerRe: 0,
  centerIm: 0,
  span: 2.8,
};

export const DEFAULT_EXPLORER_C = FRACTAL_EXPLORER_PRESETS[0].c;
