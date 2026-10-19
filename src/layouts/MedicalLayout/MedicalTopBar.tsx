import { Bell, Plus, Moon, Sun, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useMedicalNotifications } from '../../components/medical/useMedicalNotifications';

interface MedicalTopBarProps {
  title: string;
  breadcrumb?: string;
  actionLabel?: string;
  actionPath?: string;
  menuOpen?: boolean;
  menuButtonId?: string;
  sidebarId?: string;
  onMenuToggle?: () => void;
}

export function MedicalTopBar({
  title,
  breadcrumb,
  actionLabel,
  actionPath,
  menuOpen = false,
  menuButtonId,
  sidebarId,
  onMenuToggle,
}: MedicalTopBarProps) {
  const navigate = useNavigate();
  const { isDark, toggleDark } = useTheme();
  const { unreadCount } = useMedicalNotifications();

  return (
    <header className="medical-topbar">
      <div className="medical-topbar-lead">
        {onMenuToggle && (
          <button
            id={menuButtonId}
            type="button"
            className="topbar-icon-btn medical-menu-btn"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
            aria-controls={sidebarId}
            onClick={onMenuToggle}
          >
            {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        )}
        <div className="topbar-title-wrap">
          {breadcrumb && <div className="topbar-breadcrumb">{breadcrumb}</div>}
          <h1 className="topbar-title">{title}</h1>
        </div>
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
          aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
          onClick={() => navigate('/medical/notifications')}
        >
          <Bell size={18} aria-hidden="true" />
          {unreadCount > 0 && <span className="notif-badge" aria-hidden="true" />}
        </button>
      </div>
    </header>
  );
}
