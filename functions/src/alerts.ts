import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { auditLog } from './utils.js';
import type { AlertStatus } from './types.js';

const db = () => getFirestore();

function requireAuth(auth: unknown) {
  if (!auth || !(auth as { uid: string }).uid) {
    throw new HttpsError('unauthenticated', 'Sign in required');
  }
  return (auth as { uid: string }).uid;
}

async function assertRole(uid: string, allowed: string[]) {
  const adminDoc = await db().collection('admins').doc(uid).get();
  if (!adminDoc.exists) throw new HttpsError('permission-denied', 'Not an admin');
  const role = adminDoc.data()?.role as string;
  if (!allowed.includes(role)) throw new HttpsError('permission-denied', 'Insufficient role');
  return role;
}

async function getAlert(alertId: string) {
  const alert = await db().collection('sos_alerts').doc(alertId).get();
  if (!alert.exists) throw new HttpsError('not-found', 'Alert not found');
  return alert;
}

export const markAcknowledged = onCall({ cors: ['*'] }, async (request) => {
  const uid = requireAuth(request.auth);
  await assertRole(uid, ['operator', 'supervisor', 'admin']);
  const { alertId } = request.data as { alertId: string };
  const alert = await getAlert(alertId);
  const data = alert.data() as { status: AlertStatus };
  if (data.status !== 'new' && data.status !== 'escalated') {
    throw new HttpsError('failed-precondition', `Cannot ack from ${data.status}`);
  }

  await alert.ref.update({
    status: 'acknowledged',
    assignedOperatorId: uid,
    acknowledgedAt: FieldValue.serverTimestamp(),
  });
  await auditLog({ actorId: uid, actorType: 'human', action: 'sos.acknowledged', resourceType: 'sos_alert', resourceId: alertId });
  return { ok: true, status: 'acknowledged' };
});

export const markEscalated = onCall({ cors: ['*'] }, async (request) => {
  const { alertId } = request.data as { alertId: string };
  const alert = await getAlert(alertId);
  const data = alert.data() as { status: AlertStatus };
  if (!['new', 'acknowledged'].includes(data.status)) return { ok: false, reason: 'already_handled' };

  await alert.ref.update({
    status: 'escalated',
    escalatedAt: FieldValue.serverTimestamp(),
  });
  await auditLog({ actorId: 'system', actorType: 'system', action: 'sos.escalated', resourceType: 'sos_alert', resourceId: alertId });
  return { ok: true, status: 'escalated' };
});

export const markVerified = onCall({ cors: ['*'] }, async (request) => {
  const uid = requireAuth(request.auth);
  await assertRole(uid, ['operator', 'supervisor', 'admin']);
  const { alertId } = request.data as { alertId: string };
  const alert = await getAlert(alertId);
  const data = alert.data() as { status: AlertStatus };
  if (data.status !== 'acknowledged') throw new HttpsError('failed-precondition', 'Must ack first');

  await alert.ref.update({
    status: 'verified',
    verifiedBy: uid,
    verifiedAt: FieldValue.serverTimestamp(),
  });
  await auditLog({ actorId: uid, actorType: 'human', action: 'sos.verified', resourceType: 'sos_alert', resourceId: alertId });
  return { ok: true, status: 'verified' };
});

export const markFalseAlarm = onCall({ cors: ['*'] }, async (request) => {
  const uid = requireAuth(request.auth);
  await assertRole(uid, ['operator', 'supervisor', 'admin']);
  const { alertId, reason } = request.data as { alertId: string; reason: string };
  if (!reason) throw new HttpsError('invalid-argument', 'Reason required');
  const alert = await getAlert(alertId);
  const data = alert.data() as { status: AlertStatus };
  if (!['new', 'acknowledged', 'escalated'].includes(data.status)) {
    throw new HttpsError('failed-precondition', `Cannot mark false from ${data.status}`);
  }

  await alert.ref.update({
    status: 'false_alarm',
    falseAlarmReason: reason,
    closedBy: uid,
    closedAt: FieldValue.serverTimestamp(),
  });
  await auditLog({ actorId: uid, actorType: 'human', action: 'sos.false_alarm', resourceType: 'sos_alert', resourceId: alertId, metadata: { reason } });
  return { ok: true, status: 'false_alarm' };
});

export const resolveIncident = onCall({ cors: ['*'] }, async (request) => {
  const uid = requireAuth(request.auth);
  await assertRole(uid, ['operator', 'supervisor', 'admin']);
  const { alertId, notes } = request.data as { alertId: string; notes: string };
  if (!notes) throw new HttpsError('invalid-argument', 'Resolution notes required');
  const alert = await getAlert(alertId);
  const data = alert.data() as { status: AlertStatus };
  if (data.status !== 'verified') throw new HttpsError('failed-precondition', 'Must verify first');

  await alert.ref.update({
    status: 'closed',
    resolutionNotes: notes,
    closedBy: uid,
    closedAt: FieldValue.serverTimestamp(),
  });
  await auditLog({ actorId: uid, actorType: 'human', action: 'sos.closed', resourceType: 'sos_alert', resourceId: alertId, metadata: { notes } });

  const incidentRef = db().collection('incidents').doc();
  await incidentRef.set({
    alertId,
    category: 'sos',
    resolutionNotes: notes,
    closedBy: uid,
    closedAt: FieldValue.serverTimestamp(),
    timeline: [
      { at: FieldValue.serverTimestamp(), note: 'SOS triggered', actorType: 'device' },
      { at: FieldValue.serverTimestamp(), note: 'Incident resolved', actorType: 'human', actorId: uid },
    ],
  });
  return { ok: true, status: 'closed', incidentId: incidentRef.id };
});
