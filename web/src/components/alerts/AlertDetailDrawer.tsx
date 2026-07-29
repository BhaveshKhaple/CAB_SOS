import { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../lib/firebase.ts';
import { useTrip, useDriver, useVehicle, useEmergencyContacts } from '../../hooks/useLiveTrip.ts';
import { useEvidence } from '../../hooks/useEvidence.ts';
import type { SosAlert } from '../../types/index.ts';

export function AlertDetailDrawer({ alert, onClose }: { alert: SosAlert; onClose: () => void }) {
  const trip = useTrip(alert.tripId);
  const driver = useDriver(trip?.driverId);
  const vehicle = useVehicle(alert.vehicleId);
  const contacts = useEmergencyContacts(trip?.passengerRef);
  const { getSignedUrl } = useEvidence();
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [evidenceUrl, setEvidenceUrl] = useState<string | null>(null);

  const callFn = async (name: string, payload: Record<string, unknown>) => {
    setBusy(true);
    try {
      await httpsCallable(functions, name)(payload);
    } finally {
      setBusy(false);
    }
  };

  const handleNotify = async (channel: 'contact' | 'police', contact: { name: string; phone: string }) => {
    const fn = channel === 'contact' ? 'queueContactNotification' : 'queuePoliceNotification';
    await callFn(fn, {
      alertId: alert.id,
      toName: contact.name,
      toPhone: contact.phone,
      body: `SafeRide SOS alert for ${vehicle?.registrationNumber} at ${alert.location.lat.toFixed(4)}, ${alert.location.lng.toFixed(4)}. Status: ${alert.status}.`,
    });
  };

  const loadEvidence = async () => {
    if (!alert.videoRef) return;
    const data = await getSignedUrl(alert.videoRef);
    setEvidenceUrl(data.url);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: 420,
        height: '100%',
        background: 'var(--surface)',
        borderLeft: '1px solid var(--surface-2)',
        padding: '1.25rem',
        overflow: 'auto',
        zIndex: 1000,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Alert {alert.id.slice(-6)}</h2>
        <button className="btn btn-secondary" onClick={onClose}>
          ✕
        </button>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className={`badge badge-${alert.status}`}>{alert.status.replace('_', ' ')}</div>
        <div style={{ marginTop: 8, fontSize: '0.9rem' }}>
          <strong>Vehicle:</strong> {vehicle?.registrationNumber || alert.vehicleId}
        </div>
        <div style={{ fontSize: '0.9rem' }}>
          <strong>Driver:</strong> {driver?.name || trip?.driverId}
        </div>
        <div style={{ fontSize: '0.9rem' }}>
          <strong>Time:</strong> {alert.triggeredAt.toLocaleString()}
        </div>
        <div style={{ fontSize: '0.9rem' }}>
          <strong>Location:</strong> {alert.location.lat.toFixed(5)}, {alert.location.lng.toFixed(5)}
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h4 style={{ marginTop: 0 }}>Operator Actions</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {alert.status === 'new' && (
            <button className="btn btn-info" disabled={busy} onClick={() => callFn('markAcknowledged', { alertId: alert.id })}>
              Acknowledge
            </button>
          )}
          {alert.status === 'acknowledged' && (
            <>
              <button className="btn btn-ok" disabled={busy} onClick={() => callFn('markVerified', { alertId: alert.id })}>
                Mark Verified
              </button>
              <button
                className="btn btn-secondary"
                disabled={busy}
                onClick={() => callFn('markFalseAlarm', { alertId: alert.id, reason: note || 'No reason given' })}
              >
                False Alarm
              </button>
            </>
          )}
          {alert.status === 'verified' && (
            <>
              <input
                className="input"
                placeholder="Resolution notes"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                style={{ flex: 1, minWidth: 200 }}
              />
              <button className="btn btn-primary" disabled={busy} onClick={() => callFn('resolveIncident', { alertId: alert.id, notes: note || 'Resolved' })}>
                Resolve
              </button>
            </>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h4 style={{ marginTop: 0 }}>Notify</h4>
        {contacts.map((c) => (
          <div key={c.id} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
            <div style={{ flex: 1, fontSize: '0.9rem' }}>
              {c.name} ({c.relationship})<br />
              <span style={{ color: 'var(--muted)' }}>{c.phone}</span>
            </div>
            <button className="btn btn-secondary" disabled={busy} onClick={() => handleNotify('contact', c)}>
              SMS
            </button>
          </div>
        ))}
        <button
          className="btn btn-warn"
          disabled={busy}
          onClick={() => handleNotify('police', { name: 'Local Police Control', phone: '100' })}
          style={{ width: '100%' }}
        >
          Notify Police
        </button>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h4 style={{ marginTop: 0 }}>Evidence</h4>
        {alert.videoRef ? (
          <>
            <button className="btn btn-secondary" onClick={loadEvidence} disabled={busy}>
              Load Video
            </button>
            {evidenceUrl && (
              <video controls style={{ width: '100%', marginTop: 8, borderRadius: 'var(--radius)' }}>
                <source src={evidenceUrl} />
              </video>
            )}
          </>
        ) : (
          <div style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>No evidence linked yet.</div>
        )}
      </div>
    </div>
  );
}
