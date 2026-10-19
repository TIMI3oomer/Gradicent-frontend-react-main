import type { RefObject } from 'react';
import { Bell, Sun, Moon, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useBusinessNotifications } from '../../components/business/businessNotifications';
import { BUSINESS_ROUTES } from '../../lib/constants';

interface BusinessTopBarProps {
  title: string;
  menuOpen?: boolean;
  onMenuClick?: () => void;
  menuButtonRef?: RefObject<HTMLButtonElement>;
}

export function BusinessTopBar({ title, menuOpen = false, onMenuClick, menuButtonRef }: BusinessTopBarProps) {
  const navigate = useNavigate();
  const { isDark, toggleDark } = useTheme();
  // Same source as the Notifications page, so the dot clears when everything is read there
  const { unreadCount } = useBusinessNotifications();

  return (
    <header className="business-topbar">
      <div className="biz-topbar-left">
        {onMenuClick && (
          <button
            ref={menuButtonRef}
            type="button"
            className="topbar-icon-btn biz-menu-btn"
            onClick={onMenuClick}
            aria-label="Open navigation"
            aria-controls="biz-sidebar"
            aria-expanded={menuOpen}
          >
            <Menu size={20} aria-hidden="true" />
          </button>
        )}
        <h1 className="biz-topbar-title">{title}</h1>
      </div>
      <div className="biz-topbar-right">
        <button
          className={`dark-mode-toggle${isDark ? ' on' : ''}`}
          onClick={toggleDark}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDark ? 'Light mode' : 'Dark mode'}
        >
          <div className="dark-mode-knob" />
        </button>
        {isDark ? <Moon size={14} style={{ color: 'var(--text-muted)' }} aria-hidden="true" /> : <Sun size={14} style={{ color: 'var(--text-muted)' }} aria-hidden="true" />}

        <button
          className="topbar-icon-btn"
          aria-label={unreadCount > 0 ? `Notifications (${unreadCount} unread)` : 'Notifications'}
          onClick={() => navigate(BUSINESS_ROUTES.NOTIFICATIONS)}
          style={{ color: 'var(--text-muted)' }}
        >
          <Bell size={18} aria-hidden="true" />
          {unreadCount > 0 && <span className="notif-badge" aria-hidden="true" />}
        </button>
      </div>
    </header>
  );
}
