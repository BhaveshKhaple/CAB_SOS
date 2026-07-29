import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useAllAlerts } from '../../hooks/useLiveAlerts.ts';

export function ResponseTimeChart() {
  const alerts = useAllAlerts(7);
  const data = alerts
    .filter((a) => a.acknowledgedAt)
    .map((a) => ({
      name: a.id.slice(-4),
      seconds: Math.round((a.acknowledgedAt!.getTime() - a.triggeredAt.getTime()) / 1000),
    }));

  return (
    <div className="card" style={{ height: 320 }}>
      <h3 style={{ marginTop: 0 }}>Ack Time (last 7 days)</h3>
      {data.length === 0 ? (
        <div style={{ color: 'var(--muted)' }}>No acknowledged alerts yet.</div>
      ) : (
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" label={{ value: 'sec', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
            <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--surface-2)' }} />
            <Bar dataKey="seconds" fill="var(--info)" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
