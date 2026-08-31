import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase.ts';
import type { SosAlert } from '../types/index.ts';

export function useLiveAlerts() {
  const [alerts, setAlerts] = useState<SosAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'sos_alerts'),
      where('status', 'in', ['new', 'acknowledged', 'escalated', 'verified']),
      orderBy('triggeredAt', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      const items: SosAlert[] = [];
      snap.forEach((doc) => {
        const d = doc.data();
        items.push({
          id: doc.id,
          tripId: d.tripId,
          vehicleId: d.vehicleId,
          deviceId: d.deviceId,
          triggeredAt: d.triggeredAt?.toDate?.() ?? new Date(d.triggeredAt),
          location: d.location,
          status: d.status,
          escalationDeadlineAt: d.escalationDeadlineAt?.toDate?.() ?? new Date(d.escalationDeadlineAt),
          assignedOperatorId: d.assignedOperatorId,
          audioRef: d.audioRef,
          videoRef: d.videoRef,
          gpsTrackRef: d.gpsTrackRef,
          verifiedBy: d.verifiedBy,
          verifiedAt: d.verifiedAt?.toDate?.(),
          acknowledgedAt: d.acknowledgedAt?.toDate?.(),
          falseAlarmReason: d.falseAlarmReason,
          escalatedAt: d.escalatedAt?.toDate?.(),
          closedAt: d.closedAt?.toDate?.(),
          closedBy: d.closedBy,
          resolutionNotes: d.resolutionNotes,
          batteryPct: d.batteryPct,
          signalDbm: d.signalDbm,
        });
      });
      setAlerts(items);
      setLoading(false);
    });
    return unsub;
  }, []);

  return { alerts, loading };
}

export function useAllAlerts(limitDays = 7) {
  const [alerts, setAlerts] = useState<SosAlert[]>([]);

  useEffect(() => {
    const since = Timestamp.fromMillis(Date.now() - limitDays * 24 * 60 * 60 * 1000);
    const q = query(collection(db, 'sos_alerts'), where('triggeredAt', '>=', since), orderBy('triggeredAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const items: SosAlert[] = [];
      snap.forEach((doc) => {
        const d = doc.data();
        items.push({
          id: doc.id,
          ...d,
          triggeredAt: d.triggeredAt?.toDate?.() ?? new Date(),
          escalationDeadlineAt: d.escalationDeadlineAt?.toDate?.() ?? new Date(),
          verifiedAt: d.verifiedAt?.toDate?.(),
          acknowledgedAt: d.acknowledgedAt?.toDate?.(),
          escalatedAt: d.escalatedAt?.toDate?.(),
          closedAt: d.closedAt?.toDate?.(),
        } as SosAlert);
      });
      setAlerts(items);
    });
    return unsub;
  }, [limitDays]);

  return alerts;
}
