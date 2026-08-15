import { useEffect, useRef, useState } from 'react';

export default function BeforeAfter() {
  const containerRef = useRef(null);
  const [reveal, setReveal] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const handleMove = (clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    let x = clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setReveal(percent);
  };

  const onPointerMove = (e) => {
    if (isDragging) {
      handleMove(e.clientX || (e.touches && e.touches[0].clientX));
    }
  };

  const onPointerUp = () => setIsDragging(false);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', onPointerMove);
      window.addEventListener('touchmove', onPointerMove);
      window.addEventListener('mouseup', onPointerUp);
      window.addEventListener('touchend', onPointerUp);
    }
    return () => {
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      window.removeEventListener('touchend', onPointerUp);
    };
  }, [isDragging]);

  return (
    <section id="transform" className="h-[220vh] bg-[var(--ink)]">
      <div className="sticky top-0 h-screen flex flex-col pt-[min(14vh,120px)]">
        <div className="px-[var(--edge)] mb-[28px]">
          <div className="eyebrow">Results</div>
          <h2 className="text-[clamp(32px,5vw,64px)] font-semibold uppercase mt-[14px] leading-[1.05]">
            From Ordinary<br />To Obsessed.
          </h2>
        </div>
        
        <div 
          ref={containerRef}
          className="relative flex-1 mx-[var(--edge)] overflow-hidden cursor-ew-resize border border-[var(--line)]"
          onMouseDown={(e) => {
            setIsDragging(true);
            handleMove(e.clientX);
          }}
          onTouchStart={(e) => {
            setIsDragging(true);
            handleMove(e.touches[0].clientX);
          }}
          style={{ '--reveal': `${reveal}%` }}
        >
          {/* Before Image */}
          <img 
            className="absolute inset-0 w-full h-full object-cover saturate-[.35] contrast-[.85] brightness-[.72] blur-[.4px]"
            src="https://images.unsplash.com/photo-1611820972863-59eaff523aba?w=1800&q=80&auto=format&fit=crop" 
            alt="Before paint correction" 
          />
          
          {/* After Image */}
          <div 
            className="absolute inset-0 w-full h-full"
            style={{ clipPath: `inset(0 0 0 ${reveal}%)` }}
          >
            <img 
              src="https://images.unsplash.com/photo-1611820972863-59eaff523aba?w=1800&q=80&auto=format&fit=crop" 
              alt="After paint correction" 
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>

          <div className="absolute top-[24px] left-[24px] font-mono text-[11px] tracking-[.18em] px-[14px] py-[8px] border border-[rgba(237,237,232,.4)] bg-[rgba(10,11,13,.4)] backdrop-blur-[6px]">
            BEFORE
          </div>
          <div className="absolute top-[24px] right-[24px] font-mono text-[11px] tracking-[.18em] px-[14px] py-[8px] border border-[rgba(237,237,232,.4)] bg-[rgba(10,11,13,.4)] backdrop-blur-[6px]">
            AFTER
          </div>

          <div 
            className="absolute top-0 bottom-0 w-[1px] bg-[var(--paper)] -translate-x-[0.5px]"
            style={{ left: `${reveal}%` }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[52px] h-[52px] rounded-full bg-[var(--paper)] flex items-center justify-center gap-[4px] shadow-lg">
              <svg viewBox="0 0 24 24" fill="none" className="w-[12px] h-[12px]">
                <path d="M8 6L2 12L8 18M16 6L22 12L16 18" stroke="#0a0b0d" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
