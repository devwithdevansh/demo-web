import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const steps = [
  { num: '01', name: 'Foam', desc: 'Snow foam pre-wash lifts loose contamination before anything touches the paint.', img: 'https://images.unsplash.com/photo-1762933855598-273a51b47649?w=1400&q=80&auto=format&fit=crop' },
  { num: '02', name: 'Decontamination', desc: 'Iron and tar removal, then a clay bar pass to leave the surface glass-smooth.', img: 'https://images.unsplash.com/photo-1653749573430-3ed4b826222c?w=1400&q=80&auto=format&fit=crop' },
  { num: '03', name: 'Inspection', desc: 'Paint depth readings and swirl mapping under raking light set the correction plan.', img: 'https://images.unsplash.com/photo-1578478412827-8c0ec4fdde15?w=1400&q=80&auto=format&fit=crop' },
  { num: '04', name: 'Correction', desc: 'Multi-stage machine polishing removes defects and restores true clarity.', img: 'https://images.unsplash.com/photo-1621712151262-60bd142ba19f?w=1400&q=80&auto=format&fit=crop' },
  { num: '05', name: 'Finishing', desc: 'A finishing polish refines the surface to maximum gloss and depth.', img: 'https://images.unsplash.com/photo-1611820972863-59eaff523aba?w=1400&q=80&auto=format&fit=crop' },
  { num: '06', name: 'Protection', desc: 'Ceramic coating or PPF locks the result in for years, not weeks.', img: 'https://images.unsplash.com/photo-1653749576894-3a571fa4ca07?w=1400&q=80&auto=format&fit=crop' }
];

export default function Process() {
  const containerRef = useRef(null);
  
  useEffect(() => {
    let ctx = gsap.context(() => {
      
      const stepEls = gsap.utils.toArray('.proc-step');
      const imgEls = gsap.utils.toArray('.proc-img');
      const descEl = document.getElementById('procDesc');

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
        }
      });

      stepEls.forEach((step, i) => {
        if (i === 0) return; // skip first, already active
        
        tl.to(stepEls[i - 1], { opacity: 0.35, duration: 0.5 }, i)
          .to(imgEls[i - 1], { opacity: 0, scale: 1.06, duration: 1, ease: 'power3.inOut' }, i)
          .to(step, { opacity: 1, duration: 0.5 }, i)
          .to(imgEls[i], { opacity: 1, scale: 1, duration: 1, ease: 'power3.inOut' }, i)
          .call(() => {
            if (descEl) descEl.innerText = steps[i].desc;
          }, [], i + 0.5)
          .call(() => {
            if (descEl && i > 0) descEl.innerText = steps[i-1].desc;
          }, [], i - 0.1);
      });
      
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} id="process" className="bg-[var(--graphite)] md:h-[400vh]">
      <div className="md:sticky md:top-0 h-auto md:h-screen grid grid-cols-1 md:grid-cols-2 items-center relative py-[60px] md:py-0 gap-[40px] md:gap-0">
        <div className="proc-left px-[var(--edge)]">
          <div className="eyebrow">Method</div>
          <h2 className="text-[clamp(30px,4vw,52px)] font-semibold uppercase mt-[14px]">The Process</h2>
          
          <div className="proc-steps mt-[40px]">
            {steps.map((step, i) => (
              <div key={i} className={`proc-step flex items-baseline gap-[18px] py-[14px] transition-opacity duration-400 ${i === 0 ? 'opacity-100' : 'opacity-[0.35]'}`}>
                <span className="font-mono text-[12px] text-[var(--brass)]">{step.num}</span>
                <span className="text-[clamp(20px,2.6vw,32px)] font-medium uppercase">{step.name}</span>
              </div>
            ))}
          </div>
          
          <p id="procDesc" className="proc-desc mt-[28px] max-w-[38ch] text-[14px] text-[var(--paper-dim)] min-h-[60px] font-mono">
            {steps[0].desc}
          </p>
        </div>
        
        <div className="proc-right relative h-[46vh] md:h-[78vh] mx-[var(--edge)] md:mx-0 md:mr-[var(--edge)] overflow-hidden">
          {steps.map((step, i) => (
            <img 
              key={i}
              className={`proc-img absolute inset-0 w-full h-full object-cover transition-all duration-[1.2s] ease-[var(--ease-panel)] ${i === 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.06]'}`}
              src={step.img} 
              alt={step.name} 
            />
          ))}
        </div>
      </div>
    </section>
  );
}
