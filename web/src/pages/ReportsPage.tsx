import { ResponseTimeChart } from '../components/reports/ResponseTimeChart.tsx';
import { useAllAlerts } from '../hooks/useLiveAlerts.ts';

export default function ReportsPage() {
  const alerts = useAllAlerts(30);
  const resolved = alerts.filter((a) => a.status === 'closed').length;
  const falseAlarms = alerts.filter((a) => a.status === 'false_alarm').length;

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Reports</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card">
          <div style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>Total Alerts (30d)</div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>{alerts.length}</div>
        </div>
        <div className="card">
          <div style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>Resolved</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--ok)' }}>{resolved}</div>
        </div>
        <div className="card">
          <div style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>False Alarms</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--muted)' }}>{falseAlarms}</div>
        </div>
      </div>
      <ResponseTimeChart />
    </div>
  );
}
