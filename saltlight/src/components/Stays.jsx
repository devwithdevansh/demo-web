import { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { rooms } from '../content';
import { Img } from './Media';

export const pickRoom = (name) => window.dispatchEvent(new CustomEvent('pick-room', { detail: name }));

export default function Stays() {
  const root = useRef(null);
  const float = useRef(null);
  const [active, setActive] = useState(null);
  const move = useRef(null);

  useGSAP(() => {
    gsap.set(float.current, { xPercent: -50, yPercent: -50 });
    const x = gsap.quickTo(float.current, 'x', { duration: 0.55, ease: 'power3' });
    const y = gsap.quickTo(float.current, 'y', { duration: 0.55, ease: 'power3' });
    move.current = (e) => { x(e.clientX); y(e.clientY); };
  }, { scope: root });

  return (
    <section id="stay" ref={root} className="wrap py-[clamp(96px,16vh,180px)]" onMouseMove={(e) => move.current?.(e)}>
      <div className="flex flex-wrap items-end justify-between gap-6 mb-12 md:mb-16">
        <h2 className="serif d2 m-0 max-w-[12ch]">Three ways to stay</h2>
        <p className="m-0 max-w-[36ch] muted">Prices per night for two, with all meals, airport pickup and the sunset cart ride.</p>
      </div>

      <ul className="list-none m-0 p-0 border-t border-current/25" onMouseLeave={() => setActive(null)}>
        {rooms.map((r, i) => (
          <li key={r.name} className="border-b border-current/25">
            <a
              href="#book"
              onClick={() => pickRoom(r.name)}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              className="group grid grid-cols-1 md:grid-cols-[1.4fr_1fr_auto] items-baseline gap-2 md:gap-10 py-7 md:py-9 no-underline"
            >
              <Img m={r.image} alt={r.name} className="md:hidden h-[56vw] rounded-[3px] mb-5" />
              <span className="serif d3 transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] md:group-hover:translate-x-4">{r.name}</span>
              <span className="muted">{r.detail}</span>
              <span className="text-[20px] tabular-nums md:text-right">{r.price}<span className="muted text-[15px]"> / night</span></span>
            </a>
          </li>
        ))}
      </ul>

      {/* Floating preview that follows the cursor on desktop */}
      <div
        ref={float}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-40 hidden md:block w-[340px] h-[420px] rounded-[3px] overflow-hidden transition-[opacity,scale] duration-500"
        style={{ opacity: active === null ? 0 : 1, scale: active === null ? 0.85 : 1 }}
      >
        {rooms.map((r, i) => (
          <div key={r.name} className="absolute inset-0 transition-opacity duration-500" style={{ opacity: active === i ? 1 : 0 }}>
            <Img m={r.image} alt="" className="absolute inset-0" />
          </div>
        ))}
      </div>
    </section>
  );
}
