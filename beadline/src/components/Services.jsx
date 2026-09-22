import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
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

export default function Services() {
  const [size, setSize] = useState(1);
  const [open, setOpen] = useState(3);

  return (
    <section id="services" className="wrap pt-[clamp(96px,16vh,180px)] pb-[clamp(72px,12vh,140px)]">
      <div className="flex flex-wrap items-end justify-between gap-8 mb-10 md:mb-14">
        <div>
          <h2 className="wide d2 m-0 max-w-[12ch]">Pick a service, see the price</h2>
          <p className="lede mt-5 mb-0 muted">Prices include pickup and drop within 8 km, and GST.</p>
        </div>
        <div role="radiogroup" aria-label="Car size" className="flex gap-2">
          {sizes.map((s, i) => (
            <button key={s} role="radio" aria-checked={size === i} aria-pressed={size === i} onClick={() => setSize(i)} className="chip">{s}</button>
          ))}
        </div>
      </div>

      <ul className="list-none m-0 p-0 border-t border-[var(--line)]">
        {services.map((s, i) => {
          const isOpen = open === i;
          return (
            <li key={s.name} className="border-b border-[var(--line)]">
              <button
                onClick={() => setOpen(isOpen ? -1 : i)}
                aria-expanded={isOpen}
                aria-controls={`svc-${i}`}
                className="w-full grid grid-cols-[1fr_auto] md:grid-cols-[1.6fr_1fr_auto_28px] items-baseline gap-x-6 gap-y-1 py-6 md:py-7 text-left cursor-pointer group"
              >
                <span className="narrow text-[clamp(26px,3vw,44px)] leading-none transition-[font-stretch] duration-500 group-hover:[font-stretch:100%]">{s.name}</span>
                <span className="text-[clamp(20px,2vw,26px)] font-semibold md:order-3"><Price value={s.prices[size]} /></span>
                <span className="muted text-[15px] md:order-2">{s.time}</span>
                <span aria-hidden="true" className="hidden md:block order-4 text-[24px] leading-none transition-transform duration-500" style={{ transform: isOpen ? 'rotate(45deg)' : 'none' }}>+</span>
              </button>

              <div id={`svc-${i}`} className="grid transition-[grid-template-rows] duration-600 ease-[cubic-bezier(.16,1,.3,1)]" style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}>
                <div className="overflow-hidden">
                  <div className="grid md:grid-cols-[1fr_1.2fr] gap-6 md:gap-12 pb-8 pt-1">
                    <Img m={s.image} alt={s.name} className="h-[52vw] md:h-[320px] rounded-[6px]" />
                    <div className="flex flex-col justify-between gap-6">
                      <div>
                        <p className="m-0 max-w-[48ch]">{s.body}</p>
                        <ul className="mt-5 mb-0 pl-5 muted">
                          {s.includes.map((x) => <li key={x}>{x}</li>)}
                        </ul>
                      </div>
                      <a href="#book" onClick={() => pickService(s.name)} className="btn self-start" tabIndex={isOpen ? 0 : -1}>Book {s.name.toLowerCase()}</a>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
