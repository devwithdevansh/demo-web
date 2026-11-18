import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PACKAGES } from '@/config/forge';
import type { PackageKey } from '@/config/forge';

export function ForgeMark({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-display tracking-wider text-bone ${className}`}>
      <svg viewBox="0 0 32 32" className="h-[0.8em] w-[0.8em]" aria-hidden>
        <path d="M4 12h4v8H4zM24 12h4v8h-4zM9 14.5h14v3H9z" fill="var(--color-red)" />
      </svg>
      FORGE
    </span>
  );
}

/**
 * The strip that sits above every demo. It belongs to FORGE, not to the
 * sample gym: it says which demo is open, that the content is sample content,
 * and gives a way back to the homepage and across to the other packages.
 */
export function DemoBar({ current, note = 'Sample gym, sample data' }: { current: PackageKey; note?: string }) {
  const navigate = useNavigate();
  const pkg = PACKAGES.find((p) => p.key === current)!;

  return (
    <div className="relative z-[60] border-b border-line bg-ink">
      <div className="mx-auto flex h-11 max-w-[1440px] items-center justify-between gap-3 px-4 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Link to="/" className="flex shrink-0 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-bone-dim transition-colors hover:text-bone" aria-label="Back to the FORGE homepage">
            <ArrowLeft size={14} aria-hidden />
            <ForgeMark className="text-base" />
          </Link>
          <span className="hidden h-4 w-px bg-line sm:block" aria-hidden />
          <p className="truncate font-mono text-[10px] uppercase tracking-[0.16em] text-mute">
            <span className="text-bone">{pkg.name} demo</span>
            <span className="hidden md:inline"> · {note}</span>
          </p>
        </div>

        <nav aria-label="Switch demo" className="hidden items-center gap-1 md:flex">
          {PACKAGES.map((p) => (
            <Link
              key={p.key}
              to={p.route}
              aria-current={p.key === current ? 'page' : undefined}
              className={`px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors ${
                p.key === current ? 'bg-bone text-ink' : 'text-bone-dim hover:text-bone'
              }`}
            >
              {p.name}
            </Link>
          ))}
        </nav>

        <label className="md:hidden">
          <span className="sr-only">Switch demo</span>
          <select
            value={current}
            onChange={(e) => navigate(PACKAGES.find((p) => p.key === e.target.value)!.route)}
            className="border border-line bg-ink px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-bone"
          >
            {PACKAGES.map((p) => (
              <option key={p.key} value={p.key}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
