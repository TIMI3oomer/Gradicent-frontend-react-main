import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { notifications as sourceNotifications } from '../../data/notifications';

// Single source of truth for business notifications, shared by the top bar bell and the
// Notifications page so the unread dot always matches the page's unread count.
// There is no notifications endpoint on the backend yet, so the list comes from the bundled
// sample data and the read state is remembered per browser.

const STORAGE_KEY = 'gradicent_business_notifications_read';

export const businessNotifications = sourceNotifications.filter(n => n.domain === 'business' || n.domain === 'system');

function loadReadIds(): Set<string> {
  const initial = new Set(businessNotifications.filter(n => n.read).map(n => n.id));
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) parsed.forEach(id => typeof id === 'string' && initial.add(id));
    }
  } catch {
    // Storage unavailable (private mode etc.) — fall back to the defaults
  }
  return initial;
}

let readIds = loadReadIds();
const listeners = new Set<() => void>();

function setReadIds(next: Set<string>) {
  readIds = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
  } catch {
    // ignore storage failures
  }
  listeners.forEach(listener => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

function getSnapshot() {
  return readIds;
}

export function useBusinessNotifications() {
  const read = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const unreadCount = useMemo(() => businessNotifications.filter(n => !read.has(n.id)).length, [read]);

  const markRead = useCallback((id: string) => {
    if (readIds.has(id)) return;
    setReadIds(new Set([...readIds, id]));
  }, []);

  const markAllRead = useCallback(() => {
    setReadIds(new Set(businessNotifications.map(n => n.id)));
  }, []);

  return { notifications: businessNotifications, read, unreadCount, markRead, markAllRead };
}
