import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function Loader({ onComplete }) {
  const loaderRef = useRef(null);
  const barRef = useRef(null);
  const countRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.to(loaderRef.current, {
            opacity: 0,
            visibility: 'hidden',
            duration: 0.7,
            ease: 'power3.inOut',
            onComplete
          });
        }
      });

      tl.to(barRef.current, {
        width: '100%',
        duration: 2,
        ease: 'power2.inOut',
      }, 0)
      .tweenTo(2, {
        onUpdate: function() {
          const progress = Math.round(this.progress() * 100);
          if (countRef.current) {
            countRef.current.innerText = progress.toString().padStart(2, '0');
          }
        }
      }, 0);
    }, loaderRef);

    return () => ctx.revert();
  }, [onComplete]);

  return (
    <div
      ref={loaderRef}
      className="fixed inset-0 bg-[var(--ink)] z-[10000] flex flex-col items-center justify-center gap-[22px]"
    >
      <div className="text-[clamp(28px,4vw,40px)] tracking-[0.05em] font-semibold">
        OBSIDIAN
      </div>
      <div className="w-[220px] h-[1px] bg-[var(--line)] relative overflow-hidden">
        <div ref={barRef} className="absolute left-0 top-0 bottom-0 w-0 bg-[var(--paper)]"></div>
      </div>
      <div className="font-mono text-[11px] tracking-[.2em] text-[var(--paper-faint)]">
        <span ref={countRef}>00</span> — 100
      </div>
    </div>
  );
}
