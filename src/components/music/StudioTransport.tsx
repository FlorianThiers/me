import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronDown,
  LayoutDashboard,
  Play,
  Repeat,
  RotateCcw,
  Settings2,
  Square,
} from 'lucide-react';
import type { PlayMode } from '../../music/types';
import type { VoicePack } from '../../music/types';
import type { SongDefinition, SongId } from '../../music/songs';
import {
  masterVolumeFromPercent,
  masterVolumePercent,
  MAX_MASTER_VOLUME,
} from '../../music/masterVolume';
import { AudioOutputSelect } from './AudioOutputSelect';
import { SongLibraryControls } from './SongLibraryControls';
import { STUDIO, WINDOW_SHORT } from './studioTheme';
import { FL } from '../../music/flTerms';

export type PanelKey =
  | 'arrangement'
  | 'rack'
  | 'pianoroll'
  | 'mixer'
  | 'livecode'
  | 'visualizer'
  | 'sound';

type Props = {
  studioName: string;
  songs: SongDefinition[];
  songId: SongId;
  currentGenre: VoicePack;
  onSongChange: (id: SongId) => void;
  onSongNew: (title: string, genre: VoicePack) => void;
  onSongSaveAs: (title: string) => void;
  onSongDuplicate: () => void;
  onSongRename: (title: string) => void;
  onSongDelete: () => void;
  onSongExport: () => void;
  onSongImport: (json: string) => void;
  onSongResetFactory?: () => void;
  playing: boolean;
  playMode: PlayMode;
  bpm: number;
  bpmDraft: string | null;
  looping: boolean;
  metronome: boolean;
  keysOn: boolean;
  keyboardMode: 'piano' | 'liveSet';
  onKeyboardMode: (mode: 'piano' | 'liveSet') => void;
  snapSteps: 1 | 2 | 4;
  snapBars: 1 | 2 | 4;
  swing: number;
  status: string;
  parseErrors: number;
  panels: Record<PanelKey, boolean>;
  onTogglePlay: () => void;
  onPlayMode: (mode: PlayMode) => void;
  onLoop: () => void;
  onMetronome: () => void;
  onKeys: () => void;
  onBpmDraft: (v: string | null) => void;
  onBpmCommit: (bpm: number) => void;
  onSnapSteps: (v: 1 | 2 | 4) => void;
  onSnapBars: (v: 1 | 2 | 4) => void;
  onSwing: (v: number) => void;
  onGridProfile: (p: 'tight' | 'human' | 'loose') => void;
  onResetProject: () => void;
  onResetLayout: () => void;
  onTogglePanel: (key: PanelKey) => void;
  outputDeviceId: string;
  onOutputDevice: (deviceId: string) => Promise<void> | void;
  masterVolume: number;
  onMasterVolume: (volume: number) => void;
};

const PANEL_LABELS: Record<PanelKey, string> = {
  arrangement: FL.playlist,
  rack: FL.channelRack,
  pianoroll: FL.pianoRoll,
  mixer: FL.mixer,
  livecode: FL.livecode,
  visualizer: FL.scope,
  sound: FL.sound,
};

const PANEL_HINTS: Partial<Record<PanelKey, string>> = {
  arrangement: 'F5',
  rack: 'F6',
  pianoroll: 'F7',
  mixer: 'F9',
};

