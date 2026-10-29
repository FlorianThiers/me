import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Mic, Square, Headphones } from 'lucide-react';
import type { MusicEngine } from '../../music/engine';
import {
  listAudioInputDevices,
  loadStoredInputDeviceId,
  saveInputDeviceId,
  type AudioInputDevice,
} from '../../music/inputDevices';
import { VocalRecorder } from '../../music/recorder';
import { STEPS_PER_BAR, stepDurationSec } from '../../music/types';

export type VocalTakeInfo = {
  sampleId: string;
  durationSec: number;
  lengthBars: number;
  /** Playlist bar where the take should start (0-based). */
  startBar: number;
};

type Props = {
  bpm: number;
  engine: MusicEngine | null;
  playing: boolean;
  /** Live playhead bar (0-based). */
  getCurrentBar: () => number;
  onEnsurePlaying: () => Promise<void>;
  onRecorded: (info: VocalTakeInfo) => void;
  onStatus: (msg: string) => void;
};

export const VocalRecorderPanel: React.FC<Props> = ({
  bpm,
  engine,
  playing,
  getCurrentBar,
  onEnsurePlaying,
  onRecorded,
  onStatus,
}) => {
  const recorderRef = useRef(new VocalRecorder());
  const punchBarRef = useRef(0);
  const [phase, setPhase] = useState<'idle' | 'armed' | 'count-in' | 'recording'>('idle');
  const [countMs, setCountMs] = useState(0);
  const [level, setLevel] = useState(0);
  const [inputs, setInputs] = useState<AudioInputDevice[]>([]);
  const [inputId, setInputId] = useState(loadStoredInputDeviceId);
  const [fromPlayhead, setFromPlayhead] = useState(true);
  const [withBacking, setWithBacking] = useState(true);
  const [monitor, setMonitor] = useState(false);

  const barMs = stepDurationSec(bpm) * STEPS_PER_BAR * 1000;

  useEffect(() => {
    void listAudioInputDevices().then(setInputs);
    const onChange = () => void listAudioInputDevices().then(setInputs);
    navigator.mediaDevices?.addEventListener?.('devicechange', onChange);
    return () => {
      navigator.mediaDevices?.removeEventListener?.('devicechange', onChange);
      recorderRef.current.disarm();
    };
  }, []);

  useEffect(() => {
    if (phase === 'idle') {
      setLevel(0);
      return;
    }
    let raf = 0;
    const tick = () => {
      setLevel(recorderRef.current.getLevel());
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  useEffect(() => {
    recorderRef.current.setMonitor(monitor);
  }, [monitor]);

  const armMic = useCallback(async () => {
    const rec = recorderRef.current;
    onStatus('arming mic…');
    await engine?.ensureContext();
    await rec.arm(inputId || undefined);
    rec.setMonitor(monitor);
    setPhase('armed');
    onStatus(monitor ? 'mic armed · monitor on' : 'mic armed');
  }, [engine, inputId, monitor, onStatus]);

  const startTake = useCallback(async () => {
    const rec = recorderRef.current;
    if (phase === 'count-in' || phase === 'recording') {
      rec.cancel();
      setPhase(rec.isArmed() ? 'armed' : 'idle');
      setCountMs(0);
      onStatus('record cancelled');
      return;
    }
    try {
      if (phase === 'idle') await armMic();
      if (withBacking && !playing) {
        onStatus('starting backing…');
        await onEnsurePlaying();
      }
      setPhase('count-in');
      onStatus('count-in…');
      await rec.startCountIn(barMs, (remaining) => setCountMs(remaining));
      punchBarRef.current = fromPlayhead ? Math.max(0, Math.floor(getCurrentBar())) : -1;
      rec.startRecording();
      setPhase('recording');
      onStatus(
        fromPlayhead
          ? `recording from bar ${punchBarRef.current + 1} · stop when done`
          : 'recording · append at end · stop when done',
      );
    } catch (err) {
      setPhase(rec.isArmed() ? 'armed' : 'idle');
      onStatus(err instanceof Error ? err.message : 'mic failed');
    }
  }, [
    armMic,
    barMs,
    fromPlayhead,
    getCurrentBar,
    onEnsurePlaying,
    onStatus,
    phase,
    playing,
    withBacking,
  ]);

  const stopTake = useCallback(async () => {
    const rec = recorderRef.current;
    if (phase !== 'recording' || !engine) return;
    try {
      const ctx = await engine.ensureContext();
      const result = await rec.stopRecording(ctx);
      const lengthBars = Math.max(
        1,
        Math.ceil(result.durationSec / (stepDurationSec(bpm) * STEPS_PER_BAR)),
      );
      const startBar = punchBarRef.current >= 0 ? punchBarRef.current : -1;
      onRecorded({ ...result, lengthBars, startBar });
      onStatus(
        startBar >= 0
          ? `take @ bar ${startBar + 1} · ${result.durationSec.toFixed(1)}s · ${lengthBars} bars`
          : `take saved · ${result.durationSec.toFixed(1)}s · ${lengthBars} bars`,
      );
      setPhase('armed');
    } catch (err) {
      onStatus(err instanceof Error ? err.message : 'stop failed');
      setPhase(rec.isArmed() ? 'armed' : 'idle');
    } finally {
      setCountMs(0);
    }
  }, [bpm, engine, onRecorded, onStatus, phase]);

  const onInputChange = async (id: string) => {
    setInputId(id);
    saveInputDeviceId(id);
    if (phase !== 'idle' && phase !== 'count-in' && phase !== 'recording') {
      try {
        await recorderRef.current.arm(id || undefined);
        recorderRef.current.setMonitor(monitor);
        onStatus('mic input switched');
      } catch (err) {
        onStatus(err instanceof Error ? err.message : 'mic switch failed');
      }
    }
  };

  return (
    <div className="flex flex-col gap-2 rounded border border-[#2a2a2a] bg-[#141414] p-2">
      <span className="text-[9px] uppercase tracking-wide text-[#5a5a5a]">Vocal recorder</span>

      <label className="flex flex-col gap-0.5 text-[10px] text-[#8a8a8a]">
        <span>Input</span>
        <select
          value={inputId}
          onChange={(e) => void onInputChange(e.target.value)}
          disabled={phase === 'count-in' || phase === 'recording'}
          className="h-7 rounded border border-[#2a2a2a] bg-[#1a1a1a] px-1.5 text-[10px] text-[#d0d0d0]"
        >
          <option value="">System default mic</option>
          {inputs.map((d) => (
            <option key={d.deviceId} value={d.deviceId}>
              {d.label}
            </option>
          ))}
        </select>
      </label>

      {(phase === 'armed' || phase === 'count-in' || phase === 'recording') && (
        <div className="flex h-2 overflow-hidden rounded bg-[#1a1a1a]">
          <div
            className={`h-full transition-[width] duration-75 ${
              level > 0.85 ? 'bg-[#c45a3a]' : level > 0.55 ? 'bg-[#c4783a]' : 'bg-[#5a9e6a]'
            }`}
            style={{ width: `${Math.round(level * 100)}%` }}
          />
        </div>
      )}

      <div className="flex flex-col gap-1 text-[10px] text-[#8a8a8a]">
        <label className="flex items-center gap-1.5">
          <input
            type="checkbox"
            checked={fromPlayhead}
            onChange={(e) => setFromPlayhead(e.target.checked)}
            className="accent-[#c4783a]"
          />
          Place take at playhead
        </label>
        <label className="flex items-center gap-1.5">
          <input
            type="checkbox"
            checked={withBacking}
            onChange={(e) => setWithBacking(e.target.checked)}
            className="accent-[#c4783a]"
          />
          Start song on count-in
        </label>
        <label className="flex items-center gap-1.5">
          <input
            type="checkbox"
            checked={monitor}
            onChange={(e) => setMonitor(e.target.checked)}
            className="accent-[#c4783a]"
          />
          <Headphones className="h-3 w-3" />
          Monitor (careful with speakers)
        </label>
      </div>

      {phase === 'count-in' && (
        <span className="font-mono text-[11px] text-[#c4783a]">
          count-in {(countMs / 1000).toFixed(1)}s
        </span>
      )}
      {phase === 'recording' && (
        <span className="animate-pulse font-mono text-[11px] text-[#e8a0c8]">● recording</span>
      )}
      {phase === 'armed' && (
        <span className="font-mono text-[10px] text-[#6a9e6a]">armed · ready</span>
      )}

      <div className="flex gap-1">
        {phase === 'idle' && (
          <button
            type="button"
            onClick={() => void armMic()}
            className="flex h-7 flex-1 items-center justify-center gap-1 bg-[#242424] text-[10px] text-[#d0d0d0] hover:bg-[#2e2e2e]"
          >
            <Mic className="h-3 w-3" />
            arm mic
          </button>
        )}
        <button
          type="button"
          onClick={() => void startTake()}
          disabled={phase === 'count-in'}
          className="flex h-7 flex-1 items-center justify-center gap-1 bg-[#242424] text-[10px] text-[#d0d0d0] hover:bg-[#2e2e2e] disabled:opacity-40"
        >
          <Mic className="h-3 w-3" />
          {phase === 'recording' || phase === 'count-in' ? 'cancel' : 'count-in + rec'}
        </button>
        <button
          type="button"
          onClick={() => void stopTake()}
          disabled={phase !== 'recording'}
          className="flex h-7 flex-1 items-center justify-center gap-1 bg-[#c4783a] text-[10px] text-[#111] disabled:opacity-40"
        >
          <Square className="h-3 w-3" />
          stop take
        </button>
      </div>
      {phase === 'armed' && (
        <button
          type="button"
          onClick={() => {
            recorderRef.current.disarm();
            setPhase('idle');
            onStatus('mic disarmed');
          }}
          className="h-6 text-[9px] text-[#6a6a6a] hover:text-[#a0a0a0]"
        >
          disarm
        </button>
      )}
    </div>
  );
};
