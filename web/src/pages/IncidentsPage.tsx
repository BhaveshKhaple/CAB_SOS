import { useState } from 'react';
import { useAllAlerts } from '../hooks/useLiveAlerts.ts';
import { IncidentTimeline } from '../components/incidents/IncidentTimeline.tsx';
import type { SosAlert } from '../types/index.ts';

export default function IncidentsPage() {
  const alerts = useAllAlerts(30);
  const [selected, setSelected] = useState<SosAlert | null>(alerts[0] || null);

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Incidents</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1rem' }}>
        <div className="card" style={{ height: 'fit-content' }}>
          <h3 style={{ marginTop: 0 }}>History</h3>
          {alerts.map((a) => (
            <button
              key={a.id}
              onClick={() => setSelected(a)}
              className="card"
              style={{
                width: '100%',
                textAlign: 'left',
                background: selected?.id === a.id ? 'var(--surface-2)' : 'var(--bg)',
                marginBottom: 8,
              }}
            >
              <div style={{ fontSize: '0.85rem' }}>{a.vehicleId}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{a.status.replace('_', ' ')} · {a.triggeredAt.toLocaleDateString()}</div>
            </button>
          ))}
        </div>
        <div>{selected && <IncidentTimeline alert={selected} />}</div>
      </div>
    </div>
  );
}
