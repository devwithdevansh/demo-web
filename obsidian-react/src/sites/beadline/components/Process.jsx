import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { steps } from '../content';
import { Img, Video } from './Media';

export default function Process() {
  const root = useRef(null);

  useGSAP(() => {
    gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
      const cards = gsap.utils.toArray('.step-card');
      cards.forEach((card, i) => {
        if (i === cards.length - 1) return;
        // As the next card slides over, this one sinks back.
        gsap.to(card.querySelector('.step-inner'), {
          scale: 0.92, opacity: 0.6, ease: 'none',
          scrollTrigger: { trigger: cards[i + 1], start: 'top bottom', end: 'top 20%', scrub: true },
        });
      });
    });
  }, { scope: root });

  return (
    <section id="process" ref={root} className="wrap pb-[clamp(72px,12vh,140px)] pt-[clamp(96px,16vh,180px)]">
      <div className="flex flex-wrap items-end justify-between gap-6 mb-10 md:mb-14">
        <h2 className="wide d2 m-0 max-w-[12ch]">What happens in the bay</h2>
        <p className="lede m-0 muted">Five stages, same order every time. A ceramic job takes two days because none of them get skipped.</p>
      </div>

      <ol className="list-none m-0 p-0">
        {steps.map((s, i) => (
          <li key={s.title} className="step-card sticky mb-6" style={{ top: `calc(96px + ${i * 14}px)` }}>
            <div className="step-inner origin-top rounded-[10px] bg-[#16191c] text-[#f3f5f6] overflow-hidden grid md:grid-cols-[1fr_1.1fr] md:h-[min(68vh,560px)] will-change-transform">
              <div className="p-7 md:p-12 flex flex-col justify-between gap-10">
                <span className="wide text-[clamp(56px,7vw,112px)] leading-none tnum text-[#3fa9d9]" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3 className="wide d3 m-0">{s.title}</h3>
                  <p className="mt-4 mb-0 max-w-[40ch] muted">{s.body}</p>
                </div>
              </div>
              <div className="relative h-[60vw] md:h-auto">
                {s.video ? <Video file={s.video} poster={s.image} /> : <Img m={s.image} alt={s.title} className="absolute inset-0" />}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
