import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { media, src } from '../content';

export default function BeforeAfter() {
  const sectionRef = useRef(null);
  const containerRef = useRef(null);
  const interacted = useRef(false);
  const [reveal, setReveal] = useState(12);
  const [dragging, setDragging] = useState(false);

  const handleMove = (clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    setReveal(Math.max(0, Math.min(100, (x / rect.width) * 100)));
  };

  // A one-time auto-sweep the first time the section comes into view, so
  // visitors who never think to drag still see what the slider does.
  // Any real interaction cancels it immediately and hands over control.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setReveal(50); return; }
    const el = sectionRef.current;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || interacted.current) return;
      io.disconnect();
      const obj = { v: 12 };
      gsap.to(obj, {
        v: 82, duration: 1.6, delay: 0.3, ease: 'power2.inOut', yoyo: true, repeat: 1,
        onUpdate: () => { if (!interacted.current) setReveal(obj.v); },
      });
    }, { threshold: 0.6 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const claim = () => { interacted.current = true; };

  // Pointer Events + touch-action: pan-y (on the container below): on a
  // tablet, a touch only takes over the slider once it's clearly moving
  // sideways, and lets go if it's clearly vertical (a page scroll).
  const start = useRef(null);
  const onPointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    start.current = e.pointerType === 'mouse' ? null : { x: e.clientX, y: e.clientY };
    setDragging(true);
    if (e.pointerType === 'mouse') { claim(); handleMove(e.clientX); }
  };
  const onPointerMove = (e) => {
    if (!dragging) return;
    if (start.current) {
      const dx = Math.abs(e.clientX - start.current.x);
      const dy = Math.abs(e.clientY - start.current.y);
      if (Math.max(dx, dy) < 8) return;
      if (dy > dx) { setDragging(false); return; }
      start.current = null; // sideways: it's a drag from here on
      claim();
    }
    handleMove(e.clientX);
  };
  const onPointerEnd = () => setDragging(false);

  return (
    <section ref={sectionRef} className="wrap py-[clamp(72px,12vh,140px)]">
      <div className="flex flex-wrap items-end justify-between gap-6 mb-10">
        <div>
          <span className="eyebrow mb-4">Drag to compare</span>
          <h2 className="display d2 m-0 max-w-[13ch]">From swirled to showroom.</h2>
        </div>
        <p className="lede m-0">Same panel, same light. The only thing that changed is two days of paint correction and a ceramic topcoat.</p>
      </div>

      <div
        ref={containerRef}
        className="hotspot relative h-[46vw] min-h-[320px] max-h-[560px] rounded-[16px] overflow-hidden cursor-ew-resize border border-[var(--line)]"
        style={{ touchAction: 'pan-y' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
      >
        <img
          className="absolute inset-0 w-full h-full object-cover saturate-[.4] contrast-[.85] brightness-[.7] blur-[.3px]"
          src={src(media.beforeAfter)}
          alt="Before paint correction: dull, swirled paint"
        />
        <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${reveal}%)` }}>
          <img
            className="absolute inset-0 w-full h-full object-cover"
            src={src(media.beforeAfter)}
            alt="After paint correction and ceramic coating: glossy paint"
          />
        </div>

        <div className="absolute top-5 left-5 font-mono text-[11px] tracking-[.18em] uppercase px-3.5 py-2 border border-[var(--line)] bg-[rgba(8,9,10,.5)] backdrop-blur-[6px] rounded-full">Before</div>
        <div className="absolute top-5 right-5 font-mono text-[11px] tracking-[.18em] uppercase px-3.5 py-2 border border-[var(--line)] bg-[rgba(8,9,10,.5)] backdrop-blur-[6px] rounded-full text-[var(--lacquer-bright)]">After</div>

        <div className="ba-handle" style={{ left: `${reveal}%` }}>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[52px] h-[52px] rounded-full bg-[var(--paper)] flex items-center justify-center shadow-lg">
            <svg viewBox="0 0 24 24" fill="none" className="w-[14px] h-[14px]">
              <path d="M8 6L2 12L8 18M16 6L22 12L16 18" stroke="#08090a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
