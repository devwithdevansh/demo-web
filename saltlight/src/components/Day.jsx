import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { day } from '../content';
import { Img, Video } from './Media';

const setTone = (t, duration = 0.8) =>
  gsap.to(document.documentElement, { '--bg': t.bg, '--fg': t.fg, duration, ease: 'power2.out', overwrite: 'auto' });

function NightSky({ moonClass = '' }) {
  return (
    <div className="sky" aria-hidden="true">
      <div className="stars" />
      <div className={`moon left-[58%] top-[24%] md:left-[62%] md:top-[18%] ${moonClass}`} />
      <div className="salt-floor" />
    </div>
  );
}

function Panel({ p, i }) {
  const dark = p.night;
  return (
    <article
      className={`day-panel relative shrink-0 w-full md:w-screen md:h-[100svh] flex ${p.night ? 'min-h-[100svh] items-end md:items-center' : 'items-center'}`}
      aria-label={`${p.time}, ${p.title}`}
    >
      {dark && (
        <div className="absolute inset-0">
          <NightSky moonClass="moon-rise" />
          {p.video && <Video file={p.video} className="mix-blend-screen opacity-60" />}
        </div>
      )}

      <div className={`relative wrap w-full grid gap-8 md:gap-[6vw] items-center ${dark ? 'pb-[14vh] pt-[40vh] md:py-0' : 'py-16 md:py-0 md:grid-cols-[5fr_7fr]'}`}>
        <div className={dark ? 'max-w-[640px]' : ''}>
          <p className="serif m-0 text-[clamp(64px,10vw,168px)] leading-[.85] tabular-nums">{p.time}</p>
          <h3 className="serif d3 mt-6 mb-4">{p.title}</h3>
          <p className="m-0 max-w-[40ch] muted">{p.body}</p>
          {i === 0 && <p className="mt-10 mb-0 text-[14px] muted hidden md:block">Keep scrolling. The page follows the day.</p>}
        </div>

        {!dark && (
          <div className="relative h-[62vw] md:h-[68vh] rounded-[3px] overflow-hidden">
            {p.video
              ? <Video file={p.video} poster={p.image} />
              : <Img m={p.image} alt={p.title} className="absolute inset-0" />}
          </div>
        )}
      </div>
    </article>
  );
}

export default function Day() {
  const root = useRef(null);
  const track = useRef(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    // Desktop: pin and scroll sideways; colours and moon are scrubbed to the scroll.
    mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
      const distance = () => track.current.scrollWidth - window.innerWidth;
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root.current, start: 'top top', end: () => `+=${distance()}`,
          pin: true, scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1,
        },
      });
      tl.to(track.current, { x: () => -distance(), duration: day.length - 1 }, 0);
      day.forEach((p, i) => {
        if (i === 0) return;
        tl.to(document.documentElement, { '--bg': p.tone.bg, '--fg': p.tone.fg, duration: 0.6 }, i - 0.8);
      });
      tl.fromTo('.moon-rise', { yPercent: 260, scale: 0.8 }, { yPercent: 0, scale: 1, duration: 0.9 }, day.length - 1.9);
      return () => setTone(day[0].tone, 0);
    });

    // Mobile or reduced motion: stack vertically, switch colours as each hour arrives.
    mm.add('(max-width: 767px), (prefers-reduced-motion: reduce)', () => {
      gsap.utils.toArray('.day-panel').forEach((el, i) => {
        gsap.timeline({
          scrollTrigger: {
            trigger: el, start: 'top 60%', end: 'bottom 60%',
            onEnter: () => setTone(day[i].tone),
            onEnterBack: () => setTone(day[i].tone),
            onLeaveBack: () => i === 0 && setTone(day[0].tone),
          },
        });
      });
    });
  }, { scope: root });

  return (
    <section id="day" ref={root} className="relative overflow-hidden" aria-label="A day on the Rann">
      <h2 className="sr-only">A day on the Rann</h2>
      <div ref={track} className="flex flex-col md:flex-row md:w-max will-change-transform">
        {day.map((p, i) => <Panel key={p.time} p={p} i={i} />)}
      </div>
    </section>
  );
}
