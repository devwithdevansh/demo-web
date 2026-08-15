import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Craftsmanship() {
  const containerRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      // Title Lines Reveal
      gsap.to('.craft-line-span', {
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 60%',
        },
        y: 0,
        opacity: 1,
        duration: 0.9,
        stagger: 0.12,
        ease: 'power3.out'
      });
      
      // Parallax effect on background
      gsap.to('.craft-bg-img', {
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
        y: '20%',
        ease: 'none'
      });

    }, containerRef);
    
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} id="craft" className="relative min-h-screen flex items-center overflow-hidden bg-[var(--ink)]">
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1661336878257-1c51b5af959a?w=2000&q=80&auto=format&fit=crop" 
          alt="Steering wheel stitching detail" 
          className="craft-bg-img w-full h-[120%] -top-[10%] object-cover brightness-[.28] saturate-[.7] relative"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,11,13,.5),rgba(10,11,13,.75))]"></div>
      </div>
      
      <div className="relative z-[2] px-[var(--edge)] py-[min(16vh,140px)] w-full">
        <div className="eyebrow mb-[22px]">Craft</div>
        <h2 className="text-[clamp(30px,5.6vw,76px)] font-semibold uppercase leading-[1.14] max-w-[16ch]">
          {['Machines can polish.', 'Craftsmen know', 'when to stop.'].map((text, i) => (
            <div key={i} className="overflow-hidden">
              <span className="craft-line-span inline-block translate-y-[110%] opacity-0">{text}</span>
            </div>
          ))}
        </h2>
      </div>
    </section>
  );
}
