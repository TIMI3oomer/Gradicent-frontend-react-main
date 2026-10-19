import { useState, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CircleCheck as CheckCircle, CircleAlert as AlertCircle, Info, TriangleAlert as AlertTriangle, Bell } from 'lucide-react';
import { MedicalLayout } from '../../layouts/MedicalLayout/MedicalLayout';
import { useMedicalNotifications } from '../../components/medical/useMedicalNotifications';
import { formatRelativeTime } from '../../lib/formatters';
import { cn } from '../../lib/cn';
import type { Notification } from '../../types';

const icons = {
  success: <CheckCircle size={16} style={{ color: '#4CAF7D' }} aria-hidden="true" />,
  error:   <AlertCircle  size={16} style={{ color: '#D95C5C' }} aria-hidden="true" />,
  warning: <AlertTriangle size={16} style={{ color: '#E8A838' }} aria-hidden="true" />,
  info:    <Info          size={16} style={{ color: '#78CEE6' }} aria-hidden="true" />,
};

export function MedicalNotifications() {
  const navigate = useNavigate();
  const { notifications, read, unreadCount, markRead, markAllRead } = useMedicalNotifications();
  const [filter, setFilter] = useState<'All' | 'Unread'>('All');

  const filtered = notifications.filter(n => filter === 'All' || !read.has(n.id));

  // Only follow links inside the medical workspace (some system items point at business pages)
  const medicalLink = (n: Notification) => (n.link && n.link.startsWith('/medical') ? n.link : null);

  const openNotification = (n: Notification) => {
    markRead(n.id);
    const link = medicalLink(n);
    if (link) navigate(link);
  };

  const onRowKeyDown = (event: KeyboardEvent<HTMLDivElement>, n: Notification) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openNotification(n);
    }
  };

  return (
    <MedicalLayout title="Notifications">
      <div style={{ maxWidth: 680 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {(['All', 'Unread'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={f === filter ? 'btn-primary btn-sm' : 'btn-ghost btn-sm'}
                aria-pressed={f === filter}
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
            <Bell size={32} style={{ margin: '0 auto 12px', opacity: 0.3 }} aria-hidden="true" />
            <div>{filter === 'Unread' ? 'No unread notifications' : 'No notifications'}</div>
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
                  className={cn('card', 'medical-clickable-row', isUnread && 'notif-unread')}
                  role="button"
                  tabIndex={0}
                  aria-label={`${isUnread ? 'Unread: ' : ''}${n.title}. ${n.message}${medicalLink(n) ? '' : ' (marks as read)'}`}
                  style={{
                    display: 'flex', gap: 12, alignItems: 'flex-start',
                    padding: '14px 16px',
                    borderLeft: isUnread ? '3px solid var(--accent)' : '3px solid transparent',
                  }}
                  onClick={() => openNotification(n)}
                  onKeyDown={event => onRowKeyDown(event, n)}
                >
                  <div style={{ flexShrink: 0, marginTop: 1 }}>{icons[n.type]}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 3 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{n.title}</div>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{formatRelativeTime(n.createdAt)}</span>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{n.message}</p>
                  </div>
                  {isUnread && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0, marginTop: 5 }} aria-hidden="true" />}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </MedicalLayout>
  );
}
