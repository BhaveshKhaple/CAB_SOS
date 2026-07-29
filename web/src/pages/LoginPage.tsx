import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.tsx';

export default function LoginPage() {
  const [email, setEmail] = useState('operator@saferide.demo');
  const [password, setPassword] = useState('SaferideDemo123!');
  const [error, setError] = useState('');
  const { login, user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    navigate('/', { replace: true });
    return null;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at 50% 50%, #0d1c2d 0%, #051424 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Decorative Grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'linear-gradient(to right, rgba(28, 43, 60, 0.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(28, 43, 60, 0.25) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          pointerEvents: 'none',
        }}
      />

      <div className="glass-panel" style={{ width: 420, padding: '2.25rem', position: 'relative', zIndex: 10, boxShadow: '0 20px 50px rgba(0,0,0,0.6)' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, borderRadius: '50%', background: 'rgba(235, 65, 65, 0.15)', border: '1px solid var(--accent)', marginBottom: '0.75rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '32px', color: 'var(--accent)', fontVariationSettings: "'FILL' 1" }}>
              shield_with_heart
            </span>
          </div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            SENTINEL <span style={{ color: 'var(--accent)' }}>SOS</span>
          </h1>
          <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Mission Control & Dispatch Terminal Access
          </p>
        </div>

        {error && (
          <div
            style={{
              background: 'rgba(147, 0, 10, 0.4)',
              border: '1px solid var(--accent)',
              color: '#ffb4ab',
              padding: '0.65rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.25rem',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }} className="text-caps">
              DISPATCHER EMAIL
            </label>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }} className="text-caps">
              SECURITY KEY / PASSWORD
            </label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button className="btn btn-primary" type="submit" style={{ width: '100%', marginTop: '0.75rem', padding: '0.75rem' }}>
            <span className="material-symbols-outlined">login</span>
            AUTHENTICATE & LOG IN
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--outline-subtle)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <div className="text-caps" style={{ color: 'var(--secondary)', marginBottom: '0.4rem' }}>
            DEMO DISPATCH ACCOUNTS:
          </div>
          <div className="font-mono" style={{ fontSize: '0.72rem', lineHeight: 1.6 }}>
            • operator@saferide.demo (Operator)<br />
            • supervisor@saferide.demo (Supervisor)<br />
            • admin@saferide.demo (Admin)<br />
            <span style={{ color: 'var(--text-primary)' }}>Password: SaferideDemo123!</span>
          </div>
        </div>
      </div>
    </div>
  );
}
