export type ToolType = 'select' | 'rectangle' | 'circle' | 'line' | 'polygon' | 'freehand';
export type LayerType = 'ground' | 'building' | 'plants' | 'water';
export type PlantType = 'houseplant' | 'vegetable' | 'perennial' | 'climber' | 'grass' | 'mulch';
export type WaterType = 'pipe' | 'channel' | 'pond';
export type ElementType = 'rectangle' | 'circle' | 'line' | 'polygon' | 'freehand' | 'library-item';
export type LibraryCategory = 'plants' | 'furniture' | 'building' | 'water' | 'foundation';
export type Unit = 'mm' | 'cm' | 'm' | 'km';
export type DisplayFormat = 'auto' | 'mm' | 'cm' | 'm';

export interface ScaleConfig {
  pixelsPerUnit: number;  // Bijv. 10 (1 pixel = 10cm)
  unit: Unit;
  displayFormat: DisplayFormat; // Auto kiest beste eenheid
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
  defaultSize: { width: number; height: number };
  defaultLayer: LayerType;
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
}
