import type { SosAlert } from '../../types/index.ts';

const statusClass: Record<SosAlert['status'], string> = {
  new: 'badge-new',
  acknowledged: 'badge-acknowledged',
  escalated: 'badge-escalated',
  verified: 'badge-verified',
  false_alarm: 'badge-false_alarm',
  closed: 'badge-closed',
  cancelled: 'badge-cancelled',
};

export function LiveAlertFeed({
  alerts,
  selectedId,
  onSelect,
}: {
  alerts: SosAlert[];
  selectedId?: string;
  onSelect: (a: SosAlert) => void;
}) {
  return (
    <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          Live SOS Alert Feed
        </h3>
        <span className="badge badge-new" style={{ fontSize: '0.65rem' }}>
          {alerts.length} ALERTS
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto', flex: 1, paddingRight: '0.2rem' }}>
        {alerts.length === 0 && (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', padding: '1.5rem', textAlign: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '32px', color: 'var(--ok)', marginBottom: '0.5rem', display: 'block' }}>
              check_circle
            </span>
            No active emergency alerts. All vehicles operating normally.
          </div>
        )}

        {alerts.map((a) => {
          const isSelected = selectedId === a.id;
          const isEmergency = a.status === 'new' || a.status === 'escalated';

          return (
            <div
              key={a.id}
              onClick={() => onSelect(a)}
              style={{
                textAlign: 'left',
                cursor: 'pointer',
                background: isEmergency
                  ? 'rgba(147, 0, 10, 0.3)'
                  : isSelected
                  ? 'var(--surface-high)'
                  : 'var(--surface-lowest)',
                border: isSelected ? '1px solid var(--secondary)' : '1px solid var(--outline-subtle)',
                borderLeft: isEmergency ? '4px solid var(--accent)' : isSelected ? '4px solid var(--secondary)' : '4px solid transparent',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <span className="font-mono" style={{ fontWeight: 700, fontSize: '0.95rem', color: isEmergency ? '#ffffff' : 'var(--text-primary)' }}>
                  {a.vehicleId}
                </span>
                <span className={`badge ${statusClass[a.status]}`}>
                  {isEmergency && <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>emergency</span>}
                  {a.status.replace('_', ' ')}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--secondary)' }}>
                  location_on
                </span>
                <span className="font-mono">
                  {a.location.lat.toFixed(4)}° N, {a.location.lng.toFixed(4)}° W
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                <span>Trip ID: <span className="font-mono">{a.tripId}</span></span>
                <span>{a.triggeredAt.toLocaleTimeString()}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
