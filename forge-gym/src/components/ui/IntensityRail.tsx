import { useEffect, useRef, useState } from 'react';

/**
 * The site's one signature interaction (per the frontend-design brief: spend
 * boldness in one place). Section 35 of the client brief says the page's
 * intensity should "rise and fall like a workout" — this rail makes that
 * literal: a fixed effort readout that ticks through phase labels as
 * sections carrying [data-phase] scroll through, with a fill line tracking
 * overall page progress. Hidden on touch/mobile, where it would just be
 * visual noise. Skips animation under prefers-reduced-motion.
 */
const PHASES = ['WARM-UP', 'DRIVE', 'BUILD', 'PUSH', 'PEAK', 'COOL DOWN', 'CLOSE'] as const;

export function IntensityRail() {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<string>(PHASES[0]);
  const [enabled, setEnabled] = useState(false);
  const ticking = useRef(false);

  useEffect(() => {
    const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setEnabled(isDesktop && !reduceMotion);
    if (!isDesktop || reduceMotion) return;

    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        const doc = document.documentElement;
        const max = doc.scrollHeight - doc.clientHeight;
        setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
        ticking.current = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const nodes = Array.from(document.querySelectorAll<HTMLElement>('[data-phase]'));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          const p = (visible.target as HTMLElement).dataset.phase;
          if (p) setPhase(p);
        }
      },
      { threshold: [0.2, 0.5, 0.8], rootMargin: '-40% 0px -40% 0px' }
    );
    nodes.forEach((n) => observer.observe(n));

    return () => {
      window.removeEventListener('scroll', onScroll);
      observer.disconnect();
    };
  }, []);

  if (!enabled) return null;

  return (
    <div className="pointer-events-none fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 lg:flex">
      <div className="flex flex-col items-center gap-3">
        <span className="font-mono text-[10px] tracking-[0.25em] text-mute">
          {String(Math.round(progress * 100)).padStart(2, '0')}%
        </span>
        <div className="relative h-40 w-px bg-line">
          <div
            className="absolute left-0 top-0 w-px bg-red"
            style={{ height: `${progress * 100}%`, transition: 'height 60ms linear' }}
          />
          <div
            className="absolute left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-red shadow-[0_0_8px_2px_rgba(255,46,46,0.6)]"
            style={{ top: `calc(${progress * 100}% - 3px)`, transition: 'top 60ms linear' }}
          />
        </div>
        <span
          key={phase}
          className="font-mono text-[10px] tracking-[0.25em] text-bone/80"
          style={{ writingMode: 'vertical-rl' }}
        >
          {phase}
        </span>
      </div>
    </div>
  );
}
