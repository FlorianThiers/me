import { COINGECKO_CONFIG } from '../config/coinGecko';

export interface CryptoPrice {
  id: string;
  symbol: string;
  name: string;
  currentPrice: number;
  priceChange24h: number;
  priceChangePercent24h: number;
}

/**
 * Get Bitcoin price (and other cryptocurrencies)
 */
export const getCryptoPrice = async (coinId: string = 'bitcoin'): Promise<CryptoPrice> => {
  try {
    const url = `${COINGECKO_CONFIG.BASE_URL}/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`CoinGecko API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data[coinId]) {
      throw new Error(`No data returned for ${coinId}`);
    }

    const coinData = data[coinId];
    
    return {
      id: coinId,
      symbol: coinId === 'bitcoin' ? 'BTC' : coinId.toUpperCase(),
      name: coinId === 'bitcoin' ? 'Bitcoin' : coinId,
      currentPrice: coinData.usd,
      priceChange24h: coinData.usd_24h_change || 0,
      priceChangePercent24h: coinData.usd_24h_change || 0,
    };
  } catch (error) {
    console.error(`Error fetching crypto price for ${coinId}:`, error);
    throw error;
  }
};

/**
 * Get multiple cryptocurrency prices
 */
export const getMultipleCryptoPrices = async (coinIds: string[]): Promise<CryptoPrice[]> => {
  try {
    const ids = coinIds.join(',');
    const url = `${COINGECKO_CONFIG.BASE_URL}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`CoinGecko API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    return coinIds.map(coinId => {
      const coinData = data[coinId];
      if (!coinData) return null;
      
      return {
        id: coinId,
        symbol: coinId === 'bitcoin' ? 'BTC' : coinId.toUpperCase(),
        name: coinId === 'bitcoin' ? 'Bitcoin' : coinId,
        currentPrice: coinData.usd,
        priceChange24h: coinData.usd_24h_change || 0,
        priceChangePercent24h: coinData.usd_24h_change || 0,
      };
    }).filter(Boolean) as CryptoPrice[];
  } catch (error) {
    console.error('Error fetching multiple crypto prices:', error);
    throw error;
  }
};
