import { useId, useState } from 'react';
import { ToggleSwitch } from './ToggleSwitch';
import { errorMessage } from './apiHelpers';
import { notificationPrefs, profileObject, type ProfilePatch, type ProfileRecord, type SaveStatus } from './userProfile';

export type NotificationItem = { key: string; label: string; desc: string };

interface NotificationPreferencesProps {
  items: NotificationItem[];
  defaults: Record<string, boolean>;
  record: ProfileRecord | null;
  save: (patch: ProfilePatch) => Promise<void>;
  disabled?: boolean;
  onColor?: string;
}

/** Toggle list saved as `preferences.notifications` on the user record; each change saves immediately. */
export function NotificationPreferences({ items, defaults, record, save, disabled = false, onColor }: NotificationPreferencesProps) {
  const baseId = useId();
  // Optimistic value while a change is being saved; cleared once the record holds it (or the save fails)
  const [pending, setPending] = useState<Record<string, boolean> | null>(null);
  const [status, setStatus] = useState<SaveStatus>(null);
  const saving = status?.type === 'saving';
  const current = pending ?? notificationPrefs(record, defaults);

  // Switches stay enabled while saving (so keyboard focus isn't lost); extra clicks are ignored until it finishes
  const toggle = async (key: string, value: boolean) => {
    if (saving || disabled) return;
    const next = { ...current, [key]: value };
    setPending(next);
    setStatus({ type: 'saving' });
    try {
      // Keep any other saved preferences intact
      await save({ preferences: { ...profileObject(record, 'preferences'), notifications: next } });
      setStatus({ type: 'saved' });
    } catch (err) {
      setStatus({ type: 'error', message: errorMessage(err, 'Could not save your notification preferences.') });
    } finally {
      setPending(null);
    }
  };

  return (
    <>
      <div>
        {items.map((item, i) => {
          const labelId = `${baseId}-${item.key}-label`;
          const descId = `${baseId}-${item.key}-desc`;
          return (
            <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '14px 0', borderBottom: i < items.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
              <div style={{ minWidth: 0 }}>
                <div id={labelId} style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{item.label}</div>
                <div id={descId} style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>{item.desc}</div>
              </div>
              <ToggleSwitch
                checked={!!current[item.key]}
                onChange={value => toggle(item.key, value)}
                labelledBy={labelId}
                describedBy={descId}
                disabled={disabled}
                onColor={onColor}
              />
            </div>
          );
        })}
      </div>
      <p role="status" aria-live="polite" style={{ fontSize: 13, marginTop: 8, minHeight: 18 }}>
        {saving && <span style={{ color: 'var(--text-muted)' }}>Saving…</span>}
        {status?.type === 'saved' && <span style={{ color: 'var(--success)' }}>Preferences saved.</span>}
        {status?.type === 'error' && <span style={{ color: 'var(--danger)' }}>{status.message}</span>}
      </p>
    </>
  );
}
