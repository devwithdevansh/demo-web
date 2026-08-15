import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function PaintCorrection() {
  const containerRef = useRef(null);
  const [activeLabel, setActiveLabel] = useState(0);

  useEffect(() => {
    let ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
          const progress = self.progress;
          if (progress < 0.33) setActiveLabel(0);
          else if (progress < 0.66) setActiveLabel(1);
          else setActiveLabel(2);

          // Animate swirl overlay fading out
          gsap.set('#swirlOverlay', { opacity: Math.max(0, 0.8 - progress * 1.5) });
          // Animate base image getting clearer
          gsap.set('#paintImg', { 
            filter: `grayscale(${Math.max(0, 0.65 - progress)} ) contrast(${Math.min(1, 0.8 + progress * 0.4)}) brightness(${Math.min(1, 0.55 + progress * 0.8)}) blur(${Math.max(0, 1.5 - progress * 3)}px)` 
          });
        }
      });
    }, containerRef);
    
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} id="paint" className="h-[280vh] bg-[var(--ink)]">
      <div className="sticky top-0 h-screen flex items-center">
        <div className="absolute inset-0">
          <img 
            id="paintImg" 
            src="https://images.unsplash.com/photo-1621712151262-60bd142ba19f?w=2000&q=80&auto=format&fit=crop" 
            alt="Paint correction macro" 
            className="absolute inset-0 w-full h-full object-cover grayscale-[.65] contrast-[.8] brightness-[.55] blur-[1.5px]"
          />
          <div 
            id="swirlOverlay" 
            className="absolute inset-0 mix-blend-overlay opacity-80"
            style={{ backgroundImage: 'repeating-radial-gradient(circle at 30% 40%, rgba(237,237,232,.05) 0px, transparent 2px, transparent 6px)' }}
          ></div>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(10,11,13,.85),rgba(10,11,13,.2)_60%)]"></div>
        </div>
        
        <div className="relative z-[2] px-[var(--edge)] max-w-[640px]">
          <div className="eyebrow">Correction</div>
          <h2 className="text-[clamp(38px,6vw,84px)] font-semibold uppercase leading-none mt-[14px]">
            Remove The<br/>Imperfections.
          </h2>
          <div className="flex gap-0 mt-[44px] font-mono text-[11px] tracking-[.14em]">
            {['DEFECTS', 'CORRECTION', 'PERFECTION'].map((label, i) => (
              <span 
                key={label}
                className={`py-[10px] pr-[18px] mr-[18px] border-b-[2px] transition-colors duration-500 ${
                  activeLabel === i 
                    ? 'text-[var(--paper)] border-[var(--brass)]' 
                    : 'text-[var(--paper-faint)] border-[var(--line)]'
                }`}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
