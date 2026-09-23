# Studio Catalog

A homepage-style catalog of the three car-detailing studio site designs in
this portfolio — Obsidian, Beadline and Lacquer — each shown as a card with
its own colour palette, live-rendered fonts, theme description and stack.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in /dist
```

## What each card shows

- **Palette preview panel** — the project's own name, set in its own display
  font, on a gradient built from its own background and accent colours. Not
  a screenshot; an honest sample of the theme built from its real tokens.
- **Swatches** — every colour token from that project's `src/index.css`,
  with its hex and what it's used for.
- **Type** — each font actually loaded and rendered (see `index.html`'s
  Google Fonts link, which pulls in every family every project uses), not
  just named in text.
- **Stack** and a **live link**, or "Not deployed yet" if it has none.

## Customise

Everything is in **`src/content.js`** — one object per site. To wire up a
live URL once a project is deployed, set its `url` field; the card switches
from "Not deployed yet" to a "Visit live site" button and its status pill
flips from "Local build" to "Live" automatically.

Adding a fourth project: add another entry to `sites` (palette straight from
its `index.css`, fonts straight from its `<link>`/`@font-face`), and if it
uses a font none of the others do, add that family to the Google Fonts link
in `index.html` too, or its specimen will fall back to the browser default.

## Deploying alongside the others

This project has no special config — same as `beadline`, `obsidian-react`
and `lacquer`, it's a plain Vite app with nothing but `package.json` and
`vite.config.js`, so whatever hosting step made those two live (a Vercel or
Netlify project pointed at that subfolder as its Root Directory) works
identically here, pointed at `other websites demo/catalog`.
