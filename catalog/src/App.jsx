import { sites } from './content';
import ProjectCard from './components/ProjectCard';

export default function App() {
  const liveCount = sites.filter((s) => s.url).length;

  return (
    <>
      <header className="wrap pt-16 pb-10 md:pt-24 md:pb-14">
        <span className="eyebrow mb-5">Studio site catalog</span>
        <h1 className="display m-0 text-[clamp(34px,6vw,64px)] leading-[1.02] max-w-[16ch]">
          Three car-detailing studios, three design systems.
        </h1>
        <p className="mt-5 mb-0 max-w-[62ch] text-[16px] md:text-[18px] text-[var(--paper-dim)] leading-[1.6]">
          Each site below is its own build — its own palette, its own type
          system, its own signature scroll effect — not a reskin of the
          others. {liveCount} of {sites.length} {liveCount === 1 ? 'is' : 'are'} live right now.
        </p>
      </header>

      <main className="wrap pb-24">
        <div className="grid md:grid-cols-3 gap-6">
          {sites.map((site) => <ProjectCard key={site.id} site={site} />)}
        </div>
      </main>

      <footer className="wrap py-10 border-t border-[var(--line)]">
        <p className="m-0 text-[13px] text-[var(--paper-faint)]">
          Hex values and font stacks are read directly from each project's own
          <code className="mx-1 px-1.5 py-0.5 rounded bg-[var(--panel)] text-[var(--paper-dim)]">src/index.css</code>
          — this page doesn't restyle or approximate them.
        </p>
      </footer>
    </>
  );
}
