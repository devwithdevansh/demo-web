import { useEffect, useState } from 'react';

export default function Preloader() {
  const [isDone, setIsDone] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timeout = setTimeout(() => {
      setIsDone(true);
      setTimeout(() => {
        setIsHidden(true);
      }, 1000);
    }, reduced ? 0 : 900);
    return () => clearTimeout(timeout);
  }, []);

  if (isHidden) return null;

  return (
    <div className={`preloader ${isDone ? 'is-done' : ''}`} aria-hidden="true">
      <div className="preloader-mark">Nuánce</div>
      <div className="preloader-bar"></div>
    </div>
  );
}
