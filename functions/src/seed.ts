import { onRequest } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

const DEFAULT_PASSWORD = 'SaferideDemo123!';

const SEED_ADMINS = [
  { uid: 'admin-demo-1', email: 'admin@saferide.demo', name: 'Amey Admin', role: 'admin' },
  { uid: 'supervisor-demo-1', email: 'supervisor@saferide.demo', name: 'Supervisor Demo', role: 'supervisor' },
  { uid: 'operator-demo-1', email: 'operator@saferide.demo', name: 'Operator Demo', role: 'operator' },
];

export const seed = onRequest({ cors: ['*'] }, async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }
  const db = getFirestore();

  await db.doc('settings/global').set({
    escalationTimeoutSec: 30,
    supervisorEscalationSec: 120,
    retentionDays: 90,
    useRealSms: false,
    updatedAt: FieldValue.serverTimestamp(),
  });

  for (const a of SEED_ADMINS) {
    try {
      await getAuth().createUser({ uid: a.uid, email: a.email, password: DEFAULT_PASSWORD, displayName: a.name });
    } catch (e: any) {
      if (e.code !== 'auth/uid-already-exists' && e.code !== 'auth/email-already-exists') throw e;
    }
    await db.collection('admins').doc(a.uid).set({
      uid: a.uid,
      name: a.name,
      email: a.email,
      role: a.role,
      lastLoginAt: null,
    });
  }

  const vehicleId = 'veh-demo-001';
  const driverId = 'drv-demo-001';
  const passengerRef = 'psg-demo-001';

  await db.collection('drivers').doc(driverId).set({
    driverId,
    name: 'Rajesh Kumar',
    phone: '+91-98765-43210',
    licenseNumber: 'MH-20-2024-0012345',
    verificationStatus: 'verified',
    rating: 4.7,
    createdAt: FieldValue.serverTimestamp(),
  });

  await db.collection('vehicles').doc(vehicleId).set({
    vehicleId,
    registrationNumber: 'MH-20-AB-1234',
    currentDriverId: driverId,
    deviceId: 'dev-demo-001',
    status: 'online',
    lastSeenAt: FieldValue.serverTimestamp(),
  });

  await db.collection('emergency_contacts').doc('ec-demo-001').set({
    contactId: 'ec-demo-001',
    passengerRef,
    name: 'Priya Sharma',
    phone: '+91-91234-56789',
    relationship: 'sister',
    priority: 1,
  });

  res.json({
    ok: true,
    logins: SEED_ADMINS.map((a) => ({ email: a.email, password: DEFAULT_PASSWORD, role: a.role })),
  });
});
