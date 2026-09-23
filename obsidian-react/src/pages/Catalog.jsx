import { useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { catalogSites } from '../data/catalogSites';
import CatalogCard from '../components/CatalogCard';
import ThemeLab from '../components/ThemeLab';
import PitchCTA from '../components/PitchCTA';
import dwdLogo from '../assets/dwd-logo.png';
import './catalog.css';

const STATS = [
  { num: '03', label: 'Live design systems, one deployment' },
  { num: '100%', label: 'Custom-built — zero reskinned templates' },
  { num: '08+6', label: 'Palettes and type pairings to try in the lab below' },
];

// The front door of the whole portfolio -- palette, type and theme for
// every studio site, one click away from here (see App.jsx: no hash, or
// any unrecognised hash, lands on this page). No server-side rewrite rule
// needed on whatever static host serves this site, since it's all just
// window.location.hash. Built to be walked through on a tablet in person,
// so layout, grids and touch targets below are tuned for that width range
// specifically, not just squeezed mobile.
export default function Catalog() {
  const [theme, setTheme] = useState('dark');
  const navigate = (route) => { window.location.hash = `#/${route}`; };

  return (
    <div className="catalog-page min-h-screen bg-[var(--ink)] text-[var(--paper)] transition-colors duration-300" data-theme={theme}>
      <header className="px-[var(--edge)] py-[26px] flex items-center justify-between gap-[16px] border-b border-[var(--line-soft)]">
        <a href="#/kohinoor" className="text-[20px] font-semibold tracking-[0.04em] flex items-center gap-[8px] shrink-0">
          <span className="w-[6px] h-[6px] bg-[var(--brass)] rounded-full" />KOHINOOR
        </a>
        <div className="theme-toggle" role="radiogroup" aria-label="Catalog page theme">
          <button type="button" role="radio" aria-pressed={theme === 'dark'} onClick={() => setTheme('dark')}>
            <Moon size={12} /> Dark
          </button>
          <button type="button" role="radio" aria-pressed={theme === 'light'} onClick={() => setTheme('light')}>
            <Sun size={12} /> Light
          </button>
        </div>
      </header>

      <main className="px-[var(--edge)]">
        <div className="max-w-[var(--container)] mx-auto">
          <section className="pt-[clamp(40px,7vw,72px)] pb-[clamp(32px,5vw,48px)]">
            <div className="dwd-badge">
              <img src={dwdLogo} alt="DWD" className="dwd-badge-logo" />
              <div className="dwd-badge-text">
                <span className="dwd-badge-eyebrow">Crafted by</span>
                <span className="dwd-badge-name">DWD Studio</span>
              </div>
            </div>

            <p className="eyebrow mb-[18px]">Studio site catalog</p>
            <h1 className="text-[clamp(32px,5vw,58px)] leading-[1.03] font-semibold max-w-[18ch] m-0">
              Three car-detailing studios, three design systems.
            </h1>
            <p className="mt-[20px] mb-0 max-w-[62ch] text-[15px] md:text-[17px] text-[var(--paper-dim)] leading-[1.6]">
              Every site in this portfolio is its own build — its own palette, its own type
              system, its own signature scroll effect — not a reskin of the others. All
              {' '}{catalogSites.length} live in this one deployment. Click any swatch to copy its hex.
            </p>

            <div className="stat-strip">
              {STATS.map((s) => (
                <div key={s.label} className="stat-item">
                  <span className="stat-num">{s.num}</span>
                  <span className="stat-label">{s.label}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="pb-[clamp(64px,10vw,110px)] grid sm:grid-cols-2 xl:grid-cols-3 gap-[24px]">
            {catalogSites.map((site) => (
              <CatalogCard key={site.id} site={site} onNavigate={navigate} />
            ))}
          </section>

          <div className="hairline mb-[clamp(48px,8vw,80px)]" />

          <ThemeLab />

          <div className="hairline mb-[clamp(48px,8vw,80px)]" />

          <PitchCTA />
        </div>
      </main>

      <footer className="px-[var(--edge)] py-[28px] border-t border-[var(--line)]">
        <p className="max-w-[var(--container)] mx-auto m-0 text-[13px] text-[var(--paper-faint)]">
          Hex values and font stacks are read directly from each project's own <code className="font-mono px-[6px] py-[2px] rounded bg-[var(--graphite)] text-[var(--paper-dim)]">src/index.css</code> — this page doesn't restyle or approximate them.
        </p>
      </footer>
    </div>
  );
}
