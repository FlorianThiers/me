import { useEffect, useState } from 'react';
import { prefersReducedMotion } from '../lib/fractalPerformance';

/** Pause WebGL when tab hidden, reduced motion, or `active` is false (e.g. hero scrolled away). */
export function useGpuFrameloop(active = true): 'always' | 'never' {
  const [tabActive, setTabActive] = useState(() => {
    if (typeof document === 'undefined') return true;
    return !document.hidden && !prefersReducedMotion();
  });

  useEffect(() => {
    const sync = () => {
      setTabActive(!document.hidden && !prefersReducedMotion());
    };
    document.addEventListener('visibilitychange', sync);
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    mq.addEventListener('change', sync);
    return () => {
      document.removeEventListener('visibilitychange', sync);
      mq.removeEventListener('change', sync);
    };
  }, []);

  if (!active || !tabActive) return 'never';
  return 'always';
}
