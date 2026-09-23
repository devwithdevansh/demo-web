import { ArrowUpRight, Circle } from 'lucide-react';

function Swatch({ color }) {
  return (
    <div className="flex flex-col items-center gap-1.5 w-[64px]">
      <div className="swatch w-full h-11" style={{ background: color.hex }} />
      <div className="text-center leading-tight">
        <p className="m-0 text-[11px] font-semibold text-[var(--paper)]">{color.name}</p>
        <p className="m-0 text-[10px] font-mono text-[var(--paper-faint)]">{color.hex}</p>
      </div>
    </div>
  );
}

export default function ProjectCard({ site }) {
  const isLive = !!site.url;
  // The preview panel is built entirely from the project's own tokens --
  // its background colour and its own font rendering its own name -- so the
  // card is an honest taste of the theme, not a screenshot claiming to be one.
  const bg = site.palette[0].hex;
  const accent = site.palette.find((c) => /accent|cta/i.test(c.role)) || site.palette[site.palette.length - 1];
  const textColor = site.palette.find((c) => /text/i.test(c.role))?.hex || '#fff';

  return (
    <article className="card">
      <div
        className="relative h-[220px] flex items-center justify-center px-6 overflow-hidden"
        style={{ background: `radial-gradient(circle at 30% 20%, ${accent.hex}33, transparent 60%), ${bg}` }}
      >
        <span
          className="text-center leading-[0.95] select-none"
          style={{
            fontFamily: site.fonts[0].family,
            fontWeight: site.fonts[0].weight,
            fontSize: 'clamp(30px, 5.5vw, 46px)',
            color: textColor,
          }}
        >
          {site.name}
        </span>
        <span
          className="absolute top-4 left-4 font-mono text-[10px] uppercase tracking-[.14em] px-2.5 py-1 rounded-full border"
          style={{ color: textColor, borderColor: `${textColor}33`, opacity: .7 }}
        >
          Palette preview
        </span>
        <span className={`absolute top-4 right-4 status-pill ${isLive ? 'status-live' : 'status-local'}`}>
          <Circle className="status-dot" size={6} fill="currentColor" />
          {isLive ? 'Live' : 'Local build'}
        </span>
      </div>

      <div className="p-6 flex flex-col gap-5 flex-1">
        <div>
          <h3 className="display m-0 text-[22px]">{site.name}</h3>
          <p className="m-0 mt-1 text-[14px] text-[var(--paper-dim)]">{site.tagline}</p>
        </div>

        <p className="m-0 text-[14px] leading-[1.6] text-[var(--paper-dim)]">{site.theme}</p>

        <div>
          <p className="eyebrow mb-3">Palette</p>
          <div className="flex flex-wrap gap-3">
            {site.palette.map((c) => <Swatch key={c.hex} color={c} />)}
          </div>
        </div>

        <div>
          <p className="eyebrow mb-3">Type</p>
          <div className="flex flex-col gap-2.5">
            {site.fonts.map((f) => (
              <div key={f.sample} className="flex items-baseline justify-between gap-4">
                <span style={{ fontFamily: f.family, fontWeight: f.weight }} className="text-[20px]">{f.sample}</span>
                <span className="text-[11px] text-[var(--paper-faint)] shrink-0">{f.role}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="hairline" />

        <div className="flex flex-wrap gap-2">
          {site.stack.map((s) => <span key={s} className="chip">{s}</span>)}
        </div>

        <div className="mt-auto pt-1">
          {isLive ? (
            <a href={site.url} target="_blank" rel="noreferrer" className="btn w-full">
              Visit live site <ArrowUpRight size={16} />
            </a>
          ) : (
            <div className="btn w-full" aria-disabled="true">Not deployed yet</div>
          )}
        </div>
      </div>
    </article>
  );
}
