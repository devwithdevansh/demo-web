import React, { useEffect, useMemo, useState } from 'react';

interface TypePair {
  name: string;
  display: string;
  displayW: number;
  body: string;
  bodyW: number;
}

interface Palette {
  name: string;
  bg: string;
  text: string;
  accent: string;
  panel: string;
  muted: string;
}

const TYPE_PAIRS: TypePair[] = [
  { name: 'Space Tech', display: "'Space Grotesk', sans-serif", displayW: 600, body: "'IBM Plex Mono', monospace", bodyW: 500 },
  { name: 'Athletic Impact', display: "'Bebas Neue', sans-serif", displayW: 400, body: "'Inter', sans-serif", bodyW: 400 },
  { name: 'Variable Heavy', display: "'Archivo', sans-serif", displayW: 800, body: "'Archivo', sans-serif", bodyW: 400 },
  { name: 'Modern Punch', display: "'Bricolage Grotesque', sans-serif", displayW: 700, body: "'Inter', sans-serif", bodyW: 400 },
  { name: 'Heritage', display: "'Playfair Display', serif", displayW: 700, body: "'Inter', sans-serif", bodyW: 400 },
  { name: 'Friendly', display: "'Poppins', sans-serif", displayW: 600, body: "'Karla', sans-serif", bodyW: 400 },
  { name: 'Boutique', display: "'DM Serif Display', serif", displayW: 400, body: "'DM Sans', sans-serif", bodyW: 400 },
  { name: 'Motorsport', display: "'Oswald', sans-serif", displayW: 600, body: "'Source Sans 3', sans-serif", bodyW: 400 },
  { name: 'Artisan', display: "'Fraunces', serif", displayW: 600, body: "'Work Sans', sans-serif", bodyW: 400 },
  { name: 'Clean Minimal', display: "'Plus Jakarta Sans', sans-serif", displayW: 700, body: "'Inter', sans-serif", bodyW: 400 },
  { name: 'Bold Grotesk', display: "'Syne', sans-serif", displayW: 700, body: "'DM Sans', sans-serif", bodyW: 400 },
  { name: 'High Luxury', display: "'Cinzel', serif", displayW: 700, body: "'Cormorant Garamond', serif", bodyW: 400 },
];

const POPULAR_FONTS: string[] = [
  'Bebas Neue', 'Archivo', 'Inter', 'Space Grotesk', 'IBM Plex Mono',
  'Bricolage Grotesque', 'Playfair Display', 'Poppins', 'Karla', 'DM Serif Display',
  'DM Sans', 'Oswald', 'Source Sans 3', 'Fraunces', 'Work Sans', 'Manrope',
  'Plus Jakarta Sans', 'Syne', 'Montserrat', 'Cinzel', 'JetBrains Mono', 'Outfit'
];

const PALETTES: Palette[] = [
  { name: 'Forge Crimson', bg: '#0a0a0a', text: '#f1efe8', accent: '#ff2e2e', panel: '#1c1c1a', muted: '#85837c' },
  { name: 'Kohinoor Noir', bg: '#0a0b0d', text: '#edede8', accent: '#b08d57', panel: '#16181d', muted: '#a8a9a4' },
  { name: 'Boond Foam', bg: '#f3f5f6', text: '#16191c', accent: '#3fa9d9', panel: '#ffffff', muted: '#6e7379' },
  { name: 'Kavach Amber', bg: '#08090a', text: '#f4f1ea', accent: '#e8a05a', panel: '#16181b', muted: '#a9a69d' },
  { name: 'Amber Ash', bg: '#17130f', text: '#efe8db', accent: '#e1521e', panel: '#2a2320', muted: '#b9ab93' },
  { name: 'Monsoon Teal', bg: '#0b1615', text: '#eef7f5', accent: '#3fbf9f', panel: '#122422', muted: '#7ea89f' },
  { name: 'Marigold Warm', bg: '#fdf6ec', text: '#231a0f', accent: '#e08a1e', panel: '#ffffff', muted: '#7d6953' },
  { name: 'Sindoor Red', bg: '#120809', text: '#f6ece7', accent: '#d1483a', panel: '#221214', muted: '#9a7873' },
  { name: 'Rajwada Purple', bg: '#f7f2fa', text: '#241a2e', accent: '#7c4fae', panel: '#ffffff', muted: '#806c90' },
  { name: 'Desert Sand', bg: '#f4ead9', text: '#2c2015', accent: '#b5772f', panel: '#e8dcbe', muted: '#7d6d58' },
  { name: 'Saltlight Indigo', bg: '#e9ecea', text: '#1b2244', accent: '#a2352a', panel: '#ffffff', muted: '#6f7894' },
  { name: 'Nuance Brass', bg: '#0c0b0a', text: '#f4efe6', accent: '#a9895a', panel: '#151310', muted: '#b9ab93' },
];

