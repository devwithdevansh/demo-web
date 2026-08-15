import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Ceramic() {
  const containerRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
        }
      });

      tl.to('#ceramicImg', {
        filter: 'saturate(1) brightness(1) contrast(1)',
        duration: 1
      }, 0)
      .to('#specular', {
        opacity: 1,
        left: '100%',
        duration: 1.5,
        ease: 'power1.inOut'
      }, 0)
      .to('.cer-tag', {
        opacity: 1,
        y: 0,
        borderColor: 'var(--brass)',
        duration: 0.5,
        stagger: 0.15
      }, 0.5);

    }, containerRef);
    
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} id="ceramic" className="h-[240vh] bg-[var(--ink)]">
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="absolute inset-0">
          <img 
            id="ceramicImg" 
            src="https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=2000&q=80&auto=format&fit=crop" 
            alt="Ceramic coated paint gloss" 
            className="absolute inset-0 w-full h-full object-cover saturate-[.5] brightness-[.6] contrast-[.9]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(10,11,13,.9),transparent_55%)]"></div>
          <div 
            id="specular" 
            className="absolute top-[10%] -left-[30%] w-[60%] h-[80%] opacity-0 pointer-events-none blur-[6px] bg-[linear-gradient(120deg,transparent_40%,rgba(255,255,255,.35)_48%,transparent_56%)]"
          ></div>
        </div>
        
        <div className="relative z-[2] h-full flex flex-col justify-end px-[var(--edge)] pb-[90px]">
          <div className="eyebrow">Ceramic Coating</div>
          <h2 className="text-[clamp(38px,6.4vw,92px)] font-semibold uppercase leading-[.98] mt-[14px]">
            Gloss That<br/>Lasts.
          </h2>
          <div className="flex flex-wrap gap-[12px] mt-[38px]">
            {['Hydrophobic', 'UV Protection', 'Gloss', 'Easy Maintenance'].map((tag) => (
              <span 
                key={tag}
                className="cer-tag font-mono text-[11px] tracking-[.12em] uppercase px-[16px] py-[10px] border border-[var(--line)] opacity-0 translate-y-[10px]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
