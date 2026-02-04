import type { StockQuote } from './alphaVantageService';

/**
 * Yahoo Finance API Service
 * No API key required, supports batch requests
 * Rate limit: ~2000 requests/hour (much more generous than Alpha Vantage)
 * 
 * Uses Yahoo Finance v8 API endpoint
 */

export interface HistoricalReturns {
  '1D': number;
  '1W': number;
  '1M': number;
  '3M': number;
  '1Y': number;
  '5Y': number;
  '10Y': number;
  '20Y': number;
  '50Y': number;
}

export interface HistoricalQuote {
  symbol: string;
  currentPrice: number;
  periodReturns: HistoricalReturns;
}

/**
 * Get single stock quote from Yahoo Finance
 */
export const getYahooStockQuote = async (symbol: string): Promise<StockQuote> => {
  try {
    // Use proxy in development to avoid CORS issues
    const baseUrl = import.meta.env.DEV 
      ? '/api/yahoo' 
      : 'https://query1.finance.yahoo.com';
    
    const url = `${baseUrl}/v8/finance/chart/${symbol}?interval=1d&range=1d`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Yahoo Finance request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
      throw new Error(`No data returned for symbol ${symbol}`);
    }

    const result = data.chart.result[0];
    const meta = result.meta;
    
    if (!meta || !meta.regularMarketPrice) {
      throw new Error(`Invalid data structure for symbol ${symbol}`);
    }

    const previousClose = meta.previousClose || meta.regularMarketPrice;
    const currentPrice = meta.regularMarketPrice;
    const change = currentPrice - previousClose;
    const changePercent = (change / previousClose) * 100;

    return {
      symbol: meta.symbol || symbol,
      price: currentPrice,
      change,
      changePercent,
      previousClose,
    };
  } catch (error) {
    console.error(`Error fetching Yahoo Finance quote for ${symbol}:`, error);
    throw error;
  }
};

/**
 * Batch fetch multiple stock quotes from Yahoo Finance
 * This is much more efficient than individual calls
 * Can fetch up to ~100 symbols in one request
 */
