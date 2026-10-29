import { useEffect, useState, type RefObject } from 'react';

/** True while `target` intersects the viewport (hero in view). */
export function useInViewport(
  target: RefObject<Element | null>,
  rootMargin = '0px',
): boolean {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const el = target.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin, threshold: 0.05 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, rootMargin]);

  return visible;
}
