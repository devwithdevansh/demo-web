import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { sampleGym } from '@/config/sampleGym';

const LINKS = [
  { label: 'About', href: '#about' },
  { label: 'Membership', href: '#membership' },
  { label: 'Trainers', href: '#trainers' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Classes', href: '#classes' },
  { label: 'Visit', href: '#visit' },
];

/** The sample gym's own navigation. It sits just below the FORGE demo bar. */
export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (href: string) => {
    setOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header
      className={`fixed inset-x-0 top-11 z-50 transition-colors duration-500 ${
        scrolled || open ? 'bg-ink/90 backdrop-blur-md border-b border-line' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-4 lg:px-12">
        <a href="#top" onClick={(e) => { e.preventDefault(); scrollTo('#top'); }} className="font-display text-2xl tracking-wider text-bone" data-cursor="HOME">
          {sampleGym.wordmark}
        </a>

        <nav aria-label="Sample gym sections" className="hidden items-center gap-8 lg:flex">
          {LINKS.map((l) => (
            <button
              key={l.href}
              onClick={() => scrollTo(l.href)}
              className="font-mono text-[11px] uppercase tracking-[0.18em] text-bone-dim transition-colors hover:text-bone"
              data-cursor="VIEW"
            >
              {l.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button
            onClick={() => scrollTo('#enquire')}
            className="hidden font-mono text-[11px] uppercase tracking-[0.18em] text-ink bg-bone px-5 py-2.5 transition-colors hover:bg-red hover:text-bone lg:block"
            data-cursor="START"
          >
            Enquire Now
          </button>
          <button
            className="lg:hidden text-bone"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            aria-label="Sample gym sections"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden bg-ink border-t border-line lg:hidden"
          >
            <div className="flex flex-col gap-1 px-6 py-4">
              {LINKS.map((l) => (
                <button
                  key={l.href}
                  onClick={() => scrollTo(l.href)}
                  className="py-3 text-left font-display text-2xl tracking-wide text-bone"
                >
                  {l.label}
                </button>
              ))}
              <button
                onClick={() => scrollTo('#enquire')}
                className="mt-3 bg-bone px-5 py-3 text-center font-mono text-xs uppercase tracking-[0.18em] text-ink"
              >
                Enquire Now
              </button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
