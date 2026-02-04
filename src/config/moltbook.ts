// Moltbook Configuration
// API key can be set via environment variable or will be loaded from user input

export const MOLTBOOK_CONFIG = {
  API_KEY: import.meta.env.VITE_MOLTBOOK_API_KEY || '',
  BASE_URL: 'https://www.moltbook.com/api/v1',
  // Rate limits from Moltbook API
  RATE_LIMITS: {
    POSTS: {
      PER_30_MINUTES: 1,
      PER_DAY: 24 // Assuming 1 per 30 minutes = 48 per day max, but being conservative
    },
    COMMENTS: {
      PER_20_SECONDS: 1,
      PER_DAY: 50
    },
    API_CALLS: {
      PER_MINUTE: 100
    }
  }
};

// Helper to check if API key is configured
export const isMoltbookConfigured = (): boolean => {
  return !!MOLTBOOK_CONFIG.API_KEY;
};

// Helper to get API key from localStorage (user can input it)
export const getMoltbookApiKey = (): string => {
  // First check environment variable
  if (MOLTBOOK_CONFIG.API_KEY) {
    return MOLTBOOK_CONFIG.API_KEY;
  }
  
  // Then check localStorage (user can input it via UI)
  const storedKey = localStorage.getItem('moltbook_api_key');
  return storedKey || '';
};

// Helper to save API key to localStorage
export const saveMoltbookApiKey = (apiKey: string): void => {
  localStorage.setItem('moltbook_api_key', apiKey);
  // Update config
  (MOLTBOOK_CONFIG as any).API_KEY = apiKey;
};
