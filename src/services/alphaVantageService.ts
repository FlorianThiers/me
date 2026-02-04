import { ALPHA_VANTAGE_CONFIG } from '../config/alphaVantage';

export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  previousClose?: number;
}

export interface CurrencyRate {
  from: string;
  to: string;
  rate: number;
  change?: number;
  changePercent?: number;
}

// Rate limiting
let lastCallTime = 0;

// Daily quota tracking
interface DailyQuota {
  date: string;
  count: number;
}

const QUOTA_KEY = 'alpha_vantage_daily_quota';
const MAX_DAILY_CALLS = 25; // Free tier limit

/**
 * Check if daily quota is available
 * Returns true if quota is available, false if exhausted
 */
const checkDailyQuota = (): boolean => {
  const today = new Date().toDateString();
  const stored = localStorage.getItem(QUOTA_KEY);
  
  if (stored) {
    const quota: DailyQuota = JSON.parse(stored);
    if (quota.date === today) {
      if (quota.count >= MAX_DAILY_CALLS) {
        console.warn(`Daily quota reached (${MAX_DAILY_CALLS} calls). Using cached data or alternative API.`);
        return false; // Quota exceeded
      }
      return true; // Can make more calls
    }
  }
  
  // New day, reset quota
  localStorage.setItem(QUOTA_KEY, JSON.stringify({ date: today, count: 0 }));
  return true;
};

/**
 * Increment daily quota counter after successful API call
 */
const incrementDailyQuota = (): void => {
  const today = new Date().toDateString();
  const stored = localStorage.getItem(QUOTA_KEY);
  
  if (stored) {
    const quota: DailyQuota = JSON.parse(stored);
    if (quota.date === today) {
      quota.count++;
      localStorage.setItem(QUOTA_KEY, JSON.stringify(quota));
    } else {
      // New day
      localStorage.setItem(QUOTA_KEY, JSON.stringify({ date: today, count: 1 }));
    }
  } else {
    localStorage.setItem(QUOTA_KEY, JSON.stringify({ date: today, count: 1 }));
  }
};

/**
 * Get remaining quota for today
 * Returns number of API calls remaining (0-25)
 */
export const getRemainingQuota = (): number => {
  const today = new Date().toDateString();
  const stored = localStorage.getItem(QUOTA_KEY);
  
  if (stored) {
    const quota: DailyQuota = JSON.parse(stored);
    if (quota.date === today) {
      return Math.max(0, MAX_DAILY_CALLS - quota.count);
    }
  }
  
  return MAX_DAILY_CALLS;
};

const waitForRateLimit = (): Promise<void> => {
  return new Promise((resolve) => {
    const now = Date.now();
    const timeSinceLastCall = now - lastCallTime;
    
    if (timeSinceLastCall >= ALPHA_VANTAGE_CONFIG.RATE_LIMIT_DELAY) {
      lastCallTime = now;
      resolve();
    } else {
      const waitTime = ALPHA_VANTAGE_CONFIG.RATE_LIMIT_DELAY - timeSinceLastCall;
      setTimeout(() => {
        lastCallTime = Date.now();
        resolve();
      }, waitTime);
    }
  });
};

const makeAPICall = async <T>(params: Record<string, string>): Promise<T> => {
  if (!ALPHA_VANTAGE_CONFIG.API_KEY) {
    throw new Error('Alpha Vantage API key not configured. Please add VITE_ALPHA_VANTAGE_API_KEY to your .env file');
  }

  // Check daily quota before making the call
  if (!checkDailyQuota()) {
    throw new Error('Daily API quota exceeded. Please try again tomorrow or use cached data.');
  }

  // Wait for rate limit before making the call
  console.log('Waiting for rate limit...');
  await waitForRateLimit();
  console.log('Rate limit passed, making API call...');

  const queryParams = new URLSearchParams({
    ...params,
    apikey: ALPHA_VANTAGE_CONFIG.API_KEY,
  });

  const url = `${ALPHA_VANTAGE_CONFIG.BASE_URL}?${queryParams.toString()}`;
  console.log('API Call URL:', url.replace(ALPHA_VANTAGE_CONFIG.API_KEY, '***'));
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('API Response:', data);
    
    // Check for rate limit/quota exceeded message
    if (data['Information'] && typeof data['Information'] === 'string' && data['Information'].includes('rate limit')) {
      // Quota exceeded, mark it
      const today = new Date().toDateString();
      localStorage.setItem(QUOTA_KEY, JSON.stringify({ 
        date: today, 
        count: MAX_DAILY_CALLS 
      }));
      throw new Error('Daily API quota exceeded. Please try again tomorrow.');
    }
    
    // Alpha Vantage returns error messages in the response
    if (data['Error Message']) {
      throw new Error(data['Error Message']);
    }
    
    if (data['Note']) {
      throw new Error('API call frequency limit reached. Please wait a minute.');
    }

    // Only increment quota on successful calls (no error messages)
    incrementDailyQuota();
    return data as T;
  } catch (error: any) {
    console.error('API Call Error:', error);
    throw error;
  }
};

