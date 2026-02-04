// FRED (Federal Reserve Economic Data) Configuration
// Free tier: Unlimited calls, requires free API key
// Get your key from: https://fred.stlouisfed.org/docs/api/api_key.html
export const FRED_CONFIG = {
  API_KEY: import.meta.env.VITE_FRED_API_KEY || '',
  BASE_URL: 'https://api.stlouisfed.org/fred',
};
