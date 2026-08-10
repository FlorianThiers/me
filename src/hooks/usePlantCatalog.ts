import { useEffect, useState } from 'react';
import type { LibraryItem } from '../types/gardenDesigner';
import type { PlantCatalogData } from '../types/plantCatalog';
import { mergeLibraryItems } from '../utils/plantCatalog';

interface UsePlantCatalogResult {
  catalog: PlantCatalogData | null;
  libraryItems: LibraryItem[];
  loading: boolean;
  error: string | null;
}

export function usePlantCatalog(): UsePlantCatalogResult {
  const [catalog, setCatalog] = useState<PlantCatalogData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch('/data/plant-catalog.json');
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = (await res.json()) as PlantCatalogData;
        if (!cancelled) {
          setCatalog(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setCatalog(null);
          setError(err instanceof Error ? err.message : 'Catalogus laden mislukt');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return {
    catalog,
    libraryItems: mergeLibraryItems(catalog),
    loading,
    error
  };
}
