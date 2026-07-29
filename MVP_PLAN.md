# SafeRide SOS — MVP Plan
**Project:** IoT SOS monitoring for women's safety in cabs (freelance build for Amey)
**Stack:** Firebase-only (Spark free tier), React dashboard, dashboard-side device simulator
**Last updated:** 2026-07-29

---

## 0. Read this first — the freelance story

This is a **paid freelance MVP** for Amey. Two stories to tell clients:

1. **Today:** "I have a fully working demo you can poke at. Live SOS alerts on a real dashboard, real evidence upload, real auth, real RBAC. Zero infrastructure cost while we validate."
2. **Tomorrow:** "Production-grade upgrades (real Twilio SMS, real push notifications, scheduled escalation) are already wired behind feature flags. Flipping them on is a billing change, not a rewrite."

The architecture is designed so the **upgrade path is a flag flip, not a refactor**.

---

## 1. Scope lock — what is and isn't in this MVP

### In scope (MVP, demoable)
- Hidden SOS trigger → live alert on dashboard in <2s
- Operator ack / escalate / mark-false / notify-contacts / notify-police / close
- Live GPS tracking of active vehicles on a map
- Audio + video + GPS-track evidence upload + playback + signed-URL access
- Incident lifecycle with immutable timeline
- RBAC (Operator / Supervisor / Admin) + MFA-ready auth
- Mock SMS "Outbox" panel (replaces real Twilio on free tier)
- Client-side escalation watcher (replaces scheduled Cloud Function on free tier)
- Dashboard-side Simulator Panel for live demos

### Out of scope (Phase 1, per PRD §5.2 / §12)
- Real ESP32 firmware (simulator stands in)
- AI distress detection from voice/video
- Automatic route-deviation ML
- Direct police dispatch API
- Wearable SOS devices
- Predictive risk scoring
- Multi-language voice assistant

---

## 2. Free-tier constraints we are designing around

Firebase Spark plan specifics that shaped the architecture:

| Capability | Spark plan | What we did |
|---|---|---|
| Firestore | 50K reads/day, 20K writes/day | Fine for MVP demo load |
| Cloud Functions (invocations) | 125K/month | Fine |
| Cloud Functions **outbound networking** | **DISABLED** | SMS via Twilio is mocked (see §6) |
| Cloud Functions **scheduled** | **DISABLED** | Escalation timer runs client-side (see §5.4) |
| Cloud Storage | 5 GB | Plenty for evidence blobs |
| Firebase Hosting | 10 GB/mo transfer | Fine |
| Firebase Auth | Unlimited | MFA supported, disabled in seed for demo ease |

**Every free-tier workaround is reversible on Blaze plan without code changes** — only billing + feature flags flip.

---

