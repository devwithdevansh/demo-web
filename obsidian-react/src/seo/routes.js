// ─────────────────────────────────────────────────────────────
// Every page this deployment serves, with what search engines and link
// previews should see for it. Plain data, no JSX, so it's shared by two
// places: App.jsx (picks the page from the URL, sets document.title) and
// vite.config.js (writes one real HTML file per page at build time, so a
// crawler gets a title, description and readable text instead of an empty
// <div id="root">).
//
// Boond, Kavach and Kohinoor are demo studios, not real businesses -- so
// their titles say so, and none of them get LocalBusiness schema. Telling
// Google a fictional studio exists at a real Rajkot address is exactly the
// kind of thing that makes a web agency look dishonest.
// ─────────────────────────────────────────────────────────────

export const SITE_URL = 'https://car-detailing-by-dwd.onrender.com';

export const ROUTES = [
  {
    id: 'catalog',
    path: '/',
    title: 'Car Detailing Website Design | DWD Studio',
    description:
      'Custom websites for car detailing, ceramic coating and PPF studios, built to be found on Google. Browse three live demo sites, try the design lab, and see what ads would cost you instead.',
    heading: 'Websites for car-detailing studios, built to be found on Google',
    body: 'DWD Studio designs custom websites for car detailing, ceramic coating and paint protection film studios. Three live demo sites — Kohinoor, Boond and Kavach — each with its own palette, type system and signature scroll effect.',
    links: [
      ['/kohinoor', 'Kohinoor — dark luxury detailing demo'],
      ['/boond', 'Boond — single-studio detailing demo'],
      ['/kavach', 'Kavach — multi-studio ceramic and PPF demo'],
    ],
  },
  {
    id: 'home',
    path: '/kohinoor',
    title: 'Kohinoor — Luxury Car Detailing Website Demo | DWD Studio',
    description:
      'Demo website for a premium detailing, ceramic coating and PPF studio: dark luxury design, before/after slider, service configurator and booking. Built by DWD Studio.',
    heading: 'Kohinoor — a demo website for a luxury detailing studio',
    body: 'A dark, high-contrast site for a premium paint correction, ceramic coating and PPF brand, with a before/after slider, interactive spec configurator and booking form. Kohinoor is a demo studio built by DWD Studio.',
  },
  {
    id: 'boond',
    path: '/boond',
    title: 'Boond — Car Detailing Studio Website Demo | DWD Studio',
    description:
      'Demo website for a single car-detailing studio: scroll-to-wash hero, price menu, five-stage process and WhatsApp booking. Built by DWD Studio.',
    heading: 'Boond — a demo website for a single detailing studio',
    body: 'A light, editorial site with a scroll-driven squeegee hero, a clear service and price menu, the five stages of a ceramic job, and booking over WhatsApp. Boond is a demo studio built by DWD Studio.',
  },
  {
    id: 'kavach',
    path: '/kavach',
    title: 'Kavach — Multi-Studio Ceramic & PPF Website Demo | DWD Studio',
    description:
      'Demo website for a detailing brand with several studios: studio locator with live map, service menu, before/after comparison and per-studio WhatsApp booking. Built by DWD Studio.',
    heading: 'Kavach — a demo website for a multi-studio detailing brand',
    body: 'A dark, atmospheric site for a ceramic and PPF network with several studios: a studio locator with a live map and open/closed status, a sideways service menu, and booking routed to the nearest studio. Kavach is a demo brand built by DWD Studio.',
  },
];

// Old links used hash routes (#/boond etc.) -- still accepted, and App.jsx
// swaps them for the real path so shared links keep working.
export const LEGACY_HASHES = {
  '#/catalog': '/',
  '#/kohinoor': '/kohinoor',
  '#/boond': '/boond',
  '#/kavach': '/kavach',
};

export const routeForPath = (pathname) => {
  const clean = pathname.replace(/\/+$/, '') || '/';
  if (clean === '/catalog') return ROUTES[0];
  return ROUTES.find((r) => r.path === clean) ?? null;
};
