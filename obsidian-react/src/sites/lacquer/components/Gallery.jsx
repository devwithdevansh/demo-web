import { useRef, useState } from 'react';
import gsap from 'gsap';
import { Flip } from 'gsap/Flip';
import { useGSAP } from '@gsap/react';
import { work, workTags } from '../content';
import { Img } from './Media';

gsap.registerPlugin(Flip);

export default function Gallery() {
  const root = useRef(null);
  const [tag, setTag] = useState('All');
  const flipState = useRef(null);

  const choose = (t) => {
    if (t === tag) return;
    flipState.current = Flip.getState('.work-item');
    setTag(t);
  };

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
    <section id="gallery" ref={root} className="wrap py-[clamp(96px,16vh,180px)]">
      <div className="flex flex-wrap items-end justify-between gap-8 mb-10 md:mb-14">
        <div>
          <span className="eyebrow mb-4">Recent work</span>
          <h2 className="display d2 m-0 max-w-[13ch]">Cars we've handed back</h2>
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter work">
          {workTags.map((t) => <button key={t} className="chip" aria-pressed={tag === t} onClick={() => choose(t)}>{t}</button>)}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 min-h-[40vh]">
        {shown.map((w, i) => (
          <figure
            key={w.car}
            data-flip-id={w.car}
            className={`work-item group relative m-0 rounded-[10px] overflow-hidden ${i % 5 === 0 ? 'col-span-2 row-span-2' : ''}`}
          >
            <div className={`relative ${i % 5 === 0 ? 'aspect-square' : 'aspect-[4/5]'}`}>
              <Img m={w.image} alt={w.car} className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-110" />
              {/* Caption sits under a mask that slides up on hover, revealing it. */}
              <div className="absolute inset-x-0 bottom-0 h-full bg-[linear-gradient(to_top,rgba(8,9,10,.88),transparent_55%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <figcaption className="absolute inset-x-0 bottom-0 p-4 translate-y-[calc(100%-2px)] group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] flex justify-between items-end gap-3">
                <span className="text-[14px] font-medium">{w.car}</span>
                <span className="font-mono text-[11px] uppercase tracking-[.1em] text-[var(--lacquer-bright)] shrink-0">{w.tag}</span>
              </figcaption>
            </div>
          </figure>
        ))}
      </div>
    </section>
  );
}
