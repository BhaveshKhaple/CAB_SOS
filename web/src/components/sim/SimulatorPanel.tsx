import { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, functions } from '../../lib/firebase.ts';

const VEHICLE_ID = 'veh-demo-001';
const DEVICE_ID = 'dev-demo-001';
const DRIVER_ID = 'drv-demo-001';
const PASSENGER_REF = 'psg-demo-001';

export function SimulatorPanel() {
  const [tripId, setTripId] = useState<string | null>(null);
  const [alertId, setAlertId] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const log = (msg: string) => setLogs((prev) => [msg, ...prev].slice(0, 50));

  const startTrip = async () => {
    setBusy(true);
    const id = `trip-${Date.now()}`;
    try {
      await setDoc(doc(db, 'trips', id), {
        vehicleId: VEHICLE_ID,
        driverId: DRIVER_ID,
        passengerRef: PASSENGER_REF,
        startTime: serverTimestamp(),
        status: 'ongoing',
        route: [],
      });
      setTripId(id);
      log(`Started trip ${id}`);
    } catch (err: any) {
      log(`Start trip failed: ${err.message}`);
    }
    setBusy(false);
  };

  const triggerSos = async () => {
    if (!tripId) return;
    setBusy(true);
    const location = { lat: 19.076 + (Math.random() - 0.5) * 0.02, lng: 72.8777 + (Math.random() - 0.5) * 0.02 };
    const fn = httpsCallable<{ tripId: string; vehicleId: string; deviceId: string; location: { lat: number; lng: number } }, { alertId: string; status: string }>(
      functions,
      'simulateSos'
    );
    try {
      const res = await fn({ tripId, vehicleId: VEHICLE_ID, deviceId: DEVICE_ID, location });
      setAlertId(res.data.alertId);
      log(`SOS triggered → alert ${res.data.alertId}`);
    } catch (err: any) {
      log(`SOS failed: ${err.message}`);
    }
    setBusy(false);
  };

  const cancelSos = async () => {
    if (!alertId) return;
    setBusy(true);
    try {
      await updateDoc(doc(db, 'sos_alerts', alertId), { status: 'cancelled', cancelledAt: serverTimestamp() });
      log(`Cancelled alert ${alertId}`);
      setAlertId(null);
    } catch (err: any) {
      log(`Cancel SOS failed: ${err.message}`);
    }
    setBusy(false);
  };

  const bulkSos = async () => {
    log('Bulk SOS started (5 in 30s)');
    for (let i = 0; i < 5; i++) {
      setTimeout(() => triggerSos(), i * 6000);
    }
  };

  const goOffline = async () => {
    try {
      await setDoc(doc(db, 'vehicles', VEHICLE_ID), { status: 'offline', lastSeenAt: serverTimestamp() }, { merge: true });
      log('Vehicle went offline');
    } catch (err: any) {
      log(`Go offline failed: ${err.message}`);
    }
  };

  const goOnline = async () => {
    try {
      await setDoc(doc(db, 'vehicles', VEHICLE_ID), { status: 'online', lastSeenAt: serverTimestamp() }, { merge: true });
      log('Vehicle came online');
    } catch (err: any) {
      log(`Go online failed: ${err.message}`);
    }
  };

  return (
    <div>
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Device Simulator</h2>
        <p style={{ color: 'var(--muted)' }}>Admin-only demo controls. Calls the simulateSos Cloud Function.</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 12 }}>
          <button className="btn btn-secondary" onClick={startTrip} disabled={busy}>Start Normal Trip</button>
          <button className="btn btn-primary" onClick={triggerSos} disabled={busy || !tripId}>Trigger SOS</button>
          <button className="btn btn-secondary" onClick={cancelSos} disabled={busy || !alertId}>Cancel SOS</button>
          <button className="btn btn-secondary" onClick={goOffline}>Go Offline</button>
          <button className="btn btn-secondary" onClick={goOnline}>Go Online</button>
          <button className="btn btn-warn" onClick={bulkSos} disabled={busy || !tripId}>Bulk: 5 SOS in 30s</button>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3>Sim Log</h3>
        <pre style={{ background: 'var(--bg)', padding: '0.75rem', borderRadius: 'var(--radius)', maxHeight: 300, overflow: 'auto' }}>
          {logs.length === 0 ? 'No actions yet.' : logs.join('\n')}
        </pre>
      </div>
    </div>
  );
}
