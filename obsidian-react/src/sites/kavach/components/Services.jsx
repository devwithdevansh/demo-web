import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { services, sizes } from '../content';
import { Img } from './Media';

export const pickService = (name) => window.dispatchEvent(new CustomEvent('pick-service', { detail: name }));
const inr = (n) => '₹' + n.toLocaleString('en-IN');

// Counts from the old price to the new one when the car size changes.
function Price({ value }) {
  const el = useRef(null);
  const prev = useRef(value);
  useEffect(() => {
    const obj = { v: prev.current };
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    gsap.to(obj, {
      v: value, duration: reduce ? 0 : 0.6, ease: 'power3.out',
      onUpdate: () => { if (el.current) el.current.textContent = inr(Math.round(obj.v)); },
      onComplete: () => { if (el.current) el.current.textContent = inr(value); },
    });
    prev.current = value;
  }, [value]);
  return <span ref={el} className="tnum">{inr(value)}</span>;
}

// A horizontal scroll-story on wide, fine-pointer screens only (the section
// pins and the scrollbar drives the cards sideways); a plain snap-scrolling
// row everywhere else -- including any tablet or narrow window, even one
// with a mouse/trackpad attached, since the pin's scroll-distance math is
// measured against viewport width and gets it wrong on anything tablet-sized
// or narrower, leaving a dead pinned gap. Touch scrolling stays native and
// reduced-motion users lose the scroll-jack but keep the content either way.
export default function Services() {
  const [size, setSize] = useState(1);
  const root = useRef(null);
  const wrapRef = useRef(null);
  const trackRef = useRef(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference) and (pointer: fine) and (min-width: 1200px)', () => {
      const track = trackRef.current;
      const wrap = wrapRef.current;
      const getDistance = () => Math.max(0, track.scrollWidth - wrap.clientWidth);

      const tween = gsap.to(track, {
        x: () => -getDistance(),
        ease: 'none',
        scrollTrigger: {
          trigger: wrap, start: 'top top', end: () => `+=${getDistance()}`,
          pin: true, scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1,
        },
      });
      return () => tween.scrollTrigger?.kill();
    });
  }, { scope: root });

  // Card width changes with the number of `includes` lines, which can shift
  // layout — refresh so the pin distance stays correct after fonts/images land.
  useEffect(() => {
    const t = setTimeout(() => ScrollTrigger.refresh(), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <section id="services" ref={root} className="pt-[clamp(96px,16vh,180px)]">
      <div className="wrap flex flex-wrap items-end justify-between gap-8 mb-10 md:mb-14">
        <div>
          <span className="eyebrow mb-4">Menu &amp; pricing — scroll sideways</span>
          <h2 className="display d2 m-0 max-w-[13ch]">Six services, one studio standard</h2>
          <p className="lede mt-5 mb-0">Every price includes GST and a written before/after report. Pickup is free within each studio's city.</p>
        </div>
        <div role="radiogroup" aria-label="Car size" className="flex flex-wrap gap-2">
          {sizes.map((s, i) => (
            <button key={s} role="radio" aria-checked={size === i} onClick={() => setSize(i)} className="chip">{s}</button>
          ))}
        </div>
      </div>

      <div ref={wrapRef} className="hscroll-wrap overflow-hidden">
        <div ref={trackRef} className="hscroll-track flex gap-5 wrap w-max pb-4">
          {services.map((s, i) => (
            <article key={s.name} className="hcard group w-[86vw] sm:w-[440px] shrink-0 rounded-[18px] panel overflow-hidden flex flex-col">
              <div className="relative h-[54vw] sm:h-[260px] overflow-hidden">
                <Img m={s.image} alt={s.name} className="absolute inset-0 transition-transform duration-700 group-hover:scale-[1.06]" />
                <span className="absolute top-4 left-4 font-mono text-[11px] tracking-[.16em] uppercase px-3 py-1.5 rounded-full bg-[rgba(8,9,10,.55)] backdrop-blur-[6px] border border-[var(--line)]">{String(i + 1).padStart(2, '0')} / {s.time}</span>
              </div>
              <div className="p-6 flex flex-col gap-4 flex-1">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="display text-[22px] m-0 leading-tight">{s.name}</h3>
                  <p className="m-0 text-[19px] font-semibold whitespace-nowrap"><Price value={s.prices[size]} /></p>
                </div>
                <p className="m-0 text-[14px] text-[var(--paper-dim)] flex-1">{s.body}</p>
                <ul className="m-0 pl-5 muted text-[13px] space-y-1">
                  {s.includes.map((x) => <li key={x}>{x}</li>)}
                </ul>
                <a href="#book" onClick={() => pickService(s.name)} className="btn solid sm self-start mt-1">Book this</a>
              </div>
            </article>
          ))}
          <div className="shrink-0 w-1 sm:w-4" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
