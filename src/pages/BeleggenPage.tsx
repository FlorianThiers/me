import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, BarChart3, Info, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { getStockQuote, getCurrencyRate, getRemainingQuota } from '../services/alphaVantageService';
import { ALPHA_VANTAGE_CONFIG } from '../config/alphaVantage';
import { getCachedInvestments, setCachedInvestments, clearCache, getCacheAge } from '../utils/investmentCache';
import { getCryptoPrice } from '../services/coinGeckoService';
import { getInflationRate, getHistoricalInflation } from '../services/fredService';
import { FRED_CONFIG } from '../config/fred';
import { getMultipleYahooQuotes, getMultipleHistoricalReturns } from '../services/yahooFinanceService';

interface PeriodReturns {
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

export interface InvestmentData {
  name: string;
  symbol: string;
  currentValue: number;
  inflationAdjusted: number;
  change: number;
  changePercent: number; // 1D change (for backward compatibility)
  periodReturns?: PeriodReturns;
  category: string;
  description: string;
}

interface InflationData {
  current: number;
  historical: Array<{ year: number; rate: number }>;
}

export const BeleggenPage: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'1Y' | '3Y' | '5Y' | '10Y'>('5Y');
  const [selectedReturnPeriod, setSelectedReturnPeriod] = useState<'1D' | '1W' | '1M' | '3M' | '1Y' | '5Y' | '10Y' | '20Y' | '50Y'>('1D');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useMockData, setUseMockData] = useState(false);
  
  const [inflationData, setInflationData] = useState<InflationData>({
    current: 2.5, // Default - wordt bijgewerkt van FRED API indien beschikbaar
    historical: [
      { year: 2020, rate: 0.3 },
      { year: 2021, rate: 2.6 },
      { year: 2022, rate: 11.6 },
      { year: 2023, rate: 3.2 },
      { year: 2024, rate: 2.5 },
    ]
  });

  // Fetch inflation data from FRED API (if configured)
  useEffect(() => {
    const fetchInflationData = async () => {
      console.log('🔄 Fetching inflation data from FRED API...');
      console.log('🔑 FRED API Key configured:', !!FRED_CONFIG.API_KEY);
      
      try {
        // Fetch current inflation rate
        const fredInflation = await getInflationRate();
        if (fredInflation !== null && !isNaN(fredInflation) && fredInflation > -100 && fredInflation < 100) {
          // Validate that inflation is a reasonable value (between -100% and 100%)
          console.log('✅ FRED inflation rate fetched:', fredInflation, '%');
          setInflationData(prev => ({
            ...prev,
            current: fredInflation,
          }));
        } else {
          console.warn('⚠️ FRED API returned invalid inflation value:', fredInflation, '. Using default inflation:', inflationData.current, '%');
        }

        // Fetch historical inflation data (last 5 years)
        const historicalData = await getHistoricalInflation(5);
        if (historicalData && historicalData.length > 0) {
          console.log('FRED historical inflation data (raw):', historicalData);
          
          // FRED service now returns year-over-year inflation percentages directly
          // Convert to yearly format for display
          const yearlyData: { [year: number]: number } = {};
          
          historicalData.forEach(item => {
            const year = parseInt(item.date.substring(0, 4));
            // Validate that the value is reasonable (between -100% and 100%)
            if (!isNaN(item.value) && item.value > -100 && item.value < 100) {
              // Use the latest value for each year if multiple exist
              const existingForYear = historicalData.find(d => d.date.startsWith(year.toString()));
              if (!yearlyData[year] || (existingForYear && item.date > existingForYear.date)) {
                yearlyData[year] = item.value;
              }
            } else {
              console.warn(`Invalid inflation value for year ${year}: ${item.value}, skipping`);
            }
          });

          const historical = Object.entries(yearlyData)
            .map(([year, rate]) => ({ year: parseInt(year), rate }))
            .sort((a, b) => a.year - b.year);

          console.log('✅ FRED historical inflation data (processed):', historical);

          if (historical.length > 0) {
            setInflationData(prev => ({
              ...prev,
              historical: historical,
            }));
            console.log('✅ Updated inflation data with FRED historical data. New historical:', historical);
          } else {
            console.warn('⚠️ No valid historical data processed from FRED. Keeping default data.');
          }
        } else {
          console.warn('⚠️ No historical data received from FRED API. Using default historical data.');
        }
      } catch (error) {
        console.error('❌ Failed to fetch inflation from FRED:', error);
        console.warn('Using default inflation data:', inflationData);
        // Keep default value
      }
    };

    fetchInflationData();
  }, []);

  // Helper function to generate mock periodReturns based on 1D change
  const generateMockPeriodReturns = (baseChange: number): PeriodReturns => {
    // Generate realistic returns for different periods based on 1D change
    // Longer periods typically have higher cumulative returns
    return {
      '1D': baseChange,
      '1W': baseChange * 5, // Weekly trend
      '1M': baseChange * 20, // Monthly trend
      '3M': baseChange * 60, // Quarterly trend
      '1Y': baseChange * 250, // Annual trend (rough estimate)
      '5Y': baseChange * 1200, // 5-year cumulative
      '10Y': baseChange * 2500, // 10-year cumulative
      '20Y': baseChange * 5000, // 20-year cumulative
      '50Y': baseChange * 12500, // 50-year cumulative (very long term)
    };
  };

  // Mock data - gebruikt als fallback of als API key niet is geconfigureerd
  const mockInvestments: InvestmentData[] = [
    // Tech & AI
    {
      name: 'NVIDIA',
      symbol: 'NVDA',
      currentValue: 850.00,
      inflationAdjusted: 850.00,
      change: 45.20,
      changePercent: 5.62,
      periodReturns: generateMockPeriodReturns(5.62),
      category: 'Tech Aandelen',
      description: 'Leider in AI chips en GPU technologie'
    },
    {
      name: 'Nasdaq 100',
      symbol: 'QQQ',
      currentValue: 420.00,
      inflationAdjusted: 420.00,
      change: 3.50,
      changePercent: 0.84,
      periodReturns: generateMockPeriodReturns(0.84),
      category: 'Tech Index',
      description: 'Top 100 tech bedrijven ETF'
    },
    // Markt Indices
    {
      name: 'S&P 500',
      symbol: 'SPY',
      currentValue: 550.00,
      inflationAdjusted: 550.00,
      change: 8.53,
      changePercent: 1.58,
      periodReturns: generateMockPeriodReturns(1.58),
      category: 'Index',
      description: 'Brede markt index ETF'
    },
    // Energie
    {
      name: 'Olie ETF',
      symbol: 'USO',
      currentValue: 75.50,
      inflationAdjusted: 75.50,
      change: 1.20,
      changePercent: 1.61,
      periodReturns: generateMockPeriodReturns(1.61),
      category: 'Energie',
      description: 'United States Oil Fund - Olie prijs tracking'
    },
    {
      name: 'Energie Sector',
      symbol: 'XLE',
      currentValue: 95.30,
      inflationAdjusted: 95.30,
      change: 0.85,
      changePercent: 0.90,
      periodReturns: generateMockPeriodReturns(0.90),
      category: 'Energie',
      description: 'Energy Select Sector ETF - Olie & gas bedrijven'
    },
    // Grondstoffen & Utilities
    {
      name: 'Water ETF',
      symbol: 'PHO',
      currentValue: 48.20,
      inflationAdjusted: 48.20,
      change: 0.35,
      changePercent: 0.73,
      periodReturns: generateMockPeriodReturns(0.73),
      category: 'Grondstoffen',
      description: 'Water infrastructure en technologie ETF'
    },
    {
      name: 'Utilities',
      symbol: 'XLU',
      currentValue: 68.50,
      inflationAdjusted: 68.50,
      change: 0.42,
      changePercent: 0.62,
      periodReturns: generateMockPeriodReturns(0.62),
      category: 'Utilities',
      description: 'Utilities Select Sector ETF - Gas, water, elektriciteit'
    },
    // Consumenten
    {
      name: 'Retail ETF',
      symbol: 'XRT',
      currentValue: 72.80,
      inflationAdjusted: 72.80,
      change: 0.55,
      changePercent: 0.76,
      periodReturns: generateMockPeriodReturns(0.76),
      category: 'Consumenten',
      description: 'SPDR S&P Retail ETF - Kleding en retail sector'
    },
    {
      name: 'Consumentengoederen',
      symbol: 'XLP',
      currentValue: 78.90,
      inflationAdjusted: 78.90,
      change: 0.30,
      changePercent: 0.38,
      periodReturns: generateMockPeriodReturns(0.38),
      category: 'Consumenten',
      description: 'Consumer Staples ETF - Dagelijkse benodigdheden'
    },
    // Andere Sectoren
    {
      name: 'Healthcare',
      symbol: 'XLV',
      currentValue: 145.20,
      inflationAdjusted: 145.20,
      change: 1.15,
      changePercent: 0.80,
      periodReturns: generateMockPeriodReturns(0.80),
      category: 'Healthcare',
      description: 'Healthcare Select Sector ETF - Zorgsector'
    },
    {
      name: 'Materialen',
      symbol: 'XLB',
      currentValue: 88.40,
      inflationAdjusted: 88.40,
      change: 0.65,
      changePercent: 0.74,
      periodReturns: generateMockPeriodReturns(0.74),
      category: 'Materialen',
      description: 'Materials Select Sector ETF - Grondstoffen en materialen'
    },
    // Edelmetalen
    {
      name: 'Goud',
      symbol: 'XAUUSD',
      currentValue: 2650.00,
      inflationAdjusted: 2650.00,
      change: 12.50,
      changePercent: 0.47,
      periodReturns: generateMockPeriodReturns(0.47),
      category: 'Edelmetalen',
      description: 'Traditionele inflatie hedge'
    },
    // Vastgoed & Obligaties
    {
      name: 'Vastgoed (REIT)',
      symbol: 'VNQ',
      currentValue: 95.50,
      inflationAdjusted: 95.50,
      change: 1.20,
      changePercent: 1.27,
      periodReturns: generateMockPeriodReturns(1.27),
      category: 'Vastgoed',
      description: 'Real Estate Investment Trust'
    },
    {
      name: 'Obligaties (10Y)',
      symbol: 'BND',
      currentValue: 78.30,
      inflationAdjusted: 78.30,
      change: -0.50,
      changePercent: -0.63,
      periodReturns: generateMockPeriodReturns(-0.63),
      category: 'Obligaties',
      description: 'Stabiele inkomsten, lagere groei'
    },
    // Cryptocurrency
    {
      name: 'Bitcoin',
      symbol: 'BTC',
      currentValue: 65000.00,
      inflationAdjusted: 65000.00,
      change: 1200.00,
      changePercent: 1.88,
      periodReturns: generateMockPeriodReturns(1.88),
      category: 'Cryptocurrency',
      description: 'Digitale store of value (mock data - Alpha Vantage ondersteunt geen crypto)'
    }
  ];

  const [investments, setInvestments] = useState<InvestmentData[]>(mockInvestments);
  const [rawInvestments, setRawInvestments] = useState<InvestmentData[]>(mockInvestments); // Store raw API data
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch real data from Alpha Vantage
  const fetchInvestmentData = async (forceRefresh: boolean = false) => {
      // Check if API key is configured
      console.log('API Key check:', ALPHA_VANTAGE_CONFIG.API_KEY ? 'Found' : 'Not found');
      console.log('API Key length:', ALPHA_VANTAGE_CONFIG.API_KEY.length);
      console.log('All import.meta.env keys:', Object.keys(import.meta.env));
      
      if (!ALPHA_VANTAGE_CONFIG.API_KEY) {
        console.warn('Alpha Vantage API key not configured. Using mock data.');
        console.warn('Troubleshooting:');
        console.warn('1. Check if .env file exists in project root');
        console.warn('2. Check if variable name is exactly: VITE_ALPHA_VANTAGE_API_KEY');
        console.warn('3. Restart development server after adding .env file');
        console.warn('4. Check .env file format: VITE_ALPHA_VANTAGE_API_KEY=your_key_here (no spaces around =)');
        setUseMockData(true);
        setIsLoading(false);
        setRawInvestments(mockInvestments);
        const adjustedMock = mockInvestments.map(inv => {
          const inflationRate = inflationData.current / 100;
          const adjustedValue = inv.currentValue * (1 - inflationRate);
          return { ...inv, inflationAdjusted: adjustedValue };
        });
        setInvestments(adjustedMock);
        return;
      }

      // Check cache first (unless forced refresh)
      if (!forceRefresh) {
        const cachedData = getCachedInvestments();
        if (cachedData && cachedData.length > 0) {
          console.log('Using cached investment data');
          
          // Check if cached data has periodReturns
          const hasPeriodReturns = cachedData.some(inv => inv.periodReturns);
          console.log(`Cached data has periodReturns: ${hasPeriodReturns}`);
          
          if (!hasPeriodReturns) {
            console.log('Cached data missing periodReturns, fetching historical data...');
            // Fetch historical returns for cached investments
            try {
              const stockSymbolsForHistory = cachedData
                .filter(inv => inv.symbol !== 'BTC' && inv.symbol !== 'XAUUSD')
                .map(inv => inv.symbol);
              
              if (stockSymbolsForHistory.length > 0) {
                const historicalReturns = await getMultipleHistoricalReturns(stockSymbolsForHistory);
                console.log('Successfully fetched historical returns for cached data:', historicalReturns.length);
                
                // Merge historical returns into cached investments
                historicalReturns.forEach(hist => {
                  const investment = cachedData.find(inv => inv.symbol === hist.symbol);
                  if (investment) {
                    investment.periodReturns = hist.periodReturns;
                    console.log(`Added periodReturns to cached ${hist.symbol}`);
                  }
                });
                
                // Update cache with periodReturns
                setCachedInvestments(cachedData);
              }
            } catch (err: any) {
              console.warn('Failed to fetch historical returns for cached data:', err);
              // Continue with cached data without periodReturns
            }
          }
          
          const cacheAge = getCacheAge();
          setRawInvestments(cachedData);
          const adjustedInvestments = cachedData.map(inv => {
            const inflationRate = inflationData.current / 100;
            const adjustedValue = inv.currentValue * (1 - inflationRate);
            return { ...inv, inflationAdjusted: adjustedValue };
          });
          setInvestments(adjustedInvestments);
          setUseMockData(false);
          setLastUpdated(new Date(Date.now() - (cacheAge || 0) * 60 * 1000));
          setIsLoading(false);
          return;
        } else {
          // No cache available, use mock data instead of fetching
          console.log('No cache available, using mock data. Click "Ververs Data" to fetch from API.');
          setUseMockData(true);
          setRawInvestments(mockInvestments);
          const adjustedMock = mockInvestments.map(inv => {
            const inflationRate = inflationData.current / 100;
            const adjustedValue = inv.currentValue * (1 - inflationRate);
            return { ...inv, inflationAdjusted: adjustedValue };
          });
          setInvestments(adjustedMock);
          setIsLoading(false);
          return;
        }
      } else {
        // Clear cache if forced refresh
        clearCache();
      }

      setIsLoading(true);
      setError(null);
      console.log('Starting to fetch investment data from API...');
      
      // Check Alpha Vantage quota
      const remainingQuota = getRemainingQuota();
      console.log(`Remaining Alpha Vantage quota: ${remainingQuota}/25`);

      try {
        const investmentConfigs = [
          // Tech & AI
          { name: 'NVIDIA', symbol: 'NVDA', category: 'Tech Aandelen', description: 'Leider in AI chips en GPU technologie', type: 'stock' as const },
          { name: 'Nasdaq 100', symbol: 'QQQ', category: 'Tech Index', description: 'Top 100 tech bedrijven ETF', type: 'stock' as const },
          
          // Markt Indices
          { name: 'S&P 500', symbol: 'SPY', category: 'Index', description: 'Brede markt index ETF', type: 'stock' as const },
          
          // Energie
          { name: 'Olie ETF', symbol: 'USO', category: 'Energie', description: 'United States Oil Fund - Olie prijs tracking', type: 'stock' as const },
          { name: 'Energie Sector', symbol: 'XLE', category: 'Energie', description: 'Energy Select Sector ETF - Olie & gas bedrijven', type: 'stock' as const },
          
          // Grondstoffen & Utilities
          { name: 'Water ETF', symbol: 'PHO', category: 'Grondstoffen', description: 'Water infrastructure en technologie ETF', type: 'stock' as const },
          { name: 'Utilities', symbol: 'XLU', category: 'Utilities', description: 'Utilities Select Sector ETF - Gas, water, elektriciteit', type: 'stock' as const },
          
          // Consumenten
          { name: 'Retail ETF', symbol: 'XRT', category: 'Consumenten', description: 'SPDR S&P Retail ETF - Kleding en retail sector', type: 'stock' as const },
          { name: 'Consumentengoederen', symbol: 'XLP', category: 'Consumenten', description: 'Consumer Staples ETF - Dagelijkse benodigdheden', type: 'stock' as const },
          
          // Andere Sectoren
          { name: 'Healthcare', symbol: 'XLV', category: 'Healthcare', description: 'Healthcare Select Sector ETF - Zorgsector', type: 'stock' as const },
          { name: 'Materialen', symbol: 'XLB', category: 'Materialen', description: 'Materials Select Sector ETF - Grondstoffen en materialen', type: 'stock' as const },
          
          // Vastgoed & Obligaties
          { name: 'Vastgoed (REIT)', symbol: 'VNQ', category: 'Vastgoed', description: 'Real Estate Investment Trust', type: 'stock' as const },
          { name: 'Obligaties (10Y)', symbol: 'BND', category: 'Obligaties', description: 'Stabiele inkomsten, lagere groei', type: 'stock' as const },
        ];

        const fetchedInvestments: InvestmentData[] = [];
        const stockSymbols = investmentConfigs.map(c => c.symbol);
        let stockQuotes: Array<{ symbol: string; price: number; change: number; changePercent: number }> = [];
        let usedYahooFinance = false;

        // Try Yahoo Finance batch fetch first (no API key, no quota limits)
        try {
          console.log('Attempting Yahoo Finance batch fetch for all stocks...');
          const yahooQuotes = await getMultipleYahooQuotes(stockSymbols);
          
          if (yahooQuotes.length > 0) {
            stockQuotes = yahooQuotes;
            usedYahooFinance = true;
            console.log(`✅ Successfully fetched ${yahooQuotes.length} stocks from Yahoo Finance`);
          }
        } catch (yahooError: any) {
          console.warn('Yahoo Finance batch fetch failed, falling back to Alpha Vantage:', yahooError);
          // Fall through to Alpha Vantage fallback
        }

        // Fallback to Alpha Vantage if Yahoo Finance failed or returned incomplete data
        if (!usedYahooFinance || stockQuotes.length < investmentConfigs.length) {
          if (remainingQuota > 0) {
            console.log(`Using Alpha Vantage fallback (${remainingQuota} calls remaining)...`);
            // Fetch missing stocks from Alpha Vantage
            const missingSymbols = usedYahooFinance 
              ? stockSymbols.filter(s => !stockQuotes.some(q => q.symbol === s))
              : stockSymbols;
            
            for (const symbol of missingSymbols) {
              try {
                const quote = await getStockQuote(symbol);
                stockQuotes.push({
                  symbol: quote.symbol,
                  price: quote.price,
                  change: quote.change,
                  changePercent: quote.changePercent,
                });
              } catch (err: any) {
                console.error(`Failed to fetch ${symbol} from Alpha Vantage:`, err);
                // Will use mock data below
              }
            }
          } else {
            console.warn('Alpha Vantage quota exhausted, using Yahoo Finance results and mock data for missing symbols');
          }
        }

        // Map fetched quotes to investment configs
        for (const config of investmentConfigs) {
          const quote = stockQuotes.find(q => q.symbol === config.symbol);
          if (quote) {
            fetchedInvestments.push({
              name: config.name,
              symbol: quote.symbol,
              currentValue: quote.price,
              inflationAdjusted: quote.price,
              change: quote.change,
              changePercent: quote.changePercent,
              category: config.category,
              description: config.description,
            });
          } else {
            // Use mock data if fetch failed
            console.warn(`No data for ${config.symbol}, using mock data`);
            const mockData = mockInvestments.find(inv => inv.symbol === config.symbol);
            if (mockData) {
              fetchedInvestments.push(mockData);
            }
          }
        }

        // Fetch gold price (XAU/USD) - Always use Alpha Vantage (Yahoo Finance doesn't support XAU/USD)
        try {
          const currentQuota = getRemainingQuota();
          if (currentQuota > 0) {
            console.log('Fetching gold price (XAU/USD) from Alpha Vantage...');
            const goldRate = await getCurrencyRate('XAU', 'USD');
            console.log('Successfully fetched gold:', goldRate);
            fetchedInvestments.push({
              name: 'Goud',
              symbol: 'XAUUSD',
              currentValue: goldRate.rate,
              inflationAdjusted: goldRate.rate,
              change: goldRate.change || 0,
              changePercent: goldRate.changePercent || 0,
              category: 'Edelmetalen',
              description: 'Traditionele inflatie hedge (Alpha Vantage)',
            });
          } else {
            console.warn('Alpha Vantage quota exhausted, using mock data for gold');
            const mockGold = mockInvestments.find(inv => inv.symbol === 'XAUUSD');
            if (mockGold) {
              fetchedInvestments.push(mockGold);
            }
          }
        } catch (err: any) {
          console.error('Failed to fetch gold price:', err);
          setError(err?.message || 'Kon goudprijs niet ophalen');
          const mockGold = mockInvestments.find(inv => inv.symbol === 'XAUUSD');
          if (mockGold) {
            fetchedInvestments.push(mockGold);
          }
        }

        // Fetch Bitcoin price from CoinGecko (free, no API key needed)
        try {
          console.log('Fetching Bitcoin price from CoinGecko...');
          const btcPrice = await getCryptoPrice('bitcoin');
          fetchedInvestments.push({
            name: 'Bitcoin',
            symbol: 'BTC',
            currentValue: btcPrice.currentPrice,
            inflationAdjusted: btcPrice.currentPrice,
            change: btcPrice.priceChange24h,
            changePercent: btcPrice.priceChangePercent24h,
            category: 'Cryptocurrency',
            description: 'Digitale store of value (real-time via CoinGecko)',
          });
          console.log('Successfully fetched Bitcoin:', btcPrice);
        } catch (err: any) {
          console.error('Failed to fetch Bitcoin price:', err);
          const mockBitcoin = mockInvestments.find(inv => inv.symbol === 'BTC');
          if (mockBitcoin) {
            fetchedInvestments.push(mockBitcoin);
          }
        }

        // Fetch historical returns for all stocks (for multiple period views)
        console.log('Fetching historical returns for all investments...');
        try {
          const stockSymbolsForHistory = fetchedInvestments
            .filter(inv => inv.symbol !== 'BTC' && inv.symbol !== 'XAUUSD')
            .map(inv => inv.symbol);
          
          if (stockSymbolsForHistory.length > 0) {
            const historicalReturns = await getMultipleHistoricalReturns(stockSymbolsForHistory);
            console.log('Successfully fetched historical returns:', historicalReturns);
            console.log('Number of investments with historical data:', historicalReturns.length);
            
            // Merge historical returns into fetched investments
            historicalReturns.forEach(hist => {
              const investment = fetchedInvestments.find(inv => inv.symbol === hist.symbol);
              if (investment) {
                investment.periodReturns = hist.periodReturns;
                console.log(`Added periodReturns to ${hist.symbol}:`, hist.periodReturns);
              } else {
                console.warn(`Could not find investment for symbol ${hist.symbol} to add periodReturns`);
              }
            });
            
            // Verify periodReturns are set
            const withPeriodReturns = fetchedInvestments.filter(inv => inv.periodReturns);
            console.log(`Investments with periodReturns: ${withPeriodReturns.length}/${fetchedInvestments.length}`);
          }
        } catch (err: any) {
          console.warn('Failed to fetch historical returns, continuing without them:', err);
          // Continue without historical data - investments will still work with 1D data
        }

        console.log('All investments fetched:', fetchedInvestments);
        console.log('Number of investments:', fetchedInvestments.length);
        
        // Check if we got any real data (not all mock)
        const hasRealData = fetchedInvestments.some(inv => {
          // Check if this is real data by comparing with mock values
          const mockInv = mockInvestments.find(m => m.symbol === inv.symbol);
          if (!mockInv) return true; // New investment, must be real
          // If values are different, it's real data
          return Math.abs(inv.currentValue - mockInv.currentValue) > 0.01;
        });
        
        console.log('Has real data:', hasRealData);
        
        if (fetchedInvestments.length > 0) {
          // Cache the data for future use
          setCachedInvestments(fetchedInvestments);
          
          // Store raw data first
          setRawInvestments(fetchedInvestments);
          // Then calculate inflation-adjusted values
          const adjustedInvestments = fetchedInvestments.map(inv => {
            const inflationRate = inflationData.current / 100;
            const adjustedValue = inv.currentValue * (1 - inflationRate);
            return { ...inv, inflationAdjusted: adjustedValue };
          });
          console.log('Setting investments state with:', adjustedInvestments);
          setInvestments(adjustedInvestments);
          setUseMockData(!hasRealData);
          setLastUpdated(new Date());
          if (hasRealData) {
            setError(null); // Clear errors if we got real data
          }
        } else {
          // No data fetched at all
          setUseMockData(true);
          setRawInvestments(mockInvestments);
          const adjustedMock = mockInvestments.map(inv => {
            const inflationRate = inflationData.current / 100;
            const adjustedValue = inv.currentValue * (1 - inflationRate);
            return { ...inv, inflationAdjusted: adjustedValue };
          });
          setInvestments(adjustedMock);
        }
      } catch (err: any) {
        console.error('Error fetching investment data:', err);
        setError(err?.message || 'Kon geen real-time data ophalen. Gebruik mock data.');
        setUseMockData(true);
        setRawInvestments(mockInvestments);
        // Calculate inflation-adjusted for mock data too
        const adjustedMock = mockInvestments.map(inv => {
          const inflationRate = inflationData.current / 100;
          const adjustedValue = inv.currentValue * (1 - inflationRate);
          return { ...inv, inflationAdjusted: adjustedValue };
        });
        setInvestments(adjustedMock);
      } finally {
        setIsLoading(false);
        console.log('Finished fetching investment data');
      }
  };

  // Load cached data or mock data on mount (don't auto-fetch to save API calls)
  useEffect(() => {
    fetchInvestmentData(false); // Only load from cache, don't fetch if no cache
  }, []);

  const handleRefresh = () => {
    fetchInvestmentData(true); // Force refresh, bypass cache
  };

  // Bereken inflatie-gecorrigeerde waarden wanneer inflatie, periode of return periode verandert
  useEffect(() => {
    // Only recalculate if we have raw investments
    if (rawInvestments.length > 0) {
      console.log('Recalculating inflation-adjusted values for', rawInvestments.length, 'investments');
      console.log('Selected return period:', selectedReturnPeriod);
      const adjustedInvestments = rawInvestments.map(inv => {
        const inflationRate = inflationData.current / 100;
        const adjustedValue = inv.currentValue * (1 - inflationRate);
        return { ...inv, inflationAdjusted: adjustedValue };
      });
      console.log('Updated investments:', adjustedInvestments);
      setInvestments(adjustedInvestments);
    }
  }, [selectedPeriod, inflationData, rawInvestments, selectedReturnPeriod]);

  // Bereken gemiddelde inflatie voor de geselecteerde periode
  const getAverageInflationForPeriod = (): number => {
    const currentYear = new Date().getFullYear();
    const periodYears = selectedPeriod === '1Y' ? 1 : selectedPeriod === '3Y' ? 3 : selectedPeriod === '5Y' ? 5 : 10;
    const startYear = currentYear - periodYears + 1;
    
    const periodData = inflationData.historical.filter(
      data => data.year >= startYear
    );
    
    if (periodData.length === 0) {
      return inflationData.current;
    }
    
    const sum = periodData.reduce((acc, data) => acc + data.rate, 0);
    return sum / periodData.length;
  };

  const getNominalReturn = (investment: InvestmentData): number => {
    // Use the selected return period, fallback to 1D if not available
    const periodReturn = investment.periodReturns?.[selectedReturnPeriod];
    const fallback = investment.changePercent;
    
    if (investment.periodReturns && import.meta.env.MODE === 'development') {
      console.log(`Investment ${investment.symbol}: periodReturns=${JSON.stringify(investment.periodReturns)}, selected=${selectedReturnPeriod}, using=${periodReturn ?? fallback}`);
    }
    
    return periodReturn ?? fallback;
  };

  const calculateRealReturn = (investment: InvestmentData) => {
    const nominalReturn = getNominalReturn(investment);
    // Gebruik gemiddelde inflatie voor de periode in plaats van alleen huidige inflatie
    const avgInflation = getAverageInflationForPeriod();
    const realReturn = nominalReturn - avgInflation;
    return realReturn;
  };

  const calculatePurchasingPowerLoss = (amount: number) => {
    // Gebruik gemiddelde inflatie voor de periode
    const avgInflation = getAverageInflationForPeriod();
    const inflationRate = avgInflation / 100;
    return (1 - 1 / (1 + inflationRate)) * amount;
  };

  return (
    <div className="min-h-screen pt-20 bg-dark-bg">
      <div className="container-custom px-4 py-8">
        {/* Header */}
        <div className="max-w-6xl mx-auto mb-12">
          <div className="flex items-center mb-8">
            <Link
              to="/interests"
              className="mr-4 p-2 rounded-full bg-dark-secondary/50 border border-white/10 hover:border-neon-green/50 transition-all duration-300"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </Link>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                💰 Beleggen & Inflatie Tracking
              </h1>
              <p className="text-lg text-white/80 max-w-3xl leading-relaxed">
                Volg hoe inflatie je geld beïnvloedt en vergelijk hoe verschillende investeringen 
                presteren ten opzichte van inflatie. Real-time statistieken en historische data.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Error/Info Banner */}
          {(error || useMockData || !ALPHA_VANTAGE_CONFIG.API_KEY) && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-4 mb-6"
            >
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-yellow-400 mr-3 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  {!ALPHA_VANTAGE_CONFIG.API_KEY ? (
                    <div>
                      <p className="text-yellow-300 font-semibold mb-1">Alpha Vantage API Key niet geconfigureerd</p>
                      <p className="text-yellow-200/80 text-sm">
                        Voeg <code className="bg-yellow-500/20 px-1 rounded">VITE_ALPHA_VANTAGE_API_KEY</code> toe aan je <code className="bg-yellow-500/20 px-1 rounded">.env</code> bestand om real-time data te gebruiken.
                        <br />
                        <strong className="text-yellow-300">Belangrijk:</strong> Herstart je development server na het toevoegen van de API key!
                        <br />
                        <a 
                          href="https://www.alphavantage.co/support/#api-key" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-yellow-300 underline hover:text-yellow-200"
                        >
                          Krijg hier een gratis API key
                        </a>
                      </p>
                      <p className="text-yellow-200/60 text-xs mt-2">
                        Debug: API Key lengte = {ALPHA_VANTAGE_CONFIG.API_KEY.length} (moet &gt; 0 zijn)
                      </p>
                    </div>
                  ) : useMockData ? (
                    <div>
                      <p className="text-yellow-300 font-semibold mb-1">Gebruikt mock data</p>
                      <p className="text-yellow-200/80 text-sm">
                        {error || 'Kon geen real-time data ophalen. Toont voorbeelddata.'}
                      </p>
                      <p className="text-yellow-200/60 text-xs mt-2">
                        Check de browser console (F12) voor meer details over de fout.
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            </motion.div>
          )}

          {/* Loading State */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-dark-secondary/50 backdrop-blur-sm border border-white/10 rounded-xl p-8 mb-8 text-center"
            >
              <Loader2 className="w-8 h-8 text-neon-green mx-auto mb-4 animate-spin" />
              <p className="text-white/70">
                Real-time data ophalen van Alpha Vantage...
                <br />
                <span className="text-sm text-white/50">Dit kan even duren vanwege rate limiting (5 calls/minuut)</span>
                <br />
                <span className="text-xs text-white/40 mt-2 block">Check de browser console voor details</span>
              </p>
            </motion.div>
          )}

          {/* Error Display */}
          {error && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-6"
            >
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-red-300 font-semibold mb-1">Fout bij ophalen data</p>
                  <p className="text-red-200/80 text-sm">{error}</p>
                  <p className="text-red-200/60 text-xs mt-2">Open de browser console (F12) voor meer details</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Inflatie Dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-dark-secondary/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <DollarSign className="w-6 h-6 mr-3 text-neon-green" />
                Huidige Inflatie (Nederland/EU)
              </h2>
              <div className="flex items-center gap-4">
                {lastUpdated && !isLoading && (
                  <div className="flex flex-col items-end">
                    <span className="text-white/50 text-xs">
                      Laatst bijgewerkt: {lastUpdated.toLocaleTimeString('nl-NL')}
                    </span>
                    {getCacheAge() !== null && getCacheAge()! < 60 && (
                      <span className="text-neon-green/70 text-xs">
                        Cache: {getCacheAge()} min geleden
                      </span>
                    )}
                  </div>
                )}
                <button
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="p-2 rounded-lg bg-dark-bg/50 border border-white/10 hover:border-neon-green/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Ververs data (bypass cache, gebruikt API calls)"
                >
                  <RefreshCw className={`w-5 h-5 text-neon-green ${isLoading ? 'animate-spin' : ''}`} />
                </button>
                <div className="flex gap-2">
                  {(['1Y', '3Y', '5Y', '10Y'] as const).map((period) => (
                    <button
                      key={period}
                      onClick={() => setSelectedPeriod(period)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedPeriod === period
                          ? 'bg-neon-green text-dark-bg'
                          : 'bg-dark-bg/50 text-white/70 hover:bg-dark-bg/70'
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-dark-bg/50 rounded-lg p-4 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white/60 text-sm">Gemiddelde Inflatie ({selectedPeriod})</p>
                  {FRED_CONFIG.API_KEY && (
                    <span className="text-xs px-2 py-1 bg-neon-green/20 text-neon-green rounded">
                      FRED API
                    </span>
                  )}
                </div>
                <p className="text-3xl font-bold text-neon-green">{getAverageInflationForPeriod().toFixed(2)}%</p>
                <p className="text-white/50 text-xs mt-2">
                  {FRED_CONFIG.API_KEY ? 'Real-time data' : 'Default waarde'} • Huidig: {inflationData.current}%
                </p>
              </div>
              <div className="bg-dark-bg/50 rounded-lg p-4 border border-white/10">
                <p className="text-white/60 text-sm mb-2">Koopkracht Verlies ({selectedPeriod})</p>
                <p className="text-3xl font-bold text-red-400">
                  €{calculatePurchasingPowerLoss(10000).toFixed(2)}
                </p>
                <p className="text-white/50 text-xs mt-2">Per €10.000 per jaar</p>
              </div>
              <div className="bg-dark-bg/50 rounded-lg p-4 border border-white/10">
                <p className="text-white/60 text-sm mb-2">Benodigd Rendement ({selectedPeriod})</p>
                <p className="text-3xl font-bold text-neon-blue">
                  {getAverageInflationForPeriod().toFixed(1)}%+
                </p>
                <p className="text-white/50 text-xs mt-2">Om koopkracht te behouden</p>
              </div>
            </div>

            {/* Inflatie Grafiek (Simple Bar Chart) */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-white mb-4">Historische Inflatie ({selectedPeriod})</h3>
              <div className="flex items-end gap-2 h-48">
                {(() => {
                  // Filter historische data op basis van selectedPeriod
                  const currentYear = new Date().getFullYear();
                  const periodYears = selectedPeriod === '1Y' ? 1 : selectedPeriod === '3Y' ? 3 : selectedPeriod === '5Y' ? 5 : 10;
                  const startYear = currentYear - periodYears + 1;
                  
                  const filteredHistorical = inflationData.historical.filter(
                    data => data.year >= startYear
                  );
                  
                  // Als er geen data is voor de geselecteerde periode, toon alle beschikbare data
                  const dataToShow = filteredHistorical.length > 0 ? filteredHistorical : inflationData.historical;
                  
                  // Vind de maximale waarde voor schaling
                  const maxRate = Math.max(...dataToShow.map(d => d.rate), 1);
                  
                  return dataToShow.map((data) => (
                    <div key={data.year} className="flex-1 flex flex-col items-center">
                      <div className="w-full bg-dark-bg/50 rounded-t border border-white/10 relative h-full">
                        <div
                          className="bg-gradient-to-t from-neon-green/80 to-neon-green rounded-t transition-all duration-500 absolute bottom-0 w-full"
                          style={{ height: `${(data.rate / maxRate) * 100}%` }}
                        />
                        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-white/70 text-xs whitespace-nowrap">
                          {data.rate.toFixed(1)}%
                        </div>
                      </div>
                      <div className="text-white/60 text-xs mt-2">{data.year}</div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </motion.div>

          {/* Investeringen Vergelijking */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <BarChart3 className="w-6 h-6 mr-3 text-neon-blue" />
                Investeringen vs Inflatie
              </h2>
              <div className="flex items-center gap-4">
                {/* Global Period Selection */}
                <div className="flex items-center gap-2">
                  <span className="text-white/70 text-sm">Rendement Periode:</span>
                  <div className="flex gap-1">
                    {(['1D', '1W', '1M', '3M', '1Y', '5Y', '10Y', '20Y', '50Y'] as const).map((period) => (
                      <button
                        key={period}
                        onClick={() => setSelectedReturnPeriod(period)}
                        className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                          selectedReturnPeriod === period
                            ? 'bg-neon-green text-dark-bg'
                            : 'bg-dark-bg/50 text-white/70 hover:bg-dark-bg/70'
                        }`}
                        title={`Toon rendement voor ${period}`}
                      >
                        {period}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-green/20 border border-neon-green/50 text-neon-green font-medium hover:bg-neon-green/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Haal nieuwe data op van Alpha Vantage (bypass cache)"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>{isLoading ? 'Data ophalen...' : 'Ververs Data'}</span>
                </button>
              </div>
            </div>

            {/* Info banner */}
            <div className="mb-4 p-3 bg-dark-bg/50 rounded-lg border border-white/10">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="text-sm text-white/70">
                  <strong className="text-white">{investments.length} investeringen</strong> geladen
                  {lastUpdated && (
                    <span className="ml-2 text-white/50">
                      • Laatst bijgewerkt: {lastUpdated.toLocaleTimeString('nl-NL')}
                    </span>
                  )}
                  {getCacheAge() !== null && (
                    <span className="ml-2 text-neon-green/70">
                      • Cache: {getCacheAge()} min geleden
                    </span>
                  )}
                </div>
                {investments.length < 10 && (
                  <div className="text-xs text-yellow-400/80">
                    ⚠️ Mogelijk oude cache. Klik op "Ververs Data" voor alle {12 + 1} investeringen
                  </div>
                )}
              </div>
            </div>

            {investments.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <p className="text-white/60">Geen investeringsdata beschikbaar</p>
              </div>
            )}

            {/* Filter by category */}
            <div className="mb-6 flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory === null
                    ? 'bg-neon-green text-dark-bg'
                    : 'bg-dark-bg/50 text-white/70 hover:bg-dark-bg/70'
                }`}
              >
                Alle
              </button>
              {Array.from(new Set(investments.map(inv => inv.category))).map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedCategory === category
                      ? 'bg-neon-blue text-dark-bg'
                      : 'bg-dark-bg/50 text-white/70 hover:bg-dark-bg/70'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {investments
                .filter(inv => selectedCategory === null || inv.category === selectedCategory)
                .map((investment, index) => {
                const realReturn = calculateRealReturn(investment);
                const isPositive = realReturn > 0;

                return (
                  <motion.div
                    key={investment.symbol}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-dark-secondary/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-neon-green/50 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white">{investment.name}</h3>
                        <p className="text-white/60 text-sm">{investment.symbol}</p>
                      </div>
                      {isPositive ? (
                        <TrendingUp className="w-6 h-6 text-neon-green" />
                      ) : (
                        <TrendingDown className="w-6 h-6 text-red-400" />
                      )}
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-white/60 text-sm">Huidige Waarde</p>
                        {!useMockData && investment.symbol !== 'BTC' && (
                          <span className="px-2 py-0.5 bg-neon-green/20 text-neon-green rounded-full text-xs font-medium border border-neon-green/30">
                            Live
                          </span>
                        )}
                      </div>
                      <p className="text-2xl font-bold text-white">
                        {investment.symbol === 'BTC' ? '₿' : investment.symbol === 'XAUUSD' ? '$' : '$'}
                        {investment.currentValue.toLocaleString('nl-NL', {
                          minimumFractionDigits: investment.symbol === 'XAUUSD' ? 2 : 2,
                          maximumFractionDigits: investment.symbol === 'XAUUSD' ? 2 : 2
                        })}
                      </p>
                    </div>


                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span className="text-white/60 text-sm">
                          Nominaal Rendement ({selectedReturnPeriod})
                        </span>
                        {(() => {
                          const nominalReturn = getNominalReturn(investment);
                          return (
                            <span className={`font-semibold ${nominalReturn >= 0 ? 'text-neon-green' : 'text-red-400'}`}>
                              {nominalReturn >= 0 ? '+' : ''}{nominalReturn.toFixed(2)}%
                            </span>
                          );
                        })()}
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60 text-sm">Inflatie</span>
                        <span className="text-white/70 font-semibold">-{getAverageInflationForPeriod().toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-white/10">
                        <span className="text-white font-semibold">Reëel Rendement</span>
                        <span className={`font-bold text-lg ${isPositive ? 'text-neon-green' : 'text-red-400'}`}>
                          {isPositive ? '+' : ''}{realReturn.toFixed(2)}%
                        </span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <span className="px-3 py-1 bg-neon-blue/20 text-neon-blue rounded-full text-xs font-medium border border-neon-blue/30">
                        {investment.category}
                      </span>
                    </div>

                    <p className="text-white/50 text-sm mb-4">{investment.description}</p>

                    {/* Visual Performance Bar */}
                    <div className="mt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex-1 h-2 bg-dark-bg rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              isPositive ? 'bg-neon-green' : 'bg-red-400'
                            }`}
                            style={{ width: `${Math.min(Math.abs(realReturn) * 10, 100)}%` }}
                          />
                        </div>
                        <span className={`text-xs font-medium ${isPositive ? 'text-neon-green' : 'text-red-400'}`}>
                          {realReturn > 0 ? '✓' : '✗'}
                        </span>
                      </div>
                      <p className="text-white/40 text-xs text-center">
                        {isPositive 
                          ? `Overtreft inflatie met ${realReturn.toFixed(2)}%` 
                          : `Onder inflatie met ${Math.abs(realReturn).toFixed(2)}%`
                        }
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Informatie Sectie */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-dark-secondary/30 rounded-xl p-6 border border-white/10"
          >
            <div className="flex items-start">
              <Info className="w-6 h-6 text-neon-blue mr-4 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-white mb-3">Over deze Data</h3>
                <p className="text-white/70 leading-relaxed mb-4">
                  Deze pagina toont hoe verschillende investeringen presteren ten opzichte van inflatie. 
                  Het <span className="text-neon-green font-semibold">reële rendement</span> is het verschil 
                  tussen het nominale rendement en de inflatie. Een positief reëel rendement betekent dat 
                  je koopkracht toeneemt, terwijl een negatief rendement betekent dat je koopkracht afneemt, 
                  zelfs als je investering in waarde stijgt.
                </p>
                <div className="text-white/60 text-sm">
                  {ALPHA_VANTAGE_CONFIG.API_KEY ? (
                    <>
                      <p><strong>Data Bronnen:</strong></p>
                      <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                        <li><strong>Yahoo Finance:</strong> Aandelen, ETFs (geen API key, batch requests)</li>
                        <li><strong>Alpha Vantage:</strong> Goud (XAU/USD) - {getRemainingQuota()}/25 calls vandaag</li>
                        <li><strong>CoinGecko:</strong> Bitcoin/cryptocurrency (gratis, geen API key nodig)</li>
                        <li><strong>FRED API:</strong> Inflatie data (optioneel, onbeperkt gratis)</li>
                      </ul>
                      {getRemainingQuota() < 5 && getRemainingQuota() > 0 && (
                        <p className="text-xs mt-2 text-yellow-400 font-semibold">
                          ⚠️ Alpha Vantage quota laag: {getRemainingQuota()} calls over
                        </p>
                      )}
                      {getRemainingQuota() === 0 && (
                        <p className="text-xs mt-2 text-red-400 font-semibold">
                          ⚠️ Alpha Vantage quota opgebruikt. Goud data gebruikt cache/mock data.
                        </p>
                      )}
                      <p className="text-xs mt-2 text-white/50">
                        Cache duur: 1 uur. Auto-fetch is uitgeschakeld om API calls te besparen.
                      </p>
                    </>
                  ) : (
                    <>
                      <p><strong>Data Bronnen:</strong></p>
                      <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                        <li><strong>Yahoo Finance:</strong> Aandelen, ETFs (geen API key nodig)</li>
                        <li><strong>CoinGecko:</strong> Bitcoin/cryptocurrency (gratis, geen API key nodig)</li>
                        <li><strong>FRED API:</strong> Inflatie data (optioneel, onbeperkt gratis)</li>
                      </ul>
                      <p className="text-xs mt-2 text-white/50">
                        <strong>Let op:</strong> Alpha Vantage API key niet geconfigureerd. Goud data gebruikt mock data.
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
