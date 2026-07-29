import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { auditLog } from './utils.js';

async function requireOperator(auth: unknown) {
  if (!auth || !(auth as { uid: string }).uid) throw new HttpsError('unauthenticated', 'Sign in required');
  const uid = (auth as { uid: string }).uid;
  const adminDoc = await getFirestore().collection('admins').doc(uid).get();
  if (!adminDoc.exists) throw new HttpsError('permission-denied', 'Not an admin');
  const role = adminDoc.data()?.role as string;
  if (!['operator', 'supervisor', 'admin'].includes(role)) throw new HttpsError('permission-denied', 'Insufficient role');
  return uid;
}

async function queueNotification(opts: {
  alertId: string;
  channel: 'contact' | 'police';
  toName: string;
  toPhone: string;
  body: string;
  queuedBy: string;
}) {
  const db = getFirestore();
  const msgRef = db.collection('mock_outbox').doc();
  await msgRef.set({
    ...opts,
    status: 'queued',
    createdAt: FieldValue.serverTimestamp(),
  });
  await auditLog({
    actorId: opts.queuedBy,
    actorType: 'human',
    action: 'notification.queued',
    resourceType: 'sos_alert',
    resourceId: opts.alertId,
    metadata: { channel: opts.channel, toPhone: opts.toPhone },
  });
  return { messageId: msgRef.id };
}

export const queueContactNotification = onCall({ cors: ['*'] }, async (request) => {
  const uid = await requireOperator(request.auth);
  const { alertId, toName, toPhone, body } = request.data as {
    alertId: string;
    toName: string;
    toPhone: string;
    body: string;
  };
  return queueNotification({ alertId, channel: 'contact', toName, toPhone, body, queuedBy: uid });
});

export const queuePoliceNotification = onCall({ cors: ['*'] }, async (request) => {
  const uid = await requireOperator(request.auth);
  const role = (await getFirestore().collection('admins').doc(uid).get()).data()?.role as string;
  if (!['supervisor', 'admin'].includes(role)) throw new HttpsError('permission-denied', 'Supervisor+ required');
  const { alertId, toName, toPhone, body } = request.data as {
    alertId: string;
    toName: string;
    toPhone: string;
    body: string;
  };
  return queueNotification({ alertId, channel: 'police', toName, toPhone, body, queuedBy: uid });
});
