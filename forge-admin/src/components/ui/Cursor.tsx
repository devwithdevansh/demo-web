import { useEffect, useRef, useState } from 'react';

/**
 * Small trailing dot cursor. Reads a `data-cursor="TEXT"` attribute off
 * whatever's under the pointer to show contextual labels (VIEW / EXPLORE /
 * TRAIN / START). Disabled entirely on touch devices per spec section 37.
 */
export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState('');
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const isFine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    setEnabled(isFine);
    if (!isFine) return;

    document.documentElement.classList.add('has-custom-cursor');

    let x = 0,
      y = 0,
      curX = 0,
      curY = 0;

    const move = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      const target = e.target as HTMLElement;
      const cursorTarget = target.closest('[data-cursor]') as HTMLElement | null;
      setLabel(cursorTarget?.dataset.cursor ?? '');
    };

    window.addEventListener('mousemove', move);

    let raf: number;
    const loop = () => {
      curX += (x - curX) * 0.18;
      curY += (y - curY) * 0.18;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${curX}px, ${curY}px, 0) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('mousemove', move);
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove('has-custom-cursor');
    };
  }, []);

  if (!enabled) return null;

  return (
    <div
      ref={dotRef}
      className="pointer-events-none fixed left-0 top-0 z-[999] flex items-center justify-center transition-[width,height] duration-200 ease-out"
      style={{ width: label ? 64 : 8, height: label ? 64 : 8 }}
    >
      <div
        className={`flex h-full w-full items-center justify-center rounded-full border transition-colors duration-200 ${
          label ? 'border-red bg-red/10 backdrop-blur-sm' : 'border-bone bg-bone'
        }`}
      >
        {label && <span className="font-mono text-[9px] tracking-[0.2em] text-bone">{label}</span>}
      </div>
    </div>
  );
}
