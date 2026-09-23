import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { media } from '../content';
import { Video } from './Media';

export default function Beading() {
  const root = useRef(null);
  useGSAP(() => {
    gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
      // Type stretches as the section crosses the screen, like water sheeting off.
      gsap.fromTo('.bead-line', { fontStretch: '62%' }, {
        fontStretch: '125%', ease: 'none', stagger: 0.15,
        scrollTrigger: { trigger: root.current, start: 'top 85%', end: 'center 40%', scrub: true },
      });
      gsap.fromTo('.bead-media', { scale: 1.15 }, {
        scale: 1, ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });
  }, { scope: root });

  return (
    <section ref={root} className="relative h-[90svh] min-h-[520px] overflow-hidden bg-[#16191c] text-[#f3f5f6]">
      <div className="bead-media absolute inset-0">
        <Video file={media.beadingVideo} poster={media.beadingPoster} />
      </div>
      <div className="absolute inset-0 bg-[rgba(22,25,28,.45)]" />
      <div className="relative h-full wrap flex flex-col justify-center">
        <h2 className="m-0 font-extrabold d1" style={{ letterSpacing: '-0.02em' }}>
          <span className="bead-line block">Water runs off.</span>
          <span className="bead-line block">Dirt goes with it.</span>
        </h2>
        <p className="lede mt-8 mb-0">That’s what a ceramic coat does. You rinse the car instead of scrubbing it, and the gloss lasts years instead of weeks.</p>
      </div>
    </section>
  );
}
