import { useState } from 'react';
import { motion } from 'framer-motion';
import { CircleCheck as CheckCircle, CircleAlert as AlertCircle, Info, TriangleAlert as AlertTriangle, Bell } from 'lucide-react';
import { MedicalLayout } from '../../layouts/MedicalLayout/MedicalLayout';
import { mockNotifications } from '../../data/notifications';
import { formatRelativeTime } from '../../lib/formatters';
import { cn } from '../../lib/cn';

const icons = {
  success: <CheckCircle size={16} style={{ color: '#4CAF7D' }} />,
  error:   <AlertCircle  size={16} style={{ color: '#D95C5C' }} />,
  warning: <AlertTriangle size={16} style={{ color: '#E8A838' }} />,
  info:    <Info          size={16} style={{ color: '#78CEE6' }} />,
};

export function MedicalNotifications() {
  const medNotifs = mockNotifications.filter(n => n.domain === 'medical' || n.domain === 'system');
  const [filter, setFilter] = useState<'All' | 'Unread'>('All');
  const [read, setRead] = useState<Set<string>>(new Set(medNotifs.filter(n => n.read).map(n => n.id)));

  const filtered = medNotifs.filter(n => filter === 'All' || !read.has(n.id));
  const unreadCount = medNotifs.filter(n => !read.has(n.id)).length;

  return (
    <MedicalLayout title="Notifications">
      <div style={{ maxWidth: 680 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {(['All', 'Unread'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} className={f === filter ? 'btn-primary btn-sm' : 'btn-ghost btn-sm'}>
                {f} {f === 'Unread' && unreadCount > 0 && `(${unreadCount})`}
              </button>
            ))}
          </div>
          {unreadCount > 0 && (
            <button className="btn-ghost btn-sm" onClick={() => setRead(new Set(medNotifs.map(n => n.id)))}>
              Mark all as read
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
            <Bell size={32} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <div>No notifications</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map((n, i) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={cn('card', !read.has(n.id) && 'notif-unread')}
                style={{
                  display: 'flex', gap: 12, alignItems: 'flex-start',
                  padding: '14px 16px',
                  cursor: 'pointer',
                  borderLeft: !read.has(n.id) ? '3px solid var(--accent)' : '3px solid transparent',
                }}
                onClick={() => setRead(r => new Set([...r, n.id]))}
              >
                <div style={{ flexShrink: 0, marginTop: 1 }}>{icons[n.type]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{n.title}</div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatRelativeTime(n.createdAt)}</span>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{n.message}</p>
                </div>
                {!read.has(n.id) && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0, marginTop: 5 }} />}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </MedicalLayout>
  );
}
