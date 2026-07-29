import { useLiveAlerts } from '../../hooks/useLiveAlerts.ts';

export function FleetOverviewCards() {
  const { alerts, loading } = useLiveAlerts();
  const unack = alerts.filter((a) => a.status === 'new').length;
  const escalated = alerts.filter((a) => a.status === 'escalated').length;
  const active = alerts.filter((a) => a.status !== 'closed' && a.status !== 'false_alarm').length;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
      {/* Active SOS Trigger Card */}
      <div
        className="card"
        style={{
          borderLeft: unack > 0 || escalated > 0 ? '4px solid var(--accent)' : '1px solid var(--surface-high)',
          background: unack > 0 ? 'rgba(147, 0, 10, 0.25)' : 'var(--surface)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
          <span className="text-caps" style={{ color: 'var(--accent)' }}>SOS EMERGENCY TRIGGERS</span>
          <span className="material-symbols-outlined" style={{ color: 'var(--accent)' }}>emergency</span>
        </div>
        <div className="font-mono" style={{ fontSize: '2.2rem', fontWeight: 800, color: unack > 0 ? 'var(--accent)' : 'var(--text-primary)' }}>
          {loading ? '—' : active}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
          {unack} Unacknowledged • {escalated} Escalated
        </div>
      </div>

      {/* Unacknowledged Alerts */}
      <div className="card" style={{ borderLeft: '4px solid var(--warn)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
          <span className="text-caps" style={{ color: 'var(--warn)' }}>UNACKNOWLEDGED</span>
          <span className="material-symbols-outlined" style={{ color: 'var(--warn)' }}>warning</span>
        </div>
        <div className="font-mono" style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--warn)' }}>
          {loading ? '—' : unack}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
          Escalation deadline &lt; 30s
        </div>
      </div>

      {/* Fleet Active Online */}
      <div className="card" style={{ borderLeft: '4px solid var(--ok)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
          <span className="text-caps" style={{ color: 'var(--ok)' }}>ACTIVE CABS ONLINE</span>
          <span className="material-symbols-outlined" style={{ color: 'var(--ok)' }}>sensors</span>
        </div>
        <div className="font-mono" style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--ok)' }}>
          42
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
          Telemetry streaming 100%
        </div>
      </div>

      {/* GSM Satellite & Relay Link */}
      <div className="card" style={{ borderLeft: '4px solid var(--secondary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
          <span className="text-caps" style={{ color: 'var(--secondary)' }}>SATELLITE & MESH</span>
          <span className="material-symbols-outlined" style={{ color: 'var(--secondary)' }}>satellite_alt</span>
        </div>
        <div className="font-mono" style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--secondary)' }}>
          LOCKED
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
          Ping 14ms • Encryption HMAC
        </div>
      </div>
    </div>
  );
}
