import { useNavigate } from 'react-router-dom';
import { BusinessLayout } from '../../layouts/BusinessLayout/BusinessLayout';
import { Avatar } from '../../components/shared/Avatar';
import { PlanBadge } from '../../components/business/PlanBadge';
import { useAuth } from '../../context/AuthContext';
import { BUSINESS_ROUTES } from '../../lib/constants';
import { formatDate } from '../../lib/formatters';

const ROLE_LABELS: Record<string, string> = {
  business: 'Business',
  medical: 'Medical',
  both: 'Business & Medical',
};

/** Reads the first non-empty string field from the /api/auth/me payload (field names vary). */
function pick(source: unknown, ...keys: string[]): string | undefined {
  if (!source || typeof source !== 'object') return undefined;
  for (const key of keys) {
    const value = (source as Record<string, unknown>)[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return undefined;
}

export function BusinessAccount() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const plan = user?.plan;
  const memberSince = pick(user, 'createdAt', 'created_at', 'joinedAt', 'joined_at', 'memberSince');
  const nextBilling = pick(user, 'nextBillingDate', 'next_billing_date', 'renewsAt', 'renews_at');
  const jobTitle = pick(user, 'title', 'jobTitle', 'job_title', 'position');

  return (
    <BusinessLayout title="My Account">
      <div style={{ maxWidth: 560 }}>
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, minWidth: 0 }}>
            <Avatar name={user?.name ?? ''} size="xl" />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 4, overflowWrap: 'anywhere' }}>{user?.name || '—'}</div>
              {jobTitle && <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>{jobTitle}</div>}
              {plan && <PlanBadge plan={plan} />}
            </div>
          </div>
          <div className="biz-grid-2">
            {[
              { label: 'Email', value: user?.email || '—' },
              { label: 'Plan', value: plan || '—' },
              { label: 'Workspace', value: (user?.role && ROLE_LABELS[user.role]) || '—' },
              { label: 'Member Since', value: formatDate(memberSince, 'long') },
            ].map(({ label, value }) => (
              <div key={label} style={{ minWidth: 0 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', overflowWrap: 'anywhere' }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>Current Plan</div>
          <div style={{ padding: '12px 16px', background: 'var(--primary-light)', borderRadius: 8, border: '1px solid var(--primary)', marginBottom: 16 }}>
            <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{plan ? `${plan} Plan` : 'No plan information'}</div>
            {nextBilling && (
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Next billing: {formatDate(nextBilling, 'long')}</div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn-primary btn-sm" onClick={() => navigate(BUSINESS_ROUTES.PLAN)}>
              {plan === 'Enterprise' ? 'View Plans' : 'Upgrade Plan'}
            </button>
            <button className="btn-ghost btn-sm" onClick={() => logout('business')} style={{ color: 'var(--danger)' }}>Sign Out</button>
          </div>
        </div>
      </div>
    </BusinessLayout>
  );
}
