// Alpha Vantage Configuration
// Get your free API key from: https://www.alphavantage.co/support/#api-key

// Debug: Log all VITE_ environment variables (for debugging only)
if (typeof window !== 'undefined') {
  const viteEnvVars = Object.keys(import.meta.env).filter(key => key.startsWith('VITE_'));
  console.log('Available VITE_ environment variables:', viteEnvVars);
  console.log('VITE_ALPHA_VANTAGE_API_KEY value:', import.meta.env.VITE_ALPHA_VANTAGE_API_KEY ? '***' + import.meta.env.VITE_ALPHA_VANTAGE_API_KEY.slice(-4) : 'NOT FOUND');
}

export const ALPHA_VANTAGE_CONFIG = {
  API_KEY: import.meta.env.VITE_ALPHA_VANTAGE_API_KEY || '',
  BASE_URL: 'https://www.alphavantage.co/query',
  // Rate limiting: Free tier allows 5 API calls per minute, 25 per day
  RATE_LIMIT_DELAY: 12000, // 12 seconds between calls (5 calls per minute = 1 per 12 seconds)
};
