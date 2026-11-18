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
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | Optional | Razorpay **test** keys for payment links. See "Payments and WhatsApp" |
| `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_DEMO_RECIPIENTS` | Optional | WhatsApp Cloud API sending. See "Payments and WhatsApp" |
| `WHATSAPP_APP_SECRET`, `WHATSAPP_VERIFY_TOKEN` | Optional | WhatsApp delivery updates by webhook |
| `WHATSAPP_APP_ID`, `WHATSAPP_CONFIG_ID`, `ADMIN_KEY` | Optional | Connecting your own WhatsApp Business app number at `/admin/whatsapp` |
| `WHATSAPP_DAILY_LIMIT` | Optional | Real messages per day. Defaults to `50` |
| `PORT` | Optional | Defaults to `4000`. Render sets this itself |
| `SESSION_HOURS` | Optional | Session length. Defaults to `12` |
| `DEMO_SANDBOX_TTL_HOURS` | Optional | How long an unused demo sandbox is kept. Defaults to `24` |
| `DEMO_MAX_SANDBOXES` | Optional | Ceiling on stored sandboxes. Defaults to `200` |

With `NODE_ENV=production` the API refuses to start unless `MONGODB_URI` and `JWT_SECRET` are set.

Always keep `MONGODB_DB` set. On a cluster shared with other projects, a connection without a database name falls through to `test`.

## Payments and WhatsApp

Both are optional. With nothing set, payment links open a practice page and messages are logged as simulated. The startup log says which mode each is in.

### Payments: Razorpay test mode

Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` to a pair of **test** keys (Razorpay Dashboard, Test Mode, API Keys). Then a payment link opens Razorpay's own checkout in test mode: pay with UPI ID `success@razorpay` or a Razorpay test card. The server creates a Razorpay order, checks the signature Razorpay returns, and only then records the payment (marked "Test payment") and lowers the member's dues.

- No real money moves in test mode.
- A **live** key is ignored by the demo on purpose; payments then stay simulated.
- The key secret is used only on the server. The pay page receives the key ID, which is public.

### WhatsApp: Meta WhatsApp Cloud API

Set `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID` and `WHATSAPP_DEMO_RECIPIENTS` (your own phone, with country code). Then "Send on WhatsApp" in the demo really sends the drafted reminder.

- **Demo messages go only to the phones in `WHATSAPP_DEMO_RECIPIENTS`**, never to the sample members or to any number a visitor types in.
- WhatsApp delivers free-text messages only to someone who messaged your business number in the last 24 hours. Before a demo, send "hi" from the demo phone to the WhatsApp number. Messages outside that window need a Meta-approved template, which is not built yet.
- Meta's test number can only message phones you have added and verified in the app dashboard (up to five).
- A token copied from the API Setup page expires within a day. For a lasting one, create a System User in Meta Business Settings and generate a token with the `whatsapp_business_messaging` and `whatsapp_business_management` permissions.

### Sending from your own WhatsApp Business app number

A number that is already on the WhatsApp Business app can be connected without leaving the app (Meta calls this "coexistence"). It is done through Meta's own sign-up window, opened from the site's admin page.

**Settings:** `WHATSAPP_APP_ID`, `WHATSAPP_APP_SECRET`, `WHATSAPP_CONFIG_ID`, `ADMIN_KEY` (16+ characters), plus `WHATSAPP_DEMO_RECIPIENTS` and the webhook settings below.

**In the Meta app** (one time):

1. Enrol the app as a Tech Provider (Dashboard, "Become a Tech Provider").
2. Facebook Login for Business, Settings: turn on Client OAuth login, Web OAuth login, Enforce HTTPS, Embedded Browser OAuth Login, Use Strict Mode for redirect URIs and Login with the JavaScript SDK. Add the site's address to "Allowed Domains for the JavaScript SDK" and to "Valid OAuth Redirect URIs".
3. Facebook Login for Business, Configurations: create a configuration from the "WhatsApp Embedded Signup" template with the `whatsapp_business_management` and `whatsapp_business_messaging` permissions. Its id is `WHATSAPP_CONFIG_ID`.
4. Webhook fields to subscribe: `messages`, `account_update`, `history`, `smb_app_state_sync`, `smb_message_echoes`.

**Then** open `https://<site-address>/admin/whatsapp`, enter the admin key, and press "Connect WhatsApp number". The server exchanges Meta's code (valid for 30 seconds), subscribes to the account, and requests the contact and chat-history sync that Meta requires within 24 hours.

Meta's window returns to the site's root address (`https://<site-address>/`) with the code, and Meta only accepts the code together with that exact address. So that address, with the trailing slash, must be in "Valid OAuth Redirect URIs", and `CORS_ORIGIN` must be the same site address. If either differs, the connect step fails with "Error validating verification code".

What to know:

- The access token Meta issues is stored encrypted and never returned by the API. It is tied to `JWT_SECRET`: changing that secret means connecting the number again.
- Meta sends the number's chat history and contacts as part of the required sync. FORGE acknowledges them and does not store them.
- If the owner disconnects in the app (Settings, Account, Business Platform), FORGE marks the number disconnected and falls back to the test sender or to simulation.
- While the Meta app is unpublished, only people with a role on the app can complete the sign-up. Onboarding other businesses needs Meta's business verification and App Review.
- A connected number is used as the demo's sender. Per-gym connection for live gyms uses the same server code and comes with gym sign-in.
- The 24-hour rule still applies: free-text reminders reach only people who messaged the number in the last 24 hours. Approved templates are not built yet.

**Delivery updates.** WhatsApp confirms delivery through a webhook. Set `WHATSAPP_APP_SECRET` (Meta app, App settings, Basic) and `WHATSAPP_VERIFY_TOKEN` (any phrase you choose). Then in the Meta app, under WhatsApp, Configuration:

| Field | Value |
|---|---|
| Callback URL | `https://<backend-address>/api/webhooks/whatsapp` |
| Verify token | the same phrase as `WHATSAPP_VERIFY_TOKEN` |
| Webhook fields | subscribe to `messages` |

Without the webhook, messages still send; the demo just says it cannot confirm delivery.

Provider charges (WhatsApp conversations, gateway fees on live payments) are billed by the provider and are separate from FORGE.

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
- WhatsApp and payment providers are wired to demo sandboxes only. Without keys, those actions are recorded as simulated. A live gym gets "no provider connected", because it needs its own WhatsApp number and payment account.

## Layout

```
server.js               Entry file for hosting panels; "npm start" runs it
src/
  index.js, app.js      Startup and Express app
  config.js, db.js      Settings and database connection
  models/               Mongoose models
  routes/               session, members, desk, insights, coach, portal, addons, webhooks, admin
  lib/providers.js      Razorpay and WhatsApp Cloud API clients
  lib/secretbox.js      Encryption for stored provider tokens
  middleware/           Auth, roles, validation, errors
  seed/demoGym.js       Sample data and sandbox lifecycle
  scripts/              clear-demo, create-gym
  test/                 API tests, and provider tests that use stand-ins (no keys needed)
```
