import { useEffect, useState } from 'react';
import type { LibraryItem } from '../types/gardenDesigner';
import type { PlantCatalogData } from '../types/plantCatalog';
import { mergeLibraryItems } from '../utils/plantCatalog';
import { fetchPrivateJson } from '../lib/privateFetch';

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
      const result = await fetchPrivateJson<PlantCatalogData>('/api/private/plant-catalog');
      if (cancelled) return;
      if (result.ok) {
        setCatalog(result.data);
        setError(null);
      } else if (result.status === 401) {
        setError('Unauthorized');
      } else {
        setError('Catalog load failed');
      }
      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return {
    catalog,
    libraryItems: mergeLibraryItems(catalog),
    loading,
    error,
  };
}
