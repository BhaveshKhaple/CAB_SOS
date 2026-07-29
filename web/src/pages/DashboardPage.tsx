import { useState } from 'react';
import { useLiveAlerts } from '../hooks/useLiveAlerts.ts';
import { FleetOverviewCards } from '../components/dashboard/FleetOverviewCards.tsx';
import { LiveAlertFeed } from '../components/dashboard/LiveAlertFeed.tsx';
import { LiveMap } from '../components/dashboard/LiveMap.tsx';
import { AlertDetailDrawer } from '../components/alerts/AlertDetailDrawer.tsx';
import { MockOutboxList } from '../components/outbox/MockOutboxList.tsx';
import type { SosAlert } from '../types/index.ts';

export default function DashboardPage() {
  const { alerts } = useLiveAlerts();
  const [selected, setSelected] = useState<SosAlert | null>(null);

  const activeCriticalAlert = alerts.find((a) => a.status === 'new' || a.status === 'escalated');

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Mission Control Dashboard
          </h1>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Real-time IoT Cab SOS monitoring, GPS telemetry, and emergency dispatch system.
          </p>
        </div>
        <div className="badge badge-verified" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>wifi_tethering</span>
          TELEMETRY STREAM ACTIVE
        </div>
      </div>

      {/* Fleet Overview Cards */}
      <FleetOverviewCards />

      {/* Main Workspace Grid: Alert Feed (340px) + Live Map */}
      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '1.25rem', minHeight: 520 }}>
        <LiveAlertFeed alerts={alerts} selectedId={selected?.id} onSelect={setSelected} />
        <div className="card" style={{ padding: 0, overflow: 'hidden', height: '100%', minHeight: 520 }}>
          <LiveMap alerts={alerts} />
        </div>
      </div>

      {/* Mock Outbox */}
      <div>
        <MockOutboxList />
      </div>

      {/* Critical Alert Ticker (Stitch Bottom Bar) */}
      {activeCriticalAlert && (
        <div
          style={{
            position: 'fixed',
            bottom: '1.25rem',
            left: 'calc(var(--sidebar-width) + (100vw - var(--sidebar-width)) / 2)',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            width: '90%',
            maxWidth: '780px',
          }}
        >
          <div
            className="pulse-red"
            style={{
              background: 'rgba(147, 0, 10, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: '#ffffff',
              borderRadius: '999px',
              padding: '0.65rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              boxShadow: '0 10px 40px rgba(0,0,0,0.7)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>warning</span>
              <span className="font-mono" style={{ fontWeight: 700, fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                CRITICAL SOS ALERT: {activeCriticalAlert.vehicleId}
              </span>
              <span style={{ fontSize: '0.8rem', opacity: 0.9 }} className="truncate">
                • {activeCriticalAlert.location.lat.toFixed(4)}°, {activeCriticalAlert.location.lng.toFixed(4)}°
              </span>
            </div>

            <button
              className="btn btn-secondary"
              style={{ padding: '0.35rem 0.85rem', fontSize: '0.75rem', borderRadius: '999px', background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none' }}
              onClick={() => setSelected(activeCriticalAlert)}
            >
              RESPOND NOW
            </button>
          </div>
        </div>
      )}

      {/* Alert Detail Drawer */}
      {selected && <AlertDetailDrawer alert={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
