# Beadline — car detailing studio, Rajkot

A detailing site built around one idea: **scroll to wash the car.** The hero starts with a dusty car, and a squeegee pass wipes it clean as you scroll. The headline changes from "Rajkot dust comes off." to "Gloss stays on."

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in /dist
```

## Stack

React 19, Vite, Tailwind 4, GSAP (ScrollTrigger + Flip), Lenis smooth scroll, Leaflet (CARTO light tiles, no API key). One typeface: **Archivo**, whose width axis runs through the whole design, from narrow service names to expanded headlines.

## Sections

1. **Hero:** pinned scroll wipes the dust off. It works from one photo, because the dusty version is generated with CSS.
2. **Services:** Hatchback / Sedan / SUV switch updates every price with a count animation. Rows expand to show details, and "Book" pre-fills the form.
3. **Beading band:** video background, and the headline stretches wider as you scroll.
4. **Process:** five stacked cards that pile up as you scroll.
5. **Recent cars:** gallery filters (Ceramic, Correction, Interior, Wheels) animate with GSAP Flip.
6. **Visit:** map with the studio pin, the 8 km free-pickup circle, and a "Check if you're in the pickup zone" button that uses the visitor's location.
7. **Reviews**, **Booking** (validated form that sends to WhatsApp), and **Footer**.

## Customise

Everything client-specific is in **`src/content.js`**: WhatsApp number, phone, address, hours, services and prices per size, process steps, gallery, map pin, pickup radius and reviews.

- **Media:** `MEDIA.md` has every download link and filename.
- **Before launch:** set the real studio coordinates, WhatsApp number and prices. The reviews are placeholders.

## Devices & accessibility

Responsive from 320px, safe-area aware, keyboard focus styles, skip link. `prefers-reduced-motion` removes pinning and scrubbed motion, and the hero shows the clean car straight away.
