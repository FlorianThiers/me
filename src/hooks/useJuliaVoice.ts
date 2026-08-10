/// <reference path="../speech.d.ts" />

import { useCallback, useEffect, useRef, useState } from 'react';

import type { JuliaLifeSnapshot } from '../types/juliaSnapshot';

import { getJuliaApiKey, juliaCapture, juliaChat, lifeSummaryLine } from '../lib/juliaApi';

import {

  parseJuliaIntent,

  speakNl,

  speechRecognitionAvailable,

  type VoiceIntent,

} from '../lib/juliaVoiceIntents';



export type { VoiceIntent };



type SpeechRecognitionCtor = new () => SpeechRecognition;



function getRecognition(): SpeechRecognition | null {

  const w = window as Window & {

    SpeechRecognition?: SpeechRecognitionCtor;

    webkitSpeechRecognition?: SpeechRecognitionCtor;

  };

  const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;

  return Ctor ? new Ctor() : null;

}



export function useJuliaVoice(life: JuliaLifeSnapshot | undefined, date: string) {

  const [listening, setListening] = useState(false);

  const [transcript, setTranscript] = useState('');

  const [intent, setIntent] = useState<VoiceIntent | null>(null);

  const [micSupported, setMicSupported] = useState(false);

  const [busy, setBusy] = useState(false);

  const [apiMessage, setApiMessage] = useState<string | null>(null);

  const [apiError, setApiError] = useState<string | null>(null);

  const [hasApiKey, setHasApiKey] = useState(false);

  const recRef = useRef<SpeechRecognition | null>(null);



  useEffect(() => {

    setMicSupported(speechRecognitionAvailable());

    setHasApiKey(Boolean(getJuliaApiKey()));

  }, []);



  const refreshApiKey = useCallback(() => {

    setHasApiKey(Boolean(getJuliaApiKey()));

  }, []);



  const runCapture = useCallback(

    async (parsed: Extract<VoiceIntent, { kind: 'capture' }>) => {

      if (!getJuliaApiKey()) {

        setApiError('Geen API-sleutel — stel in via Instellingen of /julia/usage.');

        return;

      }

      setBusy(true);

      setApiError(null);

      const res = await juliaCapture({

        date,

        kind: parsed.captureKind,

        liters: parsed.liters,

        preset: parsed.preset,

      });

      setBusy(false);

      if (!res.success) {

        setApiError(res.error ?? 'Capture mislukt');

        return;

      }

      if (parsed.captureKind === 'water') {

        setApiMessage(`Water gelogd — totaal ${res.waterL ?? '?'} L in Notion.`);

        speakNl(`Water gelogd. Je zit aan ${res.waterL} liter.`);

      } else {

        setApiMessage('Merci gelogd in Notion.');

        speakNl('Merci gelogd.');

      }

    },

    [date],

  );



  const runChat = useCallback(

    async (message: string) => {

      if (!getJuliaApiKey()) {

        setApiError('Geen API-sleutel — stel in via Instellingen.');

        return;

      }

      setBusy(true);

      setApiError(null);

      const res = await juliaChat({

        message,

        date,

        lifeSummary: lifeSummaryLine(life),

      });

      setBusy(false);

      if (!res.success || !res.text) {

        setApiError(res.error ?? 'Chat mislukt');

        return;

      }

      const via = res.provider ? ` (${res.provider})` : '';

      setApiMessage(res.text);

      speakNl(res.text);

      setIntent({ kind: 'speak', text: `${res.text}${via}` });

    },

    [date, life],

  );



  const applyText = useCallback(

    async (text: string, speakResponse = true) => {

      const trimmed = text.trim();

      setTranscript(trimmed);

      setApiMessage(null);

      setApiError(null);



      const parsed = parseJuliaIntent(trimmed, life, date);

      setIntent(parsed);

      if (!parsed) return parsed;



      if (parsed.kind === 'capture') {

        await runCapture(parsed);

        return parsed;

      }

      if (parsed.kind === 'chat') {

        await runChat(parsed.text);

        return parsed;

      }

      if (speakResponse && parsed.kind === 'speak') speakNl(parsed.text);

      return parsed;

    },

    [life, date, runCapture, runChat],

  );



  const stop = useCallback(() => {

    recRef.current?.stop();

    setListening(false);

  }, []);



  const start = useCallback(() => {

    const rec = getRecognition();

    if (!rec) return;

    recRef.current = rec;

    rec.lang = 'nl-BE';

    rec.interimResults = false;

    rec.maxAlternatives = 1;

    setTranscript('');

    setIntent(null);

    rec.onresult = (ev: SpeechRecognitionEvent) => {

      const text = ev.results[0]?.[0]?.transcript ?? '';

      void applyText(text);

    };

    rec.onerror = () => setListening(false);

    rec.onend = () => setListening(false);

    rec.start();

    setListening(true);

  }, [applyText]);



  const copyCaptureCommand = useCallback(async () => {

    if (intent?.kind !== 'capture_cmd') return false;

    try {

      await navigator.clipboard.writeText(intent.command);

      return true;

    } catch {

      return false;

    }

  }, [intent]);



  return {

    listening,

    transcript,

    intent,

    micSupported,

    busy,

    apiMessage,

    apiError,

    hasApiKey,

    refreshApiKey,

    applyText,

    start,

    stop,

    copyCaptureCommand,

  };

}


