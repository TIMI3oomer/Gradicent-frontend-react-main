import { BusinessLayout } from '../../layouts/BusinessLayout/BusinessLayout';
import { useAuth } from '../../context/AuthContext';
import { Check } from 'lucide-react';

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

const usageMeters = [
  { label: 'Clients', used: 63, total: 'Unlimited', pct: 63 },
  { label: 'Team Members', used: 12, total: 'Unlimited', pct: 40 },
  { label: 'API Calls', used: 42800, total: '100,000', pct: 43 },
  { label: 'Storage', used: 4.2, total: '20 GB', pct: 21, unit: 'GB' },
];

export function Plan() {
  const { user } = useAuth();

  return (
    <BusinessLayout title="Plan & Billing">
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-title" style={{ marginBottom: 16 }}>Usage This Month</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
          {usageMeters.map(meter => (
            <div key={meter.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                <span style={{ fontWeight: 600, color: 'var(--text)' }}>{meter.label}</span>
                <span style={{ color: 'var(--text-muted)' }}>{meter.unit ? `${meter.used} ${meter.unit}` : meter.used} / {meter.total}</span>
              </div>
              <div style={{ height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${meter.pct}%`, height: '100%', background: meter.pct > 80 ? 'var(--danger)' : meter.pct > 60 ? '#f59e0b' : 'var(--primary)', borderRadius: 4, transition: 'width 0.6s ease' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card-title" style={{ marginBottom: 16 }}>Available Plans</div>
      <div className="three-col" style={{ marginBottom: 24 }}>
        {plans.map(plan => {
          const isCurrent = plan.key === user?.plan;
          return (
            <div
              key={plan.key}
              className="card"
              style={{
                border: isCurrent ? '2px solid var(--primary)' : plan.popular ? '2px solid var(--primary)30' : '1px solid var(--border)',
                position: 'relative',
              }}
            >
              {plan.popular && !isCurrent && (
                <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'var(--primary)', color: 'white', padding: '3px 12px', borderRadius: 12, fontSize: 11, fontWeight: 700 }}>
                  Most Popular
                </div>
              )}
              {isCurrent && (
                <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#22c55e', color: 'white', padding: '3px 12px', borderRadius: 12, fontSize: 11, fontWeight: 700 }}>
                  Current Plan
                </div>
              )}
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>{plan.key}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>{plan.desc}</div>
              <div style={{ marginBottom: 20 }}>
                <span style={{ fontSize: 32, fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>${plan.price}</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>/mo</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                {plan.features.map(feat => (
                  <div key={feat} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <Check size={14} color="#22c55e" />
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{feat}</span>
                  </div>
                ))}
              </div>
              <button
                className={isCurrent ? 'btn-ghost btn-sm' : 'btn-primary btn-sm'}
                style={{ width: '100%' }}
                disabled={isCurrent}
              >
                {isCurrent ? 'Current Plan' : plan.key === 'Basic' ? 'Downgrade' : 'Upgrade'}
              </button>
            </div>
          );
        })}
      </div>

      <div className="card">
        <div className="card-title" style={{ marginBottom: 16 }}>Billing History</div>
        {[
          { date: 'Nov 1, 2024', desc: 'Pro Plan — November 2024', amount: '$899.00', status: 'Paid' },
          { date: 'Oct 1, 2024', desc: 'Pro Plan — October 2024', amount: '$899.00', status: 'Paid' },
          { date: 'Sep 1, 2024', desc: 'Pro Plan — September 2024', amount: '$899.00', status: 'Paid' },
        ].map((inv, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < 2 ? '1px solid var(--border-light)' : 'none' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{inv.desc}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{inv.date}</div>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#22c55e' }}>{inv.amount}</span>
              <span style={{ padding: '2px 8px', background: '#22c55e20', color: '#22c55e', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>{inv.status}</span>
              <button className="btn-ghost btn-sm">Invoice</button>
            </div>
          </div>
        ))}
      </div>
    </BusinessLayout>
  );
}