/**
 * Get real-time stock quote
 */
export const getStockQuote = async (symbol: string): Promise<StockQuote> => {
  try {
    const data = await makeAPICall<{
      'Global Quote': {
        '01. symbol': string;
        '05. price': string;
        '09. change': string;
        '10. change percent': string;
        '08. previous close'?: string;
      };
    }>({
      function: 'GLOBAL_QUOTE',
      symbol: symbol,
    });

    const quote = data['Global Quote'];
    if (!quote) {
      throw new Error(`No data returned for symbol ${symbol}`);
    }

    const price = parseFloat(quote['05. price']);
    const change = parseFloat(quote['09. change']);
    const changePercentStr = quote['10. change percent'].replace('%', '');
    const changePercent = parseFloat(changePercentStr);
    const previousClose = quote['08. previous close'] 
      ? parseFloat(quote['08. previous close']) 
      : price - change;

    return {
      symbol: quote['01. symbol'],
      price,
      change,
      changePercent,
      previousClose,
    };
  } catch (error) {
    console.error(`Error fetching stock quote for ${symbol}:`, error);
    throw error;
  }
};

/**
 * Get currency exchange rate (for gold: XAU/USD)
 */
export const getCurrencyRate = async (fromCurrency: string, toCurrency: string): Promise<CurrencyRate> => {
  try {
    const data = await makeAPICall<{
      'Realtime Currency Exchange Rate': {
        '1. From_Currency Code': string;
        '3. To_Currency Code': string;
        '5. Exchange Rate': string;
        '8. Bid Price': string;
        '9. Ask Price': string;
      };
    }>({
      function: 'CURRENCY_EXCHANGE_RATE',
      from_currency: fromCurrency,
      to_currency: toCurrency,
    });

    const rate = data['Realtime Currency Exchange Rate'];
    if (!rate) {
      throw new Error(`No data returned for ${fromCurrency}/${toCurrency}`);
    }

    const exchangeRate = parseFloat(rate['5. Exchange Rate']);
    
    // Calculate change (simplified - in production you'd want to track previous values)
    const bidPrice = parseFloat(rate['8. Bid Price']);
    const askPrice = parseFloat(rate['9. Ask Price']);
    const midPrice = (bidPrice + askPrice) / 2;
    const change = midPrice - exchangeRate;
    const changePercent = (change / exchangeRate) * 100;

    return {
      from: rate['1. From_Currency Code'],
      to: rate['3. To_Currency Code'],
      rate: exchangeRate,
      change,
      changePercent,
    };
  } catch (error) {
    console.error(`Error fetching currency rate for ${fromCurrency}/${toCurrency}:`, error);
    throw error;
  }
};

/**
 * Get daily time series data (for historical data)
 */
export const getDailyTimeSeries = async (symbol: string, outputsize: 'compact' | 'full' = 'compact') => {
  try {
    const data = await makeAPICall<{
      'Meta Data': {
        '2. Symbol': string;
        '3. Last Refreshed': string;
        '4. Output Size': string;
        '5. Time Zone': string;
      };
      'Time Series (Daily)': Record<string, {
        '1. open': string;
        '2. high': string;
        '3. low': string;
        '4. close': string;
        '5. volume': string;
      }>;
    }>({
      function: 'TIME_SERIES_DAILY',
      symbol: symbol,
      outputsize: outputsize,
    });

    return data;
  } catch (error) {
    console.error(`Error fetching time series for ${symbol}:`, error);
    throw error;
  }
};

/**
 * Batch fetch multiple stock quotes with rate limiting
 */
export const getMultipleStockQuotes = async (symbols: string[]): Promise<StockQuote[]> => {
  const results: StockQuote[] = [];
  
  for (const symbol of symbols) {
    try {
      await waitForRateLimit();
      const quote = await getStockQuote(symbol);
      results.push(quote);
    } catch (error) {
      console.error(`Failed to fetch ${symbol}:`, error);
      // Continue with other symbols even if one fails
    }
  }
  
  return results;
};
