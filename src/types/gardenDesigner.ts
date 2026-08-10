export type ToolType =
  | 'select'
  | 'hand'
  | 'rectangle'
  | 'circle'
  | 'line'
  | 'polygon'
  | 'freehand'
  | 'contour'
  | 'wall'
  | 'room'
  | 'door'
  | 'window';
export type ViewMode = 'plan' | 'split' | 'iso' | 'perspective' | 'section';

/** 2D plan panel projection — top-down or facade elevations */
export type PlanProjection = 'top' | 'north' | 'south' | 'west' | 'east';
export type LayerType = 'ground' | 'building' | 'plants' | 'water';
export type PlantType = 'houseplant' | 'vegetable' | 'perennial' | 'climber' | 'grass' | 'mulch';
export type WaterType = 'pipe' | 'channel' | 'pond';
export type SunExposure = 'full' | 'partial' | 'shade';
export type SoilType = 'leem' | 'zand' | 'klei' | 'compost' | 'mix';
export type ElementType = 'rectangle' | 'circle' | 'line' | 'polygon' | 'freehand' | 'library-item';
export type LibraryCategory = 'plants' | 'furniture' | 'building' | 'water' | 'foundation';
export type Unit = 'mm' | 'cm' | 'm' | 'km';
export type DisplayFormat = 'auto' | 'mm' | 'cm' | 'm';

/** Canvas pixels that equal one `unit`. e.g. 1 + 'cm' → 1 px = 1 cm. */
export interface ScaleConfig {
  pixelsPerUnit: number;
  unit: Unit;
  displayFormat: DisplayFormat;
}

/** Canvas viewport — Figma-style, persisted in design JSON */
export interface ViewState {
  zoom: number;
  panX: number;
  panY: number;
}

/** Per-element elevation for 2.5D / 3D extrusion (Blender Z-axis, SketchUp push/pull) */
export interface ElevationConfig {
  /** Base height above ground reference (real-world units via scale) */
  baseZ?: number;
  /** Extrusion height: 0 = flat footprint, >0 = volume (wall, raised bed, tree canopy) */
  extrusionHeight?: number;
  /** Slope angle in degrees for retaining edges (landscape grading) */
  slopeDeg?: number;
}

/** Site terrain — future DEM / contour support (RhinoLands, AutoCAD grading) */
export interface TerrainConfig {
  referenceElevation: number;
  contourInterval?: number;
}

export interface DesignElement {
  id: string;
  name: string;
  type: ElementType;
  layer: LayerType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  /** Elevation above site reference (meters/cm per scale.unit) */
  elevation?: ElevationConfig;
  visible: boolean;
  locked: boolean;
  folderId?: string;
  properties: {
    fillColor?: string;
    strokeColor?: string;
    strokeWidth?: number;
    plantType?: PlantType;
    waterType?: WaterType;
    furnitureType?: string;
    foundationType?: string;
    catalogSlug?: string;
    zoneName?: string;
    sunExposure?: SunExposure;
    soilType?: SoilType;
    zoneNotes?: string;
    /** Hoogtelijn (terrain contour) */
    isContour?: boolean;
    contourElevation?: number;
    /** Wall drawn with wall tool (centerline + thickness) */
    isWall?: boolean;
    wallThicknessCm?: number;
    wallCenterline?: { x1: number; y1: number; x2: number; y2: number };
    /** Named room polygon with area label */
    isRoom?: boolean;
    /** Door/window cut into a wall */
    isOpening?: boolean;
    openingKind?: 'door' | 'window';
    openingWidthCm?: number;
    /** Sill height above floor (cm) — set from elevation click or properties */
    openingSillCm?: number;
    /** Clear opening height (cm) */
    openingHeightCm?: number;
    hostWallId?: string;
    openingT?: number;
    openingAngle?: number;
    openingCenter?: { x: number; y: number };
    openingSwing?: boolean;
    // Freehand specifiek
    path?: Array<{x: number, y: number}>;
    // Polygon specifiek
    points?: Array<{x: number, y: number}>;
    // Dimensions
    dimensions?: {
      length?: number;      // Voor lijnen (in pixels)
      width?: number;       // Voor rechthoeken (in pixels)
      height?: number;      // Voor rechthoeken (in pixels)
      diameter?: number;    // Voor cirkels (in pixels)
      area?: number;        // Oppervlakte in pixels²
      perimeter?: number;   // Omtrek in pixels
    };
    displayUnit?: Unit; // Override voor dit object
  };
}

export interface Folder {
  id: string;
  name: string;
  parentId?: string;
  visible: boolean;
  expanded: boolean;
  elementIds: string[];
}

export interface LibraryItem {
  id: string;
  name: string;
  category: LibraryCategory;
  icon: string;
  defaultProperties: Partial<DesignElement['properties']>;
  /** Footprint in centimeters; converted to canvas px via scale on place. */
  defaultSize: { width: number; height: number };
  defaultLayer: LayerType;
  catalogMeta?: {
    category?: string;
    sun?: SunExposure;
    water?: string;
    sowOutdoorsWeeks?: string | null;
    harvestWindow?: string | null;
    frostSensitive?: boolean;
  };
}

export interface DesignData {
  version: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  canvasWidth: number;
  canvasHeight: number;
  elements: DesignElement[];
  folders: Folder[];
  layerVisibility: {
    ground: boolean;
    building: boolean;
    plants: boolean;
    water: boolean;
  };
  scale: ScaleConfig;
  view?: ViewState;
  viewMode?: ViewMode;
  planProjection?: PlanProjection;
  terrain?: TerrainConfig;
}
