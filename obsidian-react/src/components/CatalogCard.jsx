import { useState } from 'react';

function Swatch({ color }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(color.hex);
    } catch {
      // clipboard can be unavailable (older browsers, some embeds) -- the
      // hex is already printed under the swatch, so this is a nicety, not
      // the only way to get it.
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="flex flex-col items-center gap-[6px] w-[62px] cursor-pointer group"
      aria-label={`Copy ${color.name} hex code ${color.hex}`}
    >
      <span
        className="w-full h-[42px] rounded-[10px] border border-[rgba(255,255,255,.1)] transition-transform duration-200 group-hover:scale-[1.06]"
        style={{ background: color.hex }}
      />
      <span className="text-[10.5px] font-semibold text-[var(--paper)] leading-tight text-center">{color.name}</span>
      <span className="font-mono text-[9.5px] text-[var(--paper-faint)]">{copied ? 'Copied' : color.hex}</span>
    </button>
  );
}

export default function CatalogCard({ site }) {
  return (
    <article className="bg-[var(--graphite)] border border-[var(--line)] rounded-[20px] overflow-hidden flex flex-col transition-colors duration-300 hover:border-[var(--line-soft)]">
      <div
        className="relative h-[220px] flex items-center justify-center px-[24px] overflow-hidden"
        style={{ background: `radial-gradient(circle at 30% 20%, ${site.accent}33, transparent 60%), ${site.previewBg}` }}
      >
        <span
          className="absolute top-[16px] left-[16px] font-mono text-[10px] uppercase tracking-[.14em] px-[11px] py-[5px] rounded-full border opacity-80"
          style={{ color: site.textOn, borderColor: `${site.textOn}33` }}
        >
          Palette preview
        </span>
        <span className="absolute top-[16px] right-[16px] inline-flex items-center gap-[6px] font-mono text-[10px] font-bold uppercase tracking-[.05em] px-[11px] py-[5px] rounded-full bg-[rgba(111,227,164,.15)] text-[#6fe3a4]">
          <span className="w-[6px] h-[6px] rounded-full bg-current" />
          Included in this site
        </span>
        <span
          className="text-center leading-[0.95] select-none"
          style={{ fontFamily: site.fonts[0].family, fontWeight: site.fonts[0].weight, fontSize: 'clamp(30px, 3.4vw, 44px)', color: site.textOn }}
        >
          {site.name}
        </span>
      </div>

      <div className="p-[24px] flex flex-col gap-[18px] flex-1">
        <div>
          <h3 className="m-0 text-[21px] font-semibold">{site.name}</h3>
          <p className="m-0 mt-[4px] text-[13.5px] text-[var(--paper-dim)]">{site.tagline}</p>
        </div>

        <p className="m-0 text-[13.5px] leading-[1.6] text-[var(--paper-dim)]">{site.theme}</p>

        <div>
          <p className="eyebrow mb-[12px]">Palette</p>
          <div className="flex flex-wrap gap-[12px]">
            {site.palette.map((c) => <Swatch key={c.hex} color={c} />)}
          </div>
        </div>

        <div>
          <p className="eyebrow mb-[12px]">Type</p>
          <div className="flex flex-col gap-[10px]">
            {site.fonts.map((f) => (
              <div key={f.sample} className="flex items-baseline justify-between gap-[12px]">
                <span style={{ fontFamily: f.family, fontWeight: f.weight }} className="text-[20px]">{f.sample}</span>
                <span className="font-mono text-[10px] text-[var(--paper-faint)] shrink-0">{f.role}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="hairline" />

        <div className="flex flex-wrap gap-[8px]">
          {site.stack.map((s) => (
            <span key={s} className="font-mono text-[11px] px-[11px] py-[5px] rounded-full border border-[var(--line)] text-[var(--paper-dim)]">{s}</span>
          ))}
        </div>

        <div className="mt-auto pt-[2px]">
          <a href={`/${site.route}`} className="btn solid w-full justify-center">
            Open {site.name} &rarr;
          </a>
        </div>
      </div>
    </article>
  );
}
