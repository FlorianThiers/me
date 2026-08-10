import React, { useMemo, useState } from 'react';
import type { LibraryItem, LibraryCategory } from '../../types/gardenDesigner';
import type { PlantCatalogData } from '../../types/plantCatalog';
import { formatSunLabel, getSowHint } from '../../utils/plantCatalog';
import { getCatalogBySlug } from '../../utils/plantCatalog';
import { Search, Leaf, Home, Droplets, Square, Sprout } from 'lucide-react';

interface ObjectLibraryProps {
  libraryItems: LibraryItem[];
  catalog: PlantCatalogData | null;
  loading?: boolean;
  onItemSelect: (item: LibraryItem) => void;
}

const categories: Array<{ type: LibraryCategory; label: string; icon: React.ReactNode }> = [
  { type: 'plants', label: 'Planten', icon: <Leaf className="w-4 h-4" /> },
  { type: 'furniture', label: 'Meubels', icon: <Home className="w-4 h-4" /> },
  { type: 'building', label: 'Bouw', icon: <Square className="w-4 h-4" /> },
  { type: 'water', label: 'Water', icon: <Droplets className="w-4 h-4" /> },
  { type: 'foundation', label: 'Fundering', icon: <Square className="w-4 h-4" /> }
];

export const ObjectLibrary: React.FC<ObjectLibraryProps> = ({
  libraryItems,
  catalog,
  loading = false,
  onItemSelect
}) => {
  const [selectedCategory, setSelectedCategory] = useState<LibraryCategory | 'all'>('plants');
  const [searchQuery, setSearchQuery] = useState('');

  const plantCategories = useMemo(() => {
    const set = new Set<string>();
    libraryItems
      .filter(i => i.category === 'plants')
      .forEach(i => {
        if (i.catalogMeta?.category) set.add(i.catalogMeta.category);
      });
    return Array.from(set).sort();
  }, [libraryItems]);

  const [plantFilter, setPlantFilter] = useState<string>('all');

  const filteredItems = libraryItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlantSub =
      selectedCategory !== 'plants' ||
      plantFilter === 'all' ||
      item.catalogMeta?.category === plantFilter;
    return matchesCategory && matchesSearch && matchesPlantSub;
  });

  return (
    <div className="bg-dark-secondary/50 backdrop-blur-sm border border-white/10 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Plant & object catalogus</h3>
        {catalog && (
          <span className="text-xs text-white/40" title={catalog.exportedAt}>
            {catalog.source === 'notion' ? 'Notion' : 'Seed'} · {catalog.plants.length}
          </span>
        )}
      </div>

      {loading && (
        <p className="text-white/40 text-xs mb-3">Catalogus laden…</p>
      )}

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Zoek plant of object…"
            className="w-full pl-10 pr-4 py-2 bg-dark-bg border border-white/20 rounded-lg text-white text-sm placeholder-white/50 focus:border-neon-green focus:outline-none focus:ring-2 focus:ring-neon-green/20 transition-all"
          />
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            selectedCategory === 'all'
              ? 'bg-neon-green/20 border border-neon-green/50 text-neon-green'
              : 'bg-dark-bg border border-white/10 text-white/70 hover:border-white/20'
          }`}
        >
          Alles
        </button>
        {categories.map(cat => (
          <button
            key={cat.type}
            onClick={() => setSelectedCategory(cat.type)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              selectedCategory === cat.type
                ? 'bg-neon-green/20 border border-neon-green/50 text-neon-green'
                : 'bg-dark-bg border border-white/10 text-white/70 hover:border-white/20'
            }`}
          >
            {cat.icon}
            {cat.label}
          </button>
        ))}
      </div>

      {selectedCategory === 'plants' && plantCategories.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          <button
            onClick={() => setPlantFilter('all')}
            className={`px-2 py-1 rounded text-xs ${
              plantFilter === 'all' ? 'bg-white/10 text-neon-green' : 'text-white/50'
            }`}
          >
            Alle
          </button>
          {plantCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setPlantFilter(cat)}
              className={`px-2 py-1 rounded text-xs ${
                plantFilter === cat ? 'bg-white/10 text-neon-green' : 'text-white/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-2 max-h-72 overflow-y-auto">
        {filteredItems.length === 0 ? (
          <p className="text-white/40 text-sm text-center py-4">
            Geen objecten gevonden
          </p>
        ) : (
          filteredItems.map(item => {
            const catalogEntry = getCatalogBySlug(catalog, item.id);
            const sowHint = catalogEntry ? getSowHint(catalogEntry) : null;
            return (
              <button
                key={item.id}
                onClick={() => onItemSelect(item)}
                className="w-full p-3 bg-dark-bg border border-white/10 rounded-lg hover:border-neon-green/50 hover:bg-white/5 transition-all duration-300 text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-medium truncate">{item.name}</div>
                    <div className="text-white/40 text-xs flex flex-wrap gap-x-2 gap-y-0.5">
                      {item.catalogMeta?.category && <span>{item.catalogMeta.category}</span>}
                      {item.catalogMeta?.sun && (
                        <span>{formatSunLabel(item.catalogMeta.sun)}</span>
                      )}
                      {sowHint && (
                        <span className="text-neon-green flex items-center gap-0.5">
                          <Sprout className="w-3 h-3" />
                          {sowHint}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      {catalog?.gardenCrops && catalog.gardenCrops.length > 0 && selectedCategory === 'plants' && (
        <div className="mt-4 pt-3 border-t border-white/10">
          <h4 className="text-xs font-semibold text-white/50 uppercase mb-2">Mijn teelt</h4>
          <div className="space-y-1.5">
            {catalog.gardenCrops.map(crop => (
              <div
                key={crop.id}
                className="text-xs text-white/60 px-2 py-1.5 bg-dark-bg/80 rounded border border-white/5"
              >
                <span className="text-white/80">{crop.name}</span>
                {crop.zone && <span className="text-white/40"> · {crop.zone}</span>}
                {crop.status && <span className="text-neon-green/80"> · {crop.status}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
