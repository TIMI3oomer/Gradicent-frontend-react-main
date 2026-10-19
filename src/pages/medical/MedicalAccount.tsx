import { useNavigate } from 'react-router-dom';
import { MedicalLayout } from '../../layouts/MedicalLayout/MedicalLayout';
import { Avatar } from '../../components/shared/Avatar';
import { useAuth } from '../../context/AuthContext';

const EMPTY = '—';

export function MedicalAccount() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const plan = user?.plan?.trim();
  const displayName = user?.name?.trim() || user?.email || 'Your account';

  return (
    <MedicalLayout title="My Account">
      <div style={{ maxWidth: 560 }}>
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
            <Avatar name={displayName} size="xl" />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-lora)', fontSize: 22, fontWeight: 700, color: 'var(--text)', overflowWrap: 'anywhere' }}>{displayName}</div>
              {user?.specialty && <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{user.specialty}</div>}
              {user?.licenseNumber && (
                <div style={{ fontSize: 12, color: 'var(--accent)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>{user.licenseNumber}</div>
              )}
            </div>
          </div>
          <div className="medical-detail-grid">
            {[
              { label: 'Email', value: user?.email || EMPTY },
              { label: 'Plan', value: plan || EMPTY },
              { label: 'Role', value: 'Medical Provider' },
            ].map(({ label, value }) => (
              <div key={label}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', overflowWrap: 'anywhere' }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>Current Plan</div>
          <div style={{ padding: '12px 16px', background: 'var(--accent-light)', borderRadius: 8, border: '1px solid var(--accent)', marginBottom: 16 }}>
            <div style={{ fontWeight: 700, color: 'var(--accent)' }}>{plan ? `${plan} Plan` : 'No plan on file'}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              Next billing date: {EMPTY}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn-primary btn-sm" onClick={() => navigate('/products#medical')}>
              {plan === 'Enterprise' ? 'View plans' : 'Upgrade Plan'}
            </button>
            <button className="btn-ghost btn-sm" onClick={() => logout('medical')} style={{ color: 'var(--danger)' }}>Sign out</button>
          </div>
        </div>
      </div>
    </MedicalLayout>
  );
}
