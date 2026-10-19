import { useNavigate } from 'react-router-dom';
import { Check, Shield, Clock, ChartBar as BarChart2, Calendar, FileText } from 'lucide-react';
import { PublicLayout } from '../../layouts/PublicLayout/PublicLayout';

const features = [
  { icon: <Shield size={24} />, title: 'HIPAA Compliant', desc: 'All data encrypted at rest and in transit. Full Business Associate Agreements included.' },
  { icon: <Calendar size={24} />, title: 'Smart Scheduling', desc: 'Intelligent calendar with conflict detection, reminders, and patient self-booking.' },
  { icon: <FileText size={24} />, title: 'EHR Integration', desc: 'Seamlessly integrates with Epic, Cerner, and 50+ EHR systems out of the box.' },
  { icon: <BarChart2 size={24} />, title: 'Clinical Analytics', desc: 'Real-time outcomes tracking, population health insights, and custom dashboards.' },
  { icon: <Clock size={24} />, title: 'Reduced Wait Times', desc: 'AI-powered flow optimization reduces average wait times by 34% in 90 days.' },
  { icon: <Check size={24} />, title: 'Streamlined Billing', desc: 'Automated coding suggestions and insurance verification to maximize collections.' },
];

const testimonials = [
  {
    quote: 'Gradicent Medical transformed our clinic. Patient wait times dropped by 40% and our staff can focus on care instead of paperwork.',
    name: 'Dr. Rebecca Torres',
    role: 'Chief Medical Officer, Northside Health System',
  },
  {
    quote: 'The analytics dashboard alone has paid for itself. We identified and resolved three costly workflow bottlenecks in our first month.',
    name: 'Dr. James Kim',
    role: 'Medical Director, Pacific Family Practice',
  },
  {
    quote: 'Switching from our old system was seamless. Gradicent\'s onboarding team had us fully operational in less than two weeks.',
    name: 'Sarah Nguyen',
    role: 'Practice Manager, Riverside Clinic Group',
  },
];

export function MedicalLanding() {
  const navigate = useNavigate();

  return (
    <PublicLayout>
      {/* Hero */}
      <div style={{ background: '#1a3a2a', color: 'white', padding: '120px 24px 80px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#CE7A3530', border: '1px solid #CE7A3560', borderRadius: 20, padding: '6px 16px', marginBottom: 24, fontSize: 13, fontWeight: 600, color: '#CE7A35' }}>
          <Shield size={13} /> HIPAA Compliant Platform
        </div>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 'clamp(34px, 7vw, 56px)', fontWeight: 900, lineHeight: 1.1, maxWidth: 760, margin: '0 auto 20px' }}>
          Modern Healthcare Operations,<br />
          <span style={{ color: '#CE7A35' }}>Built for Clinicians</span>
        </h1>
        <p style={{ fontSize: 18, opacity: 0.75, maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.7 }}>
          Gradicent Medical gives healthcare teams the tools to manage patients, streamline workflows, and improve outcomes — all in one secure platform.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/login?domain=medical')}
            style={{ padding: '14px 32px', background: '#CE7A35', color: 'white', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 16, cursor: 'pointer' }}
          >
            Start Free Trial
          </button>
          <button
            onClick={() => navigate('/products#medical')}
            style={{ padding: '14px 32px', background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8, fontWeight: 700, fontSize: 16, cursor: 'pointer' }}
          >
            View Pricing
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ background: '#CE7A35', padding: '40px 24px' }}>
        <div className="landing-grid-4" style={{ display: 'grid', gap: 24, maxWidth: 960, margin: '0 auto', textAlign: 'center' }}>
          {[
            { value: '4,200+', label: 'Providers' },
            { value: '2.1M', label: 'Patients Managed' },
            { value: '34%', label: 'Avg. Wait Time Reduction' },
            { value: '99.9%', label: 'Uptime SLA' },
          ].map(stat => (
            <div key={stat.label}>
              <div style={{ fontSize: 36, fontWeight: 900, color: 'white', fontFamily: "'Fraunces', serif", marginBottom: 4 }}>{stat.value}</div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div style={{ padding: '80px 24px', background: '#fafaf8' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 800, color: '#1a3a2a', marginBottom: 12 }}>Everything Your Practice Needs</h2>
          <p style={{ color: '#6b7280', fontSize: 16 }}>Purpose-built for healthcare providers, not adapted from generic tools.</p>
        </div>
        <div className="landing-grid-3" style={{ display: 'grid', gap: 32, maxWidth: 1000, margin: '0 auto' }}>
          {features.map(feat => (
            <div key={feat.title} style={{ background: 'white', borderRadius: 16, padding: 32, border: '1px solid #e5e7eb', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: '#CE7A3515', color: '#CE7A35', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                {feat.icon}
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#1a3a2a', marginBottom: 10, fontFamily: "'Fraunces', serif" }}>{feat.title}</div>
              <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7 }}>{feat.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div style={{ padding: '80px 24px', background: 'white' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 800, color: '#1a3a2a', marginBottom: 12 }}>Trusted by Healthcare Teams</h2>
        </div>
        <div className="landing-grid-3" style={{ display: 'grid', gap: 28, maxWidth: 1000, margin: '0 auto' }}>
          {testimonials.map(t => (
            <div key={t.name} style={{ background: '#fafaf8', borderRadius: 16, padding: 28, border: '1px solid #e5e7eb' }}>
              <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.7, marginBottom: 20, fontStyle: 'italic' }}>"{t.quote}"</p>
              <div>
                <div style={{ fontWeight: 700, color: '#1a3a2a', fontSize: 14 }}>{t.name}</div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: '80px 24px', background: '#1a3a2a', textAlign: 'center' }}>
        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 800, color: 'white', marginBottom: 16 }}>Ready to Transform Your Practice?</h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16, marginBottom: 36 }}>Start with a free 30-day trial. No credit card required.</p>
        <button
          onClick={() => navigate('/login?domain=medical')}
          style={{ padding: '16px 40px', background: '#CE7A35', color: 'white', border: 'none', borderRadius: 10, fontWeight: 800, fontSize: 17, cursor: 'pointer' }}
        >
          Get Started Free
        </button>
      </div>
    </PublicLayout>
  );
}