const STORAGE_KEY = '__dev_theme_modifier_state__';

function loadGoogleFont(fontFamily: string) {
  if (typeof document === 'undefined') return;
  const cleanName = fontFamily.replace(/['"]/g, '').split(',')[0].trim();
  const systemFonts = ['system-ui', '-apple-system', 'sans-serif', 'serif', 'monospace', 'Arial', 'Helvetica', 'Georgia', 'Times New Roman'];
  if (!cleanName || systemFonts.includes(cleanName)) return;

  const id = `google-font-${cleanName.replace(/\s+/g, '-').toLowerCase()}`;
  if (document.getElementById(id)) return;

  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(cleanName)}:wght@300;400;500;600;700;800;900&display=swap`;
  document.head.appendChild(link);
}

export default function DevThemeModifier() {
  const isDev = Boolean(
    (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV) ||
    (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development')
  );

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'type' | 'colors' | 'export'>('type');
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [copiedCss, setCopiedCss] = useState(false);

  // Theme state
  const [paletteName, setPaletteName] = useState('Custom');
  const [bg, setBg] = useState('#0a0a0a');
  const [text, setText] = useState('#f1efe8');
  const [accent, setAccent] = useState('#ff2e2e');
  const [panel, setPanel] = useState('#1c1c1a');
  const [muted, setMuted] = useState('#85837c');

  // Typography state
  const [typeName, setTypeName] = useState('Custom');
  const [displayFont, setDisplayFont] = useState("'Bebas Neue', sans-serif");
  const [displayW, setDisplayW] = useState(400);
  const [bodyFont, setBodyFont] = useState("'Inter', sans-serif");
  const [bodyW, setBodyW] = useState(400);
  const [letterSpacing, setLetterSpacing] = useState('0em');
  const [isCustomFont, setIsCustomFont] = useState(false);

  // Overrides active
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!isDev) return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.isActive) {
          setIsActive(true);
          setBg(data.bg ?? '#0a0a0a');
          setText(data.text ?? '#f1efe8');
          setAccent(data.accent ?? '#ff2e2e');
          setPanel(data.panel ?? '#1c1c1a');
          setMuted(data.muted ?? '#85837c');
          setPaletteName(data.paletteName ?? 'Custom');
          setDisplayFont(data.displayFont ?? "'Bebas Neue', sans-serif");
          setDisplayW(data.displayW ?? 400);
          setBodyFont(data.bodyFont ?? "'Inter', sans-serif");
          setBodyW(data.bodyW ?? 400);
          setLetterSpacing(data.letterSpacing ?? '0em');
          setTypeName(data.typeName ?? 'Custom');
        }
      }
    } catch {
      // Ignore storage errors
    }
  }, [isDev]);

  useEffect(() => {
    if (!isDev) return;
    try {
      if (isActive) {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            isActive: true,
            bg, text, accent, panel, muted, paletteName,
            displayFont, displayW, bodyFont, bodyW, letterSpacing, typeName,
          })
        );
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Ignore
    }
  }, [isActive, bg, text, accent, panel, muted, paletteName, displayFont, displayW, bodyFont, bodyW, letterSpacing, typeName, isDev]);

  useEffect(() => {
    if (!isDev || !isActive) return;
    loadGoogleFont(displayFont);
    loadGoogleFont(bodyFont);
  }, [displayFont, bodyFont, isDev, isActive]);

  useEffect(() => {
    if (!isDev) return;
    let styleEl = document.getElementById('__dev_theme_modifier_styles__');
    if (!isActive) {
      if (styleEl) styleEl.remove();
      return;
    }

    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = '__dev_theme_modifier_styles__';
      document.head.appendChild(styleEl);
    }

    styleEl.textContent = `
      :root {
        --font-display: ${displayFont} !important;
        --font-heading: ${displayFont} !important;
        --font-heavy: ${displayFont} !important;
        --font-sans: ${displayFont} !important;
        --font-serif: ${displayFont} !important;
        --serif: ${displayFont} !important;

        --font-body: ${bodyFont} !important;
        --font: ${bodyFont} !important;

        --bg: ${bg} !important;
        --background: ${bg} !important;
        --color-ink: ${bg} !important;
        --color-ink-2: ${panel} !important;
        --ink: ${bg} !important;
        --ink-2: ${panel} !important;
        --char: ${bg} !important;
        --salt: ${bg} !important;
        --foam: ${bg} !important;

        --text: ${text} !important;
        --foreground: ${text} !important;
        --color-bone: ${text} !important;
        --paper: ${text} !important;
        --cream-text: ${text} !important;
        --smoke: ${text} !important;
        --ivory: ${text} !important;
        --asphalt: ${text} !important;
        --fg: ${text} !important;

        --accent: ${accent} !important;
        --color-red: ${accent} !important;
        --brass: ${accent} !important;
        --ember: ${accent} !important;
        --lacquer: ${accent} !important;
        --bead: ${accent} !important;
        --madder: ${accent} !important;
        --clearcoat: ${accent} !important;

        --panel: ${panel} !important;
        --graphite: ${panel} !important;
        --color-graphite: ${panel} !important;
        --ash: ${panel} !important;
        --char-soft: ${panel} !important;

        --paper-dim: ${muted} !important;
        --paper-faint: ${muted}88 !important;
        --bone-dim: ${muted} !important;
        --color-bone-dim: ${muted} !important;
        --mute: ${muted} !important;
        --muted: ${muted} !important;
        --sand: ${muted} !important;
      }

      h1, h2, h3, h4, h5, h6, .display, .serif, [class*="display"], [class*="heading"], .wide {
        font-family: ${displayFont} !important;
        font-weight: ${displayW} !important;
        letter-spacing: ${letterSpacing} !important;
      }

      body, p, li, blockquote, .lede, .body {
        font-family: ${bodyFont} !important;
      }
    `;
  }, [isActive, bg, text, accent, panel, muted, displayFont, displayW, bodyFont, bodyW, letterSpacing, isDev]);

  useEffect(() => {
    if (!isDev) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.altKey && (e.key === 'm' || e.key === 'M')) || (e.ctrlKey && e.shiftKey && (e.key === 'm' || e.key === 'M'))) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDev]);

  const cssOutput = useMemo(() => {
    return `:root {
  /* Colors */
  --bg: ${bg};
  --text: ${text};
  --accent: ${accent};
  --panel: ${panel};
  --muted: ${muted};

  /* Typography */
  --font-display: ${displayFont};
  --display-weight: ${displayW};
  --font-body: ${bodyFont};
  --body-weight: ${bodyW};
  --display-tracking: ${letterSpacing};
}`;
  }, [bg, text, accent, panel, muted, displayFont, displayW, bodyFont, bodyW, letterSpacing]);

  const copyCss = async () => {
    try {
      await navigator.clipboard.writeText(cssOutput);
      setCopiedCss(true);
      setTimeout(() => setCopiedCss(false), 1600);
    } catch {
      // fallback
    }
  };

  const copyHex = async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex);
      setCopiedHex(hex);
      setTimeout(() => setCopiedHex(null), 1200);
    } catch {
      // fallback
    }
  };

  const applyPalette = (p: Palette) => {
    setIsActive(true);
    setBg(p.bg);
    setText(p.text);
    setAccent(p.accent);
    setPanel(p.panel);
    setMuted(p.muted);
    setPaletteName(p.name);
  };

  const applyTypePair = (t: TypePair) => {
    setIsActive(true);
    setDisplayFont(t.display);
    setDisplayW(t.displayW);
    setBodyFont(t.body);
    setBodyW(t.bodyW);
    setTypeName(t.name);
  };

  const resetAll = () => {
    setIsActive(false);
    setPaletteName('Forge Crimson');
    setBg('#0a0a0a');
    setText('#f1efe8');
    setAccent('#ff2e2e');
    setPanel('#1c1c1a');
    setMuted('#85837c');
    setTypeName('Athletic Impact');
    setDisplayFont("'Bebas Neue', sans-serif");
    setDisplayW(400);
    setBodyFont("'Inter', sans-serif");
    setBodyW(400);
    setLetterSpacing('0em');
    localStorage.removeItem(STORAGE_KEY);
    const styleEl = document.getElementById('__dev_theme_modifier_styles__');
    if (styleEl) styleEl.remove();
  };

  if (!isDev) return null;

  return (
    <>
      {/* ── Top-Right Corner Floating "Modify" Button ── */}
      <div
        style={{
          position: 'fixed',
          top: '16px',
          right: '16px',
          zIndex: 9999999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Open Dev Theme & Font Modifier"
          title="Theme & Font Modifier (Alt + M)"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 14px',
            borderRadius: '9999px',
            background: 'rgba(13, 15, 20, 0.88)',
            color: '#f4f4f5',
            border: isActive ? '1px solid rgba(245, 158, 11, 0.6)' : '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: isActive ? '0 0 16px rgba(245, 158, 11, 0.25), 0 8px 24px rgba(0, 0, 0, 0.4)' : '0 8px 24px rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            cursor: 'pointer',
            fontSize: '12px',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            fontWeight: 600,
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: isActive ? '#f59e0b' : '#38bdf8' }}>
            <line x1="4" y1="21" x2="4" y2="14" />
            <line x1="4" y1="10" x2="4" y2="3" />
            <line x1="12" y1="21" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12" y2="3" />
            <line x1="20" y1="21" x2="20" y2="16" />
            <line x1="20" y1="12" x2="20" y2="3" />
            <line x1="1" y1="14" x2="7" y2="14" />
            <line x1="9" y1="8" x2="15" y2="8" />
            <line x1="17" y1="16" x2="23" y2="16" />
          </svg>
          <span style={{ letterSpacing: '0.04em' }}>Modify</span>
          <span
            style={{
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '9px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              background: isActive ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.15)',
              color: isActive ? '#fbbf24' : '#34d399',
              border: isActive ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(16, 185, 129, 0.3)',
            }}
          >
            {isActive ? 'ACTIVE' : 'DEV'}
          </span>
        </button>
      </div>

      {/* ── Slide-Out Drawer Panel ── */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999998,
            pointerEvents: 'none',
          }}
        >
          <div
            onClick={() => setIsOpen(false)}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.45)',
              backdropFilter: 'blur(3px)',
              pointerEvents: 'auto',
            }}
          />

          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              width: 'clamp(340px, 94vw, 440px)',
              background: '#0a0c10',
              color: '#ededed',
              borderLeft: '1px solid #232732',
              boxShadow: '-12px 0 40px rgba(0, 0, 0, 0.75)',
              display: 'flex',
              flexDirection: 'column',
              pointerEvents: 'auto',
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
              animation: 'devSlideIn 0.26s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '18px 20px',
                borderBottom: '1px solid #1f232d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#0d1017',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: '#f59e0b',
                    boxShadow: '0 0 10px rgba(245, 158, 11, 0.8)',
                  }}
                />
                <div>
                  <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 700, letterSpacing: '0.02em', color: '#ffffff' }}>
                    Design Lab & Theme Modifier
                  </h2>
                  <span style={{ fontSize: '11px', color: '#8891a2', fontFamily: 'monospace' }}>
                    Dev-only real-time style switcher
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isActive && (
                  <button
                    type="button"
                    onClick={resetAll}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      background: 'rgba(239, 68, 68, 0.15)',
                      color: '#f87171',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      fontSize: '11px',
                      fontFamily: 'monospace',
                      cursor: 'pointer',
                    }}
                    title="Reset all overrides"
                  >
                    Reset
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '6px',
                    background: '#161922',
                    border: '1px solid #282d3c',
                    color: '#9aa2b1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '15px',
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                padding: '6px',
                background: '#0a0c10',
                borderBottom: '1px solid #1a1e28',
                gap: '4px',
              }}
            >
              {[
                { id: 'type' as const, label: 'Typography', icon: 'Aa' },
                { id: 'colors' as const, label: 'Palettes', icon: '🎨' },
                { id: 'export' as const, label: 'CSS / Export', icon: '📋' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    background: activeTab === tab.id ? '#1c212c' : 'transparent',
                    color: activeTab === tab.id ? '#ffffff' : '#8c95a6',
                    fontSize: '12px',
                    fontWeight: activeTab === tab.id ? 600 : 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'background 0.15s ease',
                  }}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Content Body */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '18px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
              }}
            >
              {/* TAB: TYPOGRAPHY */}
              {activeTab === 'type' && (
                <>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#9099a8', fontWeight: 600 }}>
                        Curated Type Pairings
                      </span>
                      <span style={{ fontSize: '11px', color: '#f59e0b', fontFamily: 'monospace' }}>
                        {typeName}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {TYPE_PAIRS.map((t) => {
                        const selected = typeName === t.name;
                        return (
                          <button
                            key={t.name}
                            type="button"
                            onClick={() => applyTypePair(t)}
                            style={{
                              padding: '12px 10px',
                              borderRadius: '8px',
                              textAlign: 'left',
                              background: selected ? 'rgba(245, 158, 11, 0.08)' : '#12151c',
                              border: selected ? '1px solid #f59e0b' : '1px solid #1f2430',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <span
                              style={{
                                display: 'block',
                                fontSize: '20px',
                                lineHeight: 1,
                                color: selected ? '#fbbf24' : '#e4e4e7',
                                fontFamily: t.display,
                                fontWeight: t.displayW,
                              }}
                            >
                              Aa
                            </span>
                            <span
                              style={{
                                display: 'block',
                                marginTop: '6px',
                                fontSize: '12px',
                                fontWeight: 600,
                                color: selected ? '#ffffff' : '#d1d5db',
                              }}
                            >
                              {t.name}
                            </span>
                            <span
                              style={{
                                display: 'block',
                                marginTop: '2px',
                                fontSize: '10px',
                                color: '#717887',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {t.display.split(',')[0].replace(/'/g, '')}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Font Controls */}
                  <div style={{ padding: '14px', borderRadius: '10px', background: '#12151c', border: '1px solid #1e232e' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#9099a8', fontWeight: 600 }}>
                        Custom Font Selector
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsCustomFont(!isCustomFont)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#38bdf8',
                          fontSize: '11px',
                          cursor: 'pointer',
                          padding: 0,
                          textDecoration: 'underline',
                        }}
                      >
                        {isCustomFont ? 'Use Presets' : 'Type Custom Name'}
                      </button>
                    </div>

                    <div style={{ marginBottom: '14px' }}>
                      <label style={{ display: 'block', fontSize: '11px', color: '#9aa2b1', marginBottom: '5px' }}>
                        Display / Headline Font
                      </label>
                      {isCustomFont ? (
                        <input
                          type="text"
                          placeholder="e.g. Bebas Neue, Syne..."
                          value={displayFont.replace(/['"]/g, '').split(',')[0]}
                          onChange={(e) => {
                            setIsActive(true);
                            setTypeName('Custom');
                            setDisplayFont(`'${e.target.value}', sans-serif`);
                          }}
                          style={{
                            width: '100%',
                            boxSizing: 'border-box',
                            padding: '8px 10px',
                            background: '#0a0c10',
                            border: '1px solid #2a303e',
                            borderRadius: '6px',
                            color: '#ffffff',
                            fontSize: '13px',
                          }}
                        />
                      ) : (
                        <select
                          value={displayFont.replace(/['"]/g, '').split(',')[0]}
                          onChange={(e) => {
                            setIsActive(true);
                            setTypeName('Custom');
                            setDisplayFont(`'${e.target.value}', sans-serif`);
                          }}
                          style={{
                            width: '100%',
                            boxSizing: 'border-box',
                            padding: '8px 10px',
                            background: '#0a0c10',
                            border: '1px solid #2a303e',
                            borderRadius: '6px',
                            color: '#ffffff',
                            fontSize: '13px',
                            cursor: 'pointer',
                          }}
                        >
                          {POPULAR_FONTS.map((f) => (
                            <option key={f} value={f}>
                              {f}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    <div style={{ marginBottom: '14px' }}>
                      <label style={{ display: 'block', fontSize: '11px', color: '#9aa2b1', marginBottom: '5px' }}>
                        Body / Paragraph Font
                      </label>
                      {isCustomFont ? (
                        <input
                          type="text"
                          placeholder="e.g. Inter, DM Sans..."
                          value={bodyFont.replace(/['"]/g, '').split(',')[0]}
                          onChange={(e) => {
                            setIsActive(true);
                            setTypeName('Custom');
                            setBodyFont(`'${e.target.value}', sans-serif`);
                          }}
                          style={{
                            width: '100%',
                            boxSizing: 'border-box',
                            padding: '8px 10px',
                            background: '#0a0c10',
                            border: '1px solid #2a303e',
                            borderRadius: '6px',
                            color: '#ffffff',
                            fontSize: '13px',
                          }}
                        />
                      ) : (
                        <select
                          value={bodyFont.replace(/['"]/g, '').split(',')[0]}
                          onChange={(e) => {
                            setIsActive(true);
                            setTypeName('Custom');
                            setBodyFont(`'${e.target.value}', sans-serif`);
                          }}
                          style={{
                            width: '100%',
                            boxSizing: 'border-box',
                            padding: '8px 10px',
                            background: '#0a0c10',
                            border: '1px solid #2a303e',
                            borderRadius: '6px',
                            color: '#ffffff',
                            fontSize: '13px',
                            cursor: 'pointer',
                          }}
                        >
                          {POPULAR_FONTS.map((f) => (
                            <option key={f} value={f}>
                              {f}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#9aa2b1', marginBottom: '4px' }}>
                        <span>Display Weight</span>
                        <span style={{ fontFamily: 'monospace', color: '#f59e0b' }}>{displayW}</span>
                      </div>
                      <input
                        type="range"
                        min="300"
                        max="900"
                        step="100"
                        value={displayW}
                        onChange={(e) => {
                          setIsActive(true);
                          setDisplayW(Number(e.target.value));
                        }}
                        style={{ width: '100%', cursor: 'pointer', accentColor: '#f59e0b' }}
                      />
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#9aa2b1', marginBottom: '4px' }}>
                        <span>Headline Tracking</span>
                        <span style={{ fontFamily: 'monospace', color: '#f59e0b' }}>{letterSpacing}</span>
                      </div>
                      <select
                        value={letterSpacing}
                        onChange={(e) => {
                          setIsActive(true);
                          setLetterSpacing(e.target.value);
                        }}
                        style={{
                          width: '100%',
                          boxSizing: 'border-box',
                          padding: '6px 10px',
                          background: '#0a0c10',
                          border: '1px solid #2a303e',
                          borderRadius: '6px',
                          color: '#ffffff',
                          fontSize: '12px',
                          cursor: 'pointer',
                        }}
                      >
                        <option value="-0.04em">Tight (-0.04em)</option>
                        <option value="-0.02em">Modern (-0.02em)</option>
                        <option value="0em">Normal (0em)</option>
                        <option value="0.04em">Spaced (+0.04em)</option>
                        <option value="0.1em">Wide (+0.10em)</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* TAB: PALETTES & COLORS */}
              {activeTab === 'colors' && (
                <>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#9099a8', fontWeight: 600 }}>
                        Catalog & Studio Palettes
                      </span>
                      <span style={{ fontSize: '11px', color: '#f59e0b', fontFamily: 'monospace' }}>
                        {paletteName}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {PALETTES.map((p) => {
                        const selected = paletteName === p.name;
                        return (
                          <button
                            key={p.name}
                            type="button"
                            onClick={() => applyPalette(p)}
                            style={{
                              padding: '10px',
                              borderRadius: '8px',
                              textAlign: 'left',
                              background: selected ? 'rgba(245, 158, 11, 0.08)' : '#12151c',
                              border: selected ? '1px solid #f59e0b' : '1px solid #1f2430',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                              <span style={{ flex: 1, height: '14px', borderRadius: '3px', background: p.bg, border: '1px solid rgba(255,255,255,0.1)' }} />
                              <span style={{ flex: 1, height: '14px', borderRadius: '3px', background: p.accent }} />
                              <span style={{ flex: 1, height: '14px', borderRadius: '3px', background: p.text }} />
                            </div>
                            <span style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: selected ? '#ffffff' : '#d1d5db' }}>
                              {p.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ padding: '14px', borderRadius: '10px', background: '#12151c', border: '1px solid #1e232e' }}>
                    <span style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#9099a8', fontWeight: 600, marginBottom: '12px' }}>
                      Custom Color Overrides
                    </span>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {[
                        { label: 'Background', val: bg, set: setBg },
                        { label: 'Text / Heading', val: text, set: setText },
                        { label: 'Accent / Primary', val: accent, set: setAccent },
                        { label: 'Card / Panel', val: panel, set: setPanel },
                        { label: 'Muted Text', val: muted, set: setMuted },
                      ].map((item) => (
                        <div
                          key={item.label}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '6px 8px',
                            borderRadius: '6px',
                            background: '#0a0c10',
                            border: '1px solid #232834',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input
                              type="color"
                              value={item.val}
                              onChange={(e) => {
                                setIsActive(true);
                                setPaletteName('Custom');
                                item.set(e.target.value);
                              }}
                              style={{
                                width: '28px',
                                height: '28px',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                background: 'transparent',
                                padding: 0,
                              }}
                            />
                            <span style={{ fontSize: '12px', color: '#d1d5db' }}>{item.label}</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => copyHex(item.val)}
                            title="Click to copy hex"
                            style={{
                              background: '#161922',
                              border: '1px solid #282d3c',
                              borderRadius: '4px',
                              padding: '3px 7px',
                              fontSize: '11px',
                              fontFamily: 'monospace',
                              color: copiedHex === item.val ? '#34d399' : '#9aa2b1',
                              cursor: 'pointer',
                            }}
                          >
                            {copiedHex === item.val ? 'Copied' : item.val}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* TAB: EXPORT / CSS */}
              {activeTab === 'export' && (
                <>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#9099a8', fontWeight: 600 }}>
                        Generated CSS Tokens
                      </span>
                      <button
                        type="button"
                        onClick={copyCss}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '5px 10px',
                          borderRadius: '6px',
                          background: copiedCss ? 'rgba(16, 185, 129, 0.2)' : '#1f2432',
                          color: copiedCss ? '#34d399' : '#f4f4f5',
                          border: copiedCss ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid #2d3446',
                          fontSize: '11px',
                          fontFamily: 'monospace',
                          cursor: 'pointer',
                        }}
                      >
                        {copiedCss ? '✓ Copied!' : 'Copy CSS'}
                      </button>
                    </div>

                    <pre
                      style={{
                        margin: 0,
                        padding: '14px',
                        borderRadius: '8px',
                        background: '#0d1017',
                        border: '1px solid #1f2533',
                        color: '#93c5fd',
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                        fontSize: '11px',
                        lineHeight: 1.6,
                        overflowX: 'auto',
                        whiteSpace: 'pre',
                      }}
                    >
                      {cssOutput}
                    </pre>
                  </div>

                  <div style={{ padding: '12px 14px', borderRadius: '8px', background: '#12151c', border: '1px solid #1f2430' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#f3f4f6', marginBottom: '6px' }}>
                      Status: {isActive ? 'Live Overrides Active' : 'Default Site Styles'}
                    </div>
                    <p style={{ margin: 0, fontSize: '11px', color: '#8891a2', lineHeight: 1.5 }}>
                      Overrides are saved automatically in your browser's local storage and only execute while developing (`import.meta.env.DEV`).
                    </p>
                  </div>
                </>
              )}
            </div>

            <div
              style={{
                padding: '14px 20px',
                borderTop: '1px solid #1a1e28',
                background: '#0a0c10',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ fontSize: '11px', color: '#6b7280', fontFamily: 'monospace' }}>
                Hotkey: Alt + M
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  padding: '7px 16px',
                  borderRadius: '6px',
                  background: '#f59e0b',
                  color: '#0a0c10',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes devSlideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </>
  );
}
