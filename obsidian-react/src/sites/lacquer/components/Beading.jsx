import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { media } from '../content';
import { Video } from './Media';

// Splits a line into masked, per-word spans so each word can rise into view
// on its own beat instead of the whole line fading up together.
function KineticLine({ text, className = '' }) {
  return (
    <span className={`block ${className}`}>
      {text.split(' ').map((word, i) => (
        <span key={i} className="kinetic-mask mr-[0.28em]">
          <span className="kinetic-word block">{word}</span>
        </span>
      ))}
    </span>
  );
}

export default function Beading() {
  const root = useRef(null);
  useGSAP(() => {
    gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo('.kinetic-word', { yPercent: 115, rotate: 4 }, {
        yPercent: 0, rotate: 0, ease: 'expo.out', duration: 1, stagger: 0.05,
        scrollTrigger: { trigger: root.current, start: 'top 75%' },
      });
      gsap.fromTo('.bead-media', { scale: 1.15 }, {
        scale: 1, ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });
    gsap.matchMedia().add('(prefers-reduced-motion: reduce)', () => {
      gsap.set('.kinetic-word', { yPercent: 0 });
    });
  }, { scope: root });

  return (
    <section ref={root} className="relative h-[90svh] min-h-[520px] overflow-hidden bg-[var(--ink)] text-[var(--paper)]">
      <div className="bead-media absolute inset-0">
        <Video file={media.beadingVideo} poster={media.beadingPoster} />
      </div>
      <div className="absolute inset-0 bg-[rgba(8,9,10,.5)]" />
      <div className="grain" />
      <div className="relative h-full wrap flex flex-col justify-center">
        <span className="eyebrow mb-6">What the ceramic layer does</span>
        <h2 className="m-0 display" style={{ fontSize: 'clamp(40px,7.4vw,112px)', lineHeight: 0.98 }}>
          <KineticLine text="Water runs off." />
          <KineticLine text="Dust goes with it." />
        </h2>
        <p className="lede mt-8 mb-0">You rinse the car instead of scrubbing it, and the gloss holds for years instead of weeks. That's the whole pitch for ceramic.</p>
      </div>
    </section>
  );
}
