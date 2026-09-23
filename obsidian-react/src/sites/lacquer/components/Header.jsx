import { useEffect, useRef, useState } from 'react';
import { BRAND } from '../content';

const links = [['Services', '#services'], ['Process', '#process'], ['Studios', '#studios'], ['Gallery', '#gallery'], ['Reviews', '#reviews']];

export default function Header() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const barRef = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      setSolid(window.scrollY > 40);
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      if (barRef.current) barRef.current.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <div ref={barRef} className="progress-bar" aria-hidden="true" />
      <header
        className={`fixed inset-x-0 top-0 z-50 wrap flex items-center justify-between transition-colors duration-300 border-b ${solid ? 'bg-[rgba(8,9,10,.78)] backdrop-blur-[14px] border-[var(--line)]' : 'border-transparent'}`}
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)', height: 'calc(72px + env(safe-area-inset-top, 0px))' }}
      >
        <a href="#top" className="display text-[21px] no-underline flex items-center gap-2">
          <span className="text-[var(--lacquer)]">◆</span>{BRAND}
        </a>
        <nav className="hidden md:flex items-center gap-8 text-[14px] font-medium text-[var(--paper-dim)]" aria-label="Main">
          {links.map(([l, h]) => <a key={h} href={h} className="no-underline hover:text-[var(--paper)] transition-colors">{l}</a>)}
          <a href="#/catalog" className="no-underline hover:text-[var(--paper)] transition-colors">Catalog</a>
          <a href="#book" className="btn solid sm">Book a slot</a>
        </nav>
        <button className="md:hidden font-medium underline underline-offset-4" onClick={() => setOpen(true)} aria-expanded={open} aria-controls="mnav">Menu</button>
      </header>

      {open && (
        <div id="mnav" className="fixed inset-0 z-[60] bg-[var(--ink)] text-[var(--paper)] wrap flex flex-col" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
          <div className="flex justify-between items-center h-[72px]">
            <span className="display text-[21px]">{BRAND}</span>
            <button onClick={() => setOpen(false)} className="font-medium underline underline-offset-4">Close</button>
          </div>
          <nav className="mt-10 flex flex-col gap-3" aria-label="Mobile">
            {[...links, ['Catalog', '#/catalog'], ['Book a slot', '#book']].map(([l, h]) => (
              <a key={h} href={h} onClick={() => setOpen(false)} className="display d2 no-underline">{l}</a>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
