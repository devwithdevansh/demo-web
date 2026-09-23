import { useEffect, useRef } from 'react';

// A soft radial glow that trails the pointer, confined to whichever section
// it's dropped into. Desktop / fine-pointer only, and a no-op under reduced
// motion (the glow stays parked at its default position instead).
export default function AmbientSpotlight() {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const parent = node.parentElement;
    const onMove = (e) => {
      const r = parent.getBoundingClientRect();
      node.style.setProperty('--sx', `${((e.clientX - r.left) / r.width) * 100}%`);
      node.style.setProperty('--sy', `${((e.clientY - r.top) / r.height) * 100}%`);
    };
    parent.addEventListener('mousemove', onMove);
    return () => parent.removeEventListener('mousemove', onMove);
  }, []);

  return <div ref={ref} className="spotlight" aria-hidden="true" />;
}
