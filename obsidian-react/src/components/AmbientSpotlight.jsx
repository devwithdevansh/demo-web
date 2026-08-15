import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function AmbientSpotlight() {
  const spotlightRef = useRef(null);

  useEffect(() => {
    // Only run on non-touch devices
    if (window.matchMedia('(hover: none) or (pointer: coarse)').matches) return;

    let ctx = gsap.context(() => {
      const onMouseMove = (e) => {
        // We use innerWidth / innerHeight to calculate percentages if desired,
        // or just absolute px values. Using absolute px is easier.
        gsap.to(spotlightRef.current, {
          x: e.clientX,
          y: e.clientY,
          duration: 1.2,
          ease: 'power3.out',
        });
      };

      window.addEventListener('mousemove', onMouseMove);
      return () => window.removeEventListener('mousemove', onMouseMove);
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden mix-blend-screen hidden md:block">
      <div 
        ref={spotlightRef}
        className="absolute top-0 left-0 w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30"
        style={{
          background: 'radial-gradient(circle, rgba(176,141,87,0.15) 0%, rgba(91,127,176,0.05) 40%, transparent 70%)',
          filter: 'blur(40px)'
        }}
      ></div>
    </div>
  );
}
