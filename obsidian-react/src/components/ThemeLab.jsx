import { useMemo, useState } from 'react';
import { Copy, Check } from 'lucide-react';

// Eight starting palettes, each pulled toward a different Indian automotive
// mood -- not just "dark" and "light" again, since those two already exist
// on Kohinoor and Kavach. Picking one just fills the three colour fields
// below, so it's a starting point, not a locked-in choice.
const PALETTES = [
  { name: 'Kohinoor Noir', bg: '#0a0b0d', text: '#edede8', accent: '#b08d57' },
  { name: 'Boond Foam', bg: '#f3f5f6', text: '#16191c', accent: '#3fa9d9' },
  { name: 'Kavach Amber', bg: '#08090a', text: '#f4f1ea', accent: '#e8a05a' },
  { name: 'Monsoon Teal', bg: '#0b1615', text: '#eef7f5', accent: '#3fbf9f' },
  { name: 'Marigold', bg: '#fdf6ec', text: '#231a0f', accent: '#e08a1e' },
  { name: 'Sindoor Red', bg: '#120809', text: '#f6ece7', accent: '#d1483a' },
  { name: 'Rajwada Purple', bg: '#f7f2fa', text: '#241a2e', accent: '#7c4fae' },
  { name: 'Desert Sand', bg: '#f4ead9', text: '#2c2015', accent: '#b5772f' },
];

// Six display/body pairings, none of them the fonts any of the three sites
// already use -- these are genuinely new options to browse, not a repeat
// of Kohinoor/Boond/Kavach's own type systems.
const TYPE_PAIRS = [
  { name: 'Heritage', display: "'Playfair Display', serif", displayW: 700, body: "'Inter', sans-serif", bodyW: 400 },
  { name: 'Friendly', display: "'Poppins', sans-serif", displayW: 600, body: "'Karla', sans-serif", bodyW: 400 },
  { name: 'Boutique', display: "'DM Serif Display', serif", displayW: 400, body: "'DM Sans', sans-serif", bodyW: 400 },
  { name: 'Motorsport', display: "'Oswald', sans-serif", displayW: 600, body: "'Source Sans 3', sans-serif", bodyW: 400 },
  { name: 'Artisan', display: "'Fraunces', serif", displayW: 600, body: "'Work Sans', sans-serif", bodyW: 400 },
  { name: 'Racing', display: "'Bebas Neue', sans-serif", displayW: 400, body: "'Manrope', sans-serif", bodyW: 500 },
];

