// ─────────────────────────────────────────────────────────────
// One entry per studio site in the portfolio, shown on the /catalog page.
// Hex values and font stacks are copied straight from each project's own
// src/index.css — nothing here is approximated.
//
// Every site is ported in full into this same app (see src/sites/boond
// and src/sites/kavach) and reached by an internal hash route, `route` —
// no external URLs, no separate deployments to keep track of. Kohinoor's
// own entry uses `route: 'home'` and its card reads "You are here".
// ─────────────────────────────────────────────────────────────

export const catalogSites = [
  {
    id: 'kohinoor',
    name: 'Kohinoor',
    tagline: 'Dark luxury automotive detailing',
    theme:
      'High-contrast dark mode for a premium ceramic/PPF brand. Brass accents and a warm-to-cool "heat gradient" (blue → brass → red) stand in for paint-correction heat mapping. Custom cursor, interactive configurator, before/after slider.',
    stack: ['React 19', 'Vite', 'Tailwind 4', 'Framer Motion', 'GSAP', 'Lenis'],
    route: 'home',
    palette: [
      { name: 'Ink', hex: '#0a0b0d', role: 'Background' },
      { name: 'Graphite', hex: '#16181d', role: 'Panels' },
      { name: 'Paper', hex: '#edede8', role: 'Text' },
      { name: 'Paper dim', hex: '#a8a9a4', role: 'Muted text' },
      { name: 'Brass', hex: '#b08d57', role: 'Accent' },
      { name: 'Brass bright', hex: '#d8b578', role: 'Accent, hover' },
      { name: 'Heat blue', hex: '#5b7fb0', role: 'Gradient stop' },
      { name: 'Heat red', hex: '#c0554a', role: 'Gradient stop' },
    ],
    fonts: [
      { role: 'Display / body', family: "'Space Grotesk', sans-serif", weight: 600, sample: 'Space Grotesk' },
      { role: 'Labels / mono', family: "'IBM Plex Mono', monospace", weight: 500, sample: 'IBM Plex Mono' },
    ],
    previewBg: '#0a0b0d',
    accent: '#b08d57',
    textOn: '#edede8',
  },
  {
    id: 'boond',
    name: 'Boond',
    tagline: 'Scroll to wash the car — Rajkot studio',
    theme:
      'Light, editorial and confident: foam-white background, near-black ink, one signal blue ("bead") for water and links. Built around one gimmick — a squeegee pass wipes dust off the hero car as you scroll — carried through in the type: Archivo’s width axis stretches from narrow service names to wide, heavy headlines.',
    stack: ['React 19', 'Vite', 'Tailwind 4', 'GSAP', 'Lenis', 'Leaflet'],
    route: 'boond',
    palette: [
      { name: 'Foam', hex: '#f3f5f6', role: 'Background' },
      { name: 'Asphalt', hex: '#16191c', role: 'Text / dark sections' },
      { name: 'Clearcoat', hex: '#103a5c', role: 'Primary button' },
      { name: 'Dust', hex: '#b9a58a', role: 'Hero dust filter' },
      { name: 'Bead', hex: '#3fa9d9', role: 'Accent, links, map' },
    ],
    fonts: [
      { role: 'Display + body (one variable-width face)', family: "'Archivo', 'Arial Narrow', sans-serif", weight: 800, sample: 'Archivo' },
    ],
    previewBg: '#f3f5f6',
    accent: '#3fa9d9',
    textOn: '#16191c',
  },
  {
    id: 'kavach',
    name: 'Kavach',
    tagline: 'Multi-studio ceramic & PPF network, Gujarat',
    theme:
      'Dark, warm and atmospheric: the hero is a dusty car floating on drifting amber/teal smoke, wiped clean by a scroll-driven squeegee pass. Amber ("lacquer") for warmth and CTAs, teal ("ceramic") for the water/coating motif. A Studio Locator with a live map and per-studio open/closed status is the centrepiece.',
    stack: ['React 19', 'Vite', 'Tailwind 4', 'GSAP', 'Lenis', 'Leaflet'],
    route: 'kavach',
    palette: [
      { name: 'Ink', hex: '#08090a', role: 'Background' },
      { name: 'Panel', hex: '#16181b', role: 'Cards' },
      { name: 'Paper', hex: '#f4f1ea', role: 'Text' },
      { name: 'Paper dim', hex: '#a9a69d', role: 'Muted text' },
      { name: 'Kavach amber', hex: '#e8a05a', role: 'Accent, CTAs' },
      { name: 'Kavach bright', hex: '#ffcc8f', role: 'Accent, hover' },
      { name: 'Ceramic', hex: '#5fc7d6', role: 'Secondary accent' },
    ],
    fonts: [
      { role: 'Display', family: "'Bricolage Grotesque', sans-serif", weight: 700, sample: 'Bricolage Grotesque' },
      { role: 'Body', family: "'Inter', sans-serif", weight: 500, sample: 'Inter' },
      { role: 'Labels / mono', family: "'JetBrains Mono', monospace", weight: 500, sample: 'JetBrains Mono' },
    ],
    previewBg: '#08090a',
    accent: '#e8a05a',
    textOn: '#f4f1ea',
  },
];
