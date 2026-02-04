export type Unit = 'mm' | 'cm' | 'm' | 'km';
export type DisplayFormat = 'auto' | 'mm' | 'cm' | 'm';

export interface ScaleConfig {
  pixelsPerUnit: number;  // Bijv. 10 (1 pixel = 10cm)
  unit: Unit;
  displayFormat: DisplayFormat; // Auto kiest beste eenheid
}

// Conversie factoren naar meters
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

/**
 * Converteer pixels naar eenheden volgens schaal
 * Als pixelsPerUnit = 10 en unit = 'cm', dan betekent dit: 1 pixel = 10 cm
 */
export function pixelsToUnit(pixels: number, scale: ScaleConfig): number {
  // Directe conversie: pixels / pixelsPerUnit geeft waarde in scale.unit
  return pixels / scale.pixelsPerUnit;
}

/**
 * Converteer eenheden naar pixels volgens schaal
 */
export function unitToPixels(value: number, unit: Unit, scale: ScaleConfig): number {
  // Converteer eerst naar scale.unit, dan naar pixels
  const valueInScaleUnit = convertUnit(value, unit, scale.unit);
  return valueInScaleUnit * scale.pixelsPerUnit;
}

/**
 * Converteer van de ene eenheid naar de andere
 */
export function convertUnit(value: number, fromUnit: Unit, toUnit: Unit): number {
  const valueInMeters = value * UNIT_TO_METERS[fromUnit];
  return valueInMeters * METERS_TO_UNIT[toUnit];
}

/**
 * Kies de beste eenheid voor weergave (auto-format)
 */
export function chooseBestUnit(value: number, currentUnit: Unit): { value: number; unit: Unit } {
  const valueInMeters = value * UNIT_TO_METERS[currentUnit];
  
  if (valueInMeters >= 1000) {
    return { value: valueInMeters / 1000, unit: 'km' };
  } else if (valueInMeters >= 1) {
    return { value: valueInMeters, unit: 'm' };
  } else if (valueInMeters >= 0.01) {
    return { value: valueInMeters * 100, unit: 'cm' };
  } else {
    return { value: valueInMeters * 1000, unit: 'mm' };
  }
}

/**
 * Formatteer een dimensie waarde met eenheid
 * Afmetingen worden met 10x vermenigvuldigd voor betere leesbaarheid
 */
export function formatDimension(
  pixels: number,
  scale: ScaleConfig,
  overrideUnit?: Unit
): string {
  const unit = overrideUnit || scale.unit;
  // Vermenigvuldig met 10 voor betere leesbaarheid
  const value = pixelsToUnit(pixels, { ...scale, unit }) * 10;
  
  if (scale.displayFormat === 'auto') {
    const best = chooseBestUnit(value, unit);
    return formatValue(best.value, best.unit);
  } else {
    const convertedValue = convertUnit(value, unit, scale.displayFormat);
    return formatValue(convertedValue, scale.displayFormat);
  }
}

/**
 * Formatteer een waarde met eenheid (afgerond)
 */
function formatValue(value: number, unit: Unit): string {
  // Rond af op 2 decimalen, maar toon alleen decimalen als nodig
  const rounded = Math.round(value * 100) / 100;
  
  if (rounded % 1 === 0) {
    return `${Math.round(rounded)}${unit}`;
  } else {
    return `${rounded.toFixed(2)}${unit}`;
  }
}

/**
 * Formatteer oppervlakte (m², cm², etc.)
 * @param pixelsSquared - Oppervlakte in pixels² (niet pixels!)
 * Afmetingen worden met 10x vermenigvuldigd voor betere leesbaarheid (dus 100x voor oppervlakte)
 */
export function formatArea(
  pixelsSquared: number,
  scale: ScaleConfig,
  overrideUnit?: Unit
): string {
  const unit = overrideUnit || scale.unit;
  const pixelsPerUnit = scale.pixelsPerUnit;
  
  // Converteer pixels² naar eenheden²
  // Als 1 pixel = pixelsPerUnit eenheden, dan 1 pixel² = (pixelsPerUnit)² eenheden²
  const areaInUnitSquared = pixelsSquared / (pixelsPerUnit * pixelsPerUnit);
  
  // Vermenigvuldig met 100 (10x voor lengte = 100x voor oppervlakte)
  const scaledAreaInUnitSquared = areaInUnitSquared * 100;
  
  // Converteer naar vierkante meters eerst
  const unitToMeter = UNIT_TO_METERS[unit];
  const areaInMetersSquared = scaledAreaInUnitSquared * (unitToMeter * unitToMeter);
  
  if (scale.displayFormat === 'auto') {
    // Kies beste eenheid voor oppervlakte
    if (areaInMetersSquared >= 1000000) {
      const km2 = areaInMetersSquared / 1000000;
      return formatValue(km2, 'km') + '²';
    } else if (areaInMetersSquared >= 1) {
      return formatValue(areaInMetersSquared, 'm') + '²';
    } else if (areaInMetersSquared >= 0.0001) {
      const cm2 = areaInMetersSquared * 10000;
      return formatValue(cm2, 'cm') + '²';
    } else {
      const mm2 = areaInMetersSquared * 1000000;
      return formatValue(mm2, 'mm') + '²';
    }
  } else {
    const displayUnitToMeter = UNIT_TO_METERS[scale.displayFormat];
    const convertedArea = areaInMetersSquared / (displayUnitToMeter * displayUnitToMeter);
    return formatValue(convertedArea, scale.displayFormat) + '²';
  }
}

/**
 * Parse een dimensie string (bijv. "200cm", "2m") naar pixels
 */
export function parseDimension(value: string, scale: ScaleConfig): number | null {
  const match = value.match(/^([\d.]+)\s*(mm|cm|m|km)?$/i);
  if (!match) return null;
  
  const numValue = parseFloat(match[1]);
  const unit = (match[2]?.toLowerCase() as Unit) || scale.unit;
  
  return unitToPixels(numValue, unit, scale);
}
