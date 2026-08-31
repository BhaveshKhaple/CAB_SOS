import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import type { SosAlert, GpsPoint } from '../../types/index.ts';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const redSosIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [28, 44],
  iconAnchor: [14, 44],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export function LiveMap({ alerts, route }: { alerts: SosAlert[]; route?: GpsPoint[] }) {
  const center = alerts[0]?.location || route?.[route.length - 1] || { lat: 19.076, lng: 72.8777 };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', borderRadius: 'var(--radius-lg)' }}>
      {/* Dark Leaflet Map Canvas */}
      <MapContainer center={[center.lat, center.lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {alerts.map((a) => (
          <Marker key={a.id} position={[a.location.lat, a.location.lng]} icon={redSosIcon}>
            <Popup>
              <div style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-main)' }}>
                <div className="badge badge-new" style={{ marginBottom: 4 }}>
                  SOS TRIGGERED
                </div>
                <div className="font-mono" style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                  {a.vehicleId}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Time: {a.triggeredAt.toLocaleTimeString()}
                </div>
                <div className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--secondary)', marginTop: 2 }}>
                  {a.location.lat.toFixed(4)}°, {a.location.lng.toFixed(4)}°
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {route && route.length > 1 && (
          <Polyline positions={route.map((p) => [p.lat, p.lng])} color="#38bdf8" weight={4} opacity={0.85} />
        )}
      </MapContainer>

      {/* Floating Telemetry HUD Card (Stitch Overlay) */}
      <div
        className="glass-panel"
        style={{
          position: 'absolute',
          bottom: '1rem',
          right: '1rem',
          zIndex: 400,
          padding: '0.85rem 1.1rem',
          minWidth: '220px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
        }}
      >
        <div className="text-caps" style={{ color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
          TELEMETRY SOURCES
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.8rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--ok)', display: 'inline-block' }} />
            <span>4G Link: <span className="font-mono" style={{ color: 'var(--ok)', fontWeight: 700 }}>STABLE</span></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--secondary)', display: 'inline-block' }} />
            <span>GSM Sat: <span className="font-mono" style={{ color: 'var(--secondary)', fontWeight: 700 }}>LOCKED</span></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--warn)', display: 'inline-block' }} />
            <span>Relay Mesh: <span className="font-mono" style={{ color: 'var(--warn)', fontWeight: 700 }}>SYNCING</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}
