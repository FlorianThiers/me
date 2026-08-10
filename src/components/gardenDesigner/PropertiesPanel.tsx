import React from 'react';
import type { DesignElement, ScaleConfig, SunExposure, SoilType, ElevationConfig } from '../../types/gardenDesigner';
import type { PlantCatalogData } from '../../types/plantCatalog';
import { formatSunLabel, getCatalogBySlug, getSowHint } from '../../utils/plantCatalog';
import {
  ELEVATION_PRESETS,
  formatElevationMeters,
  getElevationValues,
  mergeElevation
} from '../../utils/elevationUtils';
import { convertUnit, pixelsToUnit, unitToPixels } from '../../utils/unitUtils';
import { applyOpeningElevation } from '../../utils/openingUtils';
import { Lock, Unlock, ArrowUpFromLine } from 'lucide-react';
import { DimensionDisplay } from './DimensionDisplay';

interface PropertiesPanelProps {
  selectedElements: DesignElement[];
  scale: ScaleConfig;
  catalog: PlantCatalogData | null;
  onElementUpdate: (elementId: string, updates: Partial<DesignElement>) => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedElements,
  scale,
  catalog,
  onElementUpdate
}) => {
  if (selectedElements.length === 0) {
    return (
      <div className="bg-dark-secondary/50 backdrop-blur-sm border border-white/10 rounded-xl p-4">
        <h3 className="text-lg font-bold text-white mb-4">Eigenschappen</h3>
        <p className="text-white/40 text-sm text-center py-8">
          Selecteer een object om eigenschappen te bewerken
        </p>
      </div>
    );
  }

  const element = selectedElements[0]; // For now, only edit first selected element
  const isMultiple = selectedElements.length > 1;
  const catalogEntry = getCatalogBySlug(catalog, element.properties.catalogSlug);
  const isGroundZone = element.layer === 'ground' && element.type !== 'line';

  const handleUpdate = (updates: Partial<DesignElement>) => {
    selectedElements.forEach(el => {
      onElementUpdate(el.id, updates);
    });
  };

  const handlePropertyUpdate = (property: string, value: any) => {
    handleUpdate({
      properties: {
        ...element.properties,
        [property]: value
      }
    });
  };

  const handleElevationUpdate = (patch: Partial<ElevationConfig>) => {
    handleUpdate({
      elevation: mergeElevation(element.elevation, patch)
    });
  };

  const { baseZ, extrusionHeight, topZ } = getElevationValues(element);

  /** Edit plan sizes in centimeters (renovation-friendly). */
  const editUnit = 'cm' as const;
  const pxToEdit = (px: number) =>
    Math.round(convertUnit(pixelsToUnit(px, scale), scale.unit, editUnit) * 10) / 10;
  const editToPx = (value: number) => unitToPixels(value, editUnit, scale);

  return (
    <div className="bg-dark-secondary/50 backdrop-blur-sm border border-white/10 rounded-xl p-4 space-y-4">
      <h3 className="text-lg font-bold text-white mb-4">
        Eigenschappen {isMultiple && `(${selectedElements.length})`}
      </h3>

      {/* Name */}
      <div>
        <label className="block text-white/80 text-sm font-medium mb-2">Naam</label>
        <input
          type="text"
          value={element.name}
          onChange={(e) => handleUpdate({ name: e.target.value })}
          className="w-full px-3 py-2 bg-dark-bg border border-white/20 rounded-lg text-white text-sm focus:border-neon-green focus:outline-none focus:ring-2 focus:ring-neon-green/20 transition-all"
          disabled={isMultiple}
        />
      </div>

      {/* Position (cm) */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">X (cm)</label>
          <input
            type="number"
            step="1"
            value={pxToEdit(element.x)}
            onChange={(e) => handleUpdate({ x: editToPx(parseFloat(e.target.value) || 0) })}
            className="w-full px-3 py-2 bg-dark-bg border border-white/20 rounded-lg text-white text-sm focus:border-neon-green focus:outline-none focus:ring-2 focus:ring-neon-green/20 transition-all"
          />
        </div>
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">Y (cm)</label>
          <input
            type="number"
            step="1"
            value={pxToEdit(element.y)}
            onChange={(e) => handleUpdate({ y: editToPx(parseFloat(e.target.value) || 0) })}
            className="w-full px-3 py-2 bg-dark-bg border border-white/20 rounded-lg text-white text-sm focus:border-neon-green focus:outline-none focus:ring-2 focus:ring-neon-green/20 transition-all"
          />
        </div>
      </div>

      {/* Size (cm) */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">Breedte (cm)</label>
          <input
            type="number"
            step="1"
            value={pxToEdit(element.width)}
            onChange={(e) => handleUpdate({ width: Math.max(editToPx(0.1), editToPx(parseFloat(e.target.value) || 0)) })}
            className="w-full px-3 py-2 bg-dark-bg border border-white/20 rounded-lg text-white text-sm focus:border-neon-green focus:outline-none focus:ring-2 focus:ring-neon-green/20 transition-all"
            min="1"
          />
        </div>
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">Diepte (cm)</label>
          <input
            type="number"
            step="1"
            value={pxToEdit(element.height)}
            onChange={(e) => handleUpdate({ height: Math.max(editToPx(0.1), editToPx(parseFloat(e.target.value) || 0)) })}
            className="w-full px-3 py-2 bg-dark-bg border border-white/20 rounded-lg text-white text-sm focus:border-neon-green focus:outline-none focus:ring-2 focus:ring-neon-green/20 transition-all"
            min="1"
          />
        </div>
      </div>

      {/* Dimensions Display */}
      {!isMultiple && <DimensionDisplay element={element} scale={scale} />}

      {element.properties.isWall && !isMultiple && (
        <div className="rounded-lg border border-white/10 bg-dark-bg/40 px-3 py-2 text-sm text-white/70">
          Muur · dikte{' '}
          <span className="text-neon-green font-medium">
            {element.properties.wallThicknessCm ?? 20} cm
          </span>
        </div>
      )}

      {element.properties.isRoom && !isMultiple && (
        <div className="rounded-lg border border-indigo-400/30 bg-indigo-500/10 px-3 py-2 text-sm text-white/80">
          Kamer · oppervlakte via afmetingen hierboven (m²)
        </div>
      )}

      {element.properties.isOpening && !isMultiple && (
        <div className="rounded-lg border border-white/10 bg-dark-bg/40 px-3 py-2 space-y-2">
          <div className="text-sm text-white/70">
            {element.properties.openingKind === 'window' ? 'Raam' : 'Deur'} ·{' '}
            <span className="text-neon-green font-medium">
              {element.properties.openingWidthCm ?? '—'} cm breed
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-white/60 text-xs mb-1">Dorpel (cm)</label>
              <input
                type="number"
                min={0}
                max={300}
                step={1}
                value={element.properties.openingSillCm ?? Math.round((element.elevation?.baseZ ?? 0) * 100)}
                onChange={(e) => {
                  const sill = Math.max(0, parseFloat(e.target.value) || 0);
                  const height =
                    element.properties.openingHeightCm ??
                    Math.round((element.elevation?.extrusionHeight ?? 1.2) * 100);
                  const next = applyOpeningElevation(element, sill, height);
                  onElementUpdate(element.id, {
                    elevation: next.elevation,
                    properties: next.properties
                  });
                }}
                className="w-full px-2 py-1.5 bg-dark-bg border border-white/20 rounded text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-white/60 text-xs mb-1">Hoogte (cm)</label>
              <input
                type="number"
                min={30}
                max={300}
                step={1}
                value={
                  element.properties.openingHeightCm ??
                  Math.round((element.elevation?.extrusionHeight ?? 1.2) * 100)
                }
                onChange={(e) => {
                  const height = Math.max(30, parseFloat(e.target.value) || 120);
                  const sill =
                    element.properties.openingSillCm ??
                    Math.round((element.elevation?.baseZ ?? 0) * 100);
                  const next = applyOpeningElevation(element, sill, height);
                  onElementUpdate(element.id, {
                    elevation: next.elevation,
                    properties: next.properties
                  });
                }}
                className="w-full px-2 py-1.5 bg-dark-bg border border-white/20 rounded text-white text-sm"
              />
            </div>
          </div>
          <p className="text-[10px] text-white/40">
            Tip: plaats/pas dorpel ook in gevel (Noord/Zuid/West/Oost) met Deur/Raam-tool
          </p>
        </div>
      )}

      {/* Elevation (3D / SketchUp push-pull) */}
      {!isMultiple && (
        <div className="rounded-lg border border-white/10 bg-dark-bg/40 p-3 space-y-3">
          <div className="flex items-center gap-2 text-white font-medium text-sm">
            <ArrowUpFromLine className="w-4 h-4 text-neon-green" />
            Hoogte &amp; diepte
          </div>
          <p className="text-xs text-white/40">
            Peil t.o.v. grond (0). Schaduw op plan = extrusie-hint.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-white/80 text-xs font-medium mb-1">Peil (Z)</label>
              <input
                type="number"
                step="0.05"
                value={baseZ}
                onChange={(e) =>
                  handleElevationUpdate({ baseZ: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-2 py-1.5 bg-dark-bg border border-white/20 rounded-lg text-white text-sm focus:border-neon-green focus:outline-none"
              />
              <span className="text-[10px] text-white/40">m · {formatElevationMeters(baseZ)}</span>
            </div>
            <div>
              <label className="block text-white/80 text-xs font-medium mb-1">Extrusie (H)</label>
              <input
                type="number"
                step="0.05"
                min="0"
                value={extrusionHeight}
                onChange={(e) =>
                  handleElevationUpdate({
                    extrusionHeight: Math.max(0, parseFloat(e.target.value) || 0)
                  })
                }
                className="w-full px-2 py-1.5 bg-dark-bg border border-white/20 rounded-lg text-white text-sm focus:border-neon-green focus:outline-none"
              />
              <span className="text-[10px] text-white/40">m · top {formatElevationMeters(topZ)}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ELEVATION_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleUpdate({ elevation: { ...preset.elevation } })}
                className="px-2 py-1 text-[10px] rounded border border-white/15 text-white/70 hover:border-neon-green/40 hover:text-neon-green transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Rotation */}
      <div>
        <label className="block text-white/80 text-sm font-medium mb-2">
          Rotatie: {element.rotation || 0}°
        </label>
        <input
          type="range"
          min="0"
          max="360"
          value={element.rotation || 0}
          onChange={(e) => handleUpdate({ rotation: parseFloat(e.target.value) })}
          className="w-full"
        />
      </div>

      {/* Colors */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">Vulkleur</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={element.properties.fillColor || '#00ff88'}
              onChange={(e) => handlePropertyUpdate('fillColor', e.target.value)}
              className="w-12 h-10 rounded border border-white/20 cursor-pointer"
            />
            <input
              type="text"
              value={element.properties.fillColor || '#00ff88'}
              onChange={(e) => handlePropertyUpdate('fillColor', e.target.value)}
              className="flex-1 px-3 py-2 bg-dark-bg border border-white/20 rounded-lg text-white text-sm focus:border-neon-green focus:outline-none focus:ring-2 focus:ring-neon-green/20 transition-all"
            />
          </div>
        </div>
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">Lijnkleur</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={element.properties.strokeColor || '#00ff88'}
              onChange={(e) => handlePropertyUpdate('strokeColor', e.target.value)}
              className="w-12 h-10 rounded border border-white/20 cursor-pointer"
            />
            <input
              type="text"
              value={element.properties.strokeColor || '#00ff88'}
              onChange={(e) => handlePropertyUpdate('strokeColor', e.target.value)}
              className="flex-1 px-3 py-2 bg-dark-bg border border-white/20 rounded-lg text-white text-sm focus:border-neon-green focus:outline-none focus:ring-2 focus:ring-neon-green/20 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Stroke Width */}
      <div>
        <label className="block text-white/80 text-sm font-medium mb-2">
          Lijndikte: {element.properties.strokeWidth || 2}px
        </label>
        <input
          type="range"
          min="1"
          max="20"
          value={element.properties.strokeWidth || 2}
          onChange={(e) => handlePropertyUpdate('strokeWidth', parseFloat(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Contour elevation */}
      {element.properties.isContour && !isMultiple && (
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">Hoogtelijn (m)</label>
          <input
            type="number"
            step="0.1"
            value={element.properties.contourElevation ?? 0}
            onChange={(e) =>
              handlePropertyUpdate('contourElevation', parseFloat(e.target.value) || 0)
            }
            className="w-full px-3 py-2 bg-dark-bg border border-amber-500/30 rounded-lg text-white text-sm focus:border-amber-400 focus:outline-none"
          />
          <p className="text-xs text-amber-400/70 mt-1">
            Vormt terrein in 3D-view (Sandbox-from-contours)
          </p>
        </div>
      )}

      {/* Ground zone (Platte Grond) */}
      {isGroundZone && !isMultiple && (
        <>
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Zone naam</label>
            <input
              type="text"
              value={element.properties.zoneName || ''}
              onChange={(e) => handlePropertyUpdate('zoneName', e.target.value)}
              placeholder="bv. Moestuin zuid"
              className="w-full px-3 py-2 bg-dark-bg border border-white/20 rounded-lg text-white text-sm focus:border-neon-green focus:outline-none focus:ring-2 focus:ring-neon-green/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Zon</label>
            <select
              value={element.properties.sunExposure || ''}
              onChange={(e) =>
                handlePropertyUpdate('sunExposure', (e.target.value || undefined) as SunExposure | undefined)
              }
              className="w-full px-3 py-2 bg-dark-bg border border-white/20 rounded-lg text-white text-sm focus:border-neon-green focus:outline-none focus:ring-2 focus:ring-neon-green/20 transition-all"
            >
              <option value="">—</option>
              <option value="full">Volle zon</option>
              <option value="partial">Halfschaduw</option>
              <option value="shade">Schaduw</option>
            </select>
          </div>
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Bodem</label>
            <select
              value={element.properties.soilType || ''}
              onChange={(e) =>
                handlePropertyUpdate('soilType', (e.target.value || undefined) as SoilType | undefined)
              }
              className="w-full px-3 py-2 bg-dark-bg border border-white/20 rounded-lg text-white text-sm focus:border-neon-green focus:outline-none focus:ring-2 focus:ring-neon-green/20 transition-all"
            >
              <option value="">—</option>
              <option value="leem">Leem</option>
              <option value="zand">Zand</option>
              <option value="klei">Klei</option>
              <option value="compost">Compost</option>
              <option value="mix">Mix</option>
            </select>
          </div>
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Notities</label>
            <textarea
              value={element.properties.zoneNotes || ''}
              onChange={(e) => handlePropertyUpdate('zoneNotes', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-dark-bg border border-white/20 rounded-lg text-white text-sm focus:border-neon-green focus:outline-none focus:ring-2 focus:ring-neon-green/20 transition-all resize-none"
            />
          </div>
        </>
      )}

      {/* Catalog plant info */}
      {catalogEntry && !isMultiple && (
        <div className="rounded-lg border border-neon-green/20 bg-neon-green/5 p-3 space-y-1 text-xs text-white/70">
          <div className="font-medium text-neon-green">{catalogEntry.name}</div>
          <div>Zon: {formatSunLabel(catalogEntry.sun)}</div>
          {catalogEntry.sowOutdoorsWeeks && (
            <div>Zaai buiten: week {catalogEntry.sowOutdoorsWeeks}</div>
          )}
          {catalogEntry.harvestWindow && <div>Oogst: {catalogEntry.harvestWindow}</div>}
          {getSowHint(catalogEntry) && (
            <div className="text-neon-green font-medium">{getSowHint(catalogEntry)}</div>
          )}
        </div>
      )}

      {/* Type-specific properties */}
      {element.properties.plantType && (
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">Plant Type</label>
          <select
            value={element.properties.plantType}
            onChange={(e) => handlePropertyUpdate('plantType', e.target.value)}
            className="w-full px-3 py-2 bg-dark-bg border border-white/20 rounded-lg text-white text-sm focus:border-neon-green focus:outline-none focus:ring-2 focus:ring-neon-green/20 transition-all"
          >
            <option value="houseplant">Huisplant</option>
            <option value="vegetable">Groente</option>
            <option value="perennial">Vaste Plant</option>
            <option value="climber">Klimmer</option>
            <option value="grass">Gras</option>
            <option value="mulch">Mulch</option>
          </select>
        </div>
      )}

      {element.properties.waterType && (
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">Water Type</label>
          <select
            value={element.properties.waterType}
            onChange={(e) => handlePropertyUpdate('waterType', e.target.value)}
            className="w-full px-3 py-2 bg-dark-bg border border-white/20 rounded-lg text-white text-sm focus:border-neon-green focus:outline-none focus:ring-2 focus:ring-neon-green/20 transition-all"
          >
            <option value="pipe">Leiding</option>
            <option value="channel">Kanaal</option>
            <option value="pond">Vijver</option>
          </select>
        </div>
      )}

      {/* Lock/Unlock */}
      <div>
        <button
          onClick={() => handleUpdate({ locked: !element.locked })}
          className={`w-full px-4 py-2 rounded-lg border transition-all duration-300 flex items-center justify-center gap-2 ${
            element.locked
              ? 'bg-red-500/20 border-red-500/50 text-red-400'
              : 'bg-neon-green/20 border-neon-green/50 text-neon-green'
          }`}
        >
          {element.locked ? (
            <>
              <Lock className="w-4 h-4" />
              Vergrendeld
            </>
          ) : (
            <>
              <Unlock className="w-4 h-4" />
              Ontgrendeld
            </>
          )}
        </button>
      </div>
    </div>
  );
};
