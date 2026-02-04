import React, { useState } from 'react';
import type { LibraryItem, LibraryCategory } from '../../types/gardenDesigner';
import { libraryItems } from '../../data/libraryItems';
import { Search, Leaf, Home, Droplets, Square } from 'lucide-react';

interface ObjectLibraryProps {
  onItemSelect: (item: LibraryItem) => void;
}

const categories: Array<{ type: LibraryCategory; label: string; icon: React.ReactNode }> = [
  { type: 'plants', label: 'Planten', icon: <Leaf className="w-4 h-4" /> },
  { type: 'furniture', label: 'Meubels', icon: <Home className="w-4 h-4" /> },
  { type: 'building', label: 'Bouw', icon: <Square className="w-4 h-4" /> },
  { type: 'water', label: 'Water', icon: <Droplets className="w-4 h-4" /> },
  { type: 'foundation', label: 'Fundering', icon: <Square className="w-4 h-4" /> }
];

export const ObjectLibrary: React.FC<ObjectLibraryProps> = ({ onItemSelect }) => {
  const [selectedCategory, setSelectedCategory] = useState<LibraryCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = libraryItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleItemClick = (item: LibraryItem) => {
    onItemSelect(item);
  };

  return (
    <div className="bg-dark-secondary/50 backdrop-blur-sm border border-white/10 rounded-xl p-4">
      <h3 className="text-lg font-bold text-white mb-4">Object Bibliotheek</h3>
      
      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Zoeken..."
            className="w-full pl-10 pr-4 py-2 bg-dark-bg border border-white/20 rounded-lg text-white text-sm placeholder-white/50 focus:border-neon-green focus:outline-none focus:ring-2 focus:ring-neon-green/20 transition-all"
          />
        </div>
      </div>

      {/* Categories */}
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

      {/* Items Grid */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {filteredItems.length === 0 ? (
          <p className="text-white/40 text-sm text-center py-4">
            Geen objecten gevonden
          </p>
        ) : (
          filteredItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
              className="w-full p-3 bg-dark-bg border border-white/10 rounded-lg hover:border-neon-green/50 hover:bg-white/5 transition-all duration-300 text-left flex items-center gap-3"
            >
              <span className="text-2xl">{item.icon}</span>
              <div className="flex-1">
                <div className="text-white text-sm font-medium">{item.name}</div>
                <div className="text-white/40 text-xs">
                  {categories.find(c => c.type === item.category)?.label}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};
