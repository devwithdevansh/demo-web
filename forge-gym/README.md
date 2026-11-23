# FORGE Gym

One gym product, five surfaces and one API:

| Folder | What it is | Runs on |
|---|---|---|
| [`api/`](./api) | Node.js + MongoDB API shared by everything | `http://localhost:4000` |
| [`web/website/`](./web/website) | Product website and the cinematic sample-gym demo | `http://localhost:5173` |
| [`web/saas/`](./web/saas) | SaaS console for the gym business | `http://localhost:5174` |
| [`web/admin/`](./web/admin) | Installation admin console | `http://localhost:5175` |
| [`web/member/`](./web/member) | Member PWA (pass, check-in, plans) | `http://localhost:5176` |
| [`app/`](./app) | Flutter gym app for owner, front desk, trainer and member | Android, iOS, web, Windows |
| [`legacy/`](./legacy) | Earlier single-app site, kept for reference only | — |

## Quick start

```bash
npm install --prefix api
npm install --prefix web/website
npm install --prefix web/saas
npm install --prefix web/admin
npm install --prefix web/member

npm run dev        # from the repository root: API + all four web apps
```

Without `MONGODB_URI` the API starts a private MongoDB in `api/.data/`, so no local setup is needed. Health check: `http://localhost:4000/api/health`.

### Flutter app

```bash
cd app
flutter pub get
flutter run -d chrome      # or: flutter run -d windows, flutter run -d <device>
```

The app calls `https://coral-rabbit-267767.hostingersite.com` by default. Point it at a local API with:

```bash
flutter run -d chrome --dart-define=API_BASE_URL=http://localhost:4000
```

The server address can also be changed at runtime from the app's sign-in screen and Settings page.

```bash
flutter analyze
flutter test
flutter build web --release     # or: flutter build apk --release
```

### Demo accounts

Sign in from any surface, or use the demo picker on the sign-in screen.

| Role | Name | Email | Password |
|---|---|---|---|
| Owner | Owner 1 | `owner1@gmail.com` | `forge1234` |
| Front desk | Staff 1 | `staff1@gmail.com` | `forge1234` |
| Trainers | Trainer 1, 2, 3 | `trainer1@gmail.com` ... `trainer3@gmail.com` | `forge1234` |
| Members | Member 1 - 5 | `member1@gmail.com` ... `member5@gmail.com` | `forge1234` |

The Performance demo sandbox supports all four roles. Demo accounts share `forge1234`; live gyms created through the admin console set their own password from the invite link.

## Configuration

Each web app reads `VITE_API_URL` at build time; copy its `.env.example`/`.env.production` and set the deployed API address. The API's own variables (`MONGODB_URI`, `JWT_SECRET`, `CORS_ORIGIN`, optional Razorpay/WhatsApp keys) are documented in [`api/README.md`](./api/README.md).

Deploying: [`render.yaml`](../render.yaml) defines the API service on Render. Host the four web apps as static sites — see the Hostinger/Render notes in [`api/README.md`](./api/README.md).
