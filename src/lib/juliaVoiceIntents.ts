import type { JuliaLifeSnapshot } from '../types/juliaSnapshot';
import type { CaptureKind, CaptureResponse, SportType } from './juliaApi';

export type VoiceIntent =
  | { kind: 'water'; liters: number; label: string }
  | { kind: 'food'; preset: string; label: string }
  | { kind: 'speak'; text: string }
  | {
      kind: 'capture';
      captureKind: CaptureKind;
      liters?: number;
      preset?: string;
      minutes?: number;
      hours?: number;
      sportType?: SportType;
      energy?: number;
      intensity?: 'Sedentary' | 'Light' | 'Active';
      moodScore?: number;
      moodNote?: string;
      label: string;
    }
  | { kind: 'chat'; text: string }
  | { kind: 'capture_cmd'; command: string; label: string };

export type VoiceQuickAction = { id: string; labelKey: string; phrase: string };

export const VOICE_QUICK_ACTIONS: VoiceQuickAction[] = [
  { id: 'water', labelKey: 'julia.voice.quick.water', phrase: 'glas water' },
  { id: 'merci', labelKey: 'julia.voice.quick.merci', phrase: 'merci' },
  { id: 'sleep', labelKey: 'julia.voice.quick.sleep', phrase: '7 uur geslapen' },
  { id: 'walk', labelKey: 'julia.voice.quick.walk', phrase: '40 minuten gewandeld' },
  { id: 'sit', labelKey: 'julia.voice.quick.sit', phrase: '10 minuten meditatie' },
  { id: 'meal', labelKey: 'julia.voice.quick.meal', phrase: 'wat eten we vanavond' },
  { id: 'protein', labelKey: 'julia.voice.quick.protein', phrase: 'hoeveel eiwit vandaag' },
];

const TTS_PREF_KEY = 'julia-tts-enabled';

/** Default off — browser TTS is opt-in only. */
export function getTtsEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(TTS_PREF_KEY) === '1';
}

export function setTtsEnabled(on: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TTS_PREF_KEY, on ? '1' : '0');
  if (!on) stopSpeak();
}

