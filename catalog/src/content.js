// ─────────────────────────────────────────────────────────────
// One entry per studio site. Palette hexes and font stacks are copied
// straight from each project's own src/index.css — nothing here is
// approximated. `url` is the live deployment; leave it null until the
// site has one and the card shows "Not deployed yet" instead of a link.
// ─────────────────────────────────────────────────────────────

export const sites = [
  {
    id: 'obsidian',
    name: 'Obsidian',
    tagline: 'Dark luxury automotive detailing',
    theme:
      'High-contrast dark mode for a premium ceramic/PPF brand. Brass accents and a warm-to-cool "heat gradient" (blue → brass → red) stand in for paint-correction heat mapping. Custom cursor, interactive configurator, before/after slider.',
    stack: ['React 19', 'Vite', 'Tailwind 4', 'Framer Motion', 'GSAP', 'Lenis'],
    url: 'https://obsidian-react.onrender.com',
    localPath: 'obsidian-react',
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
  },
  {
    id: 'beadline',
    name: 'Beadline',
    tagline: 'Scroll to wash the car — Rajkot studio',
    theme:
      'Light, editorial and confident: foam-white background, near-black ink, one signal blue ("bead") for water and links. The whole site is built around a single gimmick — a squeegee pass wipes dust off the hero car as you scroll — carried through in the type: Archivo’s width axis stretches from narrow service names to wide, heavy headlines.',
    stack: ['React 19', 'Vite', 'Tailwind 4', 'GSAP', 'Lenis', 'Leaflet'],
    url: null, // TODO: paste the live URL
    localPath: 'beadline',
    palette: [
      { name: 'Foam', hex: '#f3f5f6', role: 'Background' },
      { name: 'Asphalt', hex: '#16191c', role: 'Text / dark sections' },
      { name: 'Clearcoat', hex: '#103a5c', role: 'Primary button' },
      { name: 'Dust', hex: '#b9a58a', role: 'Hero dust filter' },
      { name: 'Bead', hex: '#3fa9d9', role: 'Accent, links, map' },
    ],
    fonts: [
      { role: 'Display + body (one face, variable width)', family: "'Archivo', 'Arial Narrow', sans-serif", weight: 800, sample: 'Archivo' },
    ],
  },
  {
    id: 'lacquer',
    name: 'Lacquer',
    tagline: 'Multi-studio ceramic & PPF network, Gujarat',
    theme:
      'Dark, warm and atmospheric: the hero is a dusty car floating on drifting amber/teal smoke, wiped clean by a scroll-driven squeegee pass. Amber ("lacquer") for warmth and CTAs, teal ("ceramic") for the water/coating motif. A Studio Locator with a live map and per-studio open/closed status is the centrepiece — this is the one with three real locations, not one shop.',
    stack: ['React 19', 'Vite', 'Tailwind 4', 'GSAP', 'Lenis', 'Leaflet'],
    url: null, // local build for now — see catalog README
    localPath: 'lacquer',
    palette: [
      { name: 'Ink', hex: '#08090a', role: 'Background' },
      { name: 'Panel', hex: '#16181b', role: 'Cards' },
      { name: 'Paper', hex: '#f4f1ea', role: 'Text' },
      { name: 'Paper dim', hex: '#a9a69d', role: 'Muted text' },
      { name: 'Lacquer', hex: '#e8a05a', role: 'Accent, CTAs' },
      { name: 'Lacquer bright', hex: '#ffcc8f', role: 'Accent, hover' },
      { name: 'Ceramic', hex: '#5fc7d6', role: 'Secondary accent' },
    ],
    fonts: [
      { role: 'Display', family: "'Bricolage Grotesque', sans-serif", weight: 700, sample: 'Bricolage Grotesque' },
      { role: 'Body', family: "'Inter', sans-serif", weight: 500, sample: 'Inter' },
      { role: 'Labels / mono', family: "'JetBrains Mono', monospace", weight: 500, sample: 'JetBrains Mono' },
    ],
  },
];
