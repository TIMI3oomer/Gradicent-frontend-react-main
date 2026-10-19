import { useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { Chrome as Home, Users, Package, Briefcase, UserCheck, Calendar, CreditCard, ChartBar as BarChart2, Database, Settings, User, Bell, LogOut, Award, X } from 'lucide-react';
import { Avatar } from '../../components/shared/Avatar';
import { useAuth } from '../../context/AuthContext';

const navGroups = [
  {
    label: 'Overview',
    items: [{ to: '/business/home', label: 'Dashboard', icon: Home }],
  },
  {
    label: 'Operations',
    items: [
      { to: '/business/clients', label: 'Clients', icon: Users },
      { to: '/business/products', label: 'Products', icon: Package },
      { to: '/business/services', label: 'Services', icon: Briefcase },
      { to: '/business/employees', label: 'Employees', icon: UserCheck },
      { to: '/business/appointments', label: 'Appointments', icon: Calendar },
    ],
  },
  {
    label: 'Finance',
    items: [
      { to: '/business/transactions', label: 'Transactions', icon: CreditCard },
      { to: '/business/plan', label: 'Plan & Billing', icon: Award },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { to: '/business/stats', label: 'Analytics', icon: BarChart2 },
      { to: '/business/data', label: 'Data Explorer', icon: Database },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: '/business/notifications', label: 'Notifications', icon: Bell },
      { to: '/business/settings', label: 'Settings', icon: Settings },
      { to: '/business/account', label: 'My Account', icon: User },
    ],
  },
];

interface BusinessSidebarProps {
  /** Drawer state on small screens (ignored on desktop where the sidebar is always visible) */
  open?: boolean;
  onClose?: () => void;
}

export function BusinessSidebar({ open = false, onClose }: BusinessSidebarProps) {
  const { user, logout } = useAuth();
  const closeRef = useRef<HTMLButtonElement>(null);
  const displayName = user?.name?.trim() || user?.email || '';
  const plan = user?.plan;

  // Move focus into the drawer when it opens so keyboard users land in the navigation
  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  return (
    <nav id="biz-sidebar" className={`business-sidebar${open ? ' open' : ''}`} aria-label="Business navigation">
      <div className="business-sidebar-logo">
        <div className="biz-logo-mark">B</div>
        <div>
          <span className="biz-logo-name">Binder Software</span>
          <span className="biz-logo-sub">Business</span>
        </div>
        <button
          ref={closeRef}
          type="button"
          className="biz-sidebar-close"
          onClick={onClose}
          aria-label="Close navigation"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>

      <div className="business-nav">
        {navGroups.map((group, gi) => (
          <div key={group.label}>
            {gi > 0 && <div className="biz-separator" />}
            <div className="biz-nav-section-label">{group.label}</div>
            {group.items.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `biz-nav-item${isActive ? ' active' : ''}`}
              >
                <item.icon size={15} aria-hidden="true" />
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </div>

      <div className="business-sidebar-dock">
        <div className="sidebar-user">
          <Avatar name={displayName} size="sm" />
          <div className="sidebar-user-info">
            <div className="sidebar-user-name" style={{ color: '#E8EDF5' }}>{displayName || '—'}</div>
            {plan && (
              <span className={`plan-badge plan-badge-${plan.toLowerCase()}`}>
                {plan}
              </span>
            )}
          </div>
        </div>
        <button className="sidebar-logout-btn" onClick={() => logout('business')} style={{ color: '#5A7090' }}>
          <LogOut size={13} aria-hidden="true" />
          Logout
        </button>
      </div>
    </nav>
  );
}
