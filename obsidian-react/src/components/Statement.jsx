import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Statement() {
  const containerRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      const words = gsap.utils.toArray('.word');
      
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          // Start as the section scrolls in, not once it fills the screen --
          // 'top top' left a full blank screen before the first word moved.
          start: 'top 65%',
          end: 'bottom bottom',
          scrub: 1,
        }
      });

      tl.to(words[0], { y: 0, color: 'var(--paper)', duration: 1 })
        .to(words[1], { y: 0, color: 'var(--paper)', duration: 1 }, "-=0.2")
        .to(words[2], { y: 0, color: 'var(--paper)', duration: 1 }, "-=0.2")
        .to('#deserveSub', { opacity: 1, duration: 1 }, "-=0.5")
        // small pause at the end before unpinning
        .to({}, { duration: 0.5 });
        
    }, containerRef);
    
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} id="deserve" className="h-[280vh] bg-[var(--ink)]">
      <div className="sticky top-0 h-screen flex flex-col justify-center px-[var(--edge)] overflow-hidden">
        <div className="flex flex-col gap-[clamp(4px,1vw,10px)]">
          {['YOUR CAR', 'DESERVES', 'MORE.'].map((text, i) => (
            <div key={i} className="overflow-hidden">
              <span className="word block text-[clamp(46px,10vw,150px)] font-semibold uppercase leading-[1] tracking-[-0.01em] text-[var(--paper-faint)] translate-y-[100%]">
                {text}
              </span>
            </div>
          ))}
        </div>
        
        <div id="deserveSub" className="absolute bottom-[64px] left-[var(--edge)] right-[var(--edge)] max-w-[44ch] text-[15px] text-[var(--paper-dim)] opacity-0 flex gap-[14px] items-baseline font-mono">
          <span className="text-[var(--brass)]">—</span>
          <span>Most cars are washed. Ours are engineered back to their factory intent, panel by panel, then protected so that standard never fades.</span>
        </div>
      </div>
    </section>
  );
}
