import React, { useEffect, useRef } from 'react';
import type { AnalogParams, DrumId, DrumSound, TrackId, WavetableParams } from '../../music/types';
import { DRUM_IDS } from '../../music/types';
import { TRACK_COLORS } from '../../music/defaults';

type Props = {
  track: TrackId;
  drums: Record<DrumId, DrumSound>;
  wavetable: WavetableParams;
  analog: AnalogParams;
  brass: WavetableParams;
  guitar: AnalogParams;
};

function waveformFromIndex(wave: number): OscillatorType {
  const map: OscillatorType[] = ['sine', 'triangle', 'sawtooth', 'square'];
  return map[Math.max(0, Math.min(3, Math.round(wave)))];
}

function renderDrumPreview(
  ctx: CanvasRenderingContext2D,
  drum: DrumSound,
  w: number,
  h: number,
  color: string,
) {
  const samples = w;
  const total = Math.max(0.04, drum.dur);
  const mid = h / 2;

  ctx.beginPath();
  for (let i = 0; i < samples; i++) {
    const t = (i / samples) * total;
    const tNorm = t / total;

    const startFreq = drum.freq + drum.pitch;
    const endFreq = drum.freq;
    const sweepEnd = Math.min(total * 0.7, 0.35);
    const freq =
      t < sweepEnd
        ? startFreq + (endFreq - startFreq) * (t / sweepEnd)
        : endFreq;

    const a = Math.max(0.001, drum.attack);
    let env: number;
    if (t < a) {
      env = t / a;
    } else {
      env = Math.exp(-((t - a) / Math.max(0.01, drum.decay)) * 3);
    }

    const phase = freq * t * 2 * Math.PI;
    let osc: number;
    switch (drum.type) {
      case 'sine':
        osc = Math.sin(phase);
        break;
      case 'triangle':
        osc = 2 * Math.abs(2 * ((freq * t) % 1) - 1) - 1;
        break;
      case 'sawtooth':
        osc = 2 * ((freq * t) % 1) - 1;
        break;
      case 'square':
        osc = Math.sin(phase) >= 0 ? 1 : -1;
        break;
      default:
        osc = Math.sin(phase);
    }

    const noise = drum.noise * (Math.random() * 2 - 1) * Math.exp(-tNorm * 4);
    const sample = (osc * (1 - drum.noise) + noise) * env;
    const y = mid - sample * mid * 0.85;
    if (i === 0) ctx.moveTo(i, y);
    else ctx.lineTo(i, y);
  }
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function renderSynthPreview(
  ctx: CanvasRenderingContext2D,
  params: { pitch: number; attack: number; decay: number; sustain: number; release: number; wave?: number; cutoff: number },
  w: number,
  h: number,
  color: string,
  oscType?: OscillatorType,
) {
  const samples = w;
  const total = params.attack + params.decay + 0.1 + params.release;
  const mid = h / 2;
  const type = oscType ?? waveformFromIndex(params.wave ?? 0);

  ctx.beginPath();
  for (let i = 0; i < samples; i++) {
    const t = (i / samples) * total;
    const freq = params.pitch;

    let env: number;
    if (t < params.attack) {
      env = t / Math.max(0.001, params.attack);
    } else if (t < params.attack + params.decay) {
      const d = (t - params.attack) / Math.max(0.001, params.decay);
      env = 1 - d * (1 - params.sustain);
    } else if (t < total - params.release) {
      env = params.sustain;
    } else {
      const r = (t - (total - params.release)) / Math.max(0.001, params.release);
      env = params.sustain * (1 - r);
    }

    const phase = freq * t * 2 * Math.PI;
    let osc: number;
    switch (type) {
      case 'sine':
        osc = Math.sin(phase);
        break;
      case 'triangle':
        osc = 2 * Math.abs(2 * ((freq * t) % 1) - 1) - 1;
        break;
      case 'sawtooth':
        osc = 2 * ((freq * t) % 1) - 1;
        break;
      case 'square':
        osc = Math.sin(phase) >= 0 ? 1 : -1;
        break;
      default:
        osc = Math.sin(phase);
    }

    const cutoffNorm = Math.min(1, params.cutoff / 8000);
    const filtered = osc * (0.3 + cutoffNorm * 0.7);

    const y = mid - filtered * env * mid * 0.8;
    if (i === 0) ctx.moveTo(i, y);
    else ctx.lineTo(i, y);
  }
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.strokeStyle = `${color}44`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  const total2 = params.attack + params.decay + 0.1 + params.release;
  for (let i = 0; i < samples; i++) {
    const t = (i / samples) * total2;
    let env: number;
    if (t < params.attack) env = t / Math.max(0.001, params.attack);
    else if (t < params.attack + params.decay) {
      const d = (t - params.attack) / Math.max(0.001, params.decay);
      env = 1 - d * (1 - params.sustain);
    } else if (t < total2 - params.release) env = params.sustain;
    else {
      const r = (t - (total2 - params.release)) / Math.max(0.001, params.release);
      env = params.sustain * (1 - r);
    }
    const y = mid - env * mid * 0.75;
    if (i === 0) ctx.moveTo(i, y);
    else ctx.lineTo(i, y);
  }
  ctx.stroke();
}

export const SoundPreview: React.FC<Props> = ({ track, drums, wavetable, analog, brass, guitar }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrum = (DRUM_IDS as readonly string[]).includes(track);
  const color = TRACK_COLORS[track];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = devicePixelRatio;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    ctx.fillStyle = '#0c0c0c';
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();

    if (isDrum) {
      renderDrumPreview(ctx, drums[track as DrumId], w, h, color);
    } else if (track === 'wt') {
      renderSynthPreview(ctx, { ...wavetable, wave: wavetable.wave }, w, h, color);
    } else if (track === 'tp') {
      renderSynthPreview(ctx, { ...brass, wave: brass.wave }, w, h, color);
    } else if (track === 'an') {
      renderSynthPreview(ctx, { ...analog, cutoff: analog.cutoff }, w, h, color, 'sawtooth');
    } else if (track === 'rg') {
      renderSynthPreview(ctx, { ...guitar, cutoff: guitar.cutoff }, w, h, color, 'triangle');
    } else if (track === 'vox') {
      const midY = h / 2;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i < w; i += 1) {
        const y = midY + Math.sin(i * 0.08) * midY * 0.35 * (0.6 + Math.random() * 0.4);
        if (i === 0) ctx.moveTo(i, y);
        else ctx.lineTo(i, y);
      }
      ctx.stroke();
    }
  }, [track, drums, wavetable, analog, brass, guitar, isDrum, color]);

  return (
    <canvas
      ref={canvasRef}
      className="h-full w-full"
      style={{ imageRendering: 'auto' }}
    />
  );
};
