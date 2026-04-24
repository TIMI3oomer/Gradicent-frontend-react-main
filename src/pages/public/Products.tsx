import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { PublicLayout } from '../../layouts/PublicLayout/PublicLayout';

const medicalPlans = [
  {
    name: 'Basic',
    price: 149,
    desc: 'For small practices.',
    features: ['Up to 200 patients', '2 providers', 'Appointment scheduling', 'Basic reporting', 'Email support'],
  },
  {
    name: 'Pro',
    price: 399,
    desc: 'For growing clinics.',
    features: ['Up to 1,000 patients', '10 providers', 'Full EHR capabilities', 'Advanced analytics', 'Priority support', 'Custom workflows'],
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 999,
    desc: 'For hospital systems.',
    features: ['Unlimited patients', 'Unlimited providers', 'Multi-location support', 'HIPAA compliance tools', 'Dedicated CSM', 'SLA guarantee', 'Custom integrations'],
  },
];

const businessPlans = [
  {
    name: 'Basic',
    price: 299,
    desc: 'For small teams.',
    features: ['Up to 10 clients', '3 team members', 'Basic analytics', 'Email support'],
  },
  {
    name: 'Pro',
    price: 899,
    desc: 'For scaling businesses.',
    features: ['Up to 50 clients', '10 team members', 'Advanced analytics', 'API access', 'Priority support', 'Custom integrations'],
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 2800,
    desc: 'For large organizations.',
    features: ['Unlimited clients', 'Unlimited users', 'Full analytics', 'Dedicated CSM', 'SLA guarantee', 'Custom reporting', 'On-premise option'],
  },
];

function PricingSection({ title, subtitle, plans, accent }: { title: string; subtitle: string; plans: typeof medicalPlans; accent: string }) {
  const navigate = useNavigate();
  return (
    <div style={{ marginBottom: 80 }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 36, fontWeight: 800, color: 'var(--navy)', marginBottom: 12 }}>{title}</h2>
        <p style={{ color: '#6b7280', fontSize: 16 }}>{subtitle}</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, maxWidth: 960, margin: '0 auto' }}>
        {plans.map(plan => (
          <div
            key={plan.name}
            style={{
              background: 'white', borderRadius: 16, padding: 32,
              border: plan.popular ? `2px solid ${accent}` : '1px solid #e5e7eb',
              position: 'relative', boxShadow: plan.popular ? `0 8px 32px ${accent}20` : '0 2px 12px rgba(0,0,0,0.06)',
            }}
          >
            {plan.popular && (
              <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: accent, color: 'white', padding: '4px 16px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                Most Popular
              </div>
            )}
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--navy)', marginBottom: 6 }}>{plan.name}</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>{plan.desc}</div>
            <div style={{ marginBottom: 24 }}>
              <span style={{ fontSize: 42, fontWeight: 900, color: 'var(--navy)', fontFamily: "'Fraunces', serif" }}>${plan.price}</span>
              <span style={{ fontSize: 14, color: '#6b7280' }}>/mo</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
              {plan.features.map(feat => (
                <div key={feat} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Check size={16} color={accent} strokeWidth={2.5} />
                  <span style={{ fontSize: 14, color: '#374151' }}>{feat}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate('/login')}
              style={{
                width: '100%', padding: '13px', borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: 'pointer',
                background: plan.popular ? accent : 'transparent',
                color: plan.popular ? 'white' : 'var(--navy)',
                border: plan.popular ? 'none' : `2px solid ${accent}`,
                transition: 'all 0.2s',
              }}
            >
              Get Started
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Products() {
  return (
    <PublicLayout>
      <div style={{ paddingTop: 80, paddingBottom: 40, textAlign: 'center', background: 'var(--navy)', color: 'white' }}>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 52, fontWeight: 900, marginBottom: 16 }}>Simple, Transparent Pricing</h1>
        <p style={{ fontSize: 18, opacity: 0.75, maxWidth: 560, margin: '0 auto' }}>Choose the plan that fits your team. Upgrade or downgrade anytime.</p>
      </div>

      <div style={{ padding: '64px 24px' }}>
        <PricingSection
          title="Medical Platform"
          subtitle="Built for healthcare teams of every size."
          plans={medicalPlans}
          accent="#CE7A35"
        />
        <PricingSection
          title="Business Platform"
          subtitle="Power your operations and grow revenue."
          plans={businessPlans}
          accent="#1171BB"
        />
      </div>

      <div style={{ background: '#f9fafb', padding: '64px 24px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 32, fontWeight: 800, color: 'var(--navy)', marginBottom: 12 }}>Need a custom solution?</h2>
        <p style={{ color: '#6b7280', marginBottom: 24, fontSize: 16 }}>Contact our sales team for enterprise pricing and custom arrangements.</p>
        <button style={{ padding: '14px 32px', background: 'var(--navy)', color: 'white', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>
          Contact Sales
        </button>
      </div>
    </PublicLayout>
  );
}
