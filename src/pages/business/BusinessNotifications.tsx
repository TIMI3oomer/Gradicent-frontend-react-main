import { useState } from 'react';
import { motion } from 'framer-motion';
import { CircleCheck as CheckCircle, CircleAlert as AlertCircle, Info, TriangleAlert as AlertTriangle, Bell } from 'lucide-react';
import { BusinessLayout } from '../../layouts/BusinessLayout/BusinessLayout';
import { useBusinessNotifications } from '../../components/business/businessNotifications';
import { formatRelativeTime } from '../../lib/formatters';
import { cn } from '../../lib/cn';

const icons = {
  success: <CheckCircle size={16} style={{ color: '#22c55e' }} />,
  error:   <AlertCircle  size={16} style={{ color: 'var(--danger)' }} />,
  warning: <AlertTriangle size={16} style={{ color: '#f59e0b' }} />,
  info:    <Info          size={16} style={{ color: 'var(--primary)' }} />,
};

export function BusinessNotifications() {
  const { notifications, read, unreadCount, markRead, markAllRead } = useBusinessNotifications();
  const [filter, setFilter] = useState<'All' | 'Unread'>('All');

  const filtered = notifications.filter(n => filter === 'All' || !read.has(n.id));

  return (
    <BusinessLayout title="Notifications">
      <div style={{ maxWidth: 680 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 4 }} role="tablist" aria-label="Filter notifications">
            {(['All', 'Unread'] as const).map(f => (
              <button
                key={f}
                role="tab"
                aria-selected={f === filter}
                onClick={() => setFilter(f)}
                className={f === filter ? 'btn-primary btn-sm' : 'btn-ghost btn-sm'}
              >
                {f} {f === 'Unread' && unreadCount > 0 && `(${unreadCount})`}
              </button>
            ))}
          </div>
          {unreadCount > 0 && (
            <button className="btn-ghost btn-sm" onClick={markAllRead}>
              Mark all as read
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
            <Bell size={32} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <div>{filter === 'Unread' ? 'You have no unread notifications.' : 'No notifications'}</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map((n, i) => {
              const isUnread = !read.has(n.id);
              return (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={cn('card', isUnread && 'notif-unread')}
                  style={{
                    display: 'flex', gap: 12, alignItems: 'flex-start',
                    padding: '14px 16px',
                    cursor: isUnread ? 'pointer' : 'default',
                    borderLeft: isUnread ? '3px solid var(--primary)' : '3px solid transparent',
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`${n.title}${isUnread ? ' (unread, press to mark as read)' : ''}`}
                  onClick={() => markRead(n.id)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); markRead(n.id); }
                  }}
                >
                  <div style={{ flexShrink: 0, marginTop: 1 }}>{icons[n.type]}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{n.title}</div>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatRelativeTime(n.createdAt)}</span>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{n.message}</p>
                  </div>
                  {isUnread && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0, marginTop: 5 }} aria-hidden="true" />}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </BusinessLayout>
  );
}
