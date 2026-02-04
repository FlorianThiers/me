import { FRED_CONFIG } from '../config/fred';

export interface InflationData {
  date: string;
  value: number;
}

/**
 * Get inflation rate from FRED API
 * Uses CPIAUCSL (CPI Index) and calculates year-over-year percentage change
 */
export const getInflationRate = async (): Promise<number | null> => {
  if (!FRED_CONFIG.API_KEY) {
    console.warn('FRED API key not configured. Using default inflation rate.');
    return null;
  }

  try {
    // Use proxy in development to avoid CORS issues
    const baseUrl = import.meta.env.DEV 
      ? '/api/fred' 
      : FRED_CONFIG.BASE_URL;
    
    // Get latest 13 months of CPI data to calculate year-over-year change
    const url = `${baseUrl}/series/observations?series_id=CPIAUCSL&api_key=${FRED_CONFIG.API_KEY}&file_type=json&limit=13&sort_order=desc`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`FRED API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.observations && data.observations.length >= 13) {
      // Get current and year-ago CPI values
      const current = parseFloat(data.observations[0].value);
      const yearAgo = parseFloat(data.observations[12].value);
      
      if (!isNaN(current) && !isNaN(yearAgo) && yearAgo > 0) {
        // Calculate year-over-year inflation rate
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
  if (!FRED_CONFIG.API_KEY) {
    return [];
  }

  try {
    // Use proxy in development to avoid CORS issues
    const baseUrl = import.meta.env.DEV 
      ? '/api/fred' 
      : FRED_CONFIG.BASE_URL;
    
    // Get enough data to calculate year-over-year changes (need 12 extra months)
    const url = `${baseUrl}/series/observations?series_id=CPIAUCSL&api_key=${FRED_CONFIG.API_KEY}&file_type=json&limit=${(years + 1) * 12}&sort_order=desc`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`FRED API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.observations && data.observations.length >= 13) {
      // Group observations by year (using December of each year)
      const observations = data.observations
        .filter((obs: any) => obs.value !== '.')
        .map((obs: any) => ({
          date: obs.date,
          value: parseFloat(obs.value),
        }))
        .reverse(); // Oldest first
      
      // Calculate year-over-year inflation for each year
      const inflationRates: InflationData[] = [];
      const yearlyData: { [year: string]: number } = {};
      
      // Group by year, taking the last month of each year (December)
      observations.forEach((obs: InflationData) => {
        const year = obs.date.substring(0, 4);
        const month = obs.date.substring(5, 7);
        
        // Only use December values for annual calculation
        if (month === '12' || !yearlyData[year]) {
          yearlyData[year] = obs.value;
        }
      });
      
      // Calculate year-over-year inflation
      const years = Object.keys(yearlyData).sort();
      for (let i = 1; i < years.length; i++) {
        const currentYear = years[i];
        const previousYear = years[i - 1];
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
