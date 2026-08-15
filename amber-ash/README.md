# Amber & Ash — Restaurant / Cafe Website Demo

A fully static, front-end-only React demo website for a wood-fire restaurant & bar. Built with
**Vite + React + React Router**. No backend — all data (menu, gallery, hours, testimonials) lives
in `src/data/` as static JS, and the reservation/contact forms simulate submission entirely on
the client.

## Design concept

**"Amber & Ash"** — a live-fire kitchen and bar. The visual identity is built around the hearth:
charcoal darks, a flame-orange accent, and brass gold, paired with a soft serif display face
(Fraunces), a clean sans body face (Inter), and a monospace utility face (IBM Plex Mono) used for
prices, labels, and menu leader lines — like a real printed menu card.

## Pages / operations covered

- **Home** — hero, brand story, signature dishes, menu preview, gallery strip, testimonials, reservation CTA
- **Menu** — full menu with category tabs (Starters, Wood-Fired, Mains, Desserts, Bar & Drinks)
- **About** — restaurant story, values, team
- **Gallery** — masonry image grid with a keyboard-navigable lightbox
- **Reservations** — booking form with client-side validation and a confirmation screen
- **Contact** — contact form with validation, map placeholder, hours, address
- **404** — not-found page

## Getting started

```bash
npm install
npm run dev       # start local dev server
npm run build     # production build to /dist
npm run preview   # preview the production build
```

## Project structure

```
src/
  components/   Navbar, Footer, Layout, MenuList, ReserveBand, FlameGlyph
  data/         static menu, gallery, testimonial, hours, and site info
  pages/        Home, Menu, About, Gallery, Reservation, Contact, NotFound
  styles/       global design tokens & base styles
```

## Notes

- All imagery is pulled from Unsplash at runtime for demo purposes — swap in real photography
  before shipping.
- The reservation and contact forms are fully interactive (validation, error states, confirmation
  screens) but do not call a real API. Wire them up to your backend or a service like Formspree /
  a serverless function when ready.
