import { Bell, Plus, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { mockNotifications } from '../../data/notifications';

interface MedicalTopBarProps {
  title: string;
  breadcrumb?: string;
  actionLabel?: string;
  actionPath?: string;
}

export function MedicalTopBar({ title, breadcrumb, actionLabel, actionPath }: MedicalTopBarProps) {
  const navigate = useNavigate();
  const { isDark, toggleDark } = useTheme();
  const unreadCount = mockNotifications.filter(n => !n.read && n.domain === 'medical').length;

  return (
    <header className="medical-topbar">
      <div className="topbar-title-wrap">
        {breadcrumb && <div className="topbar-breadcrumb">{breadcrumb}</div>}
        <h1 className="topbar-title">{title}</h1>
      </div>
      <div className="topbar-actions">
        <button
          className={`dark-mode-toggle${isDark ? ' on' : ''}`}
          onClick={toggleDark}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDark ? 'Light mode' : 'Dark mode'}
        >
          <div className="dark-mode-knob" />
        </button>
        {isDark ? <Moon size={14} style={{ color: 'var(--text-muted)' }} aria-hidden="true" /> : <Sun size={14} style={{ color: 'var(--text-muted)' }} aria-hidden="true" />}
        {actionLabel && (
          <button
            className="btn-primary btn-md"
            onClick={() => actionPath && navigate(actionPath)}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Plus size={16} />
            {actionLabel}
          </button>
        )}
        <button
          className="topbar-icon-btn"
          aria-label="Notifications"
          onClick={() => navigate('/medical/notifications')}
        >
          <Bell size={18} />
          {unreadCount > 0 && <span className="notif-badge" aria-label={`${unreadCount} unread`} />}
        </button>
      </div>
    </header>
  );
}
