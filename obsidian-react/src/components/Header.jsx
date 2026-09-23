import { useEffect, useState } from 'react';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-[500] px-[var(--edge)] flex items-center justify-between transition-all duration-400 ease-[var(--ease-soft)] border-b border-transparent ${
      scrolled ? 'py-[14px] bg-[rgba(10,11,13,0.72)] backdrop-blur-[14px] backdrop-saturate-[140%] !border-[var(--line-soft)]' : 'py-[26px]'
    }`}>
      <a href="#hero" className={`text-[20px] font-semibold tracking-[0.04em] flex items-center gap-[8px] transition-transform duration-400 ease-[var(--ease-soft)] origin-left ${
        scrolled ? 'scale-[0.86]' : ''
      }`}>
        <span className="w-[6px] h-[6px] bg-[var(--brass)] rounded-full"></span>KOHINOOR
      </a>
      
      <nav className="hidden lg:flex gap-[36px] font-mono text-[11px] tracking-[.14em] uppercase">
        {['Work', 'Services', 'Protection', 'Modification', 'Studio', 'Catalog'].map((item) => (
          <a
            key={item}
            href={item === 'Catalog' ? '#/catalog' : `#${item.toLowerCase()}`}
            className="relative pb-[4px] text-[var(--paper-dim)] transition-colors duration-300 hover:text-[var(--paper)] group"
          >
            {item}
            <span className="absolute left-0 right-full bottom-0 h-[1px] bg-[var(--heat-gradient)] transition-all duration-350 ease-[var(--ease-panel)] group-hover:right-0"></span>
          </a>
        ))}
      </nav>
      
      <a href="#booking" className="btn solid" data-cursor="BOOK">
        Book Now
      </a>
    </header>
  );
}
