import React from 'react';
import type {
  AnalogParams,
  DrumId,
  DrumSound,
  FxChain,
  TrackId,
  WavetableParams,
  Waveform,
} from '../../music/types';
import { DRUM_IDS, isAudioTrack, WAVEFORMS } from '../../music/types';
import { FxChainPanel } from './FxChainPanel';
import { PianoKeyboard } from './PianoKeyboard';
import { SoundPreview } from './SoundPreview';
import { VocalRecorderPanel, type VocalTakeInfo } from './VocalRecorderPanel';
import type { MusicEngine } from '../../music/engine';
type KnobProps = {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
};

const Knob: React.FC<KnobProps> = ({ label, min, max, step, value, onChange }) => (
  <label className="flex flex-col gap-0.5 text-[10px] text-[#8a8a8a]">
    <span className="flex justify-between">
      <span>{label}</span>
      <span className="font-mono text-[#c8c8c8]">
        {Number.isInteger(step) ? value : value.toFixed(2)}
      </span>
    </span>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="h-1 w-full cursor-pointer appearance-none bg-[#2a2a2a] accent-[#c4783a]"
    />
  </label>
);

type Props = {
  track: TrackId;
  bpm: number;
  fx: FxChain;
  drums: Record<DrumId, DrumSound>;
  wavetable: WavetableParams;
  analog: AnalogParams;
  brass: WavetableParams;
  guitar: AnalogParams;
  engine: MusicEngine | null;
  onDrum: (id: DrumId, key: keyof DrumSound, value: number | string) => void;
  onWavetable: (key: keyof WavetableParams, value: number) => void;
  onAnalog: (key: keyof AnalogParams, value: number) => void;
  onBrass: (key: keyof WavetableParams, value: number) => void;
  onGuitar: (key: keyof AnalogParams, value: number) => void;
  onFx: (key: keyof FxChain, value: number) => void;
  onVocalPreset?: () => void;
  onRecorded?: (info: VocalTakeInfo) => void;
  onStatus?: (msg: string) => void;
  playing?: boolean;
  getCurrentBar?: () => number;
  onEnsurePlaying?: () => Promise<void>;
  onPreview?: () => void;
  keysOn?: boolean;
  octave?: number;
  onOctave?: (octave: number) => void;
  onNoteOn?: (midi: number) => void;
  onNoteOff?: (midi: number) => void;
  onOpenRoll?: () => void;
  onDropClip?: () => void;
};

