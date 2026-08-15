import { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const cursorRef = useRef(null);
  const ringRef = useRef(null);
  const [label, setLabel] = useState("");
  const [isBig, setIsBig] = useState(false);
  const [isDrag, setIsDrag] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const isFinePointer = window.matchMedia("(hover:hover) and (pointer:fine)").matches;
    if (!isFinePointer) return;
    setShow(true);

    let mx = 0, my = 0, rx = 0, ry = 0;
    let animationFrame;

    const handleMouseMove = (e) => {
      mx = e.clientX;
      my = e.clientY;
      if (cursorRef.current) {
        cursorRef.current.style.left = `${mx}px`;
        cursorRef.current.style.top = `${my}px`;
      }
    };

    const loop = () => {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      if (ringRef.current) {
        ringRef.current.style.left = `${rx}px`;
        ringRef.current.style.top = `${ry}px`;
      }
      animationFrame = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", handleMouseMove);
    loop();

    // Listen for custom events to update cursor state from other components
    const handleCursorChange = (e) => {
      const { text, big, drag } = e.detail;
      setLabel(text || "");
      setIsBig(big || false);
      setIsDrag(drag || false);
    };
    
    window.addEventListener('updateCursor', handleCursorChange);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener('updateCursor', handleCursorChange);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  if (!show) return null;

  return (
    <>
      <div ref={cursorRef} className="cursor" aria-hidden="true" style={{ display: 'block' }}></div>
      <div 
        ref={ringRef} 
        className={`cursor-ring ${isBig ? 'is-big' : ''} ${isDrag ? 'is-drag' : ''}`} 
        aria-hidden="true" 
        style={{ display: 'block' }}
      >
        <span className="cursor-label">{label}</span>
      </div>
    </>
  );
}
