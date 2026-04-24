import { Bell, Search, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { mockNotifications } from '../../data/notifications';

interface BusinessTopBarProps {
  title: string;
}

export function BusinessTopBar({ title }: BusinessTopBarProps) {
  const navigate = useNavigate();
  const { isDark, toggleDark } = useTheme();
  const unreadCount = mockNotifications.filter(n => !n.read && n.domain === 'business').length;

  return (
    <header className="business-topbar">
      <h1 className="biz-topbar-title">{title}</h1>
      <div className="biz-topbar-right">
        <div className="search-bar-wrap" style={{ marginRight: 4 }}>
          <Search size={14} className="search-bar-icon" aria-hidden="true" />
          <input
            className="search-bar-input"
            type="search"
            placeholder="Search..."
            aria-label="Search"
            style={{ width: 220 }}
          />
        </div>

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
          aria-label="Notifications"
          onClick={() => navigate('/business/notifications')}
          style={{ color: 'var(--text-muted)' }}
        >
          <Bell size={18} />
          {unreadCount > 0 && <span className="notif-badge" aria-label={`${unreadCount} unread`} />}
        </button>
      </div>
    </header>
  );
}
