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

export function MedicalSidebar() {
  const { user, logout } = useAuth();

  return (
    <nav className="medical-sidebar" aria-label="Medical navigation">
      <div className="medical-sidebar-logo">
        <div className="sidebar-logo-mark">G</div>
        <div>
          <span className="sidebar-logo-name">Gradicent</span>
          <span className="sidebar-logo-sub">Medical</span>
        </div>
      </div>

      <div className="medical-nav">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `medical-nav-item${isActive ? ' active' : ''}`}
          >
            <item.icon size={18} weight="regular" className="nav-icon" aria-hidden="true" />
            {item.label}
          </NavLink>
        ))}
      </div>

      <div className="medical-sidebar-dock">
        <div className="sidebar-user">
          <Avatar name={user?.name ?? 'Dr. Alex Morgan'} size="sm" />
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name ?? 'Dr. Alex Morgan'}</div>
            <div className="sidebar-user-role">{user?.specialty ?? 'Physician'}</div>
          </div>
        </div>
        <button className="sidebar-logout-btn" onClick={logout}>
          <SignOut size={14} aria-hidden="true" />
          Logout
        </button>
      </div>
    </nav>
  );
}
