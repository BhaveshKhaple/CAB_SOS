import { useEffect, useState } from 'react';
import { doc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase.ts';
import { useAuth } from '../hooks/useAuth.tsx';

export default function SettingsPage() {
  const { hasRole } = useAuth();
  const [settings, setSettings] = useState({ escalationTimeoutSec: 30, supervisorEscalationSec: 120, retentionDays: 90, useRealSms: false });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    return onSnapshot(doc(db, 'settings/global'), (snap) => {
      if (snap.exists()) setSettings(snap.data() as typeof settings);
    });
  }, []);

  const save = async () => {
    await updateDoc(doc(db, 'settings/global'), { ...settings, updatedAt: serverTimestamp() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const canEdit = hasRole(['admin']);

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Settings</h1>
      <div className="card" style={{ maxWidth: 480 }}>
        <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem' }}>Escalation Timeout (sec)</label>
        <input
          className="input"
          type="number"
          value={settings.escalationTimeoutSec}
          disabled={!canEdit}
          onChange={(e) => setSettings({ ...settings, escalationTimeoutSec: Number(e.target.value) })}
        />
        <label style={{ display: 'block', margin: '12px 0 8px', fontSize: '0.85rem' }}>Supervisor Escalation (sec)</label>
        <input
          className="input"
          type="number"
          value={settings.supervisorEscalationSec}
          disabled={!canEdit}
          onChange={(e) => setSettings({ ...settings, supervisorEscalationSec: Number(e.target.value) })}
        />
        <label style={{ display: 'block', margin: '12px 0 8px', fontSize: '0.85rem' }}>Retention (days)</label>
        <input
          className="input"
          type="number"
          value={settings.retentionDays}
          disabled={!canEdit}
          onChange={(e) => setSettings({ ...settings, retentionDays: Number(e.target.value) })}
        />
        <label style={{ display: 'block', margin: '12px 0 8px', fontSize: '0.85rem' }}>
          <input
            type="checkbox"
            checked={settings.useRealSms}
            disabled={!canEdit}
            onChange={(e) => setSettings({ ...settings, useRealSms: e.target.checked })}
          />{' '}
          Use real SMS (requires Blaze plan + Twilio)
        </label>
        {canEdit && (
          <button className="btn btn-primary" onClick={save} style={{ marginTop: 16 }}>
            Save
          </button>
        )}
        {saved && <div style={{ color: 'var(--ok)', marginTop: 12 }}>Saved.</div>}
      </div>
    </div>
  );
}
