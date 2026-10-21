// Loads and saves the signed-in user's profile record (GET/PATCH /api/binder/user/<id>).
import { useCallback, useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { SIGNED_OUT_MESSAGE, errorMessage, toRecord } from './apiHelpers';

export type ProfileDomain = 'medical' | 'business';
export type ProfileRecord = Record<string, unknown>;

/** The only fields the PATCH route accepts; anything else is dropped before sending. */
const EDITABLE_FIELDS = ['name', 'phone', 'company', 'job_title', 'specialty', 'license_number', 'clinic', 'preferences'] as const;
type EditableField = typeof EDITABLE_FIELDS[number];
export type ProfilePatch = Partial<Record<EditableField, unknown>>;

/** UI state for a save button: idle (null), in flight, done, or failed with a message. */
export type SaveStatus = { type: 'saving' } | { type: 'saved' } | { type: 'error'; message: string } | null;

const isObject = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

/** First non-empty string among the given keys of the record. */
export function profileText(record: ProfileRecord | null, ...keys: string[]): string {
  if (!record) return '';
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value;
    if (typeof value === 'number') return String(value);
  }
  return '';
}

/** A nested object field (e.g. `clinic`, `preferences`), or an empty object. */
export function profileObject(record: ProfileRecord | null, key: string): Record<string, unknown> {
  const value = record?.[key];
  return isObject(value) ? value : {};
}

/** Saved notification toggles merged over the page's defaults. */
export function notificationPrefs(record: ProfileRecord | null, defaults: Record<string, boolean>): Record<string, boolean> {
  const saved = profileObject(profileObject(record, 'preferences'), 'notifications');
  const merged = { ...defaults };
  for (const key of Object.keys(defaults)) {
    if (typeof saved[key] === 'boolean') merged[key] = saved[key] as boolean;
  }
  return merged;
}

export function useUserProfile(domain: ProfileDomain) {
  const { user, isLoading: authLoading, updateUser } = useAuth();
  const userId = user?.id;
  const [record, setRecord] = useState<ProfileRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!userId) {
      if (!authLoading) {
        setIsLoading(false);
        setLoadError(SIGNED_OUT_MESSAGE);
      }
      return;
    }
    let ignore = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const res = await api.safeFetch(`/api/binder/user/${encodeURIComponent(userId)}?domain=${domain}`);
        if (ignore) return;
        setRecord(toRecord<ProfileRecord>(res) ?? {});
      } catch (err) {
        if (ignore) return;
        console.error('[Settings] Could not load profile:', err);
        setLoadError(errorMessage(err, 'Could not load your profile.'));
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };
    load();
    return () => { ignore = true; };
  }, [userId, authLoading, domain, reloadKey]);

  const reload = useCallback(() => setReloadKey(k => k + 1), []);

  /** PATCHes the allowed fields and merges them into the local record. Throws on failure. */
  const save = useCallback(async (patch: ProfilePatch) => {
    if (!userId) throw new Error(SIGNED_OUT_MESSAGE);
    const fields: ProfilePatch = {};
    for (const key of EDITABLE_FIELDS) {
      if (key in patch) fields[key] = patch[key];
    }
    await api.safeFetch(`/api/binder/user/${encodeURIComponent(userId)}`, {
      method: 'PATCH',
      body: JSON.stringify({ domain, user: fields }),
    });
    setRecord(prev => ({ ...(prev ?? {}), ...fields }));
    // Keep the name shown in the header/sidebar in step with what was just saved
    if (typeof fields.name === 'string' && fields.name.trim()) updateUser({ name: fields.name.trim() });
  }, [userId, domain, updateUser]);

  return { record, isLoading, loadError, reload, save, email: user?.email ?? '' };
}
