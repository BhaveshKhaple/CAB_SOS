import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import type { LogAction } from './types.js';

export async function auditLog(opts: {
  actorId: string;
  actorType: 'human' | 'device' | 'system';
  action: LogAction;
  resourceType: string;
  resourceId: string;
  metadata?: Record<string, unknown>;
}) {
  const db = getFirestore();
  await db.collection('audit_logs').add({
    ...opts,
    timestamp: FieldValue.serverTimestamp(),
  });
}
