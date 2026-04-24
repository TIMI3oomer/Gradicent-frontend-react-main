import { useState } from 'react';
import { BusinessLayout } from '../../layouts/BusinessLayout/BusinessLayout';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Moon, Sun } from 'lucide-react';

const TABS = ['General', 'Notifications', 'Integrations', 'Danger Zone'];

const notifItems = [
  { key: 'email', label: 'Email Notifications', desc: 'Receive all updates via email' },
  { key: 'slack', label: 'Slack Integration', desc: 'Push alerts to your Slack workspace' },
  { key: 'newClient', label: 'New Client Alerts', desc: 'Notify when a new client is added' },
  { key: 'churn', label: 'Churn Risk Alerts', desc: 'Alert when a client shows churn signals' },
  { key: 'payment', label: 'Payment Notifications', desc: 'Alerts for successful and failed payments' },
  { key: 'reports', label: 'Weekly Reports', desc: 'Automated weekly performance digest' },
];

const integrations = [
  { name: 'Salesforce', desc: 'CRM sync and lead pipeline', connected: true },
  { name: 'Stripe', desc: 'Payment processing and billing', connected: true },
  { name: 'HubSpot', desc: 'Marketing and inbound automation', connected: false },
  { name: 'Slack', desc: 'Team notifications and alerts', connected: false },
  { name: 'Google Analytics', desc: 'Website traffic and conversion tracking', connected: true },
  { name: 'Zapier', desc: '2,000+ app integrations', connected: false },
];

export function BusinessSettings() {
  const [tab, setTab] = useState('General');
  const { isDark, toggleDark } = useTheme();
  const { user } = useAuth();
  const [notifs, setNotifs] = useState<Record<string, boolean>>({ email: true, slack: false, newClient: true, churn: true, payment: true, reports: false });
  const [saved, setSaved] = useState(false);

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <BusinessLayout title="Settings">
      <div style={{ display: 'flex', gap: 24 }}>
        <div style={{ width: 180, flexShrink: 0 }}>
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: 6,
                background: tab === t ? 'var(--primary)' + '15' : 'transparent',
                color: tab === t ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: tab === t ? 700 : 400,
                fontSize: 13, border: 'none', cursor: 'pointer', marginBottom: 2,
                fontFamily: 'var(--font-dm-sans)',
              }}
            >{t}</button>
          ))}
        </div>

        <div style={{ flex: 1, maxWidth: 560 }}>
          {tab === 'General' && (
            <>
              <div className="card" style={{ marginBottom: 16 }}>
                <div className="card-title" style={{ marginBottom: 20 }}>Profile</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {[
                    { label: 'Full Name', value: user?.name, id: 'bname' },
                    { label: 'Email', value: user?.email, id: 'bemail' },
                    { label: 'Company', value: 'Gradicent Corp.', id: 'bcompany' },
                    { label: 'Role', value: 'Operations Manager', id: 'brole' },
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

              <div className="card">
                <div className="card-title" style={{ marginBottom: 16 }}>Appearance</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Dark Mode</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Switch between light and dark themes</div>
                  </div>
                  <button
                    onClick={toggleDark}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px',
                      background: isDark ? 'var(--primary)' : 'var(--surface)',
                      border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer',
                      color: isDark ? 'white' : 'var(--text)', fontSize: 13, fontWeight: 600,
                      transition: 'all 0.2s',
                    }}
                  >
                    {isDark ? <Moon size={14} /> : <Sun size={14} />}
                    {isDark ? 'Dark' : 'Light'}
                  </button>
                </div>
              </div>
            </>
          )}

          {tab === 'Notifications' && (
            <div className="card">
              <div className="card-title" style={{ marginBottom: 20 }}>Notification Preferences</div>
              {notifItems.map((item, i) => (
                <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: i < notifItems.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{item.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>{item.desc}</div>
                  </div>
                  <button
                    role="switch"
                    aria-checked={notifs[item.key]}
                    onClick={() => setNotifs(n => ({ ...n, [item.key]: !n[item.key] }))}
                    style={{
                      width: 44, height: 24, borderRadius: 12,
                      background: notifs[item.key] ? 'var(--primary)' : 'var(--border)',
                      border: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0, transition: 'background 0.3s',
                    }}
                  >
                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: notifs[item.key] ? 23 : 3, transition: 'left 0.3s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {tab === 'Integrations' && (
            <div className="card">
              <div className="card-title" style={{ marginBottom: 20 }}>Connected Integrations</div>
              {integrations.map((intg, i) => (
                <div key={intg.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: i < integrations.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{intg.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{intg.desc}</div>
                  </div>
                  <button className={intg.connected ? 'btn-ghost btn-sm' : 'btn-primary btn-sm'}>
                    {intg.connected ? 'Disconnect' : 'Connect'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {tab === 'Danger Zone' && (
            <div className="card" style={{ border: '1px solid var(--danger)' }}>
              <div className="card-title" style={{ marginBottom: 20, color: 'var(--danger)' }}>Danger Zone</div>
              {[
                { title: 'Export All Data', desc: 'Download a full export of all your business data.', action: 'Export Data', danger: false },
                { title: 'Reset Account', desc: 'Reset all settings and data to defaults. This cannot be undone.', action: 'Reset Account', danger: true },
                { title: 'Delete Account', desc: 'Permanently delete your account and all associated data.', action: 'Delete Account', danger: true },
              ].map((item, i) => (
                <div key={item.title} style={{ padding: '16px 0', borderBottom: i < 2 ? '1px solid var(--border-light)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{item.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.desc}</div>
                    </div>
                    <button className={item.danger ? 'btn-danger btn-sm' : 'btn-ghost btn-sm'} style={{ flexShrink: 0 }}>
                      {item.action}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </BusinessLayout>
  );
}
