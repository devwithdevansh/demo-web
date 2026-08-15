import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const mods = [
  { img: 'https://images.unsplash.com/photo-1601278840447-9af5ac4ed157?w=1600&q=80&auto=format&fit=crop', title: 'BMW M3', tags: ['PPF', 'Forged Wheels', 'Lowering', 'Ceramic'] },
  { img: 'https://images.unsplash.com/photo-1653749576894-3a571fa4ca07?w=1600&q=80&auto=format&fit=crop', title: 'Porsche 911', tags: ['Satin Wrap', 'Wheel Refinish', 'Ceramic'] },
  { img: 'https://images.unsplash.com/photo-1611820972863-59eaff523aba?w=1600&q=80&auto=format&fit=crop', title: 'Ferrari 458', tags: ['Full Detail', 'Window Tint', 'Ceramic'] },
];

export default function Modification() {
  const containerRef = useRef(null);
  const trackRef = useRef(null);

  useEffect(() => {
    // Only apply horizontal scroll animation on desktop
    const mm = gsap.matchMedia();
    
    mm.add("(min-width: 861px)", () => {
      let ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1,
          }
        });

        // Calculate scroll amount based on track width vs viewport width
        const scrollAmount = trackRef.current.scrollWidth - window.innerWidth + 120; // 120 buffer
        
        tl.to(trackRef.current, {
          x: -scrollAmount,
          ease: 'none'
        });

      }, containerRef);
      return () => ctx.revert();
    });

    return () => mm.revert();
  }, []);

  return (
    <section id="mod" className="bg-[var(--ink)] py-[min(18vh,180px)] overflow-hidden">
      <div className="px-[var(--edge)] mb-[56px]">
        <div className="flex justify-between items-end gap-[40px] flex-wrap m-0">
          <h2 className="text-[clamp(32px,5vw,64px)] font-semibold uppercase leading-[1.02] tracking-[-0.01em]">
            Make It<br/>Yours.
          </h2>
          <p className="max-w-[46ch] text-[var(--paper-dim)] text-[17px] leading-[1.6]">
            Suspension, wheels, wraps and aero — modification builds planned around the way you actually drive.
          </p>
        </div>
      </div>
      
      <div ref={containerRef} id="mod-pin" className="h-auto md:h-[340vh]">
        <div className="md:sticky md:top-0 h-auto md:h-screen flex items-center md:overflow-hidden overflow-x-auto snap-x snap-mandatory">
          <div ref={trackRef} className="flex gap-[28px] pl-[var(--edge)] will-change-transform w-max">
            {mods.map((mod, i) => (
              <div 
                key={i}
                className="relative flex-none w-[86vw] md:w-[min(78vw,760px)] h-[56vh] md:h-[64vh] overflow-hidden snap-start"
              >
                <img 
                  src={mod.img} 
                  alt={mod.title} 
                  className="absolute inset-0 w-full h-full object-cover brightness-[.72] scale-[1.02]"
                />
                <div className="absolute left-0 right-0 bottom-0 p-[28px] flex justify-between items-end">
                  <div>
                    <h3 className="text-[clamp(24px,3vw,38px)] font-semibold uppercase">{mod.title}</h3>
                    <div className="flex flex-wrap gap-[8px] mt-[12px] max-w-[80%]">
                      {mod.tags.map(tag => (
                        <span key={tag} className="font-mono text-[10px] tracking-[.1em] uppercase px-[10px] py-[6px] border border-[rgba(237,237,232,.35)] bg-[rgba(10,11,13,0.3)] backdrop-blur-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="font-mono text-[12px] text-[var(--paper-dim)]">0{i+1} / 0{mods.length}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
