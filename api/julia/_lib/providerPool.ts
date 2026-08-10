export type ProviderId = 'gemini' | 'groq';

export type ProviderConfig = {
  id: ProviderId;
  label: string;
  model: string;
  dailyRequests: number;
  dailyTokens: number;
  priority: number;
  envKey: string;
};

export const PROVIDER_POOL: ProviderConfig[] = [
  {
    id: 'gemini',
    label: 'Gemini 2.0 Flash',
    model: 'gemini-2.0-flash',
    dailyRequests: 1500,
    dailyTokens: 1_000_000,
    priority: 1,
    envKey: 'GEMINI_API_KEY',
  },
  {
    id: 'groq',
    label: 'Groq Llama 3.3 70B',
    model: 'llama-3.3-70b-versatile',
    dailyRequests: 14_400,
    dailyTokens: 500_000,
    priority: 2,
    envKey: 'GROQ_API_KEY',
  },
].sort((a, b) => a.priority - b.priority);

export function providerApiKey(id: ProviderId): string | undefined {
  const cfg = PROVIDER_POOL.find((p) => p.id === id);
  if (!cfg) return undefined;
  return process.env[cfg.envKey];
}

export function configuredProviders(): ProviderConfig[] {
  return PROVIDER_POOL.filter((p) => Boolean(process.env[p.envKey]));
}
