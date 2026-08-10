import type { LibraryItem } from '../types/gardenDesigner';

/** Non-plant library items (furniture, building, water). Plants come from plant-catalog.json */
export const staticLibraryItems: LibraryItem[] = [
  {
    id: 'table',
    name: 'Tafel',
    category: 'furniture',
    icon: '🪑',
    defaultLayer: 'building',
    defaultSize: { width: 80, height: 80 },
    defaultProperties: {
      fillColor: '#78716c',
      strokeColor: '#57534e',
      strokeWidth: 2,
      furnitureType: 'table'
    }
  },
  {
    id: 'chair',
    name: 'Stoel',
    category: 'furniture',
    icon: '💺',
    defaultLayer: 'building',
    defaultSize: { width: 40, height: 50 },
    defaultProperties: {
      fillColor: '#78716c',
      strokeColor: '#57534e',
      strokeWidth: 2,
      furnitureType: 'chair'
    }
  },
  {
    id: 'sofa',
    name: 'Bank',
    category: 'furniture',
    icon: '🛋️',
    defaultLayer: 'building',
    defaultSize: { width: 120, height: 60 },
    defaultProperties: {
      fillColor: '#a78bfa',
      strokeColor: '#8b5cf6',
      strokeWidth: 2,
      furnitureType: 'sofa'
    }
  },
  {
    id: 'bed',
    name: 'Bed',
    category: 'furniture',
    icon: '🛏️',
    defaultLayer: 'building',
    defaultSize: { width: 100, height: 140 },
    defaultProperties: {
      fillColor: '#c4b5fd',
      strokeColor: '#a78bfa',
      strokeWidth: 2,
      furnitureType: 'bed'
    }
  },
  // Building
  {
    id: 'wall',
    name: 'Muur',
    category: 'building',
    icon: '🧱',
    defaultLayer: 'building',
    defaultSize: { width: 100, height: 20 },
    defaultProperties: {
      fillColor: '#d1d5db',
      strokeColor: '#9ca3af',
      strokeWidth: 2
    }
  },
  {
    id: 'door',
    name: 'Deur',
    category: 'building',
    icon: '🚪',
    defaultLayer: 'building',
    defaultSize: { width: 40, height: 80 },
    defaultProperties: {
      fillColor: '#92400e',
      strokeColor: '#78350f',
      strokeWidth: 2
    }
  },
  {
    id: 'window',
    name: 'Raam',
    category: 'building',
    icon: '🪟',
    defaultLayer: 'building',
    defaultSize: { width: 60, height: 60 },
    defaultProperties: {
      fillColor: '#bfdbfe',
      strokeColor: '#93c5fd',
      strokeWidth: 2
    }
  },
  {
    id: 'foundation',
    name: 'Fundering',
    category: 'foundation',
    icon: '⬛',
    defaultLayer: 'ground',
    defaultSize: { width: 150, height: 150 },
    defaultProperties: {
      fillColor: '#6b7280',
      strokeColor: '#4b5563',
      strokeWidth: 2,
      foundationType: 'concrete'
    }
  },
  // Water
  {
    id: 'pipe',
    name: 'Leiding',
    category: 'water',
    icon: '🔵',
    defaultLayer: 'water',
    defaultSize: { width: 80, height: 10 },
    defaultProperties: {
      fillColor: '#3b82f6',
      strokeColor: '#2563eb',
      strokeWidth: 2,
      waterType: 'pipe'
    }
  },
  {
    id: 'channel',
    name: 'Kanaal',
    category: 'water',
    icon: '💧',
    defaultLayer: 'water',
    defaultSize: { width: 100, height: 30 },
    defaultProperties: {
      fillColor: '#60a5fa',
      strokeColor: '#3b82f6',
      strokeWidth: 2,
      waterType: 'channel'
    }
  },
  {
    id: 'pond',
    name: 'Vijver',
    category: 'water',
    icon: '🌊',
    defaultLayer: 'water',
    defaultSize: { width: 120, height: 120 },
    defaultProperties: {
      fillColor: '#1e40af',
      strokeColor: '#1e3a8a',
      strokeWidth: 2,
      waterType: 'pond'
    }
  },
  {
    id: 'fountain',
    name: 'Fontein',
    category: 'water',
    icon: '⛲',
    defaultLayer: 'water',
    defaultSize: { width: 60, height: 60 },
    defaultProperties: {
      fillColor: '#3b82f6',
      strokeColor: '#2563eb',
      strokeWidth: 2,
      waterType: 'pond'
    }
  }
];

/** @deprecated Use usePlantCatalog() — plants load from plant-catalog.json */
export const libraryItems = staticLibraryItems;
