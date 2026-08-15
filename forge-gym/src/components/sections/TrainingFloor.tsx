import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Img } from '@/components/ui/Img';
import { images } from '@/lib/images';

gsap.registerPlugin(ScrollTrigger);

const CAPTIONS = ['Free Weight Floor', 'Power Rack Row', 'Functional Zone', 'Cardio Deck', 'Recovery Corner'];

export function TrainingFloor() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!isDesktop || reduceMotion || !sectionRef.current || !trackRef.current) return;

    const ctx = gsap.context(() => {
      const track = trackRef.current!;
      const scrollAmount = track.scrollWidth - window.innerWidth;
      if (scrollAmount <= 0) return;

      gsap.to(track, {
        x: -scrollAmount,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: () => `+=${scrollAmount}`,
          scrub: true,
          pin: true,
          invalidateOnRefresh: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="floor" data-phase="BUILD" ref={sectionRef} className="relative overflow-hidden bg-ink">
      <div className="pt-20 pb-8 px-6 lg:px-12">
        <p className="eyebrow mb-4">The Training Floor</p>
        <h2 className="font-display text-5xl leading-[0.9] text-bone lg:text-7xl">
          THIS IS WHERE <span className="text-red">IT HAPPENS.</span>
        </h2>
      </div>

      <div
        ref={trackRef}
        className="flex gap-4 overflow-x-auto px-6 pb-16 lg:overflow-visible lg:px-12"
        style={{ scrollSnapType: 'x proximity' }}
      >
        {images.trainingFloor.map((src, i) => (
          <div
            key={i}
            className="relative h-[46vh] w-[82vw] shrink-0 overflow-hidden lg:h-[62vh] lg:w-[38vw]"
            style={{ scrollSnapAlign: 'start' }}
          >
            <Img src={src} alt={CAPTIONS[i] ?? 'Gym floor'} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
            <p className="absolute bottom-5 left-5 font-mono text-[11px] uppercase tracking-[0.2em] text-bone">
              {CAPTIONS[i] ?? 'Gym floor'}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
