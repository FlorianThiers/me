import React from 'react';
import type { FxChain } from '../../music/types';

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
  fx: FxChain;
  onChange: (key: keyof FxChain, value: number) => void;
  onVocalPreset?: () => void;
};

export const FxChainPanel: React.FC<Props> = ({ fx, onChange, onVocalPreset }) => (
  <div className="flex flex-col gap-2 border-t border-[#2a2a2a] pt-2">
    <div className="flex items-center justify-between">
      <span className="text-[9px] uppercase tracking-wide text-[#5a5a5a]">FX chain</span>
      {onVocalPreset && (
        <button
          type="button"
          onClick={onVocalPreset}
          className="h-5 bg-[#242424] px-2 text-[9px] text-[#c4783a] hover:text-white"
        >
          vocal preset
        </button>
      )}
    </div>
    <Knob label="HPF (Hz)" min={0} max={400} step={1} value={fx.hpf} onChange={(v) => onChange('hpf', v)} />
    <Knob
      label="comp thresh"
      min={-48}
      max={0}
      step={1}
      value={fx.compThreshold}
      onChange={(v) => onChange('compThreshold', v)}
    />
    <Knob label="comp ratio" min={1} max={12} step={0.5} value={fx.compRatio} onChange={(v) => onChange('compRatio', v)} />
    <Knob label="presence" min={0} max={1} step={0.01} value={fx.presence} onChange={(v) => onChange('presence', v)} />
    <Knob label="reverb send" min={0} max={1} step={0.01} value={fx.reverbSend} onChange={(v) => onChange('reverbSend', v)} />
    <Knob label="delay send" min={0} max={1} step={0.01} value={fx.delaySend} onChange={(v) => onChange('delaySend', v)} />
  </div>
);
