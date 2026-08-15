import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FrameSequence } from '@/components/ui/FrameSequence';
import type { FrameSequenceHandle } from '@/components/ui/FrameSequence';

gsap.registerPlugin(ScrollTrigger);

export function Hero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const text1Ref = useRef<HTMLDivElement>(null);
  const text2Ref = useRef<HTMLDivElement>(null);
  const text3Ref = useRef<HTMLDivElement>(null);
  const frameSequenceRef = useRef<FrameSequenceHandle>(null);

  // FFmpeg extracted exactly 379 frames from the 4K video.
  const FRAME_COUNT = 379;

  useEffect(() => {
    if (!sectionRef.current || !containerRef.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=300%', // Pin for 3 screen heights
          scrub: true,
          pin: true,
        },
      });

      // Animate the frames perfectly in sync with the text timeline
      tl.to({ frame: 0 }, {
        frame: FRAME_COUNT - 1,
        ease: 'none',
        duration: 5, // We just give the timeline an arbitrary duration length (5 units) to distribute things
        onUpdate: function() {
          frameSequenceRef.current?.setFrame(this.targets()[0].frame);
        }
      }, 0);

      // Text animations spaced across the 5 unit duration
      tl.to(text1Ref.current, { opacity: 0, y: -50, duration: 1 }, 0)
        .fromTo(text2Ref.current, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1 }, 1.5)
        .to(text2Ref.current, { opacity: 0, y: -50, duration: 1 }, 3)
        .fromTo(text3Ref.current, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1 }, 4);

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="top"
      data-phase="WARM-UP"
      ref={sectionRef}
      className="relative h-[100svh] w-full bg-ink"
    >
      <div ref={containerRef} className="absolute inset-0 h-[100svh] w-full overflow-hidden">
        <div className="absolute inset-0">
          <FrameSequence 
            ref={frameSequenceRef}
            frameCount={FRAME_COUNT} 
            framePath={(i) => `/frames/frame_${i.toString().padStart(4, '0')}.jpg`} 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/70 pointer-events-none" />
          <div className="absolute inset-0 bg-ink/20 pointer-events-none" />
        </div>

        {/* Caption 1 */}
        <div ref={text1Ref} className="absolute inset-0 z-10 flex h-full flex-col items-start justify-end px-6 pb-20 lg:px-12 lg:pb-24">
          <span className="eyebrow mb-6">Strength &middot; Performance &middot; Community</span>
          <div className="overflow-hidden">
            <h1 className="font-display text-[16vw] leading-[0.85] text-bone lg:text-[8.5vw]">TRAIN</h1>
          </div>
          <div className="overflow-hidden">
            <h1 className="font-display text-[16vw] leading-[0.85] text-red lg:text-[8.5vw]">BEYOND LIMITS.</h1>
          </div>
          
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <button
              onClick={() => document.querySelector('#tour')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-bone px-7 py-3.5 font-mono text-xs uppercase tracking-[0.18em] text-ink transition-colors hover:bg-red hover:text-bone"
              data-cursor="START"
            >
              Start Training →
            </button>
            <button
              onClick={() => document.querySelector('#floor')?.scrollIntoView({ behavior: 'smooth' })}
              className="border border-bone/40 px-7 py-3.5 font-mono text-xs uppercase tracking-[0.18em] text-bone transition-colors hover:border-bone"
              data-cursor="VIEW"
            >
              Explore The Gym →
            </button>
          </div>
        </div>

        {/* Caption 2 */}
        <div ref={text2Ref} className="absolute inset-0 z-10 flex h-full flex-col items-center justify-center px-6 text-center opacity-0 pointer-events-none">
          <h2 className="font-display text-[12vw] leading-none text-bone lg:text-[6vw]">FORGE YOUR</h2>
          <h2 className="font-display text-[12vw] leading-none text-red lg:text-[6vw]">LEGACY</h2>
          <p className="mt-6 max-w-md font-mono text-sm uppercase tracking-widest text-mute">
            Elite equipment. Unmatched atmosphere. No excuses.
          </p>
        </div>

        {/* Caption 3 */}
        <div ref={text3Ref} className="absolute inset-0 z-10 flex h-full flex-col items-end justify-end px-6 pb-20 lg:px-12 lg:pb-24 text-right opacity-0 pointer-events-none">
          <h2 className="font-display text-[10vw] leading-none text-bone lg:text-[5vw]">JOIN THE</h2>
          <h2 className="font-display text-[10vw] leading-none text-red lg:text-[5vw]">ELITE</h2>
        </div>
      </div>
    </section>
  );
}
