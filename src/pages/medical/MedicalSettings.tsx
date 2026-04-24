import { useState } from 'react';
import { MedicalLayout } from '../../layouts/MedicalLayout/MedicalLayout';
import { useAuth } from '../../context/AuthContext';

const TABS = ['Profile', 'Clinic Info', 'Notifications', 'Security'];

const notifItems = [
  { key: 'email', label: 'Email Notifications', desc: 'Receive all alerts via email' },
  { key: 'sms', label: 'SMS Alerts', desc: 'Urgent notifications via SMS' },
  { key: 'newPatient', label: 'New Patient Alerts', desc: 'Alert when a new patient is registered' },
  { key: 'reminders', label: 'Appointment Reminders', desc: 'Pre-appointment reminders' },
  { key: 'system', label: 'System Updates', desc: 'Platform updates and maintenance notices' },
  { key: 'digest', label: 'Weekly Digest', desc: 'A weekly summary of activity' },
];

export function MedicalSettings() {
  const [tab, setTab] = useState('Profile');
  const { user } = useAuth();
  const [notifs, setNotifs] = useState<Record<string, boolean>>({ email: true, sms: false, newPatient: true, reminders: true, system: true, digest: false });
  const [saved, setSaved] = useState(false);

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <MedicalLayout title="Settings">
      <div style={{ display: 'flex', gap: 24 }}>
        {/* Left nav */}
        <div style={{ width: 180, flexShrink: 0 }}>
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: 6,
                background: tab === t ? 'var(--accent-light)' : 'transparent',
                color: tab === t ? 'var(--accent)' : 'var(--text-muted)',
                fontWeight: tab === t ? 700 : 400,
                fontSize: 13, border: 'none', cursor: 'pointer', marginBottom: 2,
                fontFamily: 'var(--font-dm-sans)',
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, maxWidth: 560 }}>
          {tab === 'Profile' && (
            <div className="card">
              <div className="card-title" style={{ marginBottom: 20 }}>Profile Information</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  { label: 'Full Name', value: user?.name, id: 'pname' },
                  { label: 'Email', value: user?.email, id: 'pemail' },
                  { label: 'Phone', value: '(555) 100-2000', id: 'pphone' },
                  { label: 'License Number', value: user?.licenseNumber, id: 'plicense' },
                  { label: 'Specialty', value: user?.specialty, id: 'pspec' },
                ].map(f => (
                  <div key={f.id} className="form-group">
                    <label className="form-label" htmlFor={f.id}>{f.label}</label>
                    <input id={f.id} className="form-input" defaultValue={f.value ?? ''} />
                  </div>
                ))}
              </div>
              <button className="btn-primary btn-md" onClick={handleSave} style={{ marginTop: 8 }}>
                {saved ? '✓ Saved!' : 'Save Changes'}
              </button>
            </div>
          )}

          {tab === 'Notifications' && (
            <div className="card">
              <div className="card-title" style={{ marginBottom: 20 }}>Notification Preferences</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {notifItems.map((item, i) => (
                  <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: i < notifItems.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{item.label}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>{item.desc}</div>
                    </div>
                    <button
                      role="switch"
                      aria-checked={notifs[item.key]}
                      aria-label={item.label}
                      onClick={() => setNotifs(n => ({ ...n, [item.key]: !n[item.key] }))}
                      style={{
                        width: 44, height: 24, borderRadius: 12,
                        background: notifs[item.key] ? 'var(--accent)' : 'var(--border)',
                        border: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0, transition: 'background 0.3s',
                      }}
                    >
                      <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: notifs[item.key] ? 23 : 3, transition: 'left 0.3s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'Clinic Info' && (
            <div className="card">
              <div className="card-title" style={{ marginBottom: 20 }}>Clinic Information</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  { label: 'Clinic Name', id: 'cname', value: 'Gradicent Medical Center' },
                  { label: 'Phone', id: 'cphone', value: '(555) 800-9000' },
                  { label: 'Email', id: 'cemail', value: 'info@gradcentmedical.com' },
                  { label: 'Specialty', id: 'cspec', value: 'General Practice' },
                ].map(f => (
                  <div key={f.id} className="form-group">
                    <label className="form-label" htmlFor={f.id}>{f.label}</label>
                    <input id={f.id} className="form-input" defaultValue={f.value} />
                  </div>
                ))}
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label" htmlFor="caddress">Address</label>
                  <input id="caddress" className="form-input" defaultValue="500 Medical Drive, Portland, OR 97201" />
                </div>
              </div>
              <button className="btn-primary btn-md" onClick={handleSave} style={{ marginTop: 8 }}>
                {saved ? '✓ Saved!' : 'Save Changes'}
              </button>
            </div>
          )}

          {tab === 'Security' && (
            <div className="card">
              <div className="card-title" style={{ marginBottom: 20 }}>Security Settings</div>
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>Change Password</div>
                <div className="form-group">
                  <label className="form-label" htmlFor="curpwd">Current Password</label>
                  <input id="curpwd" className="form-input" type="password" />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="newpwd">New Password</label>
                  <input id="newpwd" className="form-input" type="password" />
                </div>
                <button className="btn-primary btn-md">Update Password</button>
              </div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>Two-Factor Authentication</div>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>Add an extra layer of security to your account.</p>
                <button className="btn-secondary btn-md">Enable 2FA</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </MedicalLayout>
  );
}
