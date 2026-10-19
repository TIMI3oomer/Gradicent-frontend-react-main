import { useState } from 'react';
import { BusinessLayout } from '../../layouts/BusinessLayout/BusinessLayout';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Moon, Sun } from 'lucide-react';

const TABS = ['General', 'Notifications', 'Integrations', 'Danger Zone'] as const;
type Tab = typeof TABS[number];

// None of the settings below have a backend endpoint yet (there is no profile update,
// preferences, integrations or account-deletion route), so their controls are shown
// disabled instead of pretending to save.
const COMING_SOON = 'Coming soon';

const notifItems = [
  { key: 'email', label: 'Email Notifications', desc: 'Receive all updates via email', on: true },
  { key: 'newClient', label: 'New Client Alerts', desc: 'Notify when a new client is added', on: true },
  { key: 'churn', label: 'Churn Risk Alerts', desc: 'Alert when a client shows churn signals', on: true },
  { key: 'payment', label: 'Payment Notifications', desc: 'Alerts for successful and failed payments', on: true },
  { key: 'reports', label: 'Weekly Reports', desc: 'Automated weekly performance digest', on: false },
];

const integrations = [
  { name: 'Salesforce', desc: 'CRM sync and lead pipeline' },
  { name: 'Stripe', desc: 'Payment processing and billing' },
  { name: 'HubSpot', desc: 'Marketing and inbound automation' },
  { name: 'Slack', desc: 'Team notifications and alerts' },
  { name: 'Google Analytics', desc: 'Website traffic and conversion tracking' },
  { name: 'Zapier', desc: '2,000+ app integrations' },
];

function companyOf(user: unknown): string {
  if (!user || typeof user !== 'object') return '';
  const u = user as Record<string, unknown>;
  const value = u.company ?? u.companyName ?? u.company_name ?? u.organization;
  return typeof value === 'string' ? value : '';
}

export function BusinessSettings() {
  const [tab, setTab] = useState<Tab>('General');
  const { isDark, toggleDark } = useTheme();
  const { user } = useAuth();

  return (
    <BusinessLayout title="Settings">
      <div className="biz-settings-shell">
        <div className="biz-settings-nav" role="tablist" aria-label="Settings sections">
          {TABS.map(t => (
            <button
              key={t}
              role="tab"
              id={`settings-tab-${t}`}
              aria-selected={tab === t}
              aria-controls={`settings-panel-${t}`}
              onClick={() => setTab(t)}
            >{t}</button>
          ))}
        </div>

        <div className="biz-settings-panel" role="tabpanel" id={`settings-panel-${tab}`} aria-labelledby={`settings-tab-${tab}`}>
          {tab === 'General' && (
            <>
              <div className="card" style={{ marginBottom: 16 }}>
                <div className="card-title" style={{ marginBottom: 20 }}>Profile</div>
                <div className="biz-grid-2">
                  {[
                    { label: 'Full Name', value: user?.name, id: 'bname' },
                    { label: 'Email', value: user?.email, id: 'bemail' },
                    { label: 'Company', value: companyOf(user), id: 'bcompany' },
                  ].map(f => (
                    <div key={f.id} className="form-group" style={{ minWidth: 0 }}>
                      <label className="form-label" htmlFor={f.id}>{f.label}</label>
                      <input id={f.id} className="form-input" value={f.value ?? ''} placeholder="—" readOnly />
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
                  <button className="btn-primary btn-md" disabled title={COMING_SOON}>Save Changes</button>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Profile editing is coming soon.</span>
                </div>
              </div>

              <div className="card">
                <div className="card-title" style={{ marginBottom: 16 }}>Appearance</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Dark Mode</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Switch between light and dark themes</div>
                  </div>
                  <button
                    onClick={toggleDark}
                    aria-pressed={isDark}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px',
                      background: isDark ? 'var(--primary)' : 'var(--surface)',
                      border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer',
                      color: isDark ? 'white' : 'var(--text)', fontSize: 13, fontWeight: 600,
                      transition: 'all 0.2s',
                    }}
                  >
                    {isDark ? <Moon size={14} aria-hidden="true" /> : <Sun size={14} aria-hidden="true" />}
                    {isDark ? 'Dark' : 'Light'}
                  </button>
                </div>
              </div>
            </>
          )}

          {tab === 'Notifications' && (
            <div className="card">
              <div className="card-title" style={{ marginBottom: 8 }}>Notification Preferences</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>Changing notification preferences is coming soon. These are the current defaults.</div>
              {notifItems.map((item, i) => (
                <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '14px 0', borderBottom: i < notifItems.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                  <div>
                    <div id={`notif-${item.key}`} style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{item.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>{item.desc}</div>
                  </div>
                  <button
                    role="switch"
                    aria-checked={item.on}
                    aria-labelledby={`notif-${item.key}`}
                    disabled
                    title={COMING_SOON}
                    style={{
                      width: 44, height: 24, borderRadius: 12,
                      background: item.on ? 'var(--primary)' : 'var(--border)',
                      border: 'none', cursor: 'not-allowed', position: 'relative', flexShrink: 0, opacity: 0.6,
                    }}
                  >
                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: item.on ? 23 : 3, boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {tab === 'Integrations' && (
            <div className="card">
              <div className="card-title" style={{ marginBottom: 8 }}>Integrations</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>Third-party integrations are coming soon.</div>
              {integrations.map((intg, i) => (
                <div key={intg.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '14px 0', borderBottom: i < integrations.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{intg.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{intg.desc}</div>
                  </div>
                  <button className="btn-ghost btn-sm" disabled title={COMING_SOON} style={{ flexShrink: 0 }}>
                    Connect
                  </button>
                </div>
              ))}
            </div>
          )}

          {tab === 'Danger Zone' && (
            <div className="card" style={{ border: '1px solid var(--danger)' }}>
              <div className="card-title" style={{ marginBottom: 8, color: 'var(--danger)' }}>Danger Zone</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                These account actions aren't available yet. Contact support if you need your data exported or your account removed.
              </div>
              {[
                { title: 'Export All Data', desc: 'Download a full export of all your business data.', action: 'Export Data', danger: false },
                { title: 'Reset Account', desc: 'Reset all settings and data to defaults. This cannot be undone.', action: 'Reset Account', danger: true },
                { title: 'Delete Account', desc: 'Permanently delete your account and all associated data.', action: 'Delete Account', danger: true },
              ].map((item, i) => (
                <div key={item.title} style={{ padding: '16px 0', borderBottom: i < 2 ? '1px solid var(--border-light)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 200px' }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{item.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.desc}</div>
                    </div>
                    <button className={item.danger ? 'btn-danger btn-sm' : 'btn-ghost btn-sm'} style={{ flexShrink: 0 }} disabled title={COMING_SOON}>
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
