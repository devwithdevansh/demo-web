import { useEffect, useRef } from 'react';
import useScrollReveal from '../hooks/useScrollReveal';

export default function Transformation() {
  const wrapRef = useRef(null);
  const afterRef = useRef(null);
  const handleRef = useRef(null);
  
  useScrollReveal();

  useEffect(() => {
    const wrap = wrapRef.current;
    const after = afterRef.current;
    const handle = handleRef.current;
    if (!wrap || !after || !handle) return;
    
    let dragging = false;

    const setPos = (clientX) => {
      const r = wrap.getBoundingClientRect();
      const pct = Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100));
      after.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
      handle.style.left = `${pct}%`;
    };

    setPos(wrap.getBoundingClientRect().left + wrap.getBoundingClientRect().width / 2);

    const down = () => { 
      dragging = true; 
      window.dispatchEvent(new CustomEvent('updateCursor', { detail: { drag: true } }));
    };
    const up = () => { 
      dragging = false; 
      window.dispatchEvent(new CustomEvent('updateCursor', { detail: { drag: false } }));
    };
    const move = (e) => {
      if (!dragging) return;
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      setPos(x);
    };

    handle.addEventListener("mousedown", down);
    handle.addEventListener("touchstart", down, { passive: true });
    wrap.addEventListener("mousedown", (e) => { down(); setPos(e.clientX); });
    
    window.addEventListener("mouseup", up);
    window.addEventListener("touchend", up);
    window.addEventListener("mousemove", move);
    window.addEventListener("touchmove", move, { passive: true });

    return () => {
      handle.removeEventListener("mousedown", down);
      handle.removeEventListener("touchstart", down);
      wrap.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchend", up);
      window.removeEventListener("mousemove", move);
      window.removeEventListener("touchmove", move);
    };
  }, []);

  const updateCursor = (text, drag) => {
    window.dispatchEvent(new CustomEvent('updateCursor', { detail: { text, drag } }));
  };

  return (
    <section className="section" id="transform">
      <div className="container-custom">
        <div className="transform-wrap rv">
          <div className="eyebrow" style={{ justifyContent: 'center' }}>The Transformation</div>
          <h2 className="display-lg" style={{ marginTop: '20px' }}>A great cut doesn't<br/>change who you are.</h2>
          <p className="body-lg" style={{ marginTop: '16px' }}>It reveals it.</p>
        </div>
        <div className="ba rv" id="baSlider" ref={wrapRef}>
          <div className="ba-after ph ph-after" id="baAfter" ref={afterRef}>
            <img className="ph-img" src="https://images.unsplash.com/photo-1595476108010-b4d1f10d5e43?q=80&w=1200" alt="After" />
            <span className="ba-tag">After</span>
          </div>
          <div className="ba-before ph ph-before" id="baBefore">
            <img className="ph-img" src="https://images.unsplash.com/photo-1595476108010-b4d1f10d5e43?q=80&w=1200&sat=-100" alt="Before" />
            <span className="ba-tag">Before</span>
          </div>
          <div 
            className="ba-handle" 
            id="baHandle" 
            ref={handleRef}
            onMouseEnter={() => updateCursor('Drag', false)}
            onMouseLeave={() => updateCursor('', false)}
          >
            <div className="ba-grip">
              <svg viewBox="0 0 24 24" fill="none"><path d="M9 6L3 12L9 18M15 6L21 12L15 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
