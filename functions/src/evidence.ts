import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getStorage } from 'firebase-admin/storage';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { auditLog } from './utils.js';

export const mintEvidenceUrl = onCall({ cors: ['*'] }, async (request) => {
  const auth = request.auth as { uid: string } | undefined;
  if (!auth?.uid) throw new HttpsError('unauthenticated', 'Sign in required');

  const { evidenceId } = request.data as { evidenceId: string };
  const db = getFirestore();
  const doc = await db.collection('evidence').doc(evidenceId).get();
  if (!doc.exists) throw new HttpsError('not-found', 'Evidence not found');

  const data = doc.data() as { storagePath: string; type: string; alertId: string };
  const storage = getStorage();
  const file = storage.bucket().file(data.storagePath);
  const [url] = await file.getSignedUrl({
    action: 'read',
    expires: Date.now() + 60 * 60 * 1000,
  });

  await doc.ref.update({ signedUrlIssuedAt: FieldValue.serverTimestamp() });
  await auditLog({
    actorId: auth.uid,
    actorType: 'human',
    action: 'evidence.accessed',
    resourceType: 'evidence',
    resourceId: evidenceId,
    metadata: { alertId: data.alertId, type: data.type },
  });

  return { url, type: data.type, expiresInSec: 3600 };
});
