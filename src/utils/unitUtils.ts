import type { DisplayFormat, ScaleConfig, Unit } from '../types/gardenDesigner';

export type { DisplayFormat, ScaleConfig, Unit };

/**
 * Scale model (v1.1+):
 * `pixelsPerUnit` = canvas pixels that equal **one** `unit`.
 * Example: `{ pixelsPerUnit: 1, unit: 'cm' }` → 1 px = 1 cm.
 */
export const DEFAULT_SCALE: ScaleConfig = {
  pixelsPerUnit: 1,
  unit: 'cm',
  displayFormat: 'auto'
};

const UNIT_TO_METERS: Record<Unit, number> = {
  mm: 0.001,
  cm: 0.01,
  m: 1,
  km: 1000
};

const METERS_TO_UNIT: Record<Unit, number> = {
  mm: 1000,
  cm: 100,
  m: 1,
  km: 0.001
};

/** Pixels → value in `scale.unit`. */
export function pixelsToUnit(pixels: number, scale: ScaleConfig): number {
  if (scale.pixelsPerUnit <= 0) return 0;
  return pixels / scale.pixelsPerUnit;
}

/** Real-world value → canvas pixels. */
export function unitToPixels(value: number, unit: Unit, scale: ScaleConfig): number {
  const valueInScaleUnit = convertUnit(value, unit, scale.unit);
  return valueInScaleUnit * scale.pixelsPerUnit;
}

export function convertUnit(value: number, fromUnit: Unit, toUnit: Unit): number {
  const valueInMeters = value * UNIT_TO_METERS[fromUnit];
  return valueInMeters * METERS_TO_UNIT[toUnit];
}

export function chooseBestUnit(value: number, currentUnit: Unit): { value: number; unit: Unit } {
  const valueInMeters = value * UNIT_TO_METERS[currentUnit];

  if (valueInMeters >= 1000) {
    return { value: valueInMeters / 1000, unit: 'km' };
  }
  if (valueInMeters >= 1) {
    return { value: valueInMeters, unit: 'm' };
  }
  if (valueInMeters >= 0.01) {
    return { value: valueInMeters * 100, unit: 'cm' };
  }
  return { value: valueInMeters * 1000, unit: 'mm' };
}

function formatValue(value: number, unit: Unit): string {
  const rounded = Math.round(value * 100) / 100;
  if (rounded % 1 === 0) {
    return `${Math.round(rounded)}${unit}`;
  }
  return `${rounded.toFixed(2)}${unit}`;
}

/** Format a length stored in canvas pixels. */
export function formatDimension(
  pixels: number,
  scale: ScaleConfig,
  overrideUnit?: Unit
): string {
  const valueInScaleUnit = pixelsToUnit(pixels, scale);

  if (!overrideUnit && scale.displayFormat === 'auto') {
    const best = chooseBestUnit(valueInScaleUnit, scale.unit);
    return formatValue(best.value, best.unit);
  }

  const target = overrideUnit ?? (scale.displayFormat === 'auto' ? scale.unit : scale.displayFormat);
  const converted = convertUnit(valueInScaleUnit, scale.unit, target);
  return formatValue(converted, target);
}

/** Format an area stored in canvas pixels². */
export function formatArea(
  pixelsSquared: number,
  scale: ScaleConfig,
  overrideUnit?: Unit
): string {
  const ppu = scale.pixelsPerUnit;
  if (ppu <= 0) return '0';

  const areaInScaleUnitSquared = pixelsSquared / (ppu * ppu);
  const unitToMeter = UNIT_TO_METERS[scale.unit];
  const areaInMetersSquared = areaInScaleUnitSquared * (unitToMeter * unitToMeter);

  if (!overrideUnit && scale.displayFormat === 'auto') {
    if (areaInMetersSquared >= 1_000_000) {
      return `${formatValue(areaInMetersSquared / 1_000_000, 'km')}²`;
    }
    if (areaInMetersSquared >= 1) {
      return `${formatValue(areaInMetersSquared, 'm')}²`;
    }
    if (areaInMetersSquared >= 0.0001) {
      return `${formatValue(areaInMetersSquared * 10_000, 'cm')}²`;
    }
    return `${formatValue(areaInMetersSquared * 1_000_000, 'mm')}²`;
  }

  const target = overrideUnit ?? (scale.displayFormat === 'auto' ? scale.unit : scale.displayFormat);
  const targetToMeter = UNIT_TO_METERS[target];
  const convertedArea = areaInMetersSquared / (targetToMeter * targetToMeter);
  return `${formatValue(convertedArea, target)}²`;
}

/** Parse "200cm" / "2.4m" → canvas pixels. */
export function parseDimension(value: string, scale: ScaleConfig): number | null {
  const match = value.match(/^([\d.]+)\s*(mm|cm|m|km)?$/i);
  if (!match) return null;

  const numValue = parseFloat(match[1]);
  if (Number.isNaN(numValue)) return null;
  const unit = (match[2]?.toLowerCase() as Unit) || scale.unit;
  return unitToPixels(numValue, unit, scale);
}

/**
 * Legacy designs (version &lt; 1.1) used pixelsPerUnit=10 + unit=cm with a ×10 display hack
 * that behaved like 1 px = 1 cm. Normalize to the explicit model.
 */
export function normalizeScale(scale: ScaleConfig | undefined, designVersion?: string): ScaleConfig {
  const base = { ...DEFAULT_SCALE, ...(scale ?? {}) };
  if (!scale) return base;

  const majorMinor = designVersion?.split('.').slice(0, 2).join('.') ?? '1.0';
  const isLegacy = majorMinor === '1.0' || !designVersion;
  if (isLegacy && scale.pixelsPerUnit === 10 && scale.unit === 'cm') {
    return { ...base, pixelsPerUnit: 1, unit: 'cm' };
  }
  if (base.pixelsPerUnit <= 0) {
    return { ...base, pixelsPerUnit: DEFAULT_SCALE.pixelsPerUnit };
  }
  return base;
}