export const SoundPanel: React.FC<Props> = ({
  track,
  bpm,
  fx,
  drums,
  wavetable,
  analog,
  brass,
  guitar,
  engine,
  onDrum,
  onWavetable,
  onAnalog,
  onBrass,
  onGuitar,
  onFx,
  onVocalPreset,
  onRecorded,
  onStatus,
  playing = false,
  getCurrentBar,
  onEnsurePlaying,
  onPreview,
  keysOn = true,
  octave = 4,
  onOctave,
  onNoteOn,
  onNoteOff,
  onOpenRoll,
  onDropClip,
}) => {
  const drumSelected = (DRUM_IDS as readonly string[]).includes(track);
  const isVox = isAudioTrack(track);

  return (
    <div className="flex h-full flex-col bg-[#121212]">
      {!isVox && (
        <div className="relative h-[80px] shrink-0 border-b border-[#2a2a2a]">
          <SoundPreview
            track={track}
            drums={drums}
            wavetable={wavetable}
            analog={analog}
            brass={brass}
            guitar={guitar}
          />
          {onPreview && (
            <button
              type="button"
              onClick={onPreview}
              className="absolute bottom-1.5 right-1.5 flex h-6 items-center gap-1 rounded bg-[#c4783a] px-2 text-[9px] font-medium text-[#111] shadow hover:bg-[#d4884a]"
            >
              ▶ preview
            </button>
          )}
        </div>
      )}
      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {isVox && onRecorded && onStatus && onEnsurePlaying && getCurrentBar && (
          <VocalRecorderPanel
            bpm={bpm}
            engine={engine}
            playing={playing}
            getCurrentBar={getCurrentBar}
            onEnsurePlaying={onEnsurePlaying}
            onRecorded={onRecorded}
            onStatus={onStatus}
          />
        )}
        {drumSelected && (
          <DrumEditor drum={drums[track as DrumId]} id={track as DrumId} onDrum={onDrum} />
        )}
        {track === 'wt' && <WavetableEditor wavetable={wavetable} onWavetable={onWavetable} />}
        {track === 'tp' && <WavetableEditor wavetable={brass} onWavetable={onBrass} />}
        {track === 'an' && <AnalogEditor analog={analog} onAnalog={onAnalog} />}
        {track === 'rg' && <AnalogEditor analog={guitar} onAnalog={onGuitar} />}
        {isVox && (
          <p className="mt-2 text-[10px] leading-snug text-[#5a5a5a]">
            Vocals use the FX chain below. Record takes, then comp on the playlist (click takes to toggle).
          </p>
        )}
        <FxChainPanel
          fx={fx}
          onChange={onFx}
          onVocalPreset={track === 'vox' ? onVocalPreset : undefined}
        />
      </div>
      {!isVox && (
      <div className="shrink-0 border-t border-[#2a2a2a] p-2">
        {onNoteOn && onNoteOff && onOctave && (
          <PianoKeyboard
            enabled={keysOn}
            octave={octave}
            onOctave={onOctave}
            onNoteOn={onNoteOn}
            onNoteOff={onNoteOff}
          />
        )}
        <div className="mt-1 flex gap-1">
          {onOpenRoll && (
            <button
              type="button"
              onClick={onOpenRoll}
              className="h-5 flex-1 bg-[#242424] text-[9px] text-[#9a9a9a] hover:text-white"
            >
              piano roll
            </button>
          )}
          {onDropClip && (
            <button
              type="button"
              onClick={onDropClip}
              className="h-5 flex-1 bg-[#c4783a] text-[9px] text-[#111]"
            >
              drop on playlist
            </button>
          )}
        </div>
      </div>
      )}
    </div>
  );
};

const DrumEditor: React.FC<{
  id: DrumId;
  drum: DrumSound;
  onDrum: Props['onDrum'];
}> = ({ id, drum, onDrum }) => (
  <div className="flex flex-col gap-2">
    <span className="text-[9px] text-[#5a5a5a]">ADSR · filter · drive · noise</span>
    <label className="text-[10px] text-[#8a8a8a]">
      waveform
      <select
        value={drum.type}
        onChange={(e) => onDrum(id, 'type', e.target.value as Waveform)}
        className="mt-0.5 w-full border border-[#2a2a2a] bg-[#101010] px-1 py-0.5 text-[11px] text-white"
      >
        {WAVEFORMS.map((w) => (
          <option key={w} value={w}>
            {w}
          </option>
        ))}
      </select>
    </label>
    <Knob label="freq" min={20} max={2000} step={1} value={drum.freq} onChange={(v) => onDrum(id, 'freq', v)} />
    <Knob label="pitch drop" min={0} max={120} step={1} value={drum.pitch} onChange={(v) => onDrum(id, 'pitch', v)} />
    <Knob label="length" min={0.02} max={1.2} step={0.01} value={drum.dur} onChange={(v) => onDrum(id, 'dur', v)} />
    <Knob label="attack" min={0.001} max={0.2} step={0.001} value={drum.attack} onChange={(v) => onDrum(id, 'attack', v)} />
    <Knob label="decay" min={0.01} max={0.8} step={0.01} value={drum.decay} onChange={(v) => onDrum(id, 'decay', v)} />
    <Knob label="filter" min={40} max={12000} step={1} value={drum.filter} onChange={(v) => onDrum(id, 'filter', v)} />
    <Knob label="drive" min={0} max={1} step={0.01} value={drum.drive} onChange={(v) => onDrum(id, 'drive', v)} />
    <Knob label="noise" min={0} max={1} step={0.01} value={drum.noise} onChange={(v) => onDrum(id, 'noise', v)} />
  </div>
);

