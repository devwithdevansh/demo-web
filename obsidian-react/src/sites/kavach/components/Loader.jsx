import { useEffect, useRef } from 'react';
import gsap from 'gsap';

// Mirrors Kohinoor's own loader (see src/components/Loader.jsx) so opening
// any studio in this portfolio feels the same, just re-skinned per brand.
// Also doubles as the moment scroll/pin math gets its first real refresh --
// see KavachPage.jsx's onComplete.
export default function Loader({ onComplete }) {
  const loaderRef = useRef(null);
  const barRef = useRef(null);
  const countRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onComplete();
      return;
    }
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.to(loaderRef.current, { opacity: 0, visibility: 'hidden', duration: 0.6, ease: 'power3.inOut', onComplete });
        },
      });
      tl.to(barRef.current, { width: '100%', duration: 1.3, ease: 'power2.inOut' }, 0)
        .tweenTo(1.3, {
          onUpdate: function () {
            const progress = Math.round(this.progress() * 100);
            if (countRef.current) countRef.current.innerText = progress.toString().padStart(2, '0');
          },
        }, 0);
    }, loaderRef);
    return () => ctx.revert();
  }, [onComplete]);

  return (
    <div
      ref={loaderRef}
      className="fixed inset-0 z-[10000] flex flex-col items-center justify-center gap-[22px]"
      style={{ background: 'var(--ink)', color: 'var(--paper)' }}
    >
      <div className="text-[clamp(24px,4vw,34px)] tracking-[0.02em] font-bold">Kavach</div>
      <div className="w-[200px] h-[1px] relative overflow-hidden" style={{ background: 'rgba(244,241,234,.15)' }}>
        <div ref={barRef} className="absolute left-0 top-0 bottom-0 w-0" style={{ background: 'var(--lacquer)' }} />
      </div>
      <div className="font-mono text-[11px] tracking-[.2em]" style={{ opacity: 0.55 }}>
        <span ref={countRef}>00</span> — 100
      </div>
    </div>
  );
}
