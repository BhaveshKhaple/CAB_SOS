import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase.ts';
import type { Trip, Driver, Vehicle, EmergencyContact, GpsPoint } from '../types/index.ts';

export function useTrip(tripId: string | undefined) {
  const [trip, setTrip] = useState<Trip | null>(null);
  useEffect(() => {
    if (!tripId) return;
    return onSnapshot(doc(db, 'trips', tripId), (snap) => {
      if (!snap.exists()) return setTrip(null);
      const d = snap.data();
      setTrip({
        id: snap.id,
        ...d,
        startTime: d.startTime?.toDate?.(),
        endTime: d.endTime?.toDate?.(),
        route: (d.route || []).map((p: GpsPoint & { ts: unknown }) => ({
          ...p,
          ts: p.ts instanceof Date ? p.ts : (p.ts as { toDate: () => Date }).toDate(),
        })),
      } as Trip);
    });
  }, [tripId]);
  return trip;
}

export function useDriver(driverId: string | undefined) {
  const [driver, setDriver] = useState<Driver | null>(null);
  useEffect(() => {
    if (!driverId) return;
    return onSnapshot(doc(db, 'drivers', driverId), (snap) => {
      if (snap.exists()) setDriver({ id: snap.id, ...snap.data() } as Driver);
    });
  }, [driverId]);
  return driver;
}

export function useVehicle(vehicleId: string | undefined) {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  useEffect(() => {
    if (!vehicleId) return;
    return onSnapshot(doc(db, 'vehicles', vehicleId), (snap) => {
      if (snap.exists()) setVehicle({ id: snap.id, ...snap.data() } as Vehicle);
    });
  }, [vehicleId]);
  return vehicle;
}

export function useEmergencyContacts(passengerRef: string | undefined) {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  useEffect(() => {
    if (!passengerRef) return;
    return onSnapshot(doc(db, 'emergency_contacts', 'ec-demo-001'), (snap) => {
      if (snap.exists()) setContacts([{ id: snap.id, ...snap.data() } as EmergencyContact]);
    });
  }, [passengerRef]);
  return contacts;
}