const WavetableEditor: React.FC<{
  wavetable: WavetableParams;
  onWavetable: Props['onWavetable'];
}> = ({ wavetable, onWavetable }) => (
  <div className="flex flex-col gap-2">
    <span className="text-[9px] text-[#5a5a5a]">wavetable · filter env · LFO</span>
    <Knob label="pitch" min={40} max={880} step={1} value={wavetable.pitch} onChange={(v) => onWavetable('pitch', v)} />
    <Knob label="cutoff" min={80} max={8000} step={1} value={wavetable.cutoff} onChange={(v) => onWavetable('cutoff', v)} />
    <Knob label="res" min={0} max={1} step={0.01} value={wavetable.res} onChange={(v) => onWavetable('res', v)} />
    <Knob label="filter env" min={0} max={1} step={0.01} value={wavetable.filterEnv} onChange={(v) => onWavetable('filterEnv', v)} />
    <Knob label="attack" min={0.001} max={0.3} step={0.001} value={wavetable.attack} onChange={(v) => onWavetable('attack', v)} />
    <Knob label="decay" min={0.01} max={0.5} step={0.01} value={wavetable.decay} onChange={(v) => onWavetable('decay', v)} />
    <Knob label="sustain" min={0} max={1} step={0.01} value={wavetable.sustain} onChange={(v) => onWavetable('sustain', v)} />
    <Knob label="release" min={0.01} max={0.6} step={0.01} value={wavetable.release} onChange={(v) => onWavetable('release', v)} />
    <Knob label="unison" min={1} max={5} step={1} value={wavetable.unison} onChange={(v) => onWavetable('unison', v)} />
    <Knob label="wave" min={0} max={3} step={1} value={wavetable.wave} onChange={(v) => onWavetable('wave', v)} />
    <Knob label="lfo rate" min={0.5} max={16} step={0.1} value={wavetable.lfoRate} onChange={(v) => onWavetable('lfoRate', v)} />
    <Knob label="lfo depth" min={0} max={1} step={0.01} value={wavetable.lfoDepth} onChange={(v) => onWavetable('lfoDepth', v)} />
    <Knob label="amp" min={0} max={1} step={0.01} value={wavetable.amp} onChange={(v) => onWavetable('amp', v)} />
  </div>
);

const AnalogEditor: React.FC<{
  analog: AnalogParams;
  onAnalog: Props['onAnalog'];
}> = ({ analog, onAnalog }) => (
  <div className="flex flex-col gap-2">
    <span className="text-[9px] text-[#5a5a5a]">subtractive · unison · detune</span>
    <Knob label="pitch" min={30} max={440} step={1} value={analog.pitch} onChange={(v) => onAnalog('pitch', v)} />
    <Knob label="cutoff" min={80} max={8000} step={1} value={analog.cutoff} onChange={(v) => onAnalog('cutoff', v)} />
    <Knob label="res" min={0} max={1} step={0.01} value={analog.res} onChange={(v) => onAnalog('res', v)} />
    <Knob label="filter env" min={0} max={1} step={0.01} value={analog.filterEnv} onChange={(v) => onAnalog('filterEnv', v)} />
    <Knob label="attack" min={0.001} max={0.3} step={0.001} value={analog.attack} onChange={(v) => onAnalog('attack', v)} />
    <Knob label="decay" min={0.01} max={0.5} step={0.01} value={analog.decay} onChange={(v) => onAnalog('decay', v)} />
    <Knob label="sustain" min={0} max={1} step={0.01} value={analog.sustain} onChange={(v) => onAnalog('sustain', v)} />
    <Knob label="release" min={0.01} max={0.6} step={0.01} value={analog.release} onChange={(v) => onAnalog('release', v)} />
    <Knob label="unison" min={1} max={4} step={1} value={analog.unison} onChange={(v) => onAnalog('unison', v)} />
    <Knob label="detune" min={0} max={40} step={1} value={analog.detune} onChange={(v) => onAnalog('detune', v)} />
    <Knob label="amp" min={0} max={1} step={0.01} value={analog.amp} onChange={(v) => onAnalog('amp', v)} />
  </div>
);
