import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';
import { auditLog } from './utils.js';

export const simulateSos = onCall({ cors: ['*'] }, async (request) => {
  const auth = request.auth as { uid: string } | undefined;
  if (!auth?.uid) throw new HttpsError('unauthenticated', 'Sign in required');

  const adminDoc = await getFirestore().collection('admins').doc(auth.uid).get();
  if (!adminDoc.exists || adminDoc.data()?.role !== 'admin') {
    throw new HttpsError('permission-denied', 'Admin only');
  }

  const { tripId, vehicleId, deviceId, location } = request.data as {
    tripId: string;
    vehicleId: string;
    deviceId: string;
    location: { lat: number; lng: number };
  };

  const db = getFirestore();
  const settingsSnap = await db.doc('settings/global').get();
  const settings = settingsSnap.data() ?? {};
  const escalateAfter = (settings.escalationTimeoutSec ?? 30) * 1000;

  const alertRef = db.collection('sos_alerts').doc();
  await alertRef.set({
    tripId,
    vehicleId,
    deviceId,
    triggeredAt: Timestamp.now(),
    location,
    status: 'new',
    escalationDeadlineAt: Timestamp.fromMillis(Date.now() + escalateAfter),
  });

  await db.collection('trips').doc(tripId).update({
    status: 'sos_triggered',
    sosAlertId: alertRef.id,
    updatedAt: FieldValue.serverTimestamp(),
  });

  // Create a placeholder evidence doc so the dashboard can demo signed-URL playback.
  const evidenceRef = db.collection('evidence').doc();
  await evidenceRef.set({
    alertId: alertRef.id,
    type: 'video',
    storagePath: 'evidence/sample-sos-video.mp4',
    capturedAt: Timestamp.now(),
    retentionExpiry: Timestamp.fromMillis(Date.now() + 90 * 24 * 60 * 60 * 1000),
  });
  await alertRef.update({ videoRef: evidenceRef.id });

  await auditLog({
    actorId: auth.uid,
    actorType: 'human',
    action: 'sos.ingested',
    resourceType: 'sos_alert',
    resourceId: alertRef.id,
    metadata: { tripId, vehicleId, location, simulated: true },
  });

  return { alertId: alertRef.id, status: 'new' };
});
