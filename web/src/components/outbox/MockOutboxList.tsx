import { useMockOutbox } from '../../hooks/useMockOutbox.ts';

export function MockOutboxList() {
  const messages = useMockOutbox();
  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>Mock SMS Outbox</h3>
      <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
        Free-tier messages are stored here instead of Twilio. Flip USE_REAL_SMS to enable real delivery.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
        {messages.length === 0 && <div style={{ color: 'var(--muted)' }}>No messages yet.</div>}
        {messages.map((m) => (
          <div
            key={m.id}
            style={{
              padding: '0.75rem',
              background: 'var(--bg)',
              borderRadius: 'var(--radius)',
              borderLeft: '4px solid ' + (m.channel === 'police' ? 'var(--warn)' : 'var(--info)'),
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>{m.toName}</strong>
              <span className="badge badge-acknowledged">{m.channel}</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{m.toPhone}</div>
            <div style={{ marginTop: 6, fontSize: '0.9rem' }}>{m.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
