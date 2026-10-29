import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pause, Play, RotateCcw, Check } from 'lucide-react';
import { getJuliaApiKey, juliaCapture } from '../../lib/juliaApi';
import { playSessionBell } from '../../lib/playSessionBell';
import { useJuliaSnapshot } from '../../hooks/useJuliaSnapshot';

const PRESETS = [5, 10, 15, 20, 30] as const;
const DEFAULT_MIN = 10;

function brusselsDate(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Brussels' });
}

function formatMmSs(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

type Phase = 'idle' | 'running' | 'paused' | 'done';

export const MeditationTimer: React.FC = () => {
  const { snapshot } = useJuliaSnapshot();
  const [minutes, setMinutes] = useState(DEFAULT_MIN);
  const [remaining, setRemaining] = useState(DEFAULT_MIN * 60);
  const [phase, setPhase] = useState<Phase>('idle');
  const [logState, setLogState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [logError, setLogError] = useState<string | null>(null);
  const [loggedExtra, setLoggedExtra] = useState(0);
  const endAtRef = useRef<number | null>(null);
  const tickRef = useRef<number | null>(null);
  const wakeRef = useRef<{ release: () => Promise<void> } | null>(null);

  const todayMin = (snapshot.life?.meditationMin ?? 0) + loggedExtra;
  const streak = snapshot.life?.meditationStreakDays ?? 0;
  const total = minutes * 60;
  const progress = total > 0 ? 1 - remaining / total : 0;

  const releaseWake = useCallback(() => {
    void wakeRef.current?.release().catch(() => undefined);
    wakeRef.current = null;
  }, []);

  const requestWake = useCallback(async () => {
    try {
      const nav = navigator as Navigator & {
        wakeLock?: { request: (type: 'screen') => Promise<{ release: () => Promise<void> }> };
      };
      const lock = await nav.wakeLock?.request('screen');
      if (lock) wakeRef.current = lock;
    } catch {
      /* unsupported or denied */
    }
  }, []);

  const stopTick = useCallback(() => {
    if (tickRef.current != null) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }, []);

  const logSession = useCallback(async (elapsedMin: number) => {
    const mins = Math.max(1, elapsedMin);
    if (!getJuliaApiKey()) {
      setLogState('error');
      setLogError('Stel je Julia API-sleutel in op /julia (zelfde als JULIA_API_SECRET). Timer is klaar, log is niet naar Notion gegaan.');
      return;
    }
    setLogState('saving');
    setLogError(null);
    const res = await juliaCapture({
      date: brusselsDate(),
      kind: 'meditation',
      minutes: mins,
    });
    if (!res.success) {
      setLogState('error');
      setLogError(res.error ?? 'Loggen mislukt');
      return;
    }
    setLogState('saved');
    setLoggedExtra((n) => n + mins);
  }, []);

  const complete = useCallback(
    (elapsedSec: number) => {
      stopTick();
      releaseWake();
      endAtRef.current = null;
      setRemaining(0);
      setPhase('done');
      playSessionBell('end');
      void logSession(Math.max(1, Math.round(elapsedSec / 60)));
    },
    [logSession, releaseWake, stopTick],
  );

  useEffect(() => {
    if (phase !== 'running') return;
    tickRef.current = window.setInterval(() => {
      const endAt = endAtRef.current;
      if (!endAt) return;
      const left = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
      setRemaining(left);
      if (left <= 0) {
        complete(total);
      }
    }, 250);
    return stopTick;
  }, [phase, complete, stopTick, total]);

  useEffect(() => () => {
    stopTick();
    releaseWake();
  }, [releaseWake, stopTick]);

  const start = () => {
    if (phase === 'idle' || phase === 'done') {
      setRemaining(minutes * 60);
      setLogState('idle');
      setLogError(null);
    }
    const left = phase === 'paused' || phase === 'running' ? remaining : minutes * 60;
    endAtRef.current = Date.now() + left * 1000;
    setPhase('running');
    playSessionBell('start');
    void requestWake();
  };

  const pause = () => {
    if (phase !== 'running') return;
    stopTick();
    releaseWake();
    if (endAtRef.current) {
      setRemaining(Math.max(0, Math.ceil((endAtRef.current - Date.now()) / 1000)));
    }
    endAtRef.current = null;
    setPhase('paused');
  };

  const reset = () => {
    stopTick();
    releaseWake();
    endAtRef.current = null;
    setPhase('idle');
    setRemaining(minutes * 60);
    setLogState('idle');
    setLogError(null);
  };

  const pickPreset = (m: number) => {
    if (phase === 'running') return;
    setMinutes(m);
    setRemaining(m * 60);
    setPhase('idle');
    setLogState('idle');
  };

  return (
    <div className="orbit-readable-panel rounded-2xl p-6 md:p-8 max-w-xl mx-auto border border-orbit-violet/25">
      <p className="text-[10px] uppercase tracking-wider text-white/45 mb-2">Sessie</p>
      <h2 className="text-2xl font-bold text-white mb-1">Timer</h2>
      <p className="text-sm text-white/60 mb-6">
        Standaard 10 minuten — jouw dagelijkse hybride. Start- en eindbel zijn van ons, geen Insight Timer.
      </p>

      {(todayMin > 0 || streak > 0) && (
        <p className="text-sm text-orbit-cyan mb-5">
          Vandaag {todayMin} min
          {streak > 0 ? ` · streak ${streak}d` : ''}
        </p>
      )}

      <div
        className="relative w-48 h-48 mx-auto mb-6"
        role="timer"
        aria-live="polite"
        aria-label={`${formatMmSs(remaining)} resterend`}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(#22d3ee ${progress * 360}deg, rgba(255,255,255,0.08) 0deg)`,
          }}
        />
        <div className="absolute inset-3 rounded-full bg-dark-secondary/95 flex items-center justify-center">
          <span className="text-4xl font-mono text-white tabular-nums">{formatMmSs(remaining)}</span>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {PRESETS.map((m) => (
          <button
            key={m}
            type="button"
            disabled={phase === 'running'}
            onClick={() => pickPreset(m)}
            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
              minutes === m
                ? 'border-neon-green text-neon-green bg-neon-green/10'
                : 'border-white/15 text-white/70 hover:border-white/40'
            } disabled:opacity-40`}
          >
            {m} min
          </button>
        ))}
      </div>

      <div className="flex justify-center gap-3">
        {phase !== 'running' ? (
          <button
            type="button"
            onClick={start}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-neon-green to-neon-blue text-dark-bg font-semibold py-2.5 px-6 rounded-full"
          >
            {phase === 'paused' ? <Play className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {phase === 'paused' ? 'Verder' : phase === 'done' ? 'Opnieuw' : 'Start'}
          </button>
        ) : (
          <button
            type="button"
            onClick={pause}
            className="inline-flex items-center gap-2 border border-white/25 text-white py-2.5 px-6 rounded-full"
          >
            <Pause className="w-4 h-4" />
            Pauze
          </button>
        )}
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 border border-white/15 text-white/70 py-2.5 px-4 rounded-full hover:text-white"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>

      {phase === 'done' && logState === 'saving' && (
        <p className="text-center text-sm text-white/60 mt-4">Sessie loggen in Notion…</p>
      )}
      {logState === 'saved' && (
        <p className="text-center text-sm text-neon-green mt-4 inline-flex items-center justify-center gap-1 w-full">
          <Check className="w-4 h-4" />
          Gelogd — staat op Julia na de volgende snapshot-export.
        </p>
      )}
      {logError && <p className="text-center text-sm text-amber-200 mt-4">{logError}</p>}
    </div>
  );
};
