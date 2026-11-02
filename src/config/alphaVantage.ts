// Alpha Vantage — server proxy at /api/private/market/alphavantage (ALPHA_VANTAGE_API_KEY on Vercel)

export const ALPHA_VANTAGE_CONFIG = {
  PROXY_URL: '/api/private/market/alphavantage',
  /** Free tier: 5 calls/minute */
  RATE_LIMIT_DELAY: 12000,
};
