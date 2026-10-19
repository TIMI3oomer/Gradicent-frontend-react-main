import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { mockNotifications } from '../../data/notifications';
import type { Notification } from '../../types';

/**
 * Single source of truth for which notifications the medical workspace shows,
 * so the top-bar badge and the Notifications page always count the same items.
 * Read state is local to this browser (mock data source).
 */
const MEDICAL_DOMAINS: ReadonlyArray<Notification['domain']> = ['medical', 'system'];
const STORAGE_KEY = 'gradicent_medical_read_notifications';

export const medicalNotifications: Notification[] = mockNotifications.filter(n => MEDICAL_DOMAINS.includes(n.domain));

function loadReadIds(): Set<string> {
  const initial = medicalNotifications.filter(n => n.read).map(n => n.id);
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const stored = raw ? (JSON.parse(raw) as unknown) : [];
    if (Array.isArray(stored)) {
      return new Set([...initial, ...stored.filter((id): id is string => typeof id === 'string')]);
    }
  } catch {
    // Storage unavailable (private mode, blocked) — fall back to the mock flags
  }
  return new Set(initial);
}

let readIds: Set<string> = loadReadIds();
const listeners = new Set<() => void>();

function setReadIds(next: Set<string>) {
  readIds = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
  } catch {
    // Ignore persistence failures; in-memory state still updates
  }
  listeners.forEach(listener => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return readIds;
}

export function useMedicalNotifications() {
  const read = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const unreadCount = useMemo(
    () => medicalNotifications.filter(n => !read.has(n.id)).length,
    [read],
  );

  const markRead = useCallback((id: string) => {
    if (readIds.has(id)) return;
    setReadIds(new Set([...readIds, id]));
  }, []);

  const markAllRead = useCallback(() => {
    setReadIds(new Set([...readIds, ...medicalNotifications.map(n => n.id)]));
  }, []);

  return { notifications: medicalNotifications, read, unreadCount, markRead, markAllRead };
}
