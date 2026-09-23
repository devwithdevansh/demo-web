# Lacquer — car detailing & paint protection studio

A dark, premium studio site for a multi-location ceramic/PPF detailing brand,
built around one idea: **the car arrives dusty, scroll washes it clean.** The
hero opens on a floating, dust-covered car with drifting amber and teal haze
behind it; a squeegee pass wipes the dust off as you scroll, and the headline
swaps from "The dust comes off the day you book" to "The gloss stays on for
years."

Inspired by real detailing-studio sites — CarzSpa's studio-locator card
(rating, live open/closed, phone, drive-direction) and its floating
product-shot hero — and by two sibling demos in this repo: `beadline` (the
original dust-wipe technique and the content.js/MEDIA.md convention) and
`obsidian-react` (dark luxury palette, before/after slider, magnetic cursor).
This one is its own build, not a copy of either.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in /dist
```

## Stack

React 19, Vite, Tailwind 4, GSAP (ScrollTrigger + Flip), Lenis smooth scroll,
Leaflet (OpenStreetMap tiles, no API key — see note below), lucide-react
icons. Two typefaces plus a mono label face: **Bricolage Grotesque** for
display headlines, **Inter** for body copy, **JetBrains Mono** for eyebrows,
prices and the studio "closes at" labels — all from Google Fonts.

Vite over Next.js: every sibling site in this portfolio (`beadline`,
`obsidian-react`, `saltlight`, …) is a WhatsApp-first single page with no
routes and no server data, so there's nothing for Next's SSR/routing to buy —
Vite keeps the toolchain identical to the rest of the portfolio and the dev
loop faster.

## Sections

1. **Hero** — the car floats on the dark backdrop (masked into an ellipse, or
   a real transparent PNG cutout if you drop one in — see MEDIA.md), with
   drifting CSS "smoke" and a light-pool glow behind it. Scroll pins the
   section and wipes the dust off with a squeegee pass, clip-path only, no
   video required; the smoke thins out and the glow brightens in the same
   scroll, so the haze clears along with the dust.
2. **Marquee** — an infinite ticker of service names, pure CSS keyframe.
3. **Services** — a horizontal scroll-story: the scrollbar drives six service
   cards sideways on desktop (pinned section, scrub-linked), a native
   swipeable row on touch. Hatchback / Sedan / SUV / Luxury tabs update every
   price with a count animation; "Book this" pre-fills the booking form.
4. **Before / After** — drag-to-compare slider (correction + ceramic vs. a
   dull, swirled panel), with a one-time auto-sweep demo the first time it
   scrolls into view.
5. **Beading band** — full-bleed video, "Water runs off. Dust goes with it.",
   each word rising into view on its own beat (kinetic type).
6. **Process** — an animated vertical timeline: a line fills and each
   numbered dot lights up as you scroll past its stage.
7. **Studio Locator** — a dark Leaflet map with one pin per studio (a pulsing
   ring on whichever one is active) next to CarzSpa-style cards: star rating,
   Google review count, live **Open now / Closes at** computed from each
   studio's hours, phone, **Drive direction**, and **View on map**. A small
   rotating 3D "Certified Network" badge sits by the heading.
8. **Gallery** — filterable recent-work grid (Ceramic / PPF / Correction /
   Wheels / Interior), GSAP Flip re-layout; hover scales the photo and slides
   its caption up from under a mask.
9. **Reviews** — an aggregate rating that counts up on scroll, animated
   star-distribution bars, and staggered testimonial cards.
10. **Booking** — validated form (name, phone, car, **studio**, service,
    size, date) that opens a prefilled WhatsApp chat to that studio's number.
11. **Footer**, plus throughout: a custom magnetic cursor and cursor-follow
    ambient glow (desktop, fine-pointer only), a subtle grain overlay, and a
    thin scroll-progress bar in the header.
12. **Action bar** — a fixed, app-style Call / Direction / Enquiry / WhatsApp
    / Locations row at the bottom of the screen, mobile only (the same
    shortcut row a studio's Google Business card gives you).

## Customise

Everything client-specific is in **`src/content.js`**: brand, WhatsApp
numbers, the three studios (address, coordinates, phone, hours, rating,
review count), services and prices per size, process steps, gallery, and
reviews. The bottom action bar's "Direction" button points at `studios[0]` —
reorder that array if a different studio should be the default.

- **Media:** `MEDIA.md` has every download link and exact filename, plus how
  to give the hero a real transparent PNG car cutout instead of the
  masked-photo approximation it uses out of the box.
- **Before launch:** set each studio's real coordinates and hours, the real
  WhatsApp numbers, and real prices. The reviews and review counts are
  placeholders.
- **Map tiles:** uses `tile.openstreetmap.org` directly, darkened with a CSS
  filter to match the theme. CARTO's free `dark_all`/`light_all` basemap
  tiles now require an account API key and serve a watermarked image without
  one — don't switch back to those without adding a key. For real traffic,
  consider a tile provider with a proper key and usage tier (MapTiler,
  Stadia, Mapbox) instead of hammering the OSM demo server.

## Devices & accessibility

Responsive from 360px, safe-area aware, keyboard focus styles, skip link.
`prefers-reduced-motion` removes pinning, the dust-wipe and every scrubbed
motion (the hero shows the clean car immediately), and disables the custom
cursor. The cursor, ambient spotlight and pointer-tilt effects are skipped
entirely on coarse/touch pointers, and the bottom action bar only renders
below the `md` breakpoint — desktop already has the header and full-page CTAs.
