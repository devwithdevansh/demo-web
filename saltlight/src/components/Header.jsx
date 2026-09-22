import { useEffect, useState } from 'react';

// The clock in the corner reads the page like a day: top is dawn, bottom is midnight.
function timeFromScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
  const mins = Math.round(5.5 * 60 + p * 18 * 60); // 05:30 → 23:30
  const h = String(Math.floor(mins / 60)).padStart(2, '0');
  const m = String(mins % 60).padStart(2, '0');
  return `${h}:${m}`;
}

export default function Header() {
  const [time, setTime] = useState('05:30');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setTime(timeFromScroll()));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, []);

  const links = [['The day', '#day'], ['Stay', '#stay'], ['Map', '#map'], ['Book', '#book']];

  return (
    <>
    <header
      className="fixed inset-x-0 top-0 z-50 wrap flex items-center justify-between text-[#e9ecea] mix-blend-difference"
      style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 20px)' }}
    >
      <a href="#top" className="serif text-[26px] no-underline">Saltlight</a>

      <nav className="hidden md:flex items-center gap-9 text-[15px]" aria-label="Main">
        {links.map(([l, h]) => <a key={h} href={h} className="no-underline hover:opacity-60 transition-opacity">{l}</a>)}
        <span className="tabular-nums w-[52px] text-right" aria-label="Time on the Rann">{time}</span>
      </nav>

      <button className="md:hidden flex items-center gap-3 text-[15px]" onClick={() => setOpen(true)} aria-expanded={open} aria-controls="mnav">
        <span className="tabular-nums">{time}</span>
        <span className="underline underline-offset-4">Menu</span>
      </button>
    </header>

      {open && (
        <div id="mnav" className="fixed inset-0 z-50 bg-[#e9ecea] text-[#1b2244] wrap flex flex-col" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 20px)' }}>
          <div className="flex justify-between items-center">
            <span className="serif text-[26px]">Saltlight</span>
            <button onClick={() => setOpen(false)} className="underline underline-offset-4 text-[15px]">Close</button>
          </div>
          <nav className="mt-16 flex flex-col gap-4" aria-label="Mobile">
            {links.map(([l, h]) => (
              <a key={h} href={h} onClick={() => setOpen(false)} className="serif d2 no-underline">{l}</a>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
