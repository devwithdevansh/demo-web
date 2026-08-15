import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function Cursor() {
  const cursorDot = useRef(null);
  const cursorRing = useRef(null);

  useEffect(() => {
    // Only run on non-touch devices
    if (window.matchMedia('(hover: none) or (pointer: coarse)').matches) return;

    let ctx = gsap.context(() => {
      const onMouseMove = (e) => {
        gsap.to(cursorDot.current, {
          x: e.clientX,
          y: e.clientY,
          duration: 0.1,
          ease: 'power2.out',
        });
        gsap.to(cursorRing.current, {
          x: e.clientX,
          y: e.clientY,
          duration: 0.3,
          ease: 'power2.out',
        });
      };

      const onMouseOver = (e) => {
        const target = e.target;
        const cursorData = target.closest('[data-cursor]');
        
        if (cursorData) {
          const text = cursorData.getAttribute('data-cursor');
          cursorRing.current.querySelector('span').innerText = text;
          cursorRing.current.classList.add('on');
        } else if (target.closest('a, button, input, select, textarea, .hotspot')) {
          cursorRing.current.classList.add('hover-basic');
        }
      };

      const onMouseOut = (e) => {
        const target = e.target;
        if (target.closest('[data-cursor]') || target.closest('a, button, input, select, textarea, .hotspot')) {
          cursorRing.current.classList.remove('on', 'hover-basic');
        }
      };

      window.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseover', onMouseOver);
      document.addEventListener('mouseout', onMouseOut);

      return () => {
        window.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseover', onMouseOver);
        document.removeEventListener('mouseout', onMouseOut);
      };
    });

    return () => ctx.revert();
  }, []);

  return (
    <>
      <div
        ref={cursorDot}
        className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full -translate-x-1/2 -translate-y-1/2 mix-blend-difference w-[6px] h-[6px] bg-[var(--paper)] hidden md:block"
      ></div>
      <div
        ref={cursorRing}
        className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full -translate-x-1/2 -translate-y-1/2 mix-blend-difference border border-[var(--paper)] flex items-center justify-center hidden md:flex transition-all duration-250 ease-out
          w-[38px] h-[38px] 
          [&.on]:w-[78px] [&.on]:h-[78px] [&.on]:bg-[var(--paper)] [&.on]:border-[var(--paper)]
          [&.hover-basic]:w-[58px] [&.hover-basic]:h-[58px] [&.hover-basic]:bg-[rgba(237,237,232,0.1)]"
      >
        <span className="font-mono text-[9px] tracking-[.12em] opacity-0 whitespace-nowrap text-[var(--ink)] transition-opacity duration-200 [.on_&]:opacity-100"></span>
      </div>
    </>
  );
}
