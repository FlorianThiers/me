import { FRED_CONFIG } from '../config/fred';

export interface InflationData {
  date: string;
  value: number;
}

function buildFredUrl(limit: number, sortOrder: 'asc' | 'desc'): string {
  const params = new URLSearchParams({
    series_id: 'CPIAUCSL',
    file_type: 'json',
    limit: String(limit),
    sort_order: sortOrder,
  });
  return `${FRED_CONFIG.PROXY_URL}?${params.toString()}`;
}

async function fetchFredObservations(limit: number, sortOrder: 'asc' | 'desc' = 'desc') {
  const url = buildFredUrl(limit, sortOrder);
  const response = await fetch(url, { credentials: 'include', cache: 'no-store' });

  if (response.status === 401) {
    throw new Error('Unauthorized. Log in to fetch inflation data.');
  }
  if (response.status === 503) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`FRED API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get inflation rate from FRED API
 * Uses CPIAUCSL (CPI Index) and calculates year-over-year percentage change
 */
export const getInflationRate = async (): Promise<number | null> => {
  try {
    const data = await fetchFredObservations(13, 'desc');
    if (!data) {
      console.warn('FRED API not configured on server. Using default inflation rate.');
      return null;
    }

    if (data.observations && data.observations.length >= 13) {
      const current = parseFloat(data.observations[0].value);
      const yearAgo = parseFloat(data.observations[12].value);

      if (!isNaN(current) && !isNaN(yearAgo) && yearAgo > 0) {
        const inflationRate = ((current - yearAgo) / yearAgo) * 100;
        console.log(`FRED CPI: Current=${current}, YearAgo=${yearAgo}, Inflation=${inflationRate.toFixed(2)}%`);
        return inflationRate;
      }
    }

    return null;
  } catch (error) {
    console.error('Error fetching inflation rate from FRED:', error);
    return null;
  }
};

/**
 * Get historical inflation data
 * Calculates year-over-year inflation rates from CPI index values
 */
export const getHistoricalInflation = async (years: number = 5): Promise<InflationData[]> => {
  try {
    const data = await fetchFredObservations((years + 1) * 12, 'desc');
    if (!data) {
      return [];
    }

    if (data.observations && data.observations.length >= 13) {
      const observations = data.observations
        .filter((obs: { value: string }) => obs.value !== '.')
        .map((obs: { date: string; value: string }) => ({
          date: obs.date,
          value: parseFloat(obs.value),
        }))
        .reverse();

      const inflationRates: InflationData[] = [];
      const yearlyData: { [year: string]: number } = {};

      observations.forEach((obs: InflationData) => {
        const year = obs.date.substring(0, 4);
        const month = obs.date.substring(5, 7);

        if (month === '12' || !yearlyData[year]) {
          yearlyData[year] = obs.value;
        }
      });

      const yearKeys = Object.keys(yearlyData).sort();
      for (let i = 1; i < yearKeys.length; i++) {
        const currentYear = yearKeys[i];
        const previousYear = yearKeys[i - 1];
        const currentCPI = yearlyData[currentYear];
        const previousCPI = yearlyData[previousYear];

        if (currentCPI && previousCPI && previousCPI > 0) {
          const inflationRate = ((currentCPI - previousCPI) / previousCPI) * 100;
          inflationRates.push({
            date: `${currentYear}-12-01`,
            value: inflationRate,
          });
        }
      }

      return inflationRates;
    }

    return [];
  } catch (error) {
    console.error('Error fetching historical inflation from FRED:', error);
    return [];
  }
};
