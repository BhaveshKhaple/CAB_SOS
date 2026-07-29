import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth.tsx';
import { useEscalationWatcher } from '../../hooks/useEscalationWatcher.ts';

const navItems = [
  { to: '/', label: 'Dashboard', icon: 'dashboard' },
  { to: '/incidents', label: 'SOS Alerts', icon: 'emergency' },
  { to: '/drivers', label: 'Fleet & Drivers', icon: 'local_taxi' },
  { to: '/reports', label: 'Reports', icon: 'bar_chart' },
  { to: '/settings', label: 'Settings', icon: 'settings' },
];

export function AppShell() {
  const { user, admin, loading, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [protocolStates, setProtocolStates] = useState({
    fourG: true,
    satellite: true,
    relay: false,
  });

  useEscalationWatcher();

  useEffect(() => {
    if (!loading && !user) navigate('/login', { replace: true });
  }, [loading, user, navigate]);

  if (loading) return <div className="loading">Initializing Sentinel Protocol…</div>;
  if (!user || !admin) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* Top Header Bar */}
      <header
        style={{
          height: 'var(--topbar-height)',
          background: 'var(--surface)',
          borderBottom: '1px solid var(--outline-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.5rem',
          zIndex: 50,
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span
              className="material-symbols-outlined"
              style={{ color: 'var(--accent)', fontSize: '24px', fontVariationSettings: "'FILL' 1" }}
            >
              shield_with_heart
            </span>
            <span style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              SENTINEL <span style={{ color: 'var(--accent)' }}>SOS</span>
            </span>
            <span className="badge badge-new" style={{ fontSize: '0.65rem', marginLeft: '0.25rem' }}>
              LIVE MONITORING
            </span>
          </div>

          {/* Quick Search */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'var(--surface-highest)',
              border: '1px solid var(--outline)',
              borderRadius: 'var(--radius-lg)',
              padding: '0.4rem 0.85rem',
              gap: '0.5rem',
              width: '320px',
            }}
          >
            <span className="material-symbols-outlined" style={{ color: 'var(--text-muted)' }}>
              search
            </span>
            <input
              type="text"
              placeholder="Search Vehicle ID / License Plate..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                width: '100%',
              }}
            />
            <span className="text-caps" style={{ background: 'var(--surface-high)', padding: '2px 5px', borderRadius: '4px', color: 'var(--text-muted)' }}>
              ⌘K
            </span>
          </div>
        </div>

        {/* Right Header User Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <button
            title="Telemetry Feed"
            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', padding: 6 }}
          >
            <span className="material-symbols-outlined">rss_feed</span>
          </button>

          <div style={{ position: 'relative' }}>
            <button
              title="Alert Notifications"
              style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', padding: 6 }}
            >
              <span className="material-symbols-outlined">notifications_active</span>
            </button>
            <span
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: 'var(--accent)',
              }}
            />
          </div>

          <div style={{ height: 24, width: 1, background: 'var(--outline-subtle)' }} />

          {/* User Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{admin.name}</div>
              <div className="text-caps" style={{ color: 'var(--secondary)' }}>
                {admin.role} • CLEARANCE L3
              </div>
            </div>
            <span
              className="material-symbols-outlined"
              style={{ color: 'var(--secondary)', fontSize: '32px', fontVariationSettings: "'FILL' 1" }}
            >
              account_circle
            </span>
            <button
              className="btn btn-secondary"
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', marginLeft: '0.5rem' }}
              onClick={logout}
              title="Log Out"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                logout
              </span>
              Exit
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area: Sidebar + Page Canvas */}
      <div style={{ display: 'flex', flex: 1, height: 'calc(100vh - var(--topbar-height))', overflow: 'hidden' }}>
        {/* Left Side Navigation Bar */}
        <aside
          style={{
            width: 'var(--sidebar-width)',
            background: 'var(--surface-low)',
            borderRight: '1px solid var(--outline-subtle)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            flexShrink: 0,
            padding: '1.25rem 0.75rem',
            overflowY: 'auto',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Primary Navigation */}
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {navItems.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.65rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    background: isActive ? 'var(--secondary-dark)' : 'transparent',
                    color: isActive ? 'var(--secondary)' : 'var(--text-secondary)',
                    fontWeight: isActive ? 700 : 500,
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    borderLeft: isActive ? '3px solid var(--secondary)' : '3px solid transparent',
                    transition: 'all 0.15s ease',
                  })}
                >
                  <span className="material-symbols-outlined">{n.icon}</span>
                  {n.label}
                </NavLink>
              ))}

              {hasRole(['admin']) && (
                <NavLink
                  to="/sim"
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.65rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    background: isActive ? 'var(--accent-container)' : 'rgba(235, 65, 65, 0.1)',
                    color: isActive ? '#ffffff' : 'var(--accent)',
                    fontWeight: 700,
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    marginTop: '0.5rem',
                    border: '1px solid var(--accent)',
                  })}
                >
                  <span className="material-symbols-outlined">motion_photos_auto</span>
                  IoT Simulator
                </NavLink>
              )}
            </nav>

            {/* Telemetry Filters Section */}
            <div style={{ padding: '0 0.5rem' }}>
              <div className="text-caps" style={{ color: 'var(--text-muted)', marginBottom: '0.85rem', opacity: 0.7 }}>
                Telemetry Protocols
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                  onClick={() => setProtocolStates((s) => ({ ...s, fourG: !s.fourG }))}
                >
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>4G Cellular Protocol</span>
                  <div
                    style={{
                      width: 32,
                      height: 18,
                      borderRadius: 999,
                      background: protocolStates.fourG ? 'var(--ok)' : 'var(--surface-highest)',
                      position: 'relative',
                      transition: 'background 0.2s',
                    }}
                  >
                    <div
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        background: '#fff',
                        position: 'absolute',
                        top: 2,
                        left: protocolStates.fourG ? 16 : 2,
                        transition: 'left 0.2s',
                      }}
                    />
                  </div>
                </div>

                <div
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                  onClick={() => setProtocolStates((s) => ({ ...s, satellite: !s.satellite }))}
                >
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>GSM Satellite Link</span>
                  <div
                    style={{
                      width: 32,
                      height: 18,
                      borderRadius: 999,
                      background: protocolStates.satellite ? 'var(--secondary)' : 'var(--surface-highest)',
                      position: 'relative',
                      transition: 'background 0.2s',
                    }}
                  >
                    <div
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        background: '#fff',
                        position: 'absolute',
                        top: 2,
                        left: protocolStates.satellite ? 16 : 2,
                        transition: 'left 0.2s',
                      }}
                    />
                  </div>
                </div>

                <div
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                  onClick={() => setProtocolStates((s) => ({ ...s, relay: !s.relay }))}
                >
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Relay Mesh Node</span>
                  <div
                    style={{
                      width: 32,
                      height: 18,
                      borderRadius: 999,
                      background: protocolStates.relay ? 'var(--warn)' : 'var(--surface-highest)',
                      position: 'relative',
                      transition: 'background 0.2s',
                    }}
                  >
                    <div
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        background: '#fff',
                        position: 'absolute',
                        top: 2,
                        left: protocolStates.relay ? 16 : 2,
                        transition: 'left 0.2s',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer System Status */}
          <div
            style={{
              paddingTop: '1rem',
              borderTop: '1px solid var(--outline-subtle)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--ok)' }} />
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              System: <span className="font-mono" style={{ color: 'var(--ok)', fontWeight: 700 }}>100% OPERATIONAL</span>
            </div>
          </div>
        </aside>

        {/* Dynamic Route Canvas */}
        <main style={{ flex: 1, overflow: 'auto', background: 'var(--bg)', position: 'relative' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
