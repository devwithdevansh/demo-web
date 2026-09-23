import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { media } from '../content';
import { Img } from './Media';

export default function Hero() {
  const root = useRef(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      // Load: headline stretches out on Archivo's width axis — the one intro moment.
      gsap.timeline({ defaults: { ease: 'expo.out' } })
        .fromTo('.hero-a', { fontStretch: '62%', opacity: 0 }, { fontStretch: '125%', opacity: 1, duration: 1.6 }, 0.2)
        .from('.hero-foot > *', { y: 18, opacity: 0, duration: 1, stagger: 0.08 }, 0.9)
        .from('.scroll-hint', { opacity: 0, duration: 1 }, 1.4);

      // Scroll: a squeegee pass wipes the dust off the car.
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: root.current, start: 'top top', end: '+=130%', pin: true, scrub: 0.5, anticipatePin: 1 },
      });
      tl.fromTo('.dirty', { clipPath: 'inset(0 0 0 0%)' }, { clipPath: 'inset(0 0 0 100%)', duration: 1 }, 0)
        .fromTo('.squeegee', { left: '0%' }, { left: '100%', duration: 1 }, 0)
        .to('.scroll-hint', { opacity: 0, duration: 0.1 }, 0)
        .to('.hero-a', { yPercent: -30, opacity: 0, duration: 0.3 }, 0.35)
        .fromTo('.hero-b', { yPercent: 30, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.3 }, 0.55)
        .to('.clean', { scale: 1.04, duration: 1 }, 0);
    });

    mm.add('(prefers-reduced-motion: reduce)', () => {
      gsap.set('.dirty, .squeegee, .hero-a', { display: 'none' });
      gsap.set('.hero-b', { opacity: 1 });
    });
  }, { scope: root });

  return (
    <section id="top" ref={root} className="relative h-[100svh] min-h-[560px] overflow-hidden bg-[#16191c] text-[#f3f5f6]">
      <Img m={media.hero} alt="White coupe, freshly detailed" eager className="clean absolute inset-0" />
      <div className="dirty absolute inset-0" aria-hidden="true">
        <Img m={media.hero} alt="" eager className="dusty absolute inset-0" />
        <div className="dust-grain" />
      </div>
      <div className="squeegee" aria-hidden="true" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(22,25,28,.7),rgba(22,25,28,0)_28%,rgba(22,25,28,0)_55%,rgba(22,25,28,.75))]" />

      <div className="relative z-[1] h-full wrap flex flex-col justify-end" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + clamp(28px, 6vh, 60px))' }}>
        <h1 className="relative m-0">
          <span className="hero-a wide d1 block max-w-[11ch]">Rajkot dust comes off.</span>
          <span className="hero-b wide d1 block max-w-[11ch] absolute bottom-0 left-0 opacity-0">Gloss stays on.</span>
        </h1>
        <div className="hero-foot mt-8 flex flex-wrap items-end justify-between gap-6">
          <p className="lede m-0">Paint correction, ceramic coating and PPF in Rajkot. Free pickup and drop within 8 km.</p>
          <div className="flex items-center gap-6">
            <a href="#book" className="btn light">Book a slot</a>
            <a href="#services" className="link">See prices</a>
          </div>
        </div>
      </div>
      <p className="scroll-hint absolute right-[var(--edge)] top-[50%] m-0 text-[14px] opacity-80 hidden md:block">Scroll to wash it</p>
    </section>
  );
}
