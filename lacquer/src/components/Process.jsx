import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { steps } from '../content';
import { Img, Video } from './Media';

export default function Process() {
  const root = useRef(null);
  const listRef = useRef(null);
  const fillRef = useRef(null);

  useGSAP(() => {
    gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
      // One continuous line fills as you pass through the section...
      gsap.fromTo(fillRef.current, { scaleY: 0 }, {
        scaleY: 1, ease: 'none',
        scrollTrigger: { trigger: listRef.current, start: 'top 65%', end: 'bottom 55%', scrub: true },
      });

      // ...and each dot lights up, its content sliding in, as the line reaches it.
      gsap.utils.toArray('.step-row').forEach((row) => {
        const dot = row.querySelector('.timeline-dot');
        ScrollTrigger.create({
          trigger: row, start: 'top 72%',
          onEnter: () => dot.classList.add('active'),
          onLeaveBack: () => dot.classList.remove('active'),
        });
        gsap.from(row.querySelector('.step-content'), {
          opacity: 0, y: 28, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: row, start: 'top 78%' },
        });
      });
    });
  }, { scope: root });

  return (
    <section id="process" ref={root} className="wrap pb-[clamp(72px,12vh,140px)] pt-[clamp(96px,16vh,180px)]">
      <div className="flex flex-wrap items-end justify-between gap-6 mb-14 md:mb-20">
        <div>
          <span className="eyebrow mb-4">Inside the bay</span>
          <h2 className="display d2 m-0 max-w-[13ch]">Five stages, every single time</h2>
        </div>
        <p className="lede m-0">A ceramic job takes two days because none of these get skipped, ever, regardless of who's asking.</p>
      </div>

      <ol ref={listRef} className="relative list-none m-0 p-0">
        <div className="timeline-track" aria-hidden="true" />
        <div ref={fillRef} className="timeline-fill" aria-hidden="true" />

        {steps.map((s, i) => (
          <li key={s.title} className="step-row relative pl-[76px] pb-16 last:pb-0">
            <div className="timeline-dot absolute left-0 top-0" aria-hidden="true">{String(i + 1).padStart(2, '0')}</div>
            <div className="step-content grid md:grid-cols-[1fr_1.15fr] gap-6 md:gap-10 items-center">
              <div>
                <h3 className="display d3 m-0">{s.title}</h3>
                <p className="mt-4 mb-0 max-w-[40ch] muted">{s.body}</p>
              </div>
              <div className="relative h-[54vw] md:h-[300px] rounded-[16px] overflow-hidden">
                {s.video ? <Video file={s.video} poster={s.image} /> : <Img m={s.image} alt={s.title} className="absolute inset-0" />}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
