# Saltlight — a retreat on the White Rann

A scroll-driven hotel site where the page follows one day in Kutch: salt-white at the top, madder-red at sunset, indigo night with a rising moon at the bottom. The clock in the header tracks the "time" as you scroll.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in /dist
```

## Stack

React 19 · Vite · Tailwind 4 · GSAP + ScrollTrigger · Lenis smooth scroll · Leaflet (CARTO dark tiles, no API key)

## Sections

1. **Hero** — full-screen video, letter-by-letter headline reveal (the page's one intro animation)
2. **Intro** — paragraph that lights up word by word as you scroll
3. **The day** — pinned horizontal scroll through 06:40 → 12:30 → 18:10 → 22:00; page colours shift with it and the moon rises at the end (stacks vertically on mobile)
4. **Stay** — three rooms; on desktop the photo follows your cursor; clicking a room pre-selects it in the booking form
5. **Craft** — clip-path reveal video band + sticky image that swaps as you read
6. **Map** — interactive Leaflet map synced with a list of nearby places and drive times
7. **Guestbook**, **Booking** (validated, sends the request to WhatsApp), **Footer**

## Customise

Everything client-specific is in **`src/content.js`**: WhatsApp number, email, rooms and prices, day moments, craft stories, map places, reviews, and every image/video path.

- **Media:** see `MEDIA.md` for every download link and exact filenames.
- **Map pins:** coordinates and drive times are approximate — set the real property pin before launch.
- **Colours / fonts:** tokens at the top of `src/index.css` (Gloock + Schibsted Grotesk from Google Fonts).

## Accessibility & devices

Responsive from 320px up, safe-area aware on notched phones, keyboard focus styles, skip link, and `prefers-reduced-motion` turns off smooth scroll, pinning and scrubbed animation (the day section becomes a simple vertical list).
