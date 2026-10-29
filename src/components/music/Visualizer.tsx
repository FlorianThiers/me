import React, { useEffect, useRef } from 'react';
import type { MusicEngine } from '../../music/engine';

type Props = {
  engine: MusicEngine | null;
  playing: boolean;
  mode: 'waveform' | 'spectrum' | 'both';
};

const BG = '#0e0e0e';
const WAVE_COLOR = '#c4783a';
const SPEC_COLOR = '#5cae7a';
const GRID_COLOR = '#1a1a1a';

export const Visualizer: React.FC<Props> = ({ engine, playing, mode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx2d = canvas.getContext('2d');
    if (!ctx2d) return;

    let running = true;

    const draw = () => {
      if (!running) return;
      frameRef.current = requestAnimationFrame(draw);

      const analyser = engine?.getAnalyser();
      const w = canvas.width;
      const h = canvas.height;
      ctx2d.fillStyle = BG;
      ctx2d.fillRect(0, 0, w, h);

      ctx2d.strokeStyle = GRID_COLOR;
      ctx2d.lineWidth = 0.5;
      for (let y = 0; y < h; y += 24) {
        ctx2d.beginPath();
        ctx2d.moveTo(0, y);
        ctx2d.lineTo(w, y);
        ctx2d.stroke();
      }
      for (let x = 0; x < w; x += 24) {
        ctx2d.beginPath();
        ctx2d.moveTo(x, 0);
        ctx2d.lineTo(x, h);
        ctx2d.stroke();
      }

      if (!analyser || !playing) {
        ctx2d.strokeStyle = '#2a2a2a';
        ctx2d.lineWidth = 1;
        ctx2d.beginPath();
        ctx2d.moveTo(0, h / 2);
        ctx2d.lineTo(w, h / 2);
        ctx2d.stroke();
        return;
      }

      if (mode === 'waveform' || mode === 'both') {
        const bufLen = analyser.frequencyBinCount;
        const timeBuf = new Uint8Array(bufLen);
        analyser.getByteTimeDomainData(timeBuf);

        const waveH = mode === 'both' ? h / 2 : h;
        const waveY = 0;

        ctx2d.strokeStyle = WAVE_COLOR;
        ctx2d.lineWidth = 1.5;
        ctx2d.beginPath();
        const sliceW = w / bufLen;
        for (let i = 0; i < bufLen; i++) {
          const v = timeBuf[i] / 128.0;
          const y = waveY + (v * waveH) / 2;
          if (i === 0) ctx2d.moveTo(0, y);
          else ctx2d.lineTo(i * sliceW, y);
        }
        ctx2d.stroke();

        const rms = Math.sqrt(
          timeBuf.reduce((sum, v) => sum + ((v - 128) / 128) ** 2, 0) / bufLen,
        );
        ctx2d.fillStyle = rms > 0.5 ? '#c45c4a' : rms > 0.2 ? WAVE_COLOR : '#5a5a5a';
        ctx2d.fillRect(w - 6, waveY + waveH - rms * waveH, 4, rms * waveH);
      }

      if (mode === 'spectrum' || mode === 'both') {
        const bufLen = analyser.frequencyBinCount;
        const freqBuf = new Uint8Array(bufLen);
        analyser.getByteFrequencyData(freqBuf);

        const specH = mode === 'both' ? h / 2 : h;
        const specY = mode === 'both' ? h / 2 : 0;
        const barCount = Math.min(128, bufLen);
        const barW = w / barCount;

        for (let i = 0; i < barCount; i++) {
          const v = freqBuf[i] / 255;
          const barH = v * specH * 0.9;
          const hue = 120 + i * 0.8;
          ctx2d.fillStyle = `hsla(${hue}, 55%, ${40 + v * 30}%, ${0.6 + v * 0.4})`;
          ctx2d.fillRect(i * barW, specY + specH - barH, barW - 1, barH);
        }

        ctx2d.strokeStyle = SPEC_COLOR;
        ctx2d.lineWidth = 1;
        ctx2d.beginPath();
        for (let i = 0; i < barCount; i++) {
          const v = freqBuf[i] / 255;
          const y = specY + specH - v * specH * 0.9;
          if (i === 0) ctx2d.moveTo(0, y);
          else ctx2d.lineTo(i * barW + barW / 2, y);
        }
        ctx2d.stroke();
      }
    };

    const observe = new ResizeObserver(() => {
      canvas.width = canvas.clientWidth * devicePixelRatio;
      canvas.height = canvas.clientHeight * devicePixelRatio;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(devicePixelRatio, devicePixelRatio);
    });
    observe.observe(canvas);
    canvas.width = canvas.clientWidth * devicePixelRatio;
    canvas.height = canvas.clientHeight * devicePixelRatio;
    ctx2d.scale(devicePixelRatio, devicePixelRatio);

    frameRef.current = requestAnimationFrame(draw);

    return () => {
      running = false;
      cancelAnimationFrame(frameRef.current);
      observe.disconnect();
    };
  }, [engine, playing, mode]);

  return (
    <canvas
      ref={canvasRef}
      className="h-full w-full"
      style={{ imageRendering: 'auto' }}
    />
  );
};
