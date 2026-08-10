import { useCallback, useEffect, useRef, useState } from 'react';
import type { JuliaLifeSnapshot } from '../types/juliaSnapshot';
import { getJuliaApiKey, juliaCapture, juliaChat, lifeSummaryLine } from '../lib/juliaApi';
import {
  getTtsEnabled,
  parseJuliaIntent,
  setTtsEnabled,
  speakNl,
  speechRecognitionAvailable,
  stopSpeak,
  ttsAvailable,
} from '../lib/juliaVoiceIntents';

export type ChatRole = 'user' | 'assistant' | 'system';

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: number;
  status?: 'done' | 'error' | 'aborted';
  provider?: string;
  meta?: string;
};

const THREAD_KEY = 'julia-chat-thread-v1';

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function loadThread(): ChatMessage[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = sessionStorage.getItem(THREAD_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ChatMessage[];
    return Array.isArray(parsed) ? parsed.slice(-80) : [];
  } catch {
    return [];
  }
}

function saveThread(messages: ChatMessage[]) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(THREAD_KEY, JSON.stringify(messages.slice(-80)));
  } catch {
    /* ignore quota */
  }
}

type SpeechRecognitionCtor = new () => SpeechRecognition;

function getRecognition(): SpeechRecognition | null {
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

export function useJuliaChat(life: JuliaLifeSnapshot | undefined, date: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [micSupported, setMicSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [ttsOn, setTtsOn] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');
  const abortRef = useRef<AbortController | null>(null);
  const recRef = useRef<SpeechRecognition | null>(null);
  const stickBottomRef = useRef(true);

  useEffect(() => {
    setMessages(loadThread());
    setHasApiKey(Boolean(getJuliaApiKey()));
    setMicSupported(speechRecognitionAvailable());
    setTtsSupported(ttsAvailable());
    setTtsOn(getTtsEnabled());
  }, []);

  useEffect(() => {
    saveThread(messages);
  }, [messages]);

  const refreshApiKey = useCallback(() => {
    setHasApiKey(Boolean(getJuliaApiKey()));
  }, []);

  const toggleTts = useCallback(() => {
    setTtsOn((prev) => {
      const next = !prev;
      setTtsEnabled(next);
      return next;
    });
  }, []);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setBusy(false);
    recRef.current?.stop();
    setListening(false);
    stopSpeak();
  }, []);

  const clearThread = useCallback(() => {
    stop();
    setMessages([]);
    setEditingId(null);
    sessionStorage.removeItem(THREAD_KEY);
  }, [stop]);

  const runUserText = useCallback(
    async (
      text: string,
      opts?: { replaceFromId?: string; seedMessages?: ChatMessage[] },
    ) => {
      const trimmed = text.trim();
      if (!trimmed || busy) return;

      const userMsg: ChatMessage = {
        id: opts?.replaceFromId ?? uid(),
        role: 'user',
        content: trimmed,
        createdAt: Date.now(),
        status: 'done',
      };

      setMessages((prev) => {
        const base = opts?.seedMessages ?? prev;
        if (opts?.replaceFromId) {
          const idx = base.findIndex((m) => m.id === opts.replaceFromId);
          if (idx >= 0) return [...base.slice(0, idx), userMsg];
        }
        return [...base, userMsg];
      });
      setDraft('');
      setEditingId(null);

      if (!getJuliaApiKey()) {
        setMessages((prev) => [
          ...prev,
          {
            id: uid(),
            role: 'assistant',
            content: 'Geen API-sleutel — stel JULIA_API_SECRET in via de sleutel-knop of /julia/usage.',
            createdAt: Date.now(),
            status: 'error',
          },
        ]);
        return;
      }

      const parsed = parseJuliaIntent(trimmed, life, date);
      const ac = new AbortController();
      abortRef.current = ac;
      setBusy(true);

      try {
        if (parsed?.kind === 'capture') {
          const res = await juliaCapture(
            {
              date,
              kind: parsed.captureKind,
              liters: parsed.liters,
              preset: parsed.preset,
            },
            { signal: ac.signal },
          );
          if (res.error === 'aborted') {
            setMessages((prev) => [
              ...prev,
              {
                id: uid(),
                role: 'assistant',
                content: 'Gestopt.',
                createdAt: Date.now(),
                status: 'aborted',
              },
            ]);
            return;
          }
          if (!res.success) {
            setMessages((prev) => [
              ...prev,
              {
                id: uid(),
                role: 'assistant',
                content: res.error ?? 'Capture mislukt',
                createdAt: Date.now(),
                status: 'error',
              },
            ]);
            return;
          }
          const content =
            parsed.captureKind === 'water'
              ? `Water gelogd — totaal ${res.waterL ?? '?'} L in Notion.`
              : 'Merci gelogd in Notion.';
          setMessages((prev) => [
            ...prev,
            {
              id: uid(),
              role: 'assistant',
              content,
              createdAt: Date.now(),
              status: 'done',
              meta: parsed.label,
            },
          ]);
          speakNl(
            parsed.captureKind === 'water'
              ? `Water gelogd. Je zit aan ${res.waterL} liter.`
              : 'Merci gelogd.',
          );
          return;
        }

        if (parsed?.kind === 'speak') {
          setMessages((prev) => [
            ...prev,
            {
              id: uid(),
              role: 'assistant',
              content: parsed.text,
              createdAt: Date.now(),
              status: 'done',
            },
          ]);
          speakNl(parsed.text);
          return;
        }

        const chatText = parsed?.kind === 'chat' ? parsed.text : trimmed;
        const res = await juliaChat(
          {
            message: chatText,
            date,
            lifeSummary: lifeSummaryLine(life),
          },
          { signal: ac.signal },
        );
        if (res.error === 'aborted') {
          setMessages((prev) => [
            ...prev,
            {
              id: uid(),
              role: 'assistant',
              content: 'Gestopt.',
              createdAt: Date.now(),
              status: 'aborted',
            },
          ]);
          return;
        }
        if (!res.success || !res.text) {
          setMessages((prev) => [
            ...prev,
            {
              id: uid(),
              role: 'assistant',
              content: res.error ?? 'Chat mislukt',
              createdAt: Date.now(),
              status: 'error',
            },
          ]);
          return;
        }
        setMessages((prev) => [
          ...prev,
          {
            id: uid(),
            role: 'assistant',
            content: res.text!,
            createdAt: Date.now(),
            status: 'done',
            provider: res.provider,
          },
        ]);
        speakNl(res.text);
      } finally {
        abortRef.current = null;
        setBusy(false);
      }
    },
    [busy, date, life],
  );

  const sendDraft = useCallback(() => {
    void runUserText(draft);
  }, [draft, runUserText]);

  const startEdit = useCallback((msg: ChatMessage) => {
    if (msg.role !== 'user') return;
    setEditingId(msg.id);
    setEditDraft(msg.content);
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setEditDraft('');
  }, []);

  const commitEdit = useCallback(() => {
    if (!editingId || !editDraft.trim()) return;
    void runUserText(editDraft, { replaceFromId: editingId });
  }, [editingId, editDraft, runUserText]);

  const regenerateLast = useCallback(() => {
    if (busy) return;
    setMessages((prev) => {
      let lastUserIdx = -1;
      for (let i = prev.length - 1; i >= 0; i--) {
        if (prev[i].role === 'user') {
          lastUserIdx = i;
          break;
        }
      }
      if (lastUserIdx < 0) return prev;
      const userText = prev[lastUserIdx].content;
      const truncated = prev.slice(0, lastUserIdx);
      queueMicrotask(() => {
        void runUserText(userText, { seedMessages: truncated });
      });
      return truncated;
    });
  }, [busy, runUserText]);

  const copyMessage = useCallback(async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      return true;
    } catch {
      return false;
    }
  }, []);

  const speakMessage = useCallback((content: string) => {
    if (!getTtsEnabled()) {
      setTtsEnabled(true);
      setTtsOn(true);
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(content.trim());
      u.lang = 'nl-BE';
      u.rate = 0.95;
      window.speechSynthesis.speak(u);
    }
  }, []);

  const startMic = useCallback(() => {
    const rec = getRecognition();
    if (!rec) return;
    stopSpeak();
    recRef.current = rec;
    rec.lang = 'nl-BE';
    rec.continuous = false;
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (ev: SpeechRecognitionEvent) => {
      const text = ev.results[0]?.[0]?.transcript ?? '';
      if (text.trim()) {
        setDraft(text.trim());
        void runUserText(text);
      }
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    rec.start();
    setListening(true);
  }, [runUserText]);

  const stopMic = useCallback(() => {
    recRef.current?.stop();
    setListening(false);
  }, []);

  return {
    messages,
    draft,
    setDraft,
    busy,
    hasApiKey,
    refreshApiKey,
    micSupported,
    listening,
    ttsOn,
    ttsSupported,
    toggleTts,
    editingId,
    editDraft,
    setEditDraft,
    stickBottomRef,
    sendDraft,
    stop,
    clearThread,
    startEdit,
    cancelEdit,
    commitEdit,
    regenerateLast,
    copyMessage,
    speakMessage,
    startMic,
    stopMic,
    runUserText,
  };
}