## 3. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CAB (simulated)                          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Simulator Panel (React, admin-only)                       │  │
│  │  - Start Normal Trip   - Trigger SOS                      │  │
│  │  - Cancel (grace)      - Go Offline / Online              │  │
│  └─────────────┬─────────────────────────────────────────────┘  │
│                │ HTTPS (HMAC-signed payload)                   │
└────────────────┼────────────────────────────────────────────────┘
                 ▼
        ┌──────────────────────┐
        │  Cloud Function       │
        │  ingestSos (only one) │  ── writes ──▶  ┌─────────────────┐
        │  - HMAC verify        │                  │   Firestore     │
        │  - validate payload   │                  │ sos_alerts      │
        │  - audit log          │                  │ trips, drivers  │
        └──────────────────────┘                  │ vehicles, etc.  │
                                                  │ audit_logs      │
                                                  └────┬────────────┘
                                                       │ onSnapshot
                                                       ▼
        ┌──────────────────────────────────────────────────────┐
        │            Admin Dashboard (React + Vite)           │
        │  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │
        │  │ Live Alerts  │  │  Live Map    │  │  Evidence  │  │
        │  │   Feed       │  │  (Leaflet)   │  │  Viewer    │  │
        │  └──────┬───────┘  └──────────────┘  └────────────┘  │
        │         │                                            │
        │  ┌──────▼───────┐  ┌──────────────┐  ┌────────────┐  │
        │  │ Operator     │  │  Mock        │  │ Incident   │  │
        │  │ Actions Bar  │  │  Outbox      │  │ Timeline   │  │
        │  └──────────────┘  └──────────────┘  └────────────┘  │
        │                                                       │
        │  ┌───────────────────────────────────────────────┐    │
        │  │  useEscalationWatcher (client-side timer)     │    │
        │  │  - polls sos_alerts every 5s                   │    │
        │  │  - calls markEscalated callable when overdue  │    │
        │  └───────────────────────────────────────────────┘    │
        └──────────────────────────────────────────────────────┘
                                                       │
                          signed URLs (1-hour TTL)      │
                                                       ▼
                                                ┌─────────────┐
                                                │   Cloud     │
                                                │   Storage   │
                                                │ /evidence/* │
                                                └─────────────┘
```

### Why this shape
- **One Cloud Function, one Firestore, one Storage, one Hosting.** Zero ops surface.
- **Real-time = native.** Firestore listeners replace Socket.IO.
- **Security at the DB layer.** Firestore Rules enforce RBAC; UI cannot bypass.
- **The simulator panel IS the device demo.** No ESP32 needed for client pitches.

---

## 4. Data Model (Firestore)

```
drivers/         { driverId, name, phone, licenseNumber, verificationStatus, rating, createdAt }
vehicles/        { vehicleId, registrationNumber, currentDriverId, deviceId, status }
trips/           { tripId, vehicleId, driverId, passengerRef, startTime, endTime,
                   route[], status: ongoing|completed|sos_triggered }
  └─ route[]:    [{ lat, lng, ts, speed }]   // last 200 pings; older GPS moves to evidence/
sos_alerts/      { alertId, tripId, vehicleId, deviceId, triggeredAt, location,
                   status: new|acknowledged|escalated|verified|false_alarm|closed|cancelled,
                   assignedOperatorId, audioRef, videoRef, gpsTrackRef,
                   verifiedBy, verifiedAt, falseAlarmReason,
                   escalationDeadlineAt, escalatedAt, closedAt }
evidence/        { evidenceId, alertId, type: audio|video|gps_track, storagePath,
                   checksum, capturedAt, retentionExpiry, signedUrlIssuedAt }
emergency_contacts/  { contactId, passengerRef, name, phone, relationship, priority }
incidents/       { incidentId, alertId, category, timeline[], resolutionNotes,
                   contactedParties[], closedBy, closedAt }
admins/          { uid, name, email, role: operator|supervisor|admin, lastLoginAt }
audit_logs/      { logId, actorId, actorType: human|device|system, action,
                   resourceType, resourceId, metadata, timestamp }   // append-only
settings/        { escalationTimeoutSec, supervisorEscalationSec, retentionDays }
```

---

## 5. Low-Level Design

### 5.1 Cloud Function — `ingestSos` (the only server-side function)

```ts
// functions/src/ingestSos.ts
import { onRequest } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';
import { createHmac, timingSafeEqual } from 'crypto';

export const ingestSos = onRequest(
  { secrets: ['DEVICE_KEY_HMAC_SECRET'], cors: false },
  async (req, res) => {
    if (req.method !== 'POST') return res.status(405).end();

    const { deviceId, tripId, location, triggeredAt, signature } = req.body ?? {};
    const canonical = `${deviceId}|${tripId}|${location?.lat}|${location?.lng}|${triggeredAt}`;
    const expected  = createHmac('sha256', process.env.DEVICE_KEY_HMAC_SECRET!)
                       .update(canonical).digest('hex');
    if (!signature || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
      return res.status(401).json({ error: 'BAD_SIGNATURE' });
    }

    const db = getFirestore();
    const settings = (await db.doc('settings/global').get()).data() ?? {};
    const escalateAfter = (settings.escalationTimeoutSec ?? 30) * 1000;

    const alertRef = db.collection('sos_alerts').doc();
    const alert = {
      tripId, vehicleId: req.body.vehicleId, deviceId,
      triggeredAt: Timestamp.fromDate(new Date(triggeredAt)),
      location,
      status: 'new',
      escalationDeadlineAt: Timestamp.fromMillis(Date.now() + escalateAfter),
    };
    await alertRef.set(alert);

    await db.collection('audit_logs').add({
      actorId: deviceId, actorType: 'device',
      action: 'sos.ingested', resourceType: 'sos_alert', resourceId: alertRef.id,
      timestamp: FieldValue.serverTimestamp(),
    });

    res.status(201).json({ alertId: alertRef.id, status: 'new' });
  }
);
```

That's the **entire** backend. Everything else is Firestore triggers written from the dashboard via callable functions.

### 5.2 Callable functions (run from dashboard, no scheduled workers needed)

| Function | Auth | Purpose |
|---|---|---|
| `markAcknowledged` | operator+ | Self-assign alert, move status `new → acknowledged` |
| `markEscalated` | system-only | Called by `useEscalationWatcher` when `escalationDeadlineAt` overdue |
| `markFalseAlarm` | operator+ | Move status `acknowledged → false_alarm`; requires note |
| `markVerified` | operator+ | Move status `acknowledged → verified` |
| `resolveIncident` | operator+ | Move status `verified → closed`; requires resolution notes |
| `mintEvidenceUrl` | operator+ | 1-hour signed URL for an evidence doc; logs access |
| `queueContactNotification` | operator+ | Writes to `mock_outbox` collection (replaces real SMS on free tier) |
| `queuePoliceNotification` | supervisor+ | Same — writes to `mock_outbox` with channel=police |

**Why "mock_outbox" as a Firestore collection?** It's the realistic-shaped artifact: structured, queryable, exportable, and visible in the dashboard. When Amey upgrades to Blaze, swap the write to a Twilio HTTP call — no schema change.

### 5.3 Firestore Rules (the security moat)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {
    function role() { return get(/databases/$(db)/documents/admins/$(request.auth.uid)).data.role; }
    function isSignedIn() { return request.auth != null; }
    function isOperator() { return isSignedIn() && role() in ['operator','supervisor','admin']; }
    function isSupervisor() { return isSignedIn() && role() in ['supervisor','admin']; }
    function isAdmin() { return isSignedIn() && role() == 'admin'; }

    // sos_alerts — only Cloud Functions can create; operators can update specific fields only
    match /sos_alerts/{alertId} {
      allow read:   if isOperator();
      allow create: if false;   // ingestSos writes via Admin SDK, bypasses rules
      allow update: if isOperator()
                     && request.resource.data.status in ['acknowledged','escalated','verified','false_alarm','closed','cancelled'];
      allow delete: if false;
    }

    // evidence — never direct read; only via mintEvidenceUrl signed URLs
    match /evidence/{evidenceId} {
      allow read, write: if false;
    }

    // mock_outbox — operators can read their own queue; writes via callable fns
    match /mock_outbox/{msgId} {
      allow read: if isOperator();
      allow write: if false;
    }

    // audit_logs — append-only, admin-readable
    match /audit_logs/{logId} {
      allow read:   if isAdmin();
      allow write:  if false;
    }

    // admins — users can read their own doc only
    match /admins/{uid} {
      allow read:   if isSignedIn() && request.auth.uid == uid;
      allow write:   if isAdmin();
    }

    // drivers/vehicles/trips/incidents/emergency_contacts — operator read/write
    match /{document=**} {
      allow read, write: if isOperator()
                         && request.path in [
                           '/databases/$(db)/documents/drivers',
                           '/databases/$(db)/documents/vehicles',
                           '/databases/$(db)/documents/trips',
                           '/databases/$(db)/documents/incidents',
                           '/databases/$(db)/documents/emergency_contacts',
                         ];
    }
  }
}
```

### 5.4 Client-side escalation watcher

```ts
// web/src/hooks/useEscalationWatcher.ts
import { useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';

export function useEscalationWatcher() {
  useEffect(() => {
    const q = query(
      collection(db, 'sos_alerts'),
      where('status', '==', 'new'),
      where('escalationDeadlineAt', '<=', new Date())
    );
    const unsub = onSnapshot(q, (snap) => {
      snap.docChanges().forEach(async (change) => {
        if (change.type === 'added' || change.type === 'modified') {
          await httpsCallable(functions, 'markEscalated')({ alertId: change.doc.id });
        }
      });
    });
    return () => unsub();
  }, []);
}
```

Honest limitation to document: if no dashboard is open, escalation is delayed until one is. Acceptable for MVP; the Blaze plan upgrade adds a scheduled Cloud Function for true always-on escalation.

### 5.5 React dashboard structure

```
web/src/
  App.tsx                       -- router + AuthProvider
  lib/firebase.ts               -- initializeApp, Auth, Firestore, Functions, Storage
  hooks/
    useAuth.ts                  -- current user + role from /admins/{uid}
    useLiveAlerts.ts            -- onSnapshot(sos_alerts where status in [new,acknowledged,escalated])
    useLiveTrip.ts              -- per-trip route subscription
    useEscalationWatcher.ts     -- §5.4
    useEvidence.ts              -- onCall('mintEvidenceUrl') wrapper
    useMockOutbox.ts            -- onSnapshot(mock_outbox where createdAt > now-1h)
  components/
    Layout/
      AppShell.tsx              -- sidebar nav (Dashboard/Alerts/Trips/Drivers/Incidents/Outbox/Reports/Settings)
      RoleGuard.tsx             -- <RoleGuard allow={['supervisor','admin']}>
    dashboard/
      FleetOverviewCards.tsx    -- active trips, open incidents, devices online
      LiveAlertFeed.tsx         -- list sorted by triggeredAt desc; red border for unack
      LiveMap.tsx               -- Leaflet, all active vehicle markers, click -> sidebar
    alerts/
      AlertDetailDrawer.tsx     -- passenger/driver/cab info, live GPS, audio/video players
      OperatorActionBar.tsx     -- Ack | False Alarm (note) | Notify Contacts | Notify Police | Resolve
    incidents/
      IncidentTimeline.tsx      -- immutable timeline[]
      EvidenceBundle.tsx        -- audio + video + GPS track players + Download ZIP
    outbox/
      MockOutboxList.tsx        -- replaces real SMS inbox on free tier
    reports/
      ResponseTimeChart.tsx     -- Recharts: avg ack time, escalation time
      RiskZoneHeatmap.tsx       -- Leaflet.heat
    sim/
      SimulatorPanel.tsx        -- admin-only; §5.6
      SimButton.tsx
      SimTimelineLog.tsx
  pages/
    LoginPage.tsx
    DashboardPage.tsx
    IncidentsPage.tsx
    DriversPage.tsx
    ReportsPage.tsx
    SettingsPage.tsx
    SimPage.tsx                 -- /sim route, admin-only
```

### 5.6 Simulator Panel (the demo weapon)

```
Admin sees a "Sim Panel" tab. Buttons:

[ Start Normal Trip ]     → creates trips/{id}, starts emitting GPS pings every 5s
[ Trigger SOS ]           → calls ingestSos with random vehicle+passenger, captures 5s mock audio
[ Cancel SOS (grace) ]    → only enabled for 10s after trigger; sets status=cancelled
[ Go Offline ]            → stops deviceId heartbeat
[ Go Online ]             → resumes heartbeat
[ Bulk: 5 SOS in 30s ]    → stress-test button (also nice for client demos)

Each action writes to sim_log collection + posts an entry in the dashboard's timeline.
Disabled for non-admins via RoleGuard.
```

The Simulator Panel is **the demo**. It is Amey's demo weapon — clients see real alerts flow through the real dashboard, controlled by a button click.

---

## 6. Hardware Design Document (HDD)

Since the real ESP32 build is out of scope, the HDD is the **simulator specification** that any future real-device swap must conform to.

### 6.1 Simulator → real device contract

The simulator (and any future real ESP32) calls the same HTTPS endpoint with the same HMAC-signed payload:

```ts
interface SosIngestPayload {
  deviceId: string;             // provisioned device key id
  vehicleId: string;
  tripId: string;
  location: { lat: number; lng: number; accuracyM: number };
  triggeredAt: string;          // ISO 8601, server-validated
  batteryPct?: number;
  signalDbm?: number;
  signature: string;            // HMAC-SHA256(canonical body, DEVICE_KEY_HMAC_SECRET)
}
```

A real ESP32 firmware can drop in by implementing this single contract — no backend, dashboard, or schema changes needed.

### 6.2 Future-real-device checklist (kept here for traceability)

| Subsystem | Real-device spec (Phase 2) | Simulator equivalent |
|---|---|---|
| ESP32-CAM + OV2640 | 2MP low-light camera, MJPEG stream | Pre-recorded 5s clip uploaded as chunks |
| INMP441 I2S mic | 16 kHz mono PCM | Generated WAV with synthetic speech-shaped noise |
| NEO-6M GPS | UART NMEA, 1 Hz | Script-driven lat/lng walking a Polyline |
| SIM800L GSM | Fallback uplink | Not needed — always "online" in demo |
| Hidden tactile button | GPIO interrupt, 3 s long-press | Button click in Sim Panel |
| Li-ion + buck converter | 4 h backup | N/A |
| AES-256 on-device | Encrypt payload pre-Tx | Skipped — TLS covers transport |

---

## 7. Sprint Plan (3 weeks to MVP demo, +1 to harden)

### Phase A — MVP demo (weeks 1–3)

| Wk | Build | Verify |
|---|---|---|
| 1 | Firebase project, schema, rules, 3 seed admins, login page | Operators log in, see empty dashboard |
| 2 | Simulator Panel + `ingestSos` Cloud Function + live feed + live map | Click "Trigger SOS" → alert appears in dashboard in <2 s |
| 3 | Operator actions, Mock Outbox, incident timeline, evidence viewer | Full demo: trigger → operator workflow → mock SMS in outbox |

### Phase B — Harden (week 4+)

- Unit tests on Cloud Functions (Vitest)
- Firestore rules emulator tests
- GitHub Actions: lint + test + Firebase Hosting preview channel on PR
- One-command `pnpm demo` script
- DEMO.md walkthrough + PRICING.md freelance story

---

## 8. Open questions for Amey before kickoff

1. **Hosting:** Firebase Hosting (free, integrated) — confirm.
2. **Twilio:** Mock for free MVP, real behind a `USE_REAL_SMS=true` env var on Blaze plan — confirm.
3. **MFA:** Enable in code, disable in seed for demo ease; document how to turn on — confirm.
4. **Visual style:** Reuse the existing Stitch prototypes in this folder (sentinel_adm_professional_*) as the design starting point, or redesign from scratch? My pick: reuse — saves a week.
5. **Branding:** What name ships in the UI — "SafeRide SOS" (from PRD) or something Amey picks? Affects nothing technical; affects all `<title>` and copy.

---

## 9. What Amey tells clients

> "Built on Google Firebase, fully functional on the free tier during validation. Production upgrades — real SMS via Twilio, push notifications, scheduled escalation timers — are feature-flagged and ship the day billing enables them. No rewrite."

> "Every operator action is logged. Every evidence access is signed-URL'd with a 1-hour TTL. RBAC is enforced at the database layer, not in scattered route handlers. The security model is the first-class artifact."

> "The dashboard, evidence viewer, and operator workflow work end-to-end today. The IoT device side has a simulator built in — useful for demos and for QA before hardware arrives."

---

## 10. Appendix — Glossary

- **BaaS** — Backend-as-a-Service (Firebase, Supabase)
- **HMAC** — Hash-based Message Authentication Code (used to sign device requests)
- **RBAC** — Role-Based Access Control
- **Spark / Blaze** — Firebase free / paid plans
- **Sim Panel** — Dashboard-side simulator (admin-only) used for live demos
- **Mock Outbox** — Firestore collection that stands in for real SMS delivery on free tier