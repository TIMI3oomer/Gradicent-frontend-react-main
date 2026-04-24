import { BusinessLayout } from '../../layouts/BusinessLayout/BusinessLayout';
import { Avatar } from '../../components/shared/Avatar';
import { PlanBadge } from '../../components/business/PlanBadge';
import { useAuth } from '../../context/AuthContext';

export function BusinessAccount() {
  const { user, logout } = useAuth();

  return (
    <BusinessLayout title="My Account">
      <div style={{ maxWidth: 560 }}>
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <Avatar name={user?.name ?? ''} size="xl" />
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{user?.name}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>Operations Manager</div>
              <PlanBadge plan={user?.plan ?? 'Pro'} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { label: 'Email', value: user?.email },
              { label: 'Plan', value: user?.plan },
              { label: 'Role', value: 'Business Operator' },
              { label: 'Member Since', value: 'March 2021' },
            ].map(({ label, value }) => (
              <div key={label}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>Current Plan</div>
          <div style={{ padding: '12px 16px', background: 'var(--primary)' + '12', borderRadius: 8, border: '1px solid var(--primary)', marginBottom: 16 }}>
            <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{user?.plan} Plan</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Next billing: December 1, 2024</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-primary btn-sm">Upgrade Plan</button>
            <button className="btn-ghost btn-sm" onClick={logout} style={{ color: 'var(--danger)' }}>Sign Out</button>
          </div>
        </div>
      </div>
    </BusinessLayout>
  );
}
