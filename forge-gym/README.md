# FORGE

Software for gym owners, shown as one combined demo: a product homepage and three package demos that share a fictional sample gym, **Ironpeak Fitness**.

| Route | What it shows |
|---|---|
| `/` | FORGE homepage: packages, comparison, add-ons, contact |
| `/demo/essential` | **Essential — Get Found Online.** The sample gym's public website |
| `/demo/growth` | **Growth — Run Your Gym.** Owner and front-desk portal |
| `/demo/performance` | **Performance — Coach & Retain.** Growth plus trainer and member portals |

Each demo has a bar at the top that leads back to the homepage and across to the other demos.

## Run it

```bash
npm install
npm run dev        # site on http://localhost:5173, API on http://localhost:4000
```

No setup is needed for local development. Without `MONGODB_URI`, the API starts a private MongoDB on your machine (files in `.data/`, git-ignored) so the demos work straight away.

Other commands:

| Command | Purpose |
|---|---|
| `npm test` | API tests: roles, gym isolation, workflows, add-ons, reset |
| `npm run build` | Type-check and build the site into `dist/` |
| `npm start` | Run the API, which also serves `dist/` (one deployment) |
| `npm run lint` | Lint |
| `npm run demo:clear` | Delete every demo sandbox. Live gyms are not touched |
| `npm run gym:create -- --name "Gym" --owner "Name" --email a@b.com --package growth` | Create a live gym and its owner account |

## Configuration

Copy `.env.example` to `.env`. The file is git-ignored.

| Variable | Needed | Purpose |
|---|---|---|
| `MONGODB_URI` | Production | MongoDB Atlas connection string |
| `MONGODB_DB` | Recommended | Database name. Defaults to `gym` |
| `JWT_SECRET` | Production | Signs sessions |
| `PORT` | Optional | API port. Defaults to `4000` |
| `SESSION_HOURS` | Optional | Session length. Defaults to `12` |
| `DEMO_SANDBOX_TTL_HOURS` | Optional | How long an unused demo sandbox is kept. Defaults to `24` |
| `DEMO_MAX_SANDBOXES` | Optional | Ceiling on stored sandboxes. Defaults to `200` |

With `NODE_ENV=production` the API refuses to start unless `MONGODB_URI` and `JWT_SECRET` are set.

**Deploying:** run `npm run build`, then `npm start` with `NODE_ENV=production` and the variables above. The one Node process serves both the site and the API.

## How the demo works

- **Entering a demo.** `/demo/growth` and `/demo/performance` list the roles you can enter as. There are no passwords to type and none in the frontend: the server issues a short session for the chosen sample account.
- **Private sandbox.** Each visitor gets their own copy of the sample gym, so nothing one visitor types is visible to another. The sandbox key is kept in the browser; the same sandbox is shared across the Essential, Growth and Performance demos, which is why an enquiry sent from the sample website shows up under Leads.
- **Reset.** "Reset demo data" in any portal restores the original sample data for that visitor only. Unused sandboxes are removed after `DEMO_SANDBOX_TTL_HOURS`.
- **Sample data.** Seeded relative to today, so expiry dates, renewals and follow-ups always look current. See `server/seed/demoGym.js`.

### Demo roles

| Role | Sample account | Available in |
|---|---|---|
| Owner | Rhea Kapoor | Growth, Performance |
| Front desk | Imran Shaikh | Growth, Performance |
| Trainer | Alex Rey | Performance |
| Member | Aarav Shah | Performance |

## Access and data safety

- Every record carries the gym it belongs to, and every query is scoped to the signed-in user's gym. A record from another gym returns "not found".
- Roles (owner, front desk, trainer, member) and the package are enforced on the server, not by hiding buttons. A trainer can open only members assigned to them; a member can read only their own record.
- Live gym accounts sign in at `POST /api/auth/login` with bcrypt-hashed passwords. Demo accounts have no password and cannot use that endpoint; live gyms cannot be reset or reached from a demo session.
- Input is validated with zod, responses never include password hashes or internal ids, and errors do not expose database details.

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

For a live gym these endpoints answer "no provider connected" rather than pretending. Wiring real providers means adding a WhatsApp Business API provider and a payment gateway (sandbox keys first) behind `server/routes/addons.js`.

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
server/
  index.js, app.js            API entry and Express app
  models/                     Mongoose models
  routes/                     Session, members, front desk, reports, coaching, member portal, add-ons
  middleware/                 Auth, roles, validation, errors
  seed/demoGym.js             Sample data and sandbox lifecycle
  test/api.test.js            API tests
```

## Media

The only local media is the hero frame sequence in `public/frames/`. Gallery photos are stills from it and the "video" plays the same frames, all labelled as sample media. Trainer tiles are monogram placeholders. Replace them with the gym's own photos for a real site.
