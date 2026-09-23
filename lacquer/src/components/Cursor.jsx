import { useEffect, useRef } from 'react';
import gsap from 'gsap';

// A small magnetic cursor: a dot that tracks exactly, a ring that trails and
// swells over interactive elements. Skipped entirely on touch/coarse pointers
// and under reduced motion.
export default function Cursor() {
  const dot = useRef(null);
  const ring = useRef(null);

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const move = (e) => {
      gsap.to(dot.current, { x: e.clientX, y: e.clientY, duration: 0.08, ease: 'power2.out' });
      gsap.to(ring.current, { x: e.clientX, y: e.clientY, duration: 0.28, ease: 'power2.out' });
    };
    const over = (e) => {
      if (e.target.closest('a, button, input, select, textarea, .hotspot')) ring.current.classList.add('hover');
    };
    const out = (e) => {
      if (e.target.closest('a, button, input, select, textarea, .hotspot')) ring.current.classList.remove('hover');
    };

    window.addEventListener('mousemove', move);
    document.addEventListener('mouseover', over);
    document.addEventListener('mouseout', out);
    return () => {
      window.removeEventListener('mousemove', move);
      document.removeEventListener('mouseover', over);
      document.removeEventListener('mouseout', out);
    };
  }, []);

  return (
    <>
      <div ref={dot} className="cursor-dot hidden md:block" />
      <div ref={ring} className="cursor-ring hidden md:block" />
    </>
  );
}