export const getMultipleYahooQuotes = async (symbols: string[]): Promise<StockQuote[]> => {
  if (symbols.length === 0) {
    return [];
  }

  try {
    // Use proxy in development to avoid CORS issues
    const baseUrl = import.meta.env.DEV 
      ? '/api/yahoo' 
      : 'https://query1.finance.yahoo.com';
    
    // Yahoo Finance allows multiple symbols separated by comma
    const symbolsString = symbols.join(',');
    const url = `${baseUrl}/v8/finance/chart/${symbolsString}?interval=1d&range=1d`;
    
    console.log(`Fetching ${symbols.length} symbols from Yahoo Finance in batch...`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Yahoo Finance batch request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const results: StockQuote[] = [];

    if (data.chart && data.chart.result) {
      for (const result of data.chart.result) {
        try {
          const meta = result.meta;
          
          if (!meta || !meta.regularMarketPrice) {
            console.warn(`Skipping ${meta?.symbol || 'unknown'} - invalid data structure`);
            continue;
          }

          const previousClose = meta.previousClose || meta.regularMarketPrice;
          const currentPrice = meta.regularMarketPrice;
          const change = currentPrice - previousClose;
          const changePercent = (change / previousClose) * 100;

          results.push({
            symbol: meta.symbol || 'UNKNOWN',
            price: currentPrice,
            change,
            changePercent,
            previousClose,
          });
        } catch (err) {
          console.error(`Error processing symbol in batch:`, err);
          // Continue with other symbols
        }
      }
    }

    console.log(`Successfully fetched ${results.length}/${symbols.length} symbols from Yahoo Finance`);
    return results;
  } catch (error) {
    console.error('Error fetching batch Yahoo Finance quotes:', error);
    throw error;
  }
};

/**
 * Get historical returns for multiple periods (1D, 1W, 1M, 3M, 1Y, 5Y, 10Y, 20Y, 50Y)
 * Fetches max available data (up to 50 years) to calculate all periods
 */
export const getHistoricalReturns = async (symbol: string): Promise<HistoricalQuote> => {
  try {
    // Use proxy in development to avoid CORS issues
    const baseUrl = import.meta.env.DEV 
      ? '/api/yahoo' 
      : 'https://query1.finance.yahoo.com';
    
    // Fetch max available data (Yahoo Finance supports up to max range, which is typically 50+ years)
    // Using 'max' range to get as much historical data as possible
    const url = `${baseUrl}/v8/finance/chart/${symbol}?interval=1d&range=max`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Yahoo Finance historical request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
      throw new Error(`No historical data returned for symbol ${symbol}`);
    }

    const result = data.chart.result[0];
    
    if (!result.timestamp || !result.indicators || !result.indicators.quote || !result.indicators.quote[0]) {
      throw new Error(`Invalid historical data structure for symbol ${symbol}`);
    }

    const timestamps = result.timestamp;
    const closes = result.indicators.quote[0].close;
    // const volumes = result.indicators.quote[0].volume;
    
    if (!closes || closes.length === 0) {
      throw new Error(`No price data available for symbol ${symbol}`);
    }

    const currentPrice = closes[closes.length - 1];
    const currentTimestamp = timestamps[timestamps.length - 1];
    
    // Helper function to find price at a specific time
    const findPriceAtTime = (targetTime: number): number | null => {
      // Find the closest timestamp that is <= targetTime
      for (let i = timestamps.length - 1; i >= 0; i--) {
        if (timestamps[i] <= targetTime) {
          // Find the last valid close price before or at this timestamp
          for (let j = i; j >= 0; j--) {
            if (closes[j] !== null && closes[j] !== undefined && !isNaN(closes[j])) {
              return closes[j];
            }
          }
        }
      }
      // Fallback to first valid price
      for (let i = 0; i < closes.length; i++) {
        if (closes[i] !== null && closes[i] !== undefined && !isNaN(closes[i])) {
          return closes[i];
        }
      }
      return null;
    };

    // Calculate time deltas in seconds
    const now = currentTimestamp;
    const oneDayAgo = now - 86400; // 1 day in seconds
    const oneWeekAgo = now - 604800; // 7 days
    const oneMonthAgo = now - 2592000; // 30 days
    const threeMonthsAgo = now - 7776000; // 90 days
    const oneYearAgo = now - 31536000; // 365 days
    const fiveYearsAgo = now - 157680000; // 5 years
    const tenYearsAgo = now - 315360000; // 10 years
    const twentyYearsAgo = now - 630720000; // 20 years
    const fiftyYearsAgo = now - 1576800000; // 50 years

    // Get prices at different time points
    const price1D = findPriceAtTime(oneDayAgo);
    const price1W = findPriceAtTime(oneWeekAgo);
    const price1M = findPriceAtTime(oneMonthAgo);
    const price3M = findPriceAtTime(threeMonthsAgo);
    const price1Y = findPriceAtTime(oneYearAgo);
    const price5Y = findPriceAtTime(fiveYearsAgo);
    const price10Y = findPriceAtTime(tenYearsAgo);
    const price20Y = findPriceAtTime(twentyYearsAgo);
    const price50Y = findPriceAtTime(fiftyYearsAgo);

    // Calculate percentage returns
    const calculateReturn = (oldPrice: number | null): number => {
      if (!oldPrice || oldPrice === 0 || isNaN(oldPrice)) return 0;
      return ((currentPrice - oldPrice) / oldPrice) * 100;
    };

    const periodReturns: HistoricalReturns = {
      '1D': calculateReturn(price1D),
      '1W': calculateReturn(price1W),
      '1M': calculateReturn(price1M),
      '3M': calculateReturn(price3M),
      '1Y': calculateReturn(price1Y),
      '5Y': calculateReturn(price5Y),
      '10Y': calculateReturn(price10Y),
      '20Y': calculateReturn(price20Y),
      '50Y': calculateReturn(price50Y),
    };

    return {
      symbol: result.meta?.symbol || symbol,
      currentPrice,
      periodReturns,
    };
  } catch (error) {
    console.error(`Error fetching historical returns for ${symbol}:`, error);
    throw error;
  }
};

/**
 * Batch fetch historical returns for multiple symbols
 */
export const getMultipleHistoricalReturns = async (symbols: string[]): Promise<HistoricalQuote[]> => {
  const results: HistoricalQuote[] = [];
  
  // Fetch individually to avoid URL length issues
  for (const symbol of symbols) {
    try {
      const historical = await getHistoricalReturns(symbol);
      results.push(historical);
    } catch (error) {
      console.error(`Failed to fetch historical data for ${symbol}:`, error);
      // Continue with other symbols
    }
  }
  
  return results;
};
