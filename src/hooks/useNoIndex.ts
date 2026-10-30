import { useEffect } from 'react';

/** Sets document robots meta for private / login pages (noindex). */
export function useNoIndex(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const existing = document.querySelector('meta[name="robots"]');
    const meta = existing ?? document.createElement('meta');
    meta.setAttribute('name', 'robots');
    const previous = meta.getAttribute('content');
    meta.setAttribute('content', 'noindex, nofollow');
    if (!existing) document.head.appendChild(meta);
    return () => {
      if (previous != null) meta.setAttribute('content', previous);
      else if (!existing) meta.remove();
    };
  }, [enabled]);
}
