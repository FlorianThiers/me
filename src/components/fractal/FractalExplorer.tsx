import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ExternalLink, Play, Pause } from 'lucide-react';
import { FractalCanvas } from './FractalCanvas';
import { OrbitTrailOverlay } from './OrbitTrailOverlay';
import { type Complex, isInMandelbrot } from '../../lib/fractalMath';
import {
  DEFAULT_EXPLORER_C,
  FRACTAL_EXPLORER_PRESETS,
  JULIA_EXPLORER_VIEW,
  MANDELBROT_EXPLORER_VIEW,
} from '../../data/fractalExplorerPresets';

function parseCParam(raw: string | null): Complex | null {
  if (!raw) return null;
  const parts = raw.split(',');
  if (parts.length !== 2) return null;
  const re = Number.parseFloat(parts[0]);
  const im = Number.parseFloat(parts[1]);
  if (!Number.isFinite(re) || !Number.isFinite(im)) return null;
  return { re, im };
}

function formatC(c: Complex): string {
  return `${c.re.toFixed(4)},${c.im.toFixed(4)}`;
}

export const FractalExplorer: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const juliaWrapRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [juliaSize, setJuliaSize] = useState({ w: 400, h: 320 });
  const [explorerInView, setExplorerInView] = useState(true);

  const initialC = parseCParam(searchParams.get('c')) ?? DEFAULT_EXPLORER_C;
  const [c, setC] = useState<Complex>(initialC);
  const [z0, setZ0] = useState<Complex>({ re: 0, im: 0 });
  const [orbitStep, setOrbitStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [showSpiral, setShowSpiral] = useState(false);

  const connected = useMemo(() => isInMandelbrot(c), [c]);
  const maxOrbitStep = useMemo(() => {
    let z: Complex = { ...z0 };
    let steps = 0;
    for (let i = 0; i < 180; i++) {
      if (z.re * z.re + z.im * z.im > 4) break;
      z = { re: z.re * z.re - z.im * z.im + c.re, im: 2 * z.re * z.im + c.im };
      steps++;
    }
    return steps;
  }, [c, z0]);

  const syncUrl = useCallback(
    (next: Complex) => {
      setSearchParams({ c: formatC(next) }, { replace: true });
    },
    [setSearchParams]
  );

  const applyCRef = useRef<number | null>(null);
  const pendingCRef = useRef<Complex | null>(null);

  const pickC = useCallback(
    (next: Complex) => {
      pendingCRef.current = next;
      if (applyCRef.current != null) return;
      applyCRef.current = window.setTimeout(() => {
        applyCRef.current = null;
        const picked = pendingCRef.current;
        pendingCRef.current = null;
        if (!picked) return;
        setC(picked);
        setOrbitStep(0);
        setPlaying(false);
        syncUrl(picked);
      }, 200);
    },
    [syncUrl]
  );

  const applyPreset = (preset: (typeof FRACTAL_EXPLORER_PRESETS)[number]) => {
    if (applyCRef.current != null) {
      window.clearTimeout(applyCRef.current);
      applyCRef.current = null;
    }
    pendingCRef.current = null;
    setC(preset.c);
    setOrbitStep(0);
    setPlaying(false);
    syncUrl(preset.c);
  };

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setExplorerInView(entry.isIntersecting),
      { rootMargin: '80px', threshold: 0.05 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const el = juliaWrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setJuliaSize({ w: Math.max(1, Math.floor(width)), h: Math.max(1, Math.floor(height)) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setOrbitStep((s) => {
        if (s >= maxOrbitStep) {
          setPlaying(false);
          return s;
        }
        return s + 1;
      });
    }, 120);
    return () => window.clearInterval(timer);
  }, [playing, maxOrbitStep]);

  return (
    <section ref={sectionRef} className="mb-10" aria-labelledby="fractal-explorer-heading">
      <h2 id="fractal-explorer-heading" className="text-2xl font-bold text-white mb-2 text-center">
        {t('mandelbrot.explorer.title')}
      </h2>
      <p className="text-white/55 text-center text-sm mb-6 max-w-2xl mx-auto leading-relaxed">
        {t('mandelbrot.explorer.subtitle')}
      </p>

      <div className="orbit-readable-panel rounded-2xl p-4 md:p-6 border border-white/10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <div>
            <p className="text-neon-green text-xs uppercase tracking-wider mb-2 font-medium">
              {t('mandelbrot.explorer.mandelbrotPanel')}
            </p>
            <div className="aspect-[4/3] rounded-xl overflow-hidden border border-white/10 bg-black/40 relative">
              <FractalCanvas
                mode="mandelbrot"
                view={MANDELBROT_EXPLORER_VIEW}
                c={c}
                marker={c}
                active={explorerInView}
                ariaLabel={t('mandelbrot.explorer.mandelbrotAria')}
                onPick={pickC}
                pickOnHover
              />
            </div>
            <p className="text-white/45 text-xs mt-2">{t('mandelbrot.explorer.mandelbrotHint')}</p>
          </div>

          <div>
            <p className="text-neon-blue text-xs uppercase tracking-wider mb-2 font-medium">
              {t('mandelbrot.explorer.juliaPanel')}
            </p>
            <div
              ref={juliaWrapRef}
              className="aspect-[4/3] rounded-xl overflow-hidden border border-white/10 bg-black/40 relative"
            >
              <FractalCanvas
                mode="julia"
                view={JULIA_EXPLORER_VIEW}
                c={c}
                active={explorerInView}
                ariaLabel={t('mandelbrot.explorer.juliaAria')}
                onPick={(z) => {
                  setZ0(z);
                  setOrbitStep(0);
                  setPlaying(false);
                }}
              />
              <OrbitTrailOverlay
                c={c}
                z0={z0}
                view={JULIA_EXPLORER_VIEW}
                width={juliaSize.w}
                height={juliaSize.h}
                step={orbitStep}
                showSpiralGuide={showSpiral}
              />
            </div>
            <p className="text-white/45 text-xs mt-2">{t('mandelbrot.explorer.juliaHint')}</p>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-white/40 text-xs uppercase tracking-wider mb-2 text-center">
            {t('mandelbrot.explorer.presetsLabel')}
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {FRACTAL_EXPLORER_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset)}
                className="text-xs md:text-sm px-3 py-1.5 rounded-full border border-white/15 bg-white/5 text-white/75 hover:border-neon-green/50 hover:text-neon-green transition-colors"
              >
                {preset.fibonacci
                  ? t('mandelbrot.explorer.presets.fibonacci', {
                      num: preset.fibonacci.num,
                      den: preset.fibonacci.den,
                    })
                  : t(preset.labelKey)}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="rounded-lg bg-black/30 border border-white/10 p-3 font-mono text-white/70">
            <span className="text-white/45 block text-xs mb-1">c</span>
            {c.re.toFixed(5)} {c.im >= 0 ? '+' : '−'} {Math.abs(c.im).toFixed(5)}i
          </div>
          <div className="rounded-lg bg-black/30 border border-white/10 p-3 font-mono text-white/70">
            <span className="text-white/45 block text-xs mb-1">z₀</span>
            {z0.re.toFixed(5)} {z0.im >= 0 ? '+' : '−'} {Math.abs(z0.im).toFixed(5)}i
            <span className="block text-xs text-white/40 mt-1">
              {connected
                ? t('mandelbrot.explorer.connected')
                : t('mandelbrot.explorer.dust')}
            </span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (playing) setPlaying(false);
              else {
                setOrbitStep(0);
                setPlaying(true);
              }
            }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-neon-green/40 text-neon-green text-sm hover:bg-neon-green/10 transition-colors"
          >
            {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {playing ? t('mandelbrot.explorer.pauseOrbit') : t('mandelbrot.explorer.playOrbit')}
          </button>
          <label className="inline-flex items-center gap-2 text-sm text-white/60 cursor-pointer">
            <input
              type="range"
              min={0}
              max={maxOrbitStep}
              value={orbitStep}
              onChange={(e) => {
                setPlaying(false);
                setOrbitStep(Number(e.target.value));
              }}
              className="w-32 accent-neon-green"
            />
            {t('mandelbrot.explorer.step', { current: orbitStep, max: maxOrbitStep })}
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-white/60 cursor-pointer">
            <input
              type="checkbox"
              checked={showSpiral}
              onChange={(e) => setShowSpiral(e.target.checked)}
              className="accent-amber-400"
            />
            {t('mandelbrot.explorer.spiralGuide')}
          </label>
        </div>

        <p className="mt-4 text-white/55 text-sm leading-relaxed border-t border-white/10 pt-4">
          {t('mandelbrot.explorer.goldenNote')}
        </p>

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs">
          <a
            href="https://youtu.be/FFftmWSzgmk"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-white/45 hover:text-neon-green transition-colors"
          >
            Numberphile — Ben Sparks
            <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href="https://youtu.be/0OP9guFmWfs"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-white/45 hover:text-neon-green transition-colors"
          >
            Stand-up Maths — Matt Parker
            <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href="https://youtu.be/sj8Sg8qnjOg"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-white/45 hover:text-neon-green transition-colors"
          >
            Numberphile — Golden ratio
            <ExternalLink className="w-3 h-3" />
          </a>
          <Link to="/julia" className="text-white/45 hover:text-neon-blue transition-colors">
            {t('mandelbrot.explorer.juliaHub')}
          </Link>
        </div>
      </div>
    </section>
  );
};
