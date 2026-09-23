import { catalogSites } from '../data/catalogSites';
import CatalogCard from '../components/CatalogCard';

// A menu of every studio site in the portfolio -- palette, type and theme
// for each, one click from the Obsidian homepage. Lives at the #/catalog
// hash route (see App.jsx) so it needs no server-side rewrite rule to work
// on whatever static host is already serving this site.
export default function Catalog() {
  const goHome = () => { window.location.hash = ''; };
  const liveCount = catalogSites.filter((s) => s.isSelf || s.external).length;

  return (
    <div className="min-h-screen bg-[var(--ink)] text-[var(--paper)]">
      <header className="px-[var(--edge)] py-[26px] flex items-center justify-between border-b border-[var(--line-soft)]">
        <a href="#" onClick={(e) => { e.preventDefault(); goHome(); }} className="text-[20px] font-semibold tracking-[0.04em] flex items-center gap-[8px]">
          <span className="w-[6px] h-[6px] bg-[var(--brass)] rounded-full" />OBSIDIAN
        </a>
        <a href="#" onClick={(e) => { e.preventDefault(); goHome(); }} className="font-mono text-[11px] tracking-[.14em] uppercase text-[var(--paper-dim)] hover:text-[var(--paper)] transition-colors duration-300">
          &larr; Back to site
        </a>
      </header>

      <main className="px-[var(--edge)]">
        <div className="max-w-[var(--container)] mx-auto">
          <section className="pt-[clamp(48px,8vw,84px)] pb-[clamp(32px,5vw,48px)]">
            <p className="eyebrow mb-[18px]">Studio site catalog</p>
            <h1 className="text-[clamp(32px,5vw,58px)] leading-[1.03] font-semibold max-w-[18ch] m-0">
              Three car-detailing studios, three design systems.
            </h1>
            <p className="mt-[20px] mb-0 max-w-[62ch] text-[15px] md:text-[17px] text-[var(--paper-dim)] leading-[1.6]">
              Every site in this portfolio is its own build — its own palette, its own type
              system, its own signature scroll effect — not a reskin of the others.
              {' '}{liveCount} of {catalogSites.length} {liveCount === 1 ? 'is' : 'are'} live right now.
              Click any swatch to copy its hex.
            </p>
          </section>

          <section className="pb-[clamp(64px,10vw,110px)] grid md:grid-cols-3 gap-[24px]">
            {catalogSites.map((site) => (
              <CatalogCard key={site.id} site={site} onBackHome={goHome} />
            ))}
          </section>
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
