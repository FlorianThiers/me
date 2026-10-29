/** Short session bells — original tones, not third-party samples. */

export function playSessionBell(kind: 'start' | 'end' = 'end'): void {
  if (typeof window === 'undefined') return;
  const AudioCtx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return;
  const ctx = new AudioCtx();
  const now = ctx.currentTime;
  const freqs = kind === 'start' ? [392, 523] : [523, 392, 262];
  freqs.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.02 + i * 0.12);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55 + i * 0.18);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + i * 0.12);
    osc.stop(now + 0.7 + i * 0.18);
  });
  window.setTimeout(() => void ctx.close(), 1600);
}
