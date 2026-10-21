import { useState, type KeyboardEvent } from 'react';
import { ExternalLink, ShieldCheck } from 'lucide-react';
import { MedicalLayout } from '../../layouts/MedicalLayout/MedicalLayout';
import { ErrorBanner, LoadingState } from '../../components/shared/PageStatus';
import { SettingsForm, type SettingsField } from '../../components/shared/SettingsForm';
import { NotificationPreferences } from '../../components/shared/NotificationPreferences';
import { profileObject, profileText, useUserProfile } from '../../components/shared/userProfile';

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

// Used for any toggle the account hasn't saved yet
const defaultNotifs: Record<string, boolean> = { email: true, sms: false, newPatient: true, reminders: true, system: true, digest: false };

const profileFields: SettingsField[] = [
  { key: 'name', label: 'Full Name', required: true, autoComplete: 'name' },
  { key: 'email', label: 'Email', type: 'email', readOnly: true, hint: 'Comes from your Google account.' },
  { key: 'phone', label: 'Phone', type: 'tel', autoComplete: 'tel', placeholder: '(555) 000-0000' },
  { key: 'specialty', label: 'Specialty', placeholder: 'e.g. General Practice' },
  { key: 'license_number', label: 'License Number', placeholder: 'Not set' },
];

const clinicFields: SettingsField[] = [
  { key: 'name', label: 'Clinic Name', autoComplete: 'organization', placeholder: 'Your clinic name' },
  { key: 'phone', label: 'Phone', type: 'tel', autoComplete: 'tel', placeholder: '(555) 000-0000' },
  { key: 'email', label: 'Email', type: 'email', autoComplete: 'email', placeholder: 'clinic@example.com' },
  { key: 'address', label: 'Address', autoComplete: 'street-address', placeholder: 'Street, City, State ZIP', className: 'medical-span-2' },
];

const GOOGLE_SECURITY_URL = 'https://myaccount.google.com/security';

const tabId = (i: number) => `settings-tab-${i}`;

export function MedicalSettings() {
  const [tab, setTab] = useState<Tab>('Profile');
  const profile = useUserProfile('medical');
  const { record } = profile;
  const clinic = profileObject(record, 'clinic');

  const profileStatus = profile.isLoading
    ? <LoadingState label="Loading your profile..." padding="24px 0" />
    : profile.loadError ? <ErrorBanner message={profile.loadError} onRetry={profile.reload} /> : null;

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
              {profileStatus ?? (
                // Mounted only after the profile has loaded, so its initial values are the saved ones
                <SettingsForm
                  fields={profileFields}
                  gridClassName="medical-form-grid"
                  initialValues={{
                    name: profileText(record, 'name', 'full_name'),
                    email: profileText(record, 'email') || profile.email,
                    phone: profileText(record, 'phone', 'phone_number'),
                    specialty: profileText(record, 'specialty'),
                    license_number: profileText(record, 'license_number', 'licenseNumber'),
                  }}
                  onSave={values => profile.save({
                    name: values.name,
                    phone: values.phone,
                    specialty: values.specialty,
                    license_number: values.license_number,
                  })}
                  savedMessage="Profile saved."
                />
              )}
            </div>
          )}

          {tab === 'Notifications' && (
            <div className="card">
              <div className="card-title" style={{ marginBottom: 8 }}>Notification Preferences</div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Changes are saved to your account as soon as you flip a switch.</p>
              {profileStatus ?? (
                <NotificationPreferences items={notifItems} defaults={defaultNotifs} record={record} save={profile.save} onColor="var(--accent)" />
              )}
            </div>
          )}

          {tab === 'Clinic Info' && (
            <div className="card">
              <div className="card-title" style={{ marginBottom: 20 }}>Clinic Information</div>
              {profileStatus ?? (
                <SettingsForm
                  fields={clinicFields}
                  gridClassName="medical-form-grid"
                  initialValues={{
                    name: profileText(clinic, 'name'),
                    phone: profileText(clinic, 'phone'),
                    email: profileText(clinic, 'email'),
                    address: profileText(clinic, 'address'),
                  }}
                  onSave={values => profile.save({
                    // Keep any other clinic details already on the record
                    clinic: { ...clinic, name: values.name, phone: values.phone, email: values.email, address: values.address },
                  })}
                  savedMessage="Clinic details saved."
                />
              )}
            </div>
          )}

          {tab === 'Security' && (
            <div className="card">
              <div className="card-title" style={{ marginBottom: 16 }}>Security</div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 16 }}>
                <ShieldCheck size={22} aria-hidden="true" style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 2 }} />
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6, marginBottom: 6 }}>
                    You sign in to Binder Software with your Google account, so there is no separate Binder password to manage.
                  </p>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    Your password, two-step verification and signed-in devices are managed in your Google account settings.
                  </p>
                </div>
              </div>
              <a
                href={GOOGLE_SECURITY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary btn-md"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}
              >
                Manage Google account security <ExternalLink size={14} aria-hidden="true" />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </MedicalLayout>
  );
}
