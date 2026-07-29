# SafeRide SOS — Freelance Pricing & Upgrade Story

## Current state: $0 infrastructure cost

The MVP runs entirely on the Firebase Spark (free) plan:

| Capability | Spark limit | MVP usage |
|---|---|---|
| Firestore reads/writes | 50K/20K per day | <1K/day in demo |
| Cloud Functions invocations | 125K/month | <10K/month in demo |
| Cloud Storage | 5 GB | <100 MB demo evidence |
| Firebase Hosting | 10 GB/month transfer | <1 GB demo |
| Firebase Auth | Unlimited | 3 demo users |

## What is mocked on the free tier

1. **SMS / Twilio** — the `mock_outbox` collection stores messages instead of sending them.
2. **Scheduled escalation** — a client-side watcher escalates overdue alerts while the dashboard is open.
3. **Real IoT device** — the admin-only Simulator Panel generates SOS events.

## Production upgrade path (Blaze plan + feature flags)

| Upgrade | Effort | Cost driver |
|---|---|---|
| Real Twilio SMS | Swap `queueContactNotification`/`queuePoliceNotification` to call Twilio API; set `USE_REAL_SMS=true` | Twilio per-message |
| Scheduled escalation | Add a scheduled Cloud Function that calls `markEscalated` every minute | Function invocations |
| Push notifications | Add FCM to simulator/real device | FCM free tier generous |
| Real ESP32 device | Implement the HMAC-signed `ingestSos` contract from `HDD.md` | Hardware cost |
| MFA enforcement | Enable Firebase Auth MFA; remove demo seed accounts | SMS/email 2FA rates |

## Freelance positioning

> "The MVP is deliberately built to validate the workflow with Amey's stakeholders before any billing commitment. Every production upgrade is a feature flag or billing change, not a rewrite."

## Suggested commercial structure

- **MVP build (fixed):** scope as agreed
- **Production hardening (fixed or T&M):** tests, CI/CD, real SMS, scheduled escalation
- **Ongoing retainer:** monitoring, incident response, feature additions
