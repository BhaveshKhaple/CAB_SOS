import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase.ts';
import type { Driver, Vehicle } from '../types/index.ts';

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'drivers'), (snap) => {
      setDrivers(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Driver)));
    });
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'vehicles'), (snap) => {
      setVehicles(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Vehicle)));
    });
    return unsub;
  }, []);

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Drivers & Vehicles</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Drivers</h3>
          {drivers.map((d) => (
            <div key={d.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--surface-2)' }}>
              <strong>{d.name}</strong>
              <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{d.phone} · {d.licenseNumber}</div>
            </div>
          ))}
        </div>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Vehicles</h3>
          {vehicles.map((v) => (
            <div key={v.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--surface-2)' }}>
              <strong>{v.registrationNumber}</strong>
              <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Device {v.deviceId} · {v.status}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
