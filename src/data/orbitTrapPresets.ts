export type OrbitTrapVariant =
  | 'mandala'
  | 'spiral'
  | 'grid'
  | 'ring'
  | 'filament'
  | 'neural';

export type OrbitTrapSettings = {
  variant: OrbitTrapVariant;
  /** Mandala fold symmetry (5, 7, 8 …) */
  petals?: number;
  /** Secondary trap scale (spiral tightness, grid cell size, …) */
  param?: number;
  zoom?: number;
  center?: [number, number];
  /** Base hue 0–1 for palette offset */
  colorHue?: number;
  breathSec?: number;
  rotationSpeed?: number;
  labelKey: string;
  metaphorKey: string;
};

export const ORBIT_TRAP_MODE: Record<OrbitTrapVariant, number> = {
  mandala: 0,
  spiral: 1,
  grid: 2,
  ring: 3,
  filament: 4,
  neural: 5,
};

const trap = (
  variant: OrbitTrapVariant,
  labelKey: string,
  metaphorKey: string,
  overrides: Partial<Omit<OrbitTrapSettings, 'variant' | 'labelKey' | 'metaphorKey'>> = {}
): OrbitTrapSettings => ({
  variant,
  petals: 5,
  param: 1,
  zoom: 2.35,
  center: [0.06, 0],
  colorHue: 0.5,
  breathSec: 30,
  rotationSpeed: 0.025,
  labelKey,
  metaphorKey,
  ...overrides,
});

/** Defaults per route — imported by pageMandelbrotConfig. */
export const ORBIT_TRAP_BY_ROUTE: Record<string, OrbitTrapSettings> = {
  '/topics/meditation': trap('mandala', 'mandala5', 'mandala5', {
    petals: 5,
    zoom: 2.35,
    colorHue: 0.48,
    breathSec: 36,
    rotationSpeed: 0.022,
  }),
  '/topics/consciousness-expansion': trap('mandala', 'mandala7', 'mandala7', {
    petals: 7,
    zoom: 2.2,
    colorHue: 0.78,
    breathSec: 34,
  }),
  '/cultivation': trap('mandala', 'flower', 'flower', {
    petals: 6,
    zoom: 2.5,
    colorHue: 0.35,
    breathSec: 32,
    rotationSpeed: 0.018,
  }),
  '/philosopher/carl-jung': trap('mandala', 'mandala8', 'mandala8', {
    petals: 8,
    zoom: 2.3,
    colorHue: 0.62,
    breathSec: 34,
  }),
  '/philosopher/itzhak-bentov': trap('mandala', 'sacred', 'sacred', {
    petals: 4,
    param: 0.85,
    zoom: 2.4,
    colorHue: 0.12,
    breathSec: 32,
  }),
  '/sports/dancing': trap('spiral', 'spiral', 'spiral', {
    param: 4.2,
    zoom: 2.15,
    colorHue: 0.92,
    breathSec: 20,
    rotationSpeed: 0.04,
  }),
  '/sports/dapo-flow-star': trap('spiral', 'spiral', 'spiralFlow', {
    param: 5.5,
    zoom: 2.45,
    colorHue: 0.55,
    breathSec: 22,
    rotationSpeed: 0.045,
  }),
  '/music': trap('ring', 'ring', 'ring', {
    param: 0.28,
    zoom: 2.1,
    colorHue: 0.08,
    breathSec: 18,
    rotationSpeed: 0.035,
  }),
  '/portfolio': trap('grid', 'grid', 'grid', {
    param: 0.16,
    zoom: 2.55,
    colorHue: 0.52,
    breathSec: 28,
    rotationSpeed: 0.012,
  }),
  '/skills': trap('grid', 'grid', 'gridSkills', {
    param: 0.13,
    zoom: 2.65,
    colorHue: 0.58,
    breathSec: 26,
    rotationSpeed: 0.01,
  }),
  '/beleggen': trap('grid', 'grid', 'gridMarkets', {
    param: 0.19,
    zoom: 2.2,
    colorHue: 0.15,
    breathSec: 30,
    rotationSpeed: 0.008,
  }),
  '/topics/quantum': trap('filament', 'filament', 'filament', {
    param: 8,
    zoom: 2.25,
    colorHue: 0.72,
    breathSec: 24,
    rotationSpeed: 0.03,
  }),
  '/topics/neural-networks': trap('neural', 'neural', 'neural', {
    param: 6,
    zoom: 2.4,
    colorHue: 0.62,
    breathSec: 26,
    rotationSpeed: 0.02,
  }),
};

export function resolveOrbitTrap(pathname: string, entry?: Partial<OrbitTrapSettings>): OrbitTrapSettings | undefined {
  const base = ORBIT_TRAP_BY_ROUTE[pathname];
  if (!base && !entry) return undefined;
  return { ...base, ...entry } as OrbitTrapSettings;
}
