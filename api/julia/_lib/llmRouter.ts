import type { ProviderId } from './providerPool.js';
import { PROVIDER_POOL, providerApiKey } from './providerPool.js';
import { isProviderAvailable, loadUsage, recordUsage, type DayUsage } from './quotaStore.js';

export type ChatResult = {
  text: string;
  provider: ProviderId;
  tokensIn: number;
  tokensOut: number;
  failoverFrom?: ProviderId[];
};

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

async function callGemini(system: string, user: string): Promise<{ text: string; tokensIn: number; tokensOut: number }> {
  const key = providerApiKey('gemini');
  if (!key) throw new Error('no_key');

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts: [{ text: user }] }],
      }),
    },
  );

  const data = (await res.json()) as {
    error?: { message?: string; status?: string };
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number };
  };

  if (!res.ok) {
    const msg = data.error?.message ?? res.statusText;
    const err = new Error(msg) as Error & { status?: number; code?: string };
    err.status = res.status;
    if (res.status === 429 || /quota|rate/i.test(msg)) err.code = 'rate_limit';
    throw err;
  }

  const text =
    data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ??
    'Geen antwoord van Gemini.';
  return {
    text,
    tokensIn: data.usageMetadata?.promptTokenCount ?? estimateTokens(system + user),
    tokensOut: data.usageMetadata?.candidatesTokenCount ?? estimateTokens(text),
  };
}

async function callGroq(system: string, user: string): Promise<{ text: string; tokensIn: number; tokensOut: number }> {
  const key = providerApiKey('groq');
  if (!key) throw new Error('no_key');

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      max_tokens: 512,
    }),
  });

  const data = (await res.json()) as {
    error?: { message?: string };
    choices?: Array<{ message?: { content?: string } }>;
    usage?: { prompt_tokens?: number; completion_tokens?: number };
  };

  if (!res.ok) {
    const msg = data.error?.message ?? res.statusText;
    const err = new Error(msg) as Error & { status?: number; code?: string };
    err.status = res.status;
    if (res.status === 429 || /rate/i.test(msg)) err.code = 'rate_limit';
    throw err;
  }

  const text = data.choices?.[0]?.message?.content ?? 'Geen antwoord van Groq.';
  return {
    text,
    tokensIn: data.usage?.prompt_tokens ?? estimateTokens(system + user),
    tokensOut: data.usage?.completion_tokens ?? estimateTokens(text),
  };
}

async function callProvider(
  id: ProviderId,
  system: string,
  user: string,
): Promise<{ text: string; tokensIn: number; tokensOut: number }> {
  if (id === 'gemini') return callGemini(system, user);
  return callGroq(system, user);
}

export async function routeChat(
  message: string,
  context: { date: string; lifeSummary?: string },
): Promise<ChatResult> {
  const usage = await loadUsage(context.date);
  const system = [
    'Je bent Julia, een beknopte NL-BE assistent voor Life OS (voeding, water, dagritme).',
    'Geef korte, praktische antwoorden. Geen medisch advies. Geen code of deploy.',
    context.lifeSummary ? `Context vandaag: ${context.lifeSummary}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const failoverFrom: ProviderId[] = [];
  const ordered = [...PROVIDER_POOL].sort((a, b) => a.priority - b.priority);

  for (const provider of ordered) {
    const avail = isProviderAvailable(usage, provider.id);
    if (!avail.ok) continue;

    try {
      const result = await callProvider(provider.id, system, message);
      await recordUsage({
        provider: provider.id,
        tokensIn: result.tokensIn,
        tokensOut: result.tokensOut,
        intent: 'chat',
        ok: true,
      }, context.date);

      return {
        text: result.text,
        provider: provider.id,
        tokensIn: result.tokensIn,
        tokensOut: result.tokensOut,
        failoverFrom: failoverFrom.length ? failoverFrom : undefined,
      };
    } catch (e) {
      const err = e as Error & { code?: string; status?: number };
      const note = err.code === 'rate_limit' || err.status === 429 ? 'rate_limit' : 'error';
      await recordUsage({
        provider: provider.id,
        tokensIn: estimateTokens(message),
        tokensOut: 0,
        intent: 'chat',
        ok: false,
        note,
      }, context.date);
      failoverFrom.push(provider.id);
    }
  }

  throw new Error('Alle providers in de pool zijn uitgeput of niet geconfigureerd.');
}

export async function getUsageForDashboard(date: string) {
  const usage = await loadUsage(date);
  return usage;
}
