import { useRef, useState } from 'react';
import gsap from 'gsap';
import { Flip } from 'gsap/Flip';
import { useGSAP } from '@gsap/react';
import { work, workTags } from '../content';
import { Img } from './Media';

gsap.registerPlugin(Flip);

export default function Work() {
  const root = useRef(null);
  const [tag, setTag] = useState('All');
  const flipState = useRef(null);

  const choose = (t) => {
    if (t === tag) return;
    flipState.current = Flip.getState('.work-item');
    setTag(t);
  };

  // Tiles glide to their new spots after a filter change.
  useGSAP(() => {
    if (!flipState.current) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    Flip.from(flipState.current, {
      duration: reduce ? 0 : 0.7, ease: 'expo.out', absolute: true, scale: true,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: reduce ? 0 : 0.5 }),
      onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.9, duration: reduce ? 0 : 0.3 }),
    });
    flipState.current = null;
  }, { dependencies: [tag], scope: root });

  const shown = work.filter((w) => tag === 'All' || w.tag === tag);

  return (
    <section id="work" ref={root} className="on-dark bg-[#16191c] text-[#f3f5f6] wrap py-[clamp(96px,16vh,180px)]">
      <div className="flex flex-wrap items-end justify-between gap-8 mb-10 md:mb-14">
        <h2 className="wide d2 m-0 max-w-[12ch]">Recent cars</h2>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter work">
          {workTags.map((t) => <button key={t} className="chip" aria-pressed={tag === t} onClick={() => choose(t)}>{t}</button>)}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 min-h-[40vh]">
        {shown.map((w, i) => (
          <figure key={w.car} data-flip-id={w.car} className={`work-item m-0 ${i % 5 === 0 ? 'col-span-2 row-span-2' : ''}`}>
            <Img m={w.image} alt={w.car} className={`rounded-[6px] ${i % 5 === 0 ? 'aspect-square' : 'aspect-[4/5]'}`} />
            <figcaption className="mt-3 flex justify-between gap-3 text-[15px]">
              <span>{w.car}</span><span className="muted">{w.tag}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
