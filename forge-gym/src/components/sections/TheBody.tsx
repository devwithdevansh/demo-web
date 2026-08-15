import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Img } from '@/components/ui/Img';
import { images } from '@/lib/images';
import { Reveal } from '@/components/ui/Reveal';

gsap.registerPlugin(ScrollTrigger);

const WORDS = ["THE BODY", "POWER", "CONTROL", "ENDURANCE", "LIMITLESS"];

export function TheBody() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Refs for images and words
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const wordRefs = useRef<(HTMLHeadingElement | null)[]>([]);

  useEffect(() => {
    if (!sectionRef.current || !containerRef.current) return;
    
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=400%', // Pin for 4 screen heights to crossfade 5 images
          scrub: true,
          pin: true,
        },
      });

      // Initially, image 0 is visible (opacity 1). Images 1-4 are opacity 0.
      // Word 0 is visible. Words 1-4 are hidden (opacity 0, y 50).
      
      for (let i = 1; i < images.theBody.length; i++) {
        // Crossfade image i over the previous one
        tl.to(imageRefs.current[i], { opacity: 1, duration: 1 }, (i - 1) * 2);
        
        // Hide previous word
        tl.to(wordRefs.current[i - 1], { opacity: 0, y: -50, duration: 0.5 }, (i - 1) * 2);
        
        // Show current word
        tl.fromTo(
          wordRefs.current[i], 
          { opacity: 0, y: 50 }, 
          { opacity: 1, y: 0, duration: 0.5 }, 
          (i - 1) * 2 + 0.5
        );
      }

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="the-body"
      data-phase="PUSH"
      ref={sectionRef}
      className="relative h-[100svh] w-full bg-ink"
    >
      <div ref={containerRef} className="absolute inset-0 h-[100svh] w-full overflow-hidden">
        
        {/* Background Images */}
        <div className="absolute inset-0 bg-ink">
          {images.theBody.map((src, index) => (
            <div 
              key={index} 
              className="absolute inset-0"
              style={{ opacity: index === 0 ? 1 : 0 }}
              ref={(el) => (imageRefs.current[index] = el)}
            >
              <Img 
                src={src} 
                alt={`Transformation phase ${index + 1}`} 
                className="h-full w-full object-cover opacity-60 mix-blend-luminosity" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent pointer-events-none" />
            </div>
          ))}
        </div>

        {/* Foreground Content */}
        <div className="absolute inset-0 z-10 flex h-full flex-col items-center justify-center px-6">
          <div className="absolute top-12 md:top-24 left-6 md:left-12">
            <Reveal>
              <p className="font-mono text-xs uppercase tracking-widest text-mute">02 / THE BODY</p>
            </Reveal>
          </div>

          <div className="relative h-[20vh] w-full flex items-center justify-center">
            {WORDS.map((word, index) => (
              <h2
                key={index}
                ref={(el) => (wordRefs.current[index] = el)}
                className="absolute font-display text-[15vw] leading-none text-bone lg:text-[10vw]"
                style={{ 
                  opacity: index === 0 ? 1 : 0,
                  transform: index === 0 ? 'translateY(0)' : 'translateY(50px)' 
                }}
              >
                {word}
              </h2>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
