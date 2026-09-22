import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { media } from '../content';
import { Video } from './Media';

const lines = ['Sleep where', 'the land turns', 'to salt.'];

export default function Hero() {
  const root = useRef(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      // The one orchestrated entrance on the page.
      gsap.timeline({ defaults: { ease: 'expo.out' } })
        .from('.hero-media', { scale: 1.18, duration: 2.4, ease: 'power3.out' }, 0)
        .from('.char', { yPercent: 110, duration: 1.3, stagger: 0.022 }, 0.25)
        .from('.hero-foot > *', { opacity: 0, y: 20, duration: 1, stagger: 0.1 }, 1.1);

      gsap.to('.hero-media', {
        yPercent: 18, ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      });
      gsap.to('.hero-copy', {
        yPercent: -30, opacity: 0, ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'center center', end: 'bottom top', scrub: true },
      });
    });
  }, { scope: root });

  return (
    <section id="top" ref={root} className="relative h-[100svh] min-h-[600px] overflow-hidden text-[#e9ecea]">
      <div className="hero-media absolute inset-0 will-change-transform">
        <Video file={media.heroVideo} poster={media.heroPoster} />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(15,20,48,.35),rgba(15,20,48,0)_35%,rgba(15,20,48,.65))]" />

      <div className="hero-copy relative z-[1] h-full wrap flex flex-col justify-end" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + clamp(28px, 6vh, 64px))' }}>
        <h1 className="serif d1 m-0" aria-label={lines.join(' ')}>
          {lines.map((l, i) => (
            <span key={i} className="line-mask" aria-hidden="true">
              {l.split('').map((c, j) => <span key={j} className="char">{c === ' ' ? '\u00A0' : c}</span>)}
            </span>
          ))}
        </h1>

        <div className="hero-foot mt-8 flex flex-wrap items-end justify-between gap-6">
          <p className="lede m-0">Twelve bhungas on the edge of the White Rann, Kutch. Open November to March.</p>
          <div className="flex items-center gap-7">
            <a href="#book" className="btn" style={{ background: '#e9ecea', color: '#1b2244' }}>Check dates</a>
            <a href="#map" className="link">See where we are</a>
          </div>
        </div>
      </div>
    </section>
  );
}
