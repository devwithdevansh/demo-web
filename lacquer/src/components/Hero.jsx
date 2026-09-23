import { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { media, src, trust } from '../content';
import AmbientSpotlight from './AmbientSpotlight';

export default function Hero() {
  const root = useRef(null);
  // A real transparent PNG cutout, if one has been dropped into
  // /public/media/images/ (see MEDIA.md), looks better than the masked
  // photo below -- try it first and fall back the moment it 404s.
  const [heroSrc, setHeroSrc] = useState(media.heroCutout);
  const [isCutout, setIsCutout] = useState(true);
  const fallback = () => {
    if (!isCutout) return;
    setIsCutout(false);
    setHeroSrc(src(media.hero));
  };

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      // Load: headline rises in, then the eyebrow, foot and scroll hint.
      gsap.timeline({ defaults: { ease: 'expo.out' } })
        .from('.hero-eyebrow', { y: 14, opacity: 0, duration: 0.8 }, 0.1)
        .from('.hero-a', { y: 40, opacity: 0, duration: 1.1 }, 0.25)
        .from('.hero-foot > *', { y: 18, opacity: 0, duration: 0.9, stagger: 0.08 }, 0.7)
        .from('.scroll-hint', { opacity: 0, duration: 1 }, 1.2)
        .from('.smoke-blob', { opacity: 0, scale: 0.7, duration: 1.6, stagger: 0.15 }, 0.1);

      // Scroll: a squeegee pass wipes the dust off the car, and the smoke
      // drifts and thins out alongside it -- dust and haze clearing together.
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: root.current, start: 'top top', end: '+=130%', pin: true, scrub: 0.5, anticipatePin: 1 },
      });
      tl.fromTo('.dirty', { clipPath: 'inset(0 0 0 0%)' }, { clipPath: 'inset(0 0 0 100%)', duration: 1 }, 0)
        .fromTo('.squeegee', { left: '0%' }, { left: '100%', duration: 1 }, 0)
        .to('.scroll-hint', { opacity: 0, duration: 0.1 }, 0)
        .to('.hero-a', { yPercent: -30, opacity: 0, duration: 0.3 }, 0.35)
        .fromTo('.hero-b', { yPercent: 30, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.3 }, 0.55)
        .to('.clean', { scale: 1.03, duration: 1 }, 0)
        .to('.hero-glow', { opacity: 1.4, duration: 1 }, 0)
        .to('.smoke-1', { x: -60, y: 30, opacity: 0.15, duration: 1 }, 0)
        .to('.smoke-2', { x: 50, y: -20, opacity: 0.1, duration: 1 }, 0)
        .to('.smoke-3', { y: 40, opacity: 0.08, duration: 1 }, 0);
    });

    mm.add('(prefers-reduced-motion: reduce)', () => {
      gsap.set('.dirty, .squeegee, .hero-a', { display: 'none' });
      gsap.set('.hero-b', { opacity: 1 });
    });
  }, { scope: root });

  const carClass = isCutout
    ? 'object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,.6)]'
    : 'hero-car-mask object-cover';

  return (
    <section id="top" ref={root} className="relative h-[100svh] min-h-[640px] overflow-hidden bg-[var(--ink)] text-[var(--paper)]">
      {/* Product stage: the car floats on the backdrop, dust-wiped by scroll.
          Inset well clear of every edge so the smoke and glow show around it,
          instead of the photo running edge to edge like a plain background. */}
      <div className="absolute inset-x-[7%] sm:inset-x-[14%] top-[13%] bottom-[38%] sm:bottom-[34%]">
        <img
          src={heroSrc}
          alt="A freshly detailed car"
          className={`clean absolute inset-0 h-full w-full ${carClass}`}
          onError={fallback}
        />
        <div className="dirty absolute inset-0" aria-hidden="true">
          <img src={heroSrc} alt="" className={`dusty absolute inset-0 h-full w-full ${carClass}`} onError={fallback} />
          {!isCutout && <div className="dust-grain hero-car-mask" />}
        </div>
        <div className="squeegee" aria-hidden="true" />
      </div>

      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(8,9,10,.4),rgba(8,9,10,.05)_30%,rgba(8,9,10,.35)_62%,rgba(8,9,10,.94)_88%)]" />

      {/* Ambient smoke and glow ride on top of the darkening overlay, so
          they stay visible instead of getting dimmed along with the photo. */}
      <div className="smoke-field" aria-hidden="true">
        <div className="smoke-blob smoke-1" />
        <div className="smoke-blob smoke-2" />
        <div className="smoke-blob smoke-3" />
      </div>
      <div className="hero-glow" aria-hidden="true" />
      <div className="grain" />
      <AmbientSpotlight />

      <div className="relative z-[1] h-full wrap flex flex-col justify-end" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + clamp(28px, 6vh, 64px))' }}>
        <span className="hero-eyebrow eyebrow mb-5">Ceramic · PPF · Correction — 3 studios in Gujarat</span>
        <h1 className="relative m-0">
          <span className="hero-a display d1 block max-w-[13ch]">The dust comes off the day you book.</span>
          <span className="hero-b display d1 block max-w-[13ch] absolute bottom-0 left-0 opacity-0">The gloss stays on for years.</span>
        </h1>
        <div className="hero-foot mt-9 flex flex-wrap items-end justify-between gap-8">
          <p className="lede m-0">Paint correction, 9H ceramic and self-healing PPF, done under lights with a written before/after report. Free pickup in every studio city.</p>
          <div className="flex items-center gap-6 shrink-0">
            <a href="#book" className="btn solid">Book a slot</a>
            <a href="#services" className="link">See prices</a>
          </div>
        </div>
        <div className="mt-10 hidden sm:grid grid-cols-4 gap-6 border-t border-[var(--line)] pt-6">
          {trust.map((t) => (
            <div key={t.label}>
              <p className="display m-0 text-[clamp(24px,2.4vw,34px)] text-[var(--lacquer-bright)]">{t.value}</p>
              <p className="m-0 mt-1 text-[13px] text-[var(--paper-dim)]">{t.label}</p>
            </div>
          ))}
        </div>
      </div>
      <p className="scroll-hint absolute right-[var(--edge)] top-[46%] m-0 text-[13px] font-mono uppercase tracking-[.16em] opacity-70 hidden md:block [writing-mode:vertical-rl]">Scroll to wash it</p>
    </section>
  );
}
