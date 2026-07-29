import type { SosAlert } from '../../types/index.ts';

export function IncidentTimeline({ alert }: { alert: SosAlert }) {
  const entries = [
    { at: alert.triggeredAt, note: 'SOS triggered by device', actorType: 'device' as const },
    alert.acknowledgedAt && { at: alert.acknowledgedAt, note: 'Acknowledged by operator', actorType: 'human' as const },
    alert.escalatedAt && { at: alert.escalatedAt, note: 'Escalated automatically', actorType: 'system' as const },
    alert.verifiedAt && { at: alert.verifiedAt, note: 'Marked verified', actorType: 'human' as const },
    alert.closedAt && { at: alert.closedAt, note: `Closed${alert.resolutionNotes ? ': ' + alert.resolutionNotes : ''}`, actorType: 'human' as const },
  ].filter(Boolean) as { at: Date; note: string; actorType: 'device' | 'human' | 'system' }[];

  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>Incident Timeline</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
        {entries.map((e, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                marginTop: 4,
                background:
                  e.actorType === 'device' ? 'var(--accent)' : e.actorType === 'system' ? 'var(--warn)' : 'var(--info)',
                flexShrink: 0,
              }}
            />
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{e.at.toLocaleString()}</div>
              <div style={{ fontSize: '0.95rem' }}>{e.note}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
