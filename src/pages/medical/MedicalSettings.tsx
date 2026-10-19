import { useState, type KeyboardEvent } from 'react';
import { MedicalLayout } from '../../layouts/MedicalLayout/MedicalLayout';
import { useAuth } from '../../context/AuthContext';

const TABS = ['Profile', 'Clinic Info', 'Notifications', 'Security'] as const;
type Tab = typeof TABS[number];

const notifItems = [
  { key: 'email', label: 'Email Notifications', desc: 'Receive all alerts via email' },
  { key: 'sms', label: 'SMS Alerts', desc: 'Urgent notifications via SMS' },
  { key: 'newPatient', label: 'New Patient Alerts', desc: 'Alert when a new patient is registered' },
  { key: 'reminders', label: 'Appointment Reminders', desc: 'Pre-appointment reminders' },
  { key: 'system', label: 'System Updates', desc: 'Platform updates and maintenance notices' },
  { key: 'digest', label: 'Weekly Digest', desc: 'A weekly summary of activity' },
];

// Defaults shown until notification preferences can be saved to the account
const defaultNotifs: Record<string, boolean> = { email: true, sms: false, newPatient: true, reminders: true, system: true, digest: false };

const tabId = (i: number) => `settings-tab-${i}`;

function ComingSoonNote({ children }: { children: string }) {
  return (
    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>{children}</p>
  );
}

export function MedicalSettings() {
  const [tab, setTab] = useState<Tab>('Profile');
  const { user } = useAuth();

  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = index;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % TABS.length;
    else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index - 1 + TABS.length) % TABS.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = TABS.length - 1;
    else return;
    event.preventDefault();
    setTab(TABS[next]);
    document.getElementById(tabId(next))?.focus();
  };

  return (
    <MedicalLayout title="Settings">
      <div className="medical-settings-shell">
        {/* Left nav */}
        <div className="medical-settings-nav" role="tablist" aria-label="Settings sections" aria-orientation="vertical">
          {TABS.map((t, i) => (
            <button
              key={t}
              type="button"
              role="tab"
              id={tabId(i)}
              aria-selected={tab === t}
              aria-controls="settings-tabpanel"
              tabIndex={tab === t ? 0 : -1}
              onClick={() => setTab(t)}
              onKeyDown={e => onTabKeyDown(e, i)}
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
        <div
          className="medical-settings-panel"
          role="tabpanel"
          id="settings-tabpanel"
          aria-labelledby={tabId(TABS.indexOf(tab))}
        >
          {tab === 'Profile' && (
            <div className="card">
              <div className="card-title" style={{ marginBottom: 20 }}>Profile Information</div>
              <div className="medical-form-grid">
                {[
                  { label: 'Full Name', value: user?.name, id: 'pname' },
                  { label: 'Email', value: user?.email, id: 'pemail' },
                  { label: 'License Number', value: user?.licenseNumber, id: 'plicense' },
                  { label: 'Specialty', value: user?.specialty, id: 'pspec' },
                ].map(f => (
                  <div key={f.id} className="form-group">
                    <label className="form-label" htmlFor={f.id}>{f.label}</label>
                    <input id={f.id} className="form-input" value={f.value ?? ''} placeholder="Not set" readOnly />
                  </div>
                ))}
              </div>
              <button className="btn-primary btn-md" style={{ marginTop: 8 }} disabled title="Coming soon">
                Save Changes
              </button>
              <ComingSoonNote>Editing your profile from here is coming soon.</ComingSoonNote>
            </div>
          )}

          {tab === 'Notifications' && (
            <div className="card">
              <div className="card-title" style={{ marginBottom: 20 }}>Notification Preferences</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {notifItems.map((item, i) => (
                  <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '14px 0', borderBottom: i < notifItems.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{item.label}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>{item.desc}</div>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={defaultNotifs[item.key]}
                      aria-label={`${item.label} (coming soon)`}
                      disabled
                      title="Coming soon"
                      style={{
                        width: 44, height: 24, borderRadius: 12,
                        background: defaultNotifs[item.key] ? 'var(--accent)' : 'var(--border)',
                        border: 'none', position: 'relative', flexShrink: 0,
                      }}
                    >
                      <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: defaultNotifs[item.key] ? 23 : 3, boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
                    </button>
                  </div>
                ))}
              </div>
              <ComingSoonNote>Changing notification preferences is coming soon. These are the current defaults.</ComingSoonNote>
            </div>
          )}

          {tab === 'Clinic Info' && (
            <div className="card">
              <div className="card-title" style={{ marginBottom: 20 }}>Clinic Information</div>
              <fieldset disabled style={{ border: 'none', padding: 0, margin: 0, minWidth: 0 }}>
                <div className="medical-form-grid">
                  {[
                    { label: 'Clinic Name', id: 'cname', placeholder: 'Your clinic name' },
                    { label: 'Phone', id: 'cphone', placeholder: '(555) 000-0000' },
                    { label: 'Email', id: 'cemail', placeholder: 'clinic@example.com' },
                    { label: 'Specialty', id: 'cspec', placeholder: 'e.g. General Practice' },
                  ].map(f => (
                    <div key={f.id} className="form-group">
                      <label className="form-label" htmlFor={f.id}>{f.label}</label>
                      <input id={f.id} className="form-input" placeholder={f.placeholder} />
                    </div>
                  ))}
                  <div className="form-group medical-span-2">
                    <label className="form-label" htmlFor="caddress">Address</label>
                    <input id="caddress" className="form-input" placeholder="Street, City, State ZIP" />
                  </div>
                </div>
                <button className="btn-primary btn-md" style={{ marginTop: 8 }} title="Coming soon">
                  Save Changes
                </button>
              </fieldset>
              <ComingSoonNote>Managing clinic details is coming soon.</ComingSoonNote>
            </div>
          )}

          {tab === 'Security' && (
            <div className="card">
              <div className="card-title" style={{ marginBottom: 20 }}>Security Settings</div>
              <fieldset disabled style={{ border: 'none', padding: 0, margin: '0 0 24px', minWidth: 0 }}>
                <legend style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>Change Password</legend>
                <div className="form-group">
                  <label className="form-label" htmlFor="curpwd">Current Password</label>
                  <input id="curpwd" className="form-input" type="password" autoComplete="current-password" />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="newpwd">New Password</label>
                  <input id="newpwd" className="form-input" type="password" autoComplete="new-password" />
                </div>
                <button className="btn-primary btn-md" title="Coming soon">Update Password</button>
                <ComingSoonNote>Changing your password from the dashboard is coming soon.</ComingSoonNote>
              </fieldset>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>Two-Factor Authentication</div>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>Add an extra layer of security to your account.</p>
                <button className="btn-secondary btn-md" disabled title="Coming soon">Enable 2FA</button>
                <ComingSoonNote>Two-factor authentication is coming soon.</ComingSoonNote>
              </div>
            </div>
          )}
        </div>
      </div>
    </MedicalLayout>
  );
}
