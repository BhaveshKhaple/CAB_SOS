# SafeRide SOS — MVP

IoT SOS monitoring for women's safety in cabs. A React operator dashboard backed by Firebase — live alerts, GPS tracking, role-based access, and a device simulator for demos.

## What works

- Hidden SOS trigger → live alert on dashboard in < 2 s
- Operator ack / escalate / verify / false-alarm / close lifecycle
- Live GPS map of active SOS locations (Leaflet)
- Audio/video/GPS evidence via signed URLs (1-hour TTL)
- RBAC: Operator / Supervisor / Admin — all backed by Firestore rules
- Mock SMS Outbox (free-tier stand-in for Twilio)
- Client-side 10 s escalation watcher
- Device Simulator panel (all roles: start trip, cancel SOS, go offline/online; admin: trigger SOS)

## Stack

- **Frontend:** React 18 + Vite + TypeScript
- **Backend:** Firebase Auth, Firestore, Cloud Functions v2, Cloud Storage
- **Maps:** Leaflet / react-leaflet
- **Charts:** Recharts

---

## Prerequisites

| Tool | Version | Check |
|------|---------|-------|
| Node.js | 22+ | `node -v` |
| npm | 10+ | `npm -v` |

That's it for local dev. No Firebase account needed (emulators run everything locally).

---

## Quickest local run — no Firebase account needed

Firebase emulators run Auth, Firestore, Functions, and Storage entirely on your machine when the project ID starts with `demo-`.

```bash
# 1. Clone and install
git clone https://github.com/BhaveshKhaple/CAB_SOS.git
cd CAB_SOS
npm install

# 2. Create the web env file
cp web/.env.example web/.env
```

Edit `web/.env` — replace every value with the demo placeholders below (the real values only matter when connecting to a real Firebase project):

```env
VITE_FIREBASE_API_KEY=demo-api-key
VITE_FIREBASE_AUTH_DOMAIN=demo-saferide.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=demo-saferide
VITE_FIREBASE_STORAGE_BUCKET=demo-saferide.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:demo
VITE_USE_EMULATORS=true
```

```bash
# 3. Build Cloud Functions (TypeScript → JavaScript)
npm run build:functions

# 4. Start all emulators (keep this terminal running)
npx firebase emulators:start --project demo-saferide
```

You should see the Emulator UI at http://127.0.0.1:4000.

```bash
# 5. Seed demo accounts + data (run in a second terminal)
curl -X POST "http://127.0.0.1:5001/demo-saferide/us-central1/seed"
```

Expected response:
```json
{"ok":true,"logins":[{"email":"admin@saferide.demo","password":"SaferideDemo123!","role":"admin"},{"email":"supervisor@saferide.demo","password":"SaferideDemo123!","role":"supervisor"},{"email":"operator@saferide.demo","password":"SaferideDemo123!","role":"operator"}]}
```

```bash
# 6. Start the dashboard (third terminal or same terminal after seed)
npm run dev:web
```

Open **http://localhost:5173** and sign in with any demo account below.

---

## Demo accounts (after seed)

| Email | Password | Role | Access |
|-------|----------|------|--------|
| admin@saferide.demo | SaferideDemo123! | Admin | Everything + Trigger SOS |
| supervisor@saferide.demo | SaferideDemo123! | Supervisor | Dashboard + Simulator (no SOS trigger) |
| operator@saferide.demo | SaferideDemo123! | Operator | Dashboard + Simulator (no SOS trigger) |

---

## Local run with your own Firebase project

Use this path if you want data to persist across restarts or you're preparing for production.

### 1. Create the Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com) → **Add project**
2. Inside the project:
   - **Authentication** → Sign-in method → Email/Password → Enable
   - **Firestore Database** → Create database → Start in **production mode** (rules are in `firestore.rules`)
   - **Storage** → Get started (needed only for evidence files)
3. **Project settings** → Your apps → Add app → **Web** → Register → copy the config object

### 2. Configure the web env

```bash
cp web/.env.example web/.env
```

Fill in `web/.env` with your real values:

```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123...
VITE_FIREBASE_APP_ID=1:123...:web:abc...
VITE_USE_EMULATORS=true        # keep true for local dev
```

### 3. Link the Firebase CLI to your project

```bash
npx firebase login
npx firebase use --add         # pick your project, set alias to "default"
```

This creates a `.firebaserc` file in the root.

### 4. Deploy Firestore rules

```bash
npx firebase deploy --only firestore:rules,storage
```

### 5. Build functions, start emulators, seed, and run

```bash
npm run build:functions
npx firebase emulators:start        # uses your real project ID from .firebaserc

# In a second terminal:
curl -X POST "http://127.0.0.1:5001/YOUR_PROJECT_ID/us-central1/seed"

# In a third terminal:
npm run dev:web
```

Replace `YOUR_PROJECT_ID` with the value from `VITE_FIREBASE_PROJECT_ID`.

---

## Production deploy

> Requires the **Blaze (pay-as-you-go)** plan for Cloud Functions. The Spark free tier does not support Cloud Functions deployment.

```bash
# Set the HMAC secret used to verify IoT device payloads
npx firebase functions:secrets:set DEVICE_KEY_HMAC_SECRET

# Deploy everything (rules + functions + hosting)
npm run deploy
```

`npm run deploy` runs: `build:web` → `build:functions` → `firebase deploy`.

After deploy, the dashboard is at your Firebase Hosting URL. The `seed` HTTP function will be live at:
```
https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/seed
```
Call it once with `POST` to create demo accounts in production Auth + Firestore.

---

## Project structure

```
CAB_SOS/
├── functions/          Firebase Cloud Functions (TypeScript)
│   └── src/
│       ├── index.ts    Function exports
│       ├── alerts.ts   ack / escalate / verify / close
│       ├── ingestSos.ts  IoT device HTTP endpoint (HMAC-verified)
│       ├── simulator.ts  (legacy callable, unused — simulator now writes directly)
│       ├── evidence.ts  Signed URL minting
│       ├── outbox.ts   Mock SMS queue
│       └── seed.ts     Demo data seeder
├── web/                React dashboard (Vite)
│   └── src/
│       ├── pages/      Route-level pages
│       ├── components/ UI components
│       ├── hooks/      Firebase data hooks
│       └── lib/        Firebase SDK init
├── firestore.rules     Firestore security rules (RBAC)
├── storage.rules       Storage security rules
└── firebase.json       Emulator + hosting + functions config
```

---

## Common issues

| Problem | Fix |
|---------|-----|
| `firebase: command not found` | Use `npx firebase ...` — firebase-tools is in devDependencies |
| Emulator fails to start | Make sure port 5001, 8080, 9099, 9199 are free |
| Seed returns 404 | Wrong project ID in the curl URL — use the one from `VITE_FIREBASE_PROJECT_ID` |
| Login works but dashboard redirects back to login | Admin doc missing — seed hasn't been run yet |
| `Start Normal Trip` fails in Sim Log | Make sure `VITE_USE_EMULATORS=true` and emulators are running |
| Trigger SOS not visible | Only shown for `admin` role — log in with `admin@saferide.demo` |