function parseHours(t: string): number | null {
  const m = t.match(/(\d+(?:[.,]\d+)?)\s*(?:uur|uren|\bu\b)/i);
  if (!m) return null;
  const n = Number(m[1].replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

function parseMinutes(t: string): number | null {
  const m = t.match(/(\d+(?:[.,]\d+)?)\s*(?:min(?:uten?)?|minuut)\b/i);
  if (!m) return null;
  const n = Number(m[1].replace(',', '.'));
  return Number.isFinite(n) ? Math.round(n) : null;
}

function parseSportType(t: string): SportType | undefined {
  const m = t.match(/\btype\s*([abcd])\b/i);
  return m ? (m[1].toUpperCase() as SportType) : undefined;
}

export function captureReply(
  parsed: Extract<VoiceIntent, { kind: 'capture' }>,
  res: CaptureResponse,
): { text: string; speak: string } {
  switch (parsed.captureKind) {
    case 'water':
      return {
        text: `Water gelogd — totaal ${res.waterL ?? '?'} L in Notion.`,
        speak: `Water gelogd. Je zit aan ${res.waterL} liter.`,
      };
    case 'food':
      return { text: 'Merci gelogd in Notion.', speak: 'Merci gelogd.' };
    case 'sleep': {
      const h = res.sleepHours ?? res.hours ?? parsed.hours ?? '?';
      return { text: `Slaap gelogd — ${h} uur.`, speak: `Slaap gelogd. ${h} uur.` };
    }
    case 'movement': {
      const min = res.minutes ?? parsed.minutes ?? '?';
      const type = res.sportType ? ` type ${res.sportType}` : '';
      return {
        text: `Beweging gelogd — ${min} min${type}.`,
        speak: `Beweging gelogd. ${min} minuten.`,
      };
    }
    case 'meditation': {
      const min = res.meditationMin ?? res.minutes ?? parsed.minutes ?? '?';
      return {
        text: `Meditatie gelogd — ${min} min.`,
        speak: `Meditatie gelogd. ${min} minuten.`,
      };
    }
    case 'mood': {
      const s = res.moodScore ?? parsed.moodScore ?? '?';
      return { text: `Mood gelogd — ${s}/5.`, speak: `Mood gelogd. ${s} uit 5.` };
    }
    default:
      return { text: 'Gelogd in Notion.', speak: 'Gelogd.' };
  }
}

export function parseJuliaIntent(
  text: string,
  life: JuliaLifeSnapshot | undefined,
  _date: string,
): VoiceIntent | null {
  const t = text.toLowerCase().trim();
  if (!t) return null;

  if (/glas water|water gedronken|nog .*water|liter water/.test(t)) {
    const liters = /half|0[,.]5/.test(t) ? 0.5 : /twee|2/.test(t) ? 0.5 : 0.25;
    return {
      kind: 'capture',
      captureKind: 'water',
      liters,
      label: `Water +${liters}L loggen`,
    };
  }
  if (/merci|chocola/.test(t) && !/meditat/.test(t)) {
    return {
      kind: 'capture',
      captureKind: 'food',
      preset: 'merci',
      label: 'Merci loggen',
    };
  }

  if (/geslapen/.test(t) || (/\bslaap\b/.test(t) && parseHours(t) !== null)) {
    const hours = parseHours(t) ?? (/slecht/.test(t) ? 6 : 7.5);
    const energy = /slecht/.test(t) ? 2 : /goed|prima/.test(t) ? 4 : /uitstekend/.test(t) ? 5 : undefined;
    return {
      kind: 'capture',
      captureKind: 'sleep',
      hours,
      energy,
      label: `Slaap ${hours}u loggen`,
    };
  }

  if (/meditat|gemediteerd|\btm\b|zazen|vipassana/.test(t)) {
    const minutes = parseMinutes(t) ?? 10;
    return {
      kind: 'capture',
      captureKind: 'meditation',
      minutes,
      label: `Meditatie ${minutes} min loggen`,
    };
  }

  if (
    /gewandeld|wandel|fiets|gesport|beweging|slackline|\btype\s*[abcd]\b/.test(t)
  ) {
    const sportType = parseSportType(t);
    const minutes = parseMinutes(t) ?? 30;
    return {
      kind: 'capture',
      captureKind: 'movement',
      minutes,
      sportType,
      intensity: sportType && sportType !== 'D' ? 'Active' : 'Light',
      label: sportType
        ? `Beweging type ${sportType} · ${minutes} min`
        : `Beweging ${minutes} min loggen`,
    };
  }

  const moodMatch = t.match(/(?:mood|humeur|gevoel)\s*(\d)/);
  if (moodMatch || /voel me|ik voel/.test(t)) {
    const score = moodMatch ? Number(moodMatch[1]) : /goed|blij|prima/.test(t) ? 4 : /slecht|moe|bah/.test(t) ? 2 : 3;
    return {
      kind: 'capture',
      captureKind: 'mood',
      moodScore: Math.min(5, Math.max(1, score)),
      moodNote: t,
      label: `Mood ${score}/5 loggen`,
    };
  }

  if (/wat eten|vanavond|menu|meal/.test(t)) {
    const meal = life?.mealTonight || life?.mealLunch;
    return {
      kind: 'speak',
      text: meal
        ? `Voor vandaag staat gepland: ${meal}.`
        : 'Er staat nog geen maaltijd gepland voor vandaag.',
    };
  }
  if (/eiwit|prote[iï]ne/.test(t)) {
    const p = life?.proteinG ?? 0;
    const target = life?.proteinTargetG ?? 140;
    return { kind: 'speak', text: `Je zit aan ${Math.round(p)} gram eiwit van ${target} gram vandaag.` };
  }
  if (/calorie|kcal/.test(t)) {
    const k = life?.kcal ?? 0;
    return { kind: 'speak', text: `Je zit aan ongeveer ${Math.round(k)} kilocalorieën vandaag.` };
  }
  if (/vezels|fiber/.test(t)) {
    const f = life?.fiberG ?? 0;
    const target = life?.fiberTargetG ?? 30;
    return { kind: 'speak', text: `Vezels: ${Math.round(f)} van ${target} gram.` };
  }
  return {
    kind: 'chat',
    text: t,
  };
}

type SpeechRecognitionCtor = new () => SpeechRecognition;

export function speechRecognitionAvailable(): boolean {
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return !!(w.SpeechRecognition || w.webkitSpeechRecognition);
}

export function ttsAvailable(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function stopSpeak(): void {
  if (!ttsAvailable()) return;
  window.speechSynthesis.cancel();
}

/** Browser TTS — only when getTtsEnabled() is true. */
export function speakNl(text: string): void {
  if (!ttsAvailable() || !getTtsEnabled() || !text.trim()) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text.trim());
  u.lang = 'nl-BE';
  u.rate = 0.95;
  u.pitch = 1;
  const voices = window.speechSynthesis.getVoices();
  const nl =
    voices.find((v) => /^nl(-|$)/i.test(v.lang) && /belgium|be|flemish|nederlands/i.test(v.name)) ||
    voices.find((v) => /^nl(-|$)/i.test(v.lang));
  if (nl) u.voice = nl;
  window.speechSynthesis.speak(u);
}

export function isFirefox(): boolean {
  return typeof navigator !== 'undefined' && /firefox/i.test(navigator.userAgent);
}
