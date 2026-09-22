import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const text = 'For five months a year the sea retreats from the Rann and leaves behind seven thousand square kilometres of salt. We built twelve rooms at its edge, with the people who have always lived here, and planned every day around the light.';

export default function Intro() {
  const root = useRef(null);
  useGSAP(() => {
    gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo('.w', { opacity: 0.14 }, {
        opacity: 1, stagger: 0.08, ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top 75%', end: 'bottom 55%', scrub: true },
      });
    });
  }, { scope: root });

  return (
    <section ref={root} className="wrap py-[clamp(96px,18vh,200px)]">
      <p className="serif d3 m-0 max-w-[24ch]">
        {text.split(' ').map((w, i) => <span key={i} className="w">{w} </span>)}
      </p>
    </section>
  );
}
