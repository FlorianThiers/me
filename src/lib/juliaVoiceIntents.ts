import type { JuliaLifeSnapshot } from '../types/juliaSnapshot';

export type VoiceIntent =
  | { kind: 'water'; liters: number; label: string }
  | { kind: 'food'; preset: string; label: string }
  | { kind: 'speak'; text: string }
  | { kind: 'capture'; captureKind: 'water' | 'food'; liters?: number; preset?: string; label: string }
  | { kind: 'chat'; text: string }
  | { kind: 'capture_cmd'; command: string; label: string };

export type VoiceQuickAction = { id: string; labelKey: string; phrase: string };

export const VOICE_QUICK_ACTIONS: VoiceQuickAction[] = [
  { id: 'water', labelKey: 'julia.voice.quick.water', phrase: 'glas water' },
  { id: 'merci', labelKey: 'julia.voice.quick.merci', phrase: 'merci' },
  { id: 'meal', labelKey: 'julia.voice.quick.meal', phrase: 'wat eten we vanavond' },
  { id: 'protein', labelKey: 'julia.voice.quick.protein', phrase: 'hoeveel eiwit vandaag' },
];

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
  if (/merci|chocola/.test(t)) {
    return {
      kind: 'capture',
      captureKind: 'food',
      preset: 'merci',
      label: 'Merci loggen',
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

export function speakNl(text: string): void {
  if (!ttsAvailable()) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'nl-BE';
  window.speechSynthesis.speak(u);
}

export function isFirefox(): boolean {
  return typeof navigator !== 'undefined' && /firefox/i.test(navigator.userAgent);
}
