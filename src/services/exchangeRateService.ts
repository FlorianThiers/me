import { EXCHANGE_RATE_CONFIG } from '../config/exchangeRate';

export interface ExchangeRate {
  base: string;
  target: string;
  rate: number;
}

/**
 * Get exchange rate between two currencies
 * Free tier: No API key needed, 1,500 requests/month
 */
export const getExchangeRate = async (base: string, target: string): Promise<ExchangeRate> => {
  try {
    const url = `${EXCHANGE_RATE_CONFIG.BASE_URL}/latest/${base}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`ExchangeRate API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.rates || !data.rates[target]) {
      throw new Error(`Exchange rate not found for ${base}/${target}`);
    }

    return {
      base: data.base,
      target: target,
      rate: data.rates[target],
    };
  } catch (error) {
    console.error(`Error fetching exchange rate for ${base}/${target}:`, error);
    throw error;
  }
};

/**
 * Get gold price in USD (using XAU/USD)
 * Note: ExchangeRate-API doesn't support XAU directly, but we can use Alpha Vantage for this
 * This is a placeholder for potential future use
 */
export const getGoldPrice = async (): Promise<number | null> => {
  // ExchangeRate-API doesn't support precious metals
  // We'll keep using Alpha Vantage for gold
  return null;
};
