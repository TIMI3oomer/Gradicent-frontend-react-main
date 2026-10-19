import { BusinessLayout } from '../../layouts/BusinessLayout/BusinessLayout';
import { UnavailableNotice } from '../../components/business/PageStatus';
import { useAuth } from '../../context/AuthContext';
import { Check, Receipt } from 'lucide-react';

const plans = [
  {
    key: 'Basic',
    price: 299,
    desc: 'For small teams getting started.',
    features: ['Up to 10 clients', '3 team members', 'Basic analytics', 'Email support'],
  },
  {
    key: 'Pro',
    price: 899,
    desc: 'For growing businesses.',
    features: ['Up to 50 clients', '10 team members', 'Advanced analytics', 'Priority support', 'API access', 'Custom integrations'],
    popular: true,
  },
  {
    key: 'Enterprise',
    price: 2800,
    desc: 'For large organizations.',
    features: ['Unlimited clients', 'Unlimited team members', 'Full analytics suite', 'Dedicated CSM', 'SLA guarantee', 'Custom reporting', 'On-premise option'],
  },
];

const PLAN_RANK: Record<string, number> = { basic: 0, pro: 1, enterprise: 2 };

export function Plan() {
  const { user } = useAuth();
  const currentPlan = user?.plan;
  const currentRank = currentPlan ? PLAN_RANK[currentPlan.toLowerCase()] : undefined;

  return (
    <BusinessLayout title="Plan & Billing">
      <div className="card" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div className="card-title">Current Plan</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            {currentPlan ? `You're on the ${currentPlan} plan.` : 'Plan information is not available for your account.'}
          </div>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Plan changes from the dashboard are coming soon.</div>
      </div>

      <div className="card-title" style={{ marginBottom: 16 }}>Available Plans</div>
      <div className="three-col" style={{ marginBottom: 24 }}>
        {plans.map(plan => {
          const isCurrent = currentPlan !== undefined && plan.key.toLowerCase() === currentPlan.toLowerCase();
          const isDowngrade = currentRank !== undefined && PLAN_RANK[plan.key.toLowerCase()] < currentRank;
          return (
            <div
              key={plan.key}
              className="card"
              style={{
                border: isCurrent
                  ? '2px solid var(--primary)'
                  : plan.popular
                    ? '2px solid color-mix(in srgb, var(--primary) 30%, transparent)'
                    : '1px solid var(--border)',
                position: 'relative',
              }}
            >
              {plan.popular && !isCurrent && (
                <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'var(--primary)', color: 'white', padding: '3px 12px', borderRadius: 12, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
                  Most Popular
                </div>
              )}
              {isCurrent && (
                <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#22c55e', color: 'white', padding: '3px 12px', borderRadius: 12, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
                  Current Plan
                </div>
              )}
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>{plan.key}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>{plan.desc}</div>
              <div style={{ marginBottom: 20 }}>
                <span style={{ fontSize: 32, fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>${plan.price.toLocaleString('en-US')}</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>/mo</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                {plan.features.map(feat => (
                  <div key={feat} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <Check size={14} color="#22c55e" aria-hidden="true" />
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{feat}</span>
                  </div>
                ))}
              </div>
              {/* There is no plan-change endpoint yet, so these stay disabled rather than doing nothing */}
              <button
                className={isCurrent ? 'btn-ghost btn-sm' : 'btn-primary btn-sm'}
                style={{ width: '100%' }}
                disabled
                title={isCurrent ? undefined : 'Coming soon'}
              >
                {isCurrent ? 'Current Plan' : isDowngrade ? 'Downgrade' : 'Upgrade'}
              </button>
            </div>
          );
        })}
      </div>

      <div className="card">
        <div className="card-title" style={{ marginBottom: 8 }}>Billing History</div>
        <UnavailableNotice icon={<Receipt size={28} />} title="Billing history isn't available yet">
          Invoices and receipts will appear here once billing is connected to your account.
        </UnavailableNotice>
      </div>
    </BusinessLayout>
  );
}
