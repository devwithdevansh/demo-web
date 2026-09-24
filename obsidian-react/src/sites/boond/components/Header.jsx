import { useEffect, useState } from 'react';
import { BRAND } from '../content';

const links = [['Services', '#services'], ['Process', '#process'], ['Work', '#work'], ['Visit', '#visit']];

export default function Header() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const target = document.getElementById('services');
    const onScroll = () => setSolid(target ? target.getBoundingClientRect().top <= 90 : window.scrollY > 200);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const tone = solid ? 'bg-[rgba(243,245,246,.86)] text-[#16191c] border-b border-[rgba(22,25,28,.1)]' : 'text-[#f3f5f6] border-b border-transparent';

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 wrap flex items-center justify-between h-[72px] transition-colors duration-300 backdrop-blur-[14px] ${solid ? '' : 'backdrop-blur-none'} ${tone}`}
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)', height: 'calc(72px + env(safe-area-inset-top, 0px))' }}
      >
        <a href="#top" className="wide text-[22px] no-underline">{BRAND}</a>
        <nav className="hidden lg:flex items-center gap-8 text-[15px] font-medium" aria-label="Main">
          {links.map(([l, h]) => <a key={h} href={h} className="no-underline hover:opacity-60 transition-opacity">{l}</a>)}
          <a href="/" className="no-underline hover:opacity-60 transition-opacity">Catalog</a>
          <a href="#book" className={`btn !min-h-[42px] !px-5 ${solid ? '' : 'light'}`}>Book a slot</a>
        </nav>
        <button className="lg:hidden font-medium underline underline-offset-4" onClick={() => setOpen(true)} aria-expanded={open} aria-controls="mnav">Menu</button>
      </header>

      {open && (
        <div id="mnav" className="fixed inset-0 z-[60] bg-[#16191c] text-[#f3f5f6] wrap flex flex-col" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
          <div className="flex justify-between items-center h-[72px]">
            <span className="wide text-[22px]">{BRAND}</span>
            <button onClick={() => setOpen(false)} className="font-medium underline underline-offset-4">Close</button>
          </div>
          <nav className="mt-10 flex flex-col gap-3" aria-label="Mobile">
            {[...links, ['Catalog', '/'], ['Book a slot', '#book']].map(([l, h]) => (
              <a key={h} href={h} onClick={() => setOpen(false)} className="wide d2 no-underline">{l}</a>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