export const StudioTransport: React.FC<Props> = ({
  studioName,
  songs,
  songId,
  currentGenre,
  onSongChange,
  onSongNew,
  onSongSaveAs,
  onSongDuplicate,
  onSongRename,
  onSongDelete,
  onSongExport,
  onSongImport,
  onSongResetFactory,
  playing,
  playMode,
  bpm,
  bpmDraft,
  looping,
  metronome,
  keysOn,
  keyboardMode,
  onKeyboardMode,
  snapSteps,
  snapBars,
  swing,
  status,
  parseErrors,
  panels,
  onTogglePlay,
  onPlayMode,
  onLoop,
  onMetronome,
  onKeys,
  onBpmDraft,
  onBpmCommit,
  onSnapSteps,
  onSnapBars,
  onSwing,
  onGridProfile,
  onResetProject,
  onResetLayout,
  onTogglePanel,
  outputDeviceId,
  onOutputDevice,
  masterVolume,
  onMasterVolume,
}) => {
  const [toolsOpen, setToolsOpen] = useState(false);
  const volPct = masterVolumePercent(masterVolume);

  const btn = (active: boolean) =>
    `h-[22px] px-2 text-[10px] uppercase tracking-wide transition-colors ${
      active
        ? 'text-[#111] font-semibold'
        : 'text-[#888] hover:text-white'
    }`;

  const btnStyle = (active: boolean): React.CSSProperties =>
    active ? { background: STUDIO.accent } : { background: STUDIO.surface };

  return (
    <div className="shrink-0" style={{ background: STUDIO.bg, borderColor: STUDIO.border }}>
      {/* Row 1 — transport (FL top bar) */}
      <div className="flex h-[34px] items-center gap-1 border-b px-2" style={{ borderColor: STUDIO.border }}>
        <Link to="/" className="mr-1 text-[10px] hover:text-white" style={{ color: STUDIO.textMuted }}>
          ← home
        </Link>
        <span className="mr-2 text-[11px] font-medium" style={{ color: STUDIO.text }}>
          {studioName}
        </span>

        <SongLibraryControls
          songId={songId}
          songs={songs}
          currentGenre={currentGenre}
          onSelect={onSongChange}
          onNew={onSongNew}
          onSaveAs={onSongSaveAs}
          onDuplicate={onSongDuplicate}
          onRename={onSongRename}
          onDelete={onSongDelete}
          onExport={onSongExport}
          onImport={onSongImport}
          onResetFactory={onSongResetFactory}
        />

        <div className="flex items-center gap-0.5 rounded-sm p-0.5" style={{ background: STUDIO.surface }}>
          <button
            type="button"
            onClick={onTogglePlay}
            className="flex h-[26px] min-w-[52px] items-center justify-center gap-1 text-[11px] font-semibold"
            style={{ background: STUDIO.play, color: STUDIO.accentText }}
            title="Space"
          >
            {playing ? <Square className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            {playing ? 'Stop' : 'Play'}
          </button>
        </div>

        <div className="mx-2 h-5 w-px" style={{ background: STUDIO.border }} />

        <div className="flex rounded-sm p-0.5" style={{ background: STUDIO.surface }}>
          <button
            type="button"
            onClick={() => onPlayMode('session')}
            className={btn(playMode === 'session')}
            style={btnStyle(playMode === 'session')}
            title="Pattern mode — loop the current Pattern"
          >
            {FL.patternMode}
          </button>
          <button
            type="button"
            onClick={() => onPlayMode('arr')}
            className={btn(playMode === 'arr')}
            style={btnStyle(playMode === 'arr')}
            title="Song mode — play the Playlist"
          >
            {FL.songMode}
          </button>
        </div>

        <button
          type="button"
          onClick={onLoop}
          className={`ml-1 flex h-[22px] items-center gap-1 px-2 text-[10px] ${looping ? 'text-[#ff8c00]' : 'text-[#666]'}`}
          style={{ background: looping ? STUDIO.active : STUDIO.surface }}
          title="Loop"
        >
          <Repeat className="h-3 w-3" />
        </button>

        <button
          type="button"
          onClick={onMetronome}
          className={`h-[22px] px-2 text-[10px] ${metronome ? 'text-[#ff8c00]' : 'text-[#666]'}`}
          style={{ background: metronome ? STUDIO.active : STUDIO.surface }}
          title="Click (metronome) — default off"
        >
          {FL.click}
        </button>

        <button
          type="button"
          onClick={onKeys}
          className={`h-[22px] px-2 text-[10px] ${keysOn ? 'text-[#ff8c00]' : 'text-[#666]'}`}
          style={{ background: keysOn ? STUDIO.active : STUDIO.surface }}
          title="Master keyboard shortcuts on/off"
        >
          Keys
        </button>

        <div
          className="flex h-[22px] overflow-hidden border text-[9px]"
          style={{ borderColor: STUDIO.border }}
          title="Piano typing keyboard vs live-set clip/scene keys (same physical keys, different mode)"
        >
          <button
            type="button"
            disabled={!keysOn}
            onClick={() => onKeyboardMode('piano')}
            className="px-2 uppercase tracking-wide"
            style={{
              background: keysOn && keyboardMode === 'piano' ? STUDIO.accent : STUDIO.surface,
              color: keysOn && keyboardMode === 'piano' ? STUDIO.accentText : STUDIO.textDim,
            }}
          >
            Piano
          </button>
          <button
            type="button"
            disabled={!keysOn}
            onClick={() => onKeyboardMode('liveSet')}
            className="px-2 uppercase tracking-wide"
            style={{
              background: keysOn && keyboardMode === 'liveSet' ? STUDIO.accent : STUDIO.surface,
              color: keysOn && keyboardMode === 'liveSet' ? STUDIO.accentText : STUDIO.textDim,
            }}
          >
            Live
          </button>
        </div>

        <div className="mx-2 h-5 w-px" style={{ background: STUDIO.border }} />

        <label className="flex items-center gap-1.5 text-[10px]" style={{ color: STUDIO.textMuted }}>
          <span className="uppercase tracking-wide">BPM</span>
          <input
            type="text"
            inputMode="numeric"
            value={bpmDraft ?? String(bpm)}
            onChange={(e) => onBpmDraft(e.target.value.replace(/[^\d]/g, ''))}
            onBlur={() => {
              const n = Number(bpmDraft ?? bpm);
              const clamped = Math.min(300, Math.max(40, Number.isFinite(n) && n > 0 ? n : bpm));
              onBpmDraft(null);
              if (clamped !== bpm) onBpmCommit(clamped);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
            }}
            className="h-[22px] w-12 border px-1.5 font-mono text-[11px] text-white outline-none"
            style={{ background: STUDIO.surface, borderColor: STUDIO.border }}
          />
        </label>

        <div className="relative ml-1">
          <button
            type="button"
            onClick={() => setToolsOpen((v) => !v)}
            className="flex h-[22px] items-center gap-1 px-2 text-[10px]"
            style={{ background: STUDIO.surface, color: STUDIO.textMuted }}
          >
            <Settings2 className="h-3 w-3" />
            Grid
            <ChevronDown className="h-3 w-3" />
          </button>
          {toolsOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setToolsOpen(false)} />
              <div
                className="absolute left-0 top-full z-50 mt-1 w-56 border p-3 shadow-xl"
                style={{ background: STUDIO.panel, borderColor: STUDIO.border }}
              >
                <p className="mb-2 text-[9px] uppercase tracking-wide" style={{ color: STUDIO.textDim }}>
                  Snap & groove
                </p>
                <div className="mb-2 flex items-center justify-between gap-2 text-[10px]">
                  <span style={{ color: STUDIO.textMuted }}>Note snap</span>
                  <select
                    value={snapSteps}
                    onChange={(e) => onSnapSteps(Number(e.target.value) as 1 | 2 | 4)}
                    className="h-6 border px-1 text-[10px] text-white outline-none"
                    style={{ background: STUDIO.surface, borderColor: STUDIO.border }}
                  >
                    <option value={1}>1 step</option>
                    <option value={2}>1/2</option>
                    <option value={4}>1/4</option>
                  </select>
                </div>
                <div className="mb-2 flex items-center justify-between gap-2 text-[10px]">
                  <span style={{ color: STUDIO.textMuted }}>Clip snap</span>
                  <select
                    value={snapBars}
                    onChange={(e) => onSnapBars(Number(e.target.value) as 1 | 2 | 4)}
                    className="h-6 border px-1 text-[10px] text-white outline-none"
                    style={{ background: STUDIO.surface, borderColor: STUDIO.border }}
                  >
                    <option value={1}>1 bar</option>
                    <option value={2}>2 bars</option>
                    <option value={4}>4 bars</option>
                  </select>
                </div>
                <div className="mb-3 flex items-center gap-2 text-[10px]">
                  <span className="shrink-0" style={{ color: STUDIO.textMuted }}>
                    Swing {Math.round(swing * 100)}%
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={45}
                    step={1}
                    value={Math.round(swing * 100)}
                    onChange={(e) => onSwing(Number(e.target.value) / 100)}
                    className="min-w-0 flex-1 accent-[#ff8c00]"
                  />
                </div>
                <div className="flex gap-1">
                  {(['tight', 'human', 'loose'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => {
                        onGridProfile(p);
                        setToolsOpen(false);
                      }}
                      className="h-6 flex-1 text-[9px] capitalize hover:text-white"
                      style={{ background: STUDIO.surface, color: STUDIO.textMuted }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="ml-auto flex min-w-0 items-center gap-1">
          <label
            className="flex items-center gap-1.5 px-1"
            title={`Master volume (capped at ${Math.round(MAX_MASTER_VOLUME * 100)}% + safety limiter)`}
          >
            <span className="text-[9px] uppercase tracking-wide" style={{ color: STUDIO.textMuted }}>
              Vol
            </span>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={volPct}
              onChange={(e) => onMasterVolume(masterVolumeFromPercent(Number(e.target.value)))}
              className="h-[22px] w-[72px] accent-[#ff8c00] sm:w-[96px]"
            />
            <span className="w-7 font-mono text-[9px]" style={{ color: STUDIO.textDim }}>
              {volPct}
            </span>
            <span
              className="hidden rounded-sm px-1 py-0.5 text-[8px] font-semibold uppercase tracking-wide sm:inline"
              style={{ background: STUDIO.surface, color: STUDIO.accent }}
              title="Safety limiter + soft-clip always on"
            >
              Safe
            </span>
          </label>
          <AudioOutputSelect selectedId={outputDeviceId} onSelect={onOutputDevice} />
          <button
            type="button"
            onClick={onResetProject}
            className="flex h-[22px] items-center gap-1 px-2 text-[10px] hover:text-white"
            style={{ background: STUDIO.surface, color: STUDIO.textMuted }}
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>
          <button
            type="button"
            onClick={onResetLayout}
            className="flex h-[22px] items-center gap-1 px-2 text-[10px] hover:text-white"
            style={{ background: STUDIO.surface, color: STUDIO.textMuted }}
          >
            <LayoutDashboard className="h-3 w-3" />
            Layout
          </button>
        </div>
      </div>

      {/* Row 2 — window toggles (FL F5–F9 strip) */}
      <div
        className="flex h-[26px] items-center gap-0.5 border-b px-2"
        style={{ background: STUDIO.panelHeader, borderColor: STUDIO.border }}
      >
        {(Object.keys(PANEL_LABELS) as PanelKey[]).map((key) => {
          const on = panels[key];
          const hint = PANEL_HINTS[key];
          return (
            <button
              key={key}
              type="button"
              onClick={() => onTogglePanel(key)}
              className="flex h-[20px] items-center gap-1 px-2 text-[9px] uppercase tracking-wide"
              style={{
                background: on ? STUDIO.active : 'transparent',
                color: on ? STUDIO.accent : STUDIO.textDim,
                borderBottom: on ? `2px solid ${STUDIO.accent}` : '2px solid transparent',
              }}
              title={hint ? `${PANEL_LABELS[key]} (${hint})` : PANEL_LABELS[key]}
            >
              <span className="font-mono font-bold">{WINDOW_SHORT[key] ?? key.slice(0, 2).toUpperCase()}</span>
              <span className="hidden sm:inline">{PANEL_LABELS[key]}</span>
            </button>
          );
        })}
        <span className="ml-2 text-[9px]" style={{ color: STUDIO.textDim }}>
          Sleep oranje randen tussen panelen
        </span>
        <span className="ml-auto truncate font-mono text-[9px]" style={{ color: STUDIO.textDim }}>
          {status}
          {parseErrors > 0 && <span className="ml-2 text-[#c45c4a]">{parseErrors} parse err</span>}
        </span>
      </div>
    </div>
  );
};
