# FORGE

Software for gym owners, shown as one combined demo: a product homepage and three package demos that share a fictional sample gym, **Ironpeak Fitness**.

This folder is the **site** (React + Vite). The API it talks to is a separate project in [`../forge-gym-backend`](../forge-gym-backend).

| Route | What it shows | Needs the API |
|---|---|---|
| `/` | FORGE homepage: packages, comparison, add-ons, contact | No |
| `/demo/essential` | **Essential — Get Found Online.** The sample gym's public website | No (the enquiry form saves only when the API is up) |
| `/demo/growth` | **Growth — Run Your Gym.** Owner and front-desk portal | Yes |
| `/demo/performance` | **Performance — Coach & Retain.** Growth plus trainer and member portals | Yes |

Each demo has a bar at the top that leads back to the homepage and across to the other demos.

## Run it

Install both folders once:

```bash
cd forge-gym-backend && npm install
cd ../forge-gym && npm install
```

Then, from this folder:

```bash
npm run dev:all    # site on http://localhost:5173 and API on http://localhost:4000
```

Or run them in two terminals: `npm run dev` in `forge-gym-backend`, and `npm run dev` here. The site forwards `/api` to `http://localhost:4000`.

No database setup is needed locally; see the backend README.

| Command | Purpose |
|---|---|
| `npm run dev` | Site only |
| `npm run dev:all` | Site and API together |
| `npm run build` | Type-check and build the site into `dist/` |
| `npm run lint` | Lint |
| `npm run preview` | Serve the built site locally |

## Settings

The site has two optional settings, both public (they are built into the site). Secrets belong in the backend, never here.

| Variable | When | Purpose |
|---|---|---|
| `VITE_API_URL` | Hosted site | Address of the API, for example `https://forge-gym-api.onrender.com`. Set it in the host's build environment and redeploy |
| `VITE_DEV_API_URL` | Local, rarely | Where `npm run dev` forwards `/api`. Defaults to `http://localhost:4000` |

## Deploying

The site is a static site: build command `npm run build`, publish directory `dist`.

For the Growth and Performance demos to work on the hosted site:

1. Deploy the API from [`../forge-gym-backend`](../forge-gym-backend) as a Node web service. Its README has the exact settings.
2. On this static site, set `VITE_API_URL` to the API's address and redeploy, so the address is built in.
3. On the API, set `CORS_ORIGIN` to this site's address.
4. On the static site, the catch-all rule `/*` to `/index.html` must be a **Rewrite**, not a Redirect. With a Redirect, refreshing or sharing a link such as `/demo/growth/owner` lands on the homepage instead.

Without the API, the homepage, the role pages and the Essential site still work, and entering a portal says that no server is connected.

## How the demo works

- **Entering a demo.** `/demo/growth` and `/demo/performance` list the roles you can enter as. There are no passwords to type and none in the site: the API issues a short session for the chosen sample account.
- **Private sandbox.** Each visitor gets their own copy of the sample gym, so nothing one visitor types is visible to another. The sandbox key is kept in the browser; the same sandbox is shared across the Essential, Growth and Performance demos, which is why an enquiry sent from the sample website shows up under Leads.
- **Reset.** "Reset demo data" in any portal restores the original sample data for that visitor only.
- **Sleeping server.** On free hosting the API sleeps when idle. The site pings it when someone opens the homepage, and the portals wait with a "waking the demo server" message.

### Demo roles

| Role | Sample account | Available in |
|---|---|---|
| Owner | Rhea Kapoor | Growth, Performance |
| Front desk | Imran Shaikh | Growth, Performance |
| Trainer | Alex Rey | Performance |
| Member | Aarav Shah | Performance |

## Integrations: what is real and what is simulated

No messaging or payment provider is connected. In the demos:

| Add-on | State | What happens |
|---|---|---|
| WhatsApp notifications | Available in demo | Message is drafted and logged as simulated. Nothing is delivered |
| UPI payment links | Available in demo | Link opens a practice page (`/demo/pay/:token`). No money moves |
| UPI Autopay | Preview | Gym can request; only the member can approve, pause or cancel. No mandate is created |
| Lead follow-up | Available in demo | Follow-up queue and message drafts |
| Trainer Plus | Preview | Three workout templates in the plan editor |
| Additional location | Coming soon | Not built |

## Things to change without touching pages

- `src/config/forge.ts` — package copy, **proposed** pricing, add-on catalogue, contact address.
- `src/config/sampleGym.ts` — the sample gym's name, plans, trainers, timings and gallery.
- `src/index.css` — colours and fonts. `--color-red` is the accent used everywhere.

## Project layout

```
src/
  pages/Home.tsx              FORGE homepage
  pages/essential/            Essential demo (sample gym website)
  components/sections/        Cinematic gym sections reused by the Essential demo
  portal/                     Growth and Performance portals (shell, session, screens)
  config/                     Product and sample-gym content
  lib/api.ts                  Client for the API in ../forge-gym-backend
```

## Media

The only local media is the hero frame sequence in `public/frames/`. Gallery photos are stills from it and the "video" plays the same frames, all labelled as sample media. Trainer tiles are monogram placeholders. Replace them with the gym's own photos for a real site.
