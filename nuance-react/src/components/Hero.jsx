import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const bgRef = useRef(null);
  const innerRef = useRef(null);
  const splitLinesRef = useRef([]);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    
    // Initial setup
    splitLinesRef.current.forEach(span => {
      if (span) span.style.transform = "translateY(115%)";
    });

    if (!reduced) {
      const tl = gsap.timeline({ delay: 1.05 });
      tl.to(splitLinesRef.current, {
        y: 0, duration: 1.1, ease: "power4.out", stagger: 0.12
      }).fromTo(".hero-kicker", 
        { opacity: 0, y: 14 }, 
        { opacity: 1, y: 0, duration: .7, ease: "power2.out" }, "-=0.9"
      ).fromTo(".hero-cta-row", 
        { opacity: 0, y: 14 }, 
        { opacity: 1, y: 0, duration: .7, ease: "power2.out" }, "-=0.7"
      );

      gsap.to(innerRef.current, {
        y: -80, ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
      });
      
      gsap.to(bgRef.current, {
        scale: 1.12, ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
      });
    } else {
      splitLinesRef.current.forEach(span => {
        if (span) span.style.transform = "translateY(0)";
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  const updateCursor = (text, big) => {
    window.dispatchEvent(new CustomEvent('updateCursor', { detail: { text, big } }));
  };

  return (
    <section className="hero" id="top">
      <div className="hero-bg" id="heroBg">
        <div ref={bgRef} className="ph ph-hero">
          <img className="ph-img" src="/images/hero_bg.jpg" alt="Studio background" />
          <span className="ph-mark">N</span>
        </div>
      </div>
      <div className="hero-scrim"></div>
      <div className="hero-inner" id="heroInner" ref={innerRef}>
        <div className="hero-kicker" style={{ opacity: 0 }}><span className="eyebrow">Hair · Beauty · Grooming</span></div>
        <h1 className="hero-headline display-xl">
          <span className="split-line"><span ref={el => splitLinesRef.current[0] = el}>Your style.</span></span>
          <span className="split-line"><span ref={el => splitLinesRef.current[1] = el} className="italic brass-text">Redefined.</span></span>
        </h1>
        <div className="hero-cta-row" style={{ opacity: 0 }}>
          <a 
            href="#booking" 
            className="btn btn-solid"
            onMouseEnter={() => updateCursor('Book', true)}
            onMouseLeave={() => updateCursor('', false)}
          >
            Book Appointment
          </a>
          <a 
            href="#split" 
            className="btn btn-ghost"
            onMouseEnter={() => updateCursor('Explore', true)}
            onMouseLeave={() => updateCursor('', false)}
          >
            Explore the Salon
          </a>
        </div>
      </div>
      <div className="hero-scroll" aria-hidden="true"><span className="stem"></span>Scroll</div>
    </section>
  );
}
