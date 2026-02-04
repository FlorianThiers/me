import type { InvestmentData } from '../pages/BeleggenPage';

interface CachedInvestmentData {
  data: InvestmentData[];
  timestamp: number;
  version: string;
}

const CACHE_KEY = 'alpha_vantage_investments_cache';
const CACHE_VERSION = '1.1'; // Keep same version - we'll add periodReturns to existing cache
const CACHE_DURATION = 60 * 60 * 1000; // 1 uur in milliseconden

/**
 * Haal gecachte investeringsdata op
 */
export const getCachedInvestments = (): InvestmentData[] | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const parsed: CachedInvestmentData = JSON.parse(cached);
    
    // Check cache version
    if (parsed.version !== CACHE_VERSION) {
      console.log('Cache version mismatch, clearing cache');
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    // Check if cache is still valid (not older than CACHE_DURATION)
    const now = Date.now();
    const age = now - parsed.timestamp;
    
    if (age > CACHE_DURATION) {
      console.log(`Cache is ${Math.round(age / 1000 / 60)} minutes old, expired`);
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    console.log(`Using cached data (${Math.round(age / 1000)} seconds old)`);
    return parsed.data;
  } catch (error) {
    console.error('Error reading cache:', error);
    localStorage.removeItem(CACHE_KEY);
    return null;
  }
};

/**
 * Sla investeringsdata op in cache
 */
export const setCachedInvestments = (data: InvestmentData[]): void => {
  try {
    const cache: CachedInvestmentData = {
      data,
      timestamp: Date.now(),
      version: CACHE_VERSION,
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    console.log('Investment data cached');
  } catch (error) {
    console.error('Error caching data:', error);
    // Als localStorage vol is, probeer oude cache te verwijderen
    try {
      localStorage.removeItem(CACHE_KEY);
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        data,
        timestamp: Date.now(),
        version: CACHE_VERSION,
      }));
    } catch (e) {
      console.error('Failed to cache data:', e);
    }
  }
};

/**
 * Verwijder de cache (voor handmatige refresh)
 */
export const clearCache = (): void => {
  localStorage.removeItem(CACHE_KEY);
  console.log('Cache cleared');
};

/**
 * Check of cache bestaat en nog geldig is
 */
export const hasValidCache = (): boolean => {
  const cached = getCachedInvestments();
  return cached !== null;
};

/**
 * Haal cache leeftijd op in minuten
 */
export const getCacheAge = (): number | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const parsed: CachedInvestmentData = JSON.parse(cached);
    const age = Date.now() - parsed.timestamp;
    return Math.round(age / 1000 / 60); // in minuten
  } catch {
    return null;
  }
};
