import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Hero({ isReady }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isReady) return;
    
    let ctx = gsap.context(() => {
      // Background Image Fade
      gsap.to('#heroImg', {
        opacity: 1,
        duration: 1.6,
        ease: 'power3.inOut'
      });

      // Sweep Animation
      gsap.fromTo('.sweep', 
        { x: '-120%' },
        { x: '120%', duration: 1.4, ease: 'power3.inOut', delay: 0.55 }
      );

      // Eyebrow Fade Up
      gsap.to('.hero-eyebrow', {
        y: 0,
        opacity: 1,
        duration: 0.8,
        delay: 1.25,
        ease: 'power3.out'
      });

      // Title Lines Reveal
      gsap.to('.hero-line-span', {
        y: 0,
        duration: 0.9,
        stagger: 0.12,
        delay: 1.3,
        ease: 'power3.out'
      });

      // Footer Fade Up
      gsap.to('.hero-foot', {
        y: 0,
        opacity: 1,
        duration: 0.8,
        delay: 1.9,
        ease: 'power3.out'
      });

      // Scroll Background Darkening
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
        animation: gsap.to('#heroFade', { opacity: 1 })
      });

    }, containerRef);
    
    return () => ctx.revert();
  }, [isReady]);

  return (
    <section ref={containerRef} id="hero" className="relative h-screen min-h-[640px] overflow-hidden bg-[var(--ink)]">
      <div className="absolute inset-0 overflow-hidden">
        <img 
          id="heroImg"
          src="https://images.unsplash.com/photo-1628519592419-bf288f08cef5?w=2400&q=80&auto=format&fit=crop" 
          alt="Black Porsche 911" 
          className="absolute inset-0 w-full h-full object-cover object-[60%_55%] opacity-0 scale-100 brightness-[.62] saturate-[1.05]"
        />
        <div className="sweep absolute inset-0 bg-[linear-gradient(100deg,transparent_30%,rgba(237,237,232,.16)_45%,transparent_60%)] -translate-x-[120%] mix-blend-overlay pointer-events-none"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(10,11,13,0.15)_0%,rgba(10,11,13,0.05)_40%,rgba(10,11,13,0.75)_100%)]"></div>
        <div id="heroFade" className="absolute inset-0 bg-[var(--ink)] opacity-0"></div>
      </div>
      
      <div className="relative z-[2] h-full flex flex-col justify-end px-[var(--edge)] pb-[88px]">
        <div className="hero-eyebrow eyebrow opacity-0 translate-y-[14px] mb-[22px]">
          Detailing · Protection · Modification
        </div>
        
        <h1 className="text-[clamp(48px,9.6vw,148px)] font-semibold leading-[.94] tracking-[-0.01em] uppercase max-w-[14ch]">
          {['PRECISION', 'IN EVERY', 'PANEL.'].map((text, i) => (
            <div key={i} className="overflow-hidden">
              <span className="hero-line-span inline-block translate-y-[105%]">{text}</span>
            </div>
          ))}
        </h1>
        
        <div className="hero-foot flex items-end justify-between flex-wrap gap-[28px] mt-[40px] opacity-0 translate-y-[14px]">
          <div className="flex items-center gap-[22px] flex-wrap">
            <a href="#booking" className="btn solid" data-cursor="BOOK">Book Your Build →</a>
            <a href="#builds" className="font-mono text-[11px] tracking-[.14em] uppercase text-[var(--paper-dim)] inline-flex items-center gap-[8px] border-b border-[var(--line)] pb-[4px] transition-colors duration-300 hover:text-[var(--paper)] hover:border-[var(--paper)]" data-cursor="VIEW">
              Explore The Work
            </a>
          </div>
          
          <div className="flex flex-col items-center gap-[10px] font-mono text-[10px] tracking-[.2em] text-[var(--paper-faint)]">
            <span>SCROLL</span>
            <div className="w-[1px] h-[34px] bg-[linear-gradient(to_bottom,var(--paper-faint),transparent)] relative overflow-hidden">
              <div className="absolute left-0 -top-full w-full h-full bg-[var(--paper)] animate-[cueDrop_1.8s_ease-in-out_infinite]"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
