import { MedicalLayout } from '../../layouts/MedicalLayout/MedicalLayout';
import { Avatar } from '../../components/shared/Avatar';
import { useAuth } from '../../context/AuthContext';

export function MedicalAccount() {
  const { user, logout } = useAuth();

  return (
    <MedicalLayout title="My Account">
      <div style={{ maxWidth: 560 }}>
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <Avatar name={user?.name ?? ''} size="xl" />
            <div>
              <div style={{ fontFamily: 'var(--font-lora)', fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>{user?.name}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{user?.specialty}</div>
              <div style={{ fontSize: 12, color: 'var(--accent)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>{user?.licenseNumber}</div>
            </div>
          </div>
          <div className="medical-detail-grid">
            {[
              { label: 'Email', value: user?.email },
              { label: 'Plan', value: user?.plan },
              { label: 'Role', value: 'Medical Provider' },
              { label: 'Member Since', value: 'January 2022' },
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
          <div style={{ padding: '12px 16px', background: 'var(--accent-light)', borderRadius: 8, border: '1px solid var(--accent)', marginBottom: 16 }}>
            <div style={{ fontWeight: 700, color: 'var(--accent)' }}>{user?.plan} Plan</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Next billing: December 1, 2024</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-primary btn-sm">Upgrade Plan</button>
            <button className="btn-ghost btn-sm" onClick={() => logout('medical')} style={{ color: 'var(--danger)' }}>Sign Out</button>
          </div>
        </div>
      </div>
    </MedicalLayout>
  );
}
