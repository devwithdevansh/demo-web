# Kohinoor - Premium Automotive Detailing

A luxury, dark-themed React application designed for high-end automotive detailing, ceramic coating, and paint protection film (PPF) services.

## Key Features
- **Luxury Aesthetic:** High contrast dark-mode design tailored for premium automotive brands.
- **Interactive UI:** Smooth reveal animations, custom cursor implementations, and interactive service configurators.
- **Scroll Effects:** Implemented using Lenis for butter-smooth scrolling and parallax image reveals.
- **Responsive Design:** Fully mobile-optimized layouts that maintain the premium feel on small devices.

## Tech Stack
- React + Vite
- TailwindCSS (Custom configuration for luxury branding)
- GSAP & Lenis

## Setup
```bash
npm install
npm run dev
```

## Studio catalog, and every other studio site, live here too

`#/catalog` is a full menu of every car-detailing studio site in this
portfolio — palette, type and theme for each — linked from the nav and the
footer. Its cards don't point at external URLs: **Boond and Kavach are
ported into this project in full** (`src/sites/boond`, `src/sites/kavach`,
each with their own components, content and a scoped stylesheet) and opened
at `#/boond` / `#/kavach`, so the whole portfolio ships as one deployment
with no separate hosting to keep track of.

The catalog page also has its own light/dark theme toggle, independent of
the rest of the site, and a "Build a theme" Design Lab section with ready
palette presets, a live custom color picker, and several typography
pairings to preview — all client-side, no build step needed to try a
combination.

Routing is a plain `window.location.hash` check in `App.jsx` — no
react-router, no server rewrite rule needed on whatever static host serves
this site. Each ported site's own CSS custom properties and classes
(`--ink`, `.btn`, `.eyebrow`, ...) are scoped under a wrapper class
(`.boond-scope`, `.kavach-scope`) so they can't collide with Kohinoor's
own tokens or with each other, even though several of those names are
reused across all three sites with different values.

To add a fourth site the same way: copy its `src/components/` and
`content.js` into a new `src/sites/<name>/`, scope its `index.css` under
`.{name}-scope` the same way, add a `<Name>Page.jsx` (see `BoondPage.jsx`
for the pattern — its own Lenis setup, and killing `ScrollTrigger.getAll()`
on unmount so a leftover pin from one page can't misplace scroll on the
next), then add the route to `ROUTES` in `App.jsx` and an entry to
`src/data/catalogSites.js`.
