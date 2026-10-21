import { useState } from 'react';
import { BusinessLayout } from '../../layouts/BusinessLayout/BusinessLayout';
import { useTheme } from '../../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';
import { ErrorBanner, LoadingState } from '../../components/shared/PageStatus';
import { SettingsForm, type SettingsField } from '../../components/shared/SettingsForm';
import { NotificationPreferences } from '../../components/shared/NotificationPreferences';
import { profileText, useUserProfile } from '../../components/shared/userProfile';

const TABS = ['General', 'Notifications', 'Integrations', 'Danger Zone'] as const;
type Tab = typeof TABS[number];

// Integrations and account deletion have no backend endpoint yet, so those controls stay disabled.
const COMING_SOON = 'Coming soon';

const notifItems = [
  { key: 'email', label: 'Email Notifications', desc: 'Receive all updates via email' },
  { key: 'newClient', label: 'New Client Alerts', desc: 'Notify when a new client is added' },
  { key: 'churn', label: 'Churn Risk Alerts', desc: 'Alert when a client shows churn signals' },
  { key: 'payment', label: 'Payment Notifications', desc: 'Alerts for successful and failed payments' },
  { key: 'reports', label: 'Weekly Reports', desc: 'Automated weekly performance digest' },
];

const defaultNotifs: Record<string, boolean> = { email: true, newClient: true, churn: true, payment: true, reports: false };

const profileFields: SettingsField[] = [
  { key: 'name', label: 'Full Name', required: true, autoComplete: 'name' },
  { key: 'email', label: 'Email', type: 'email', readOnly: true, hint: 'Comes from your Google account.' },
  { key: 'company', label: 'Company', autoComplete: 'organization', placeholder: 'Your company' },
  { key: 'job_title', label: 'Job Title', autoComplete: 'organization-title', placeholder: 'e.g. Founder' },
  { key: 'phone', label: 'Phone', type: 'tel', autoComplete: 'tel', placeholder: '(555) 000-0000' },
];

const integrations = [
  { name: 'Salesforce', desc: 'CRM sync and lead pipeline' },
  { name: 'Stripe', desc: 'Payment processing and billing' },
  { name: 'HubSpot', desc: 'Marketing and inbound automation' },
  { name: 'Slack', desc: 'Team notifications and alerts' },
  { name: 'Google Analytics', desc: 'Website traffic and conversion tracking' },
  { name: 'Zapier', desc: '2,000+ app integrations' },
];

export function BusinessSettings() {
  const [tab, setTab] = useState<Tab>('General');
  const { isDark, toggleDark } = useTheme();
  const profile = useUserProfile('business');
  const { record } = profile;

  const profileStatus = profile.isLoading
    ? <LoadingState label="Loading your profile..." padding="24px 0" />
    : profile.loadError ? <ErrorBanner message={profile.loadError} onRetry={profile.reload} /> : null;

  return (
    <BusinessLayout title="Settings">
      <div className="biz-settings-shell">
        <div className="biz-settings-nav" role="tablist" aria-label="Settings sections">
          {TABS.map(t => (
            <button
              key={t}
              type="button"
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
                {profileStatus ?? (
                  // Mounted only after the profile has loaded, so its initial values are the saved ones
                  <SettingsForm
                    fields={profileFields}
                    gridClassName="biz-grid-2"
                    initialValues={{
                      name: profileText(record, 'name', 'full_name'),
                      email: profileText(record, 'email') || profile.email,
                      company: profileText(record, 'company', 'company_name', 'organization'),
                      job_title: profileText(record, 'job_title', 'jobTitle', 'title'),
                      phone: profileText(record, 'phone', 'phone_number'),
                    }}
                    onSave={values => profile.save({
                      name: values.name,
                      company: values.company,
                      job_title: values.job_title,
                      phone: values.phone,
                    })}
                    savedMessage="Profile saved."
                  />
                )}
              </div>

              <div className="card">
                <div className="card-title" style={{ marginBottom: 16 }}>Appearance</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Dark Mode</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Switch between light and dark themes</div>
                  </div>
                  <button
                    type="button"
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
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Changes are saved to your account as soon as you flip a switch.</div>
              {profileStatus ?? (
                <NotificationPreferences items={notifItems} defaults={defaultNotifs} record={record} save={profile.save} onColor="var(--primary)" />
              )}
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
