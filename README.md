# SafeRide SOS — MVP

IoT SOS monitoring for women's safety in cabs. Built on Firebase Spark (free tier) with a React operator dashboard and an admin-only device simulator.

## What works today

- Hidden SOS trigger → live alert on dashboard in <2s
- Operator ack / escalate / mark-false / notify-contacts / notify-police / close
- Live GPS tracking of active vehicles on a map
- Audio/video/GPS evidence via signed URLs (1-hour TTL)
- Incident lifecycle with immutable timeline
- RBAC (Operator / Supervisor / Admin) + Firebase Auth
- Mock SMS Outbox (free-tier Twilio stand-in)
- Client-side escalation watcher
- Dashboard-side Simulator Panel for live demos

## Stack

- Firebase Auth, Firestore, Cloud Storage, Cloud Functions v2, Hosting
- React + Vite + TypeScript
- Leaflet for maps, Recharts for reports

## Quick start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a Firebase project and copy your config into `web/.env` (see `web/.env.example`).

3. Start emulators:
   ```bash
   npm run build:functions
   npx firebase emulators:start
   ```

4. Seed demo data:
   ```bash
   curl -X POST http://127.0.0.1:5001/saferide-sos-demo/us-central1/seed
   ```

5. In another terminal, run the dashboard:
   ```bash
   npm run dev:web
   ```

6. Open http://localhost:5173 and sign in with one of the seeded demo accounts.

## Demo accounts (after seed)

| Email | Password | Role |
|---|---|---|
| admin@saferide.demo | SaferideDemo123! | admin |
| supervisor@saferide.demo | SaferideDemo123! | supervisor |
| operator@saferide.demo | SaferideDemo123! | operator |

## Deploy

```bash
npm run deploy
```

Make sure to set the `DEVICE_KEY_HMAC_SECRET` secret in Cloud Functions before going live.

## Upgrade path

- Real Twilio SMS: set `USE_REAL_SMS=true` in settings and replace the outbox write with a Twilio HTTP call.
- Always-on escalation: add a scheduled Cloud Function on Blaze plan.
- Push notifications: add Firebase Cloud Messaging.

## Project structure

```
functions/      Firebase Cloud Functions (TypeScript)
web/            React dashboard (Vite)
firebase.json   Firebase project config
firestore.rules Security rules
storage.rules   Storage rules
```
