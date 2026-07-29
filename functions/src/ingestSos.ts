import { onRequest } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';
import { createHmac, timingSafeEqual } from 'crypto';
import { auditLog } from './utils.js';

const HMAC_SECRET = process.env.DEVICE_KEY_HMAC_SECRET || 'dev-secret-change-me';

export const ingestSos = onRequest(
  { secrets: ['DEVICE_KEY_HMAC_SECRET'], cors: ['*'] },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
      return;
    }

    const { deviceId, vehicleId, tripId, location, triggeredAt, signature } = req.body ?? {};
    if (!deviceId || !vehicleId || !tripId || !location || !triggeredAt || !signature) {
      res.status(400).json({ error: 'MISSING_FIELDS' });
      return;
    }

    const canonical = `${deviceId}|${vehicleId}|${location.lat}|${location.lng}|${triggeredAt}`;
    const expected = createHmac('sha256', HMAC_SECRET).update(canonical).digest('hex');
    if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
      res.status(401).json({ error: 'BAD_SIGNATURE' });
      return;
    }

    const db = getFirestore();
    const settingsSnap = await db.doc('settings/global').get();
    const settings = settingsSnap.data() ?? {};
    const escalateAfter = (settings.escalationTimeoutSec ?? 30) * 1000;

    const alertRef = db.collection('sos_alerts').doc();
    const triggeredDate = new Date(triggeredAt);
    const deadline = Date.now() + escalateAfter;

    await alertRef.set({
      tripId,
      vehicleId,
      deviceId,
      triggeredAt: Timestamp.fromDate(triggeredDate),
      location,
      status: 'new',
      escalationDeadlineAt: Timestamp.fromMillis(deadline),
      batteryPct: req.body.batteryPct ?? null,
      signalDbm: req.body.signalDbm ?? null,
    });

    await db.collection('trips').doc(tripId).update({
      status: 'sos_triggered',
      sosAlertId: alertRef.id,
      updatedAt: FieldValue.serverTimestamp(),
    });

    await auditLog({
      actorId: deviceId,
      actorType: 'device',
      action: 'sos.ingested',
      resourceType: 'sos_alert',
      resourceId: alertRef.id,
      metadata: { tripId, vehicleId, location },
    });

    res.status(201).json({ alertId: alertRef.id, status: 'new' });
  }
);
