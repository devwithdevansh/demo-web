# FORGE backend

The Node.js API behind the FORGE demos in [`../forge-gym`](../forge-gym): members, attendance, payments, leads, coaching, the member portal, add-ons, and the private demo sandboxes. It is a separate project with its own packages, so it can be deployed on its own.

The Growth and Performance demos need this running. The homepage and the Essential demo work without it.

## Run it locally

```bash
cd forge-gym-backend
npm install
npm run dev        # API on http://localhost:4000, restarts when files change
```

No setup is needed locally. Without `MONGODB_URI`, the API starts a private MongoDB on your machine (files in `.data/`, git-ignored).

Then start the site in another terminal (`cd ../forge-gym && npm run dev`); it forwards `/api` to this server. Or run both at once from the site folder with `npm run dev:all`.

| Command | Purpose |
|---|---|
| `npm run dev` | Run with auto-restart |
| `npm start` | Run for production |
| `npm test` | API tests: roles, gym isolation, workflows, add-ons, reset |
| `npm run demo:clear` | Delete every demo sandbox. Live gyms are not touched |
| `npm run gym:create -- --name "Gym" --owner "Name" --email a@b.com --package growth` | Create a live gym and its owner account |

Check it is up at `http://localhost:4000/api/health`. It answers `{"ok":true,"database":"connected"}`.

## Settings

Copy `.env.example` to `.env` for local overrides. On a host, set these as environment variables instead.

| Variable | Needed | Purpose |
|---|---|---|
| `NODE_ENV` | Hosted | Set to `production` |
| `MONGODB_URI` | Hosted | MongoDB Atlas connection string |
| `MONGODB_DB` | Recommended | Database name. Defaults to `gym` |
| `JWT_SECRET` | Hosted | Long random string that signs sessions |
| `CORS_ORIGIN` | Hosted | The site's address, allowed to call this API. Comma-separated for more than one |
| `PORT` | Optional | Defaults to `4000`. Render sets this itself |
| `SESSION_HOURS` | Optional | Session length. Defaults to `12` |
| `DEMO_SANDBOX_TTL_HOURS` | Optional | How long an unused demo sandbox is kept. Defaults to `24` |
| `DEMO_MAX_SANDBOXES` | Optional | Ceiling on stored sandboxes. Defaults to `200` |

With `NODE_ENV=production` the API refuses to start unless `MONGODB_URI` and `JWT_SECRET` are set.

Always keep `MONGODB_DB` set. On a cluster shared with other projects, a connection without a database name falls through to `test`.

## Deploy on Hostinger (Node.js web app)

Push the repository to GitHub first, then in hPanel add a Node.js web app and import the repository. On "Review build settings":

| Setting | Value |
|---|---|
| Framework preset | **Express** (or "Other" / plain Node.js). Not Vite |
| Branch | `main` |
| Node version | `22.x` |
| Root directory | `forge-gym-backend` |
| Build command | leave empty (or `npm run build`, which does nothing) |
| Output directory | leave empty |
| Entry file | `server.js` |
| Start command, if asked | `npm start` |

Environment variables: `NODE_ENV=production`, `MONGODB_URI`, `MONGODB_DB=gym`, `JWT_SECRET`, and `CORS_ORIGIN` set to the site's address with no trailing slash. Do not set `PORT`; the host provides it.

After it deploys, open `https://<backend-address>/api/health`. Then follow steps 1 to 3 under "Deploy on Render" below (Atlas network access, `VITE_API_URL` on the site, health check); they are the same on any host.

## Deploy on Render

Create a **Web Service** (not a static site) from this repository:

| Setting | Value |
|---|---|
| Root Directory | `forge-gym-backend` |
| Runtime | Node |
| Build Command | `npm ci --omit=dev` |
| Start Command | `npm start` |
| Health Check Path | `/api/health` |

Environment variables: `NODE_ENV=production`, `MONGODB_URI`, `MONGODB_DB=gym`, `JWT_SECRET`, and `CORS_ORIGIN` set to the site's address (for example `https://demo-web-forge-gym.onrender.com`, with no trailing slash).

The `render.yaml` at the repository root describes the same service, so **New > Blueprint** creates it with these settings and only asks for `MONGODB_URI`.

Then:

1. **Atlas > Network Access:** allow the service's outbound addresses (Render shows them under the service's **Connect** menu), or allow access from anywhere.
2. **Site:** on the static site, set `VITE_API_URL` to this service's address and redeploy the site, so the address is built in.
3. Open `https://<this-service>/api/health` to confirm it is connected.

A free Render service sleeps after about 15 minutes without traffic and takes up to a minute to wake. The site pings the API when someone opens the homepage and waits with a "waking the demo server" message.

## Access and data safety

- Every record carries the gym it belongs to, and every query is scoped to the signed-in user's gym. A record from another gym returns "not found".
- Roles (owner, front desk, trainer, member) and the package are enforced here, not by hiding buttons in the site. A trainer can open only members assigned to them; a member can read only their own record.
- Demo visitors each get a private sandbox copy of the sample gym. They have no password and cannot reach a live gym. Live gym accounts sign in at `POST /api/auth/login` with bcrypt-hashed passwords, and live gyms cannot be reset.
- Input is validated with zod, responses never include password hashes or internal ids, and errors do not expose database details.
- No WhatsApp or payment provider is connected. Message and payment actions are recorded as simulated; for a live gym they answer "no provider connected".

## Layout

```
server.js               Entry file for hosting panels; "npm start" runs it
src/
  index.js, app.js      Startup and Express app
  config.js, db.js      Settings and database connection
  models/               Mongoose models
  routes/               session, members, desk, insights, coach, portal, addons
  middleware/           Auth, roles, validation, errors
  seed/demoGym.js       Sample data and sandbox lifecycle
  scripts/              clear-demo, create-gym
  test/api.test.js      API tests
```
