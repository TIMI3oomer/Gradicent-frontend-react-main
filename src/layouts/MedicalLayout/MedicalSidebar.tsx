import { NavLink } from 'react-router-dom';
import { House, Users, Calendar, ChartBar, Table, Gear, Headphones, UserCircle, Bell, SignOut } from 'phosphor-react';
import { Avatar } from '../../components/shared/Avatar';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/medical/home', label: 'Home', icon: House },
  { to: '/medical/patients', label: 'Patients', icon: Users },
  { to: '/medical/appointments', label: 'Appointments', icon: Calendar },
  { to: '/medical/stats', label: 'Analytics', icon: ChartBar },
  { to: '/medical/data', label: 'Data', icon: Table },
  { to: '/medical/notifications', label: 'Notifications', icon: Bell },
  { to: '/medical/settings', label: 'Settings', icon: Gear },
  { to: '/medical/support', label: 'Support', icon: Headphones },
  { to: '/medical/account', label: 'Account', icon: UserCircle },
];

interface MedicalSidebarProps {
  id?: string;
  /** Mobile only: whether the off-canvas drawer is open */
  open?: boolean;
  onNavigate?: () => void;
}

export function MedicalSidebar({ id, open = false, onNavigate }: MedicalSidebarProps) {
  const { user, logout } = useAuth();
  const displayName = user?.name?.trim() || user?.email || 'Signed-in user';
  const roleLabel = user?.specialty?.trim() || 'Medical provider';

  return (
    <nav id={id} className={`medical-sidebar${open ? ' is-open' : ''}`} aria-label="Medical navigation">
      <div className="medical-sidebar-logo">
        <div className="sidebar-logo-mark">B</div>
        <div>
          <span className="sidebar-logo-name">Binder Software</span>
          <span className="sidebar-logo-sub">Medical</span>
        </div>
      </div>

      <div className="medical-nav">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) => `medical-nav-item${isActive ? ' active' : ''}`}
          >
            <item.icon size={18} weight="regular" className="nav-icon" aria-hidden="true" />
            {item.label}
          </NavLink>
        ))}
      </div>

      <div className="medical-sidebar-dock">
        <div className="sidebar-user">
          <Avatar name={displayName} size="sm" />
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{displayName}</div>
            <div className="sidebar-user-role">{roleLabel}</div>
          </div>
        </div>
        <button className="sidebar-logout-btn" onClick={() => logout('medical')}>
          <SignOut size={14} aria-hidden="true" />
          Sign out
        </button>
      </div>
    </nav>
  );
}