export default function ThemeLab() {
  const [bg, setBg] = useState(PALETTES[0].bg);
  const [text, setText] = useState(PALETTES[0].text);
  const [accent, setAccent] = useState(PALETTES[0].accent);
  const [paletteName, setPaletteName] = useState(PALETTES[0].name);
  const [type, setType] = useState(TYPE_PAIRS[0]);
  const [copied, setCopied] = useState(false);

  const applyPalette = (p) => {
    setBg(p.bg); setText(p.text); setAccent(p.accent); setPaletteName(p.name);
  };

  const css = useMemo(() => `:root {
  --bg: ${bg};
  --text: ${text};
  --accent: ${accent};
  --font-display: ${type.display};
  --font-body: ${type.body};
}`, [bg, text, accent, type]);

  const copyCss = async () => {
    try { await navigator.clipboard.writeText(css); } catch { /* fallback: it's printed below regardless */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <section className="pb-[clamp(64px,10vw,110px)]">
      <div className="flex flex-wrap items-end justify-between gap-[24px] mb-[32px]">
        <div>
          <p className="eyebrow mb-[14px]">Design lab</p>
          <h2 className="text-[clamp(28px,4vw,44px)] leading-[1.05] font-semibold max-w-[20ch] m-0">
            Build a theme for your own studio site
          </h2>
          <p className="mt-[14px] mb-0 max-w-[60ch] text-[14px] md:text-[15px] text-[var(--paper-dim)] leading-[1.6]">
            Start from a palette, or pick your own three colours. Pair it with a typeface. Copy the result out as CSS.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_1.1fr] gap-[32px] items-start">
        {/* Live preview -- reflects whatever is currently selected below */}
        <div className="lg:sticky lg:top-[100px]">
          <div className="lab-preview" style={{ background: bg, color: text }}>
            <span
              className="inline-flex items-center gap-[8px] font-mono text-[10px] uppercase tracking-[.18em] px-[12px] py-[6px] rounded-full border"
              style={{ borderColor: `${accent}55`, color: accent }}
            >
              {paletteName}
            </span>
            <h3 className="mt-[22px] mb-0 leading-[1.02]" style={{ fontFamily: type.display, fontWeight: type.displayW, fontSize: 'clamp(28px,3.6vw,42px)' }}>
              Your Studio Name
            </h3>
            <p className="mt-[14px] mb-0 max-w-[38ch] opacity-80" style={{ fontFamily: type.body, fontWeight: type.bodyW, fontSize: '15px', lineHeight: 1.6 }}>
              A one-line pitch for what makes the studio worth the drive across town, set in the body face you picked below.
            </p>
            <button
              type="button"
              className="mt-[24px] inline-flex items-center gap-[8px] px-[22px] py-[13px] rounded-full font-semibold text-[14px] cursor-default"
              style={{ background: accent, color: bg }}
            >
              Book a slot
            </button>
          </div>

          <div className="mt-[16px] relative">
            <pre className="m-0 p-[16px] rounded-[14px] bg-[var(--graphite)] border border-[var(--line)] font-mono text-[12px] leading-[1.6] text-[var(--paper-dim)] overflow-x-auto whitespace-pre">{css}</pre>
            <button
              type="button"
              onClick={copyCss}
              className="absolute top-[10px] right-[10px] inline-flex items-center gap-[6px] font-mono text-[10px] uppercase tracking-[.1em] px-[10px] py-[6px] rounded-full bg-[var(--ink)] border border-[var(--line)] text-[var(--paper-dim)] hover:text-[var(--paper)] transition-colors"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copied' : 'Copy CSS'}
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-[28px]">
          <div>
            <p className="eyebrow mb-[14px]">Palettes</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-[10px]">
              {PALETTES.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  className="lab-option"
                  aria-pressed={paletteName === p.name}
                  onClick={() => applyPalette(p)}
                >
                  <span className="lab-swatch-trio mb-[8px]">
                    <span style={{ background: p.bg }} />
                    <span style={{ background: p.accent }} />
                    <span style={{ background: p.text }} />
                  </span>
                  <span className="block text-[12px] font-semibold text-[var(--paper)]">{p.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="eyebrow mb-[14px]">Or make your own</p>
            <div className="flex flex-wrap gap-[24px]">
              <label className="lab-color-field">
                <input type="color" value={bg} onChange={(e) => { setBg(e.target.value); setPaletteName('Custom'); }} aria-label="Background colour" />
                <span className="text-[11px] font-mono text-[var(--paper-faint)]">Background</span>
              </label>
              <label className="lab-color-field">
                <input type="color" value={text} onChange={(e) => { setText(e.target.value); setPaletteName('Custom'); }} aria-label="Text colour" />
                <span className="text-[11px] font-mono text-[var(--paper-faint)]">Text</span>
              </label>
              <label className="lab-color-field">
                <input type="color" value={accent} onChange={(e) => { setAccent(e.target.value); setPaletteName('Custom'); }} aria-label="Accent colour" />
                <span className="text-[11px] font-mono text-[var(--paper-faint)]">Accent</span>
              </label>
            </div>
          </div>

          <div>
            <p className="eyebrow mb-[14px]">Typography</p>
            <div className="grid sm:grid-cols-2 gap-[10px]">
              {TYPE_PAIRS.map((t) => (
                <button
                  key={t.name}
                  type="button"
                  className="lab-option"
                  aria-pressed={type.name === t.name}
                  onClick={() => setType(t)}
                >
                  <span className="block leading-none text-[26px] text-[var(--paper)]" style={{ fontFamily: t.display, fontWeight: t.displayW }}>Aa</span>
                  <span className="block mt-[8px] text-[12px] font-semibold text-[var(--paper)]">{t.name}</span>
                  <span className="block mt-[2px] text-[11px] text-[var(--paper-faint)]" style={{ fontFamily: t.body, fontWeight: t.bodyW }}>
                    {t.display.split(',')[0].replace(/'/g, '')} + {t.body.split(',')[0].replace(/'/g, '')}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
