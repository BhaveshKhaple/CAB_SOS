# SafeRide SOS — Demo Script

## Setup

1. Seed the emulator:
   ```bash
   curl -X POST http://127.0.0.1:5001/saferide-sos-demo/us-central1/seed
   ```

2. Log in as **operator@saferide.demo** / `SaferideDemo123!`.

3. In an incognito window, log in as **admin@saferide.demo** / `SaferideDemo123!` and open the **Simulator** tab.

## Walkthrough

### 1. Normal operations
- Simulator → "Start Normal Trip". A trip document is created in Firestore.
- Dashboard shows 0 alerts, devices online = 1.

### 2. SOS trigger
- Simulator → "Trigger SOS". The HTTPS Cloud Function `ingestSos` is called with an HMAC-signed payload.
- Within 2 seconds, a red alert appears in the Live Alerts feed and on the map.
- Operator clicks the alert, sees vehicle/driver/location details.

### 3. Operator workflow
- Operator clicks **Acknowledge**. Status changes to `acknowledged`.
- Operator clicks **Notify Contacts**. A message appears in the Mock SMS Outbox.
- Operator clicks **Mark Verified**. Status changes to `verified`.
- Operator enters resolution notes and clicks **Resolve**. Status changes to `closed` and an incident is created.

### 4. Escalation
- Start a new trip and trigger SOS. Wait 30 seconds without acknowledging.
- The client-side escalation watcher automatically moves status to `escalated`.
- Supervisor/Admin can then click **Notify Police**.

### 5. False alarm
- Trigger SOS, then click **False Alarm** and provide a reason.
- The alert is closed as `false_alarm`.

## What to tell Amey

> "Every operator action is logged. Every evidence access is signed-URL'd with a 1-hour TTL. RBAC is enforced at the database layer, not in scattered route handlers. The security model is the first-class artifact."

> "Built on Google Firebase, fully functional on the free tier during validation. Production upgrades — real SMS via Twilio, push notifications, scheduled escalation timers — are feature-flagged and ship the day billing enables them. No rewrite."
