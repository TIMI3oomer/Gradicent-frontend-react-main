import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowDown, ChevronRight, CircleCheck as CheckCircle2 } from 'lucide-react';
import { PublicLayout } from '../../../layouts/PublicLayout/PublicLayout';
import { useIntersectionObserver } from '../../../hooks/useIntersectionObserver';
import { useCountUp } from '../../../hooks/useCountUp';

function StatCounter({ target, suffix = '', prefix = '' }: { target: number; suffix?: string; prefix?: string }) {
  const [ref, visible] = useIntersectionObserver();
  const value = useCountUp(visible ? target : 0, 1500);
  return (
    <div className="stat-counter" ref={ref as React.Ref<HTMLDivElement>}>
      <div className="stat-counter-value font-tabular">{prefix}{value.toLocaleString()}{suffix}</div>
    </div>
  );
}

function FadeInSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const [ref, visible] = useIntersectionObserver();
  return (
    <motion.div
      ref={ref as React.Ref<HTMLDivElement>}
      initial={{ opacity: 0, y: 30 }}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay, ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}

const features = [
  { icon: '📊', title: 'Dashboard Analytics', desc: 'Real-time KPIs, charts, and insights across all your operations.' },
  { icon: '🏥', title: 'Patient Management', desc: 'Complete patient records, history, vitals, and care coordination.' },
  { icon: '👥', title: 'Client Operations', desc: 'Full CRM with revenue tracking, MRR, and client lifecycle management.' },
  { icon: '📅', title: 'Appointment Scheduling', desc: 'Calendar-based scheduling with automated reminders and status tracking.' },
  { icon: '💰', title: 'Financial Tracking', desc: 'Invoices, payments, subscriptions, and revenue analytics.' },
  { icon: '🏢', title: 'Team Management', desc: 'Employee directories, performance metrics, and department overviews.' },
];

const testimonials = [
  {
    quote: 'Gradicent transformed how we manage our clinic. Patient satisfaction scores up 18% since switching.',
    name: 'Dr. Sarah Chen', role: 'Medical Director, Pacific Health Clinic',
  },
  {
    quote: 'Finally, a platform that understands both the medical and business side of running a healthcare practice.',
    name: 'James Whitfield', role: 'CEO, Whitfield Capital Health Ventures',
  },
  {
    quote: 'The analytics alone are worth the price. We can see our full business in real-time, every day.',
    name: 'Alexandra Torres', role: 'COO, BloomRetail Medical',
  },
];

export function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);

  return (
    <PublicLayout>
      {/* ===== HERO ===== */}
      <section ref={heroRef} style={{ position: 'relative', minHeight: '100vh', display: 'flex', overflow: 'hidden', background: 'white' }}>
        {/* Left navy panel */}
        <div style={{
          position: 'absolute', inset: 0,
          background: '#1B427A',
          clipPath: 'polygon(0 0, 62% 0, 50% 100%, 0 100%)',
          zIndex: 0,
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }} />
        </div>

        {/* Left content */}
        <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '80px 80px 80px 64px', maxWidth: '680px' }}>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{ fontSize: 12, fontWeight: 700, color: '#FFAF0F', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 16 }}
          >
            Dual-domain platform
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 'clamp(48px, 5vw, 72px)', fontWeight: 700, color: 'white', lineHeight: 1.1, marginBottom: 24 }}
          >
            Manage Everything.<br />
            <span style={{ color: '#FFAF0F' }}>Decide Smarter.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.5 }}
            style={{ fontSize: 18, color: 'rgba(255,255,255,0.75)', lineHeight: 1.65, marginBottom: 36, maxWidth: 480 }}
          >
            One platform. Medical teams and business operations, unified under a single login.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 40 }}
          >
            <Link
              to="/login"
              style={{ padding: '12px 24px', background: '#FFAF0F', color: '#1B427A', borderRadius: 8, fontWeight: 700, fontSize: 15, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'background 0.15s' }}
            >
              For Medical Teams <ChevronRight size={16} />
            </Link>
            <Link
              to="/login"
              style={{ padding: '12px 24px', background: 'transparent', color: 'white', border: '1.5px solid rgba(255,255,255,0.5)', borderRadius: 8, fontWeight: 600, fontSize: 15, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              For Business Teams
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}
          >
            {['HIPAA Compliant', 'SOC 2 Type II', 'Free 30-day trial'].map(label => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>
                <CheckCircle2 size={13} style={{ color: '#4CAF7D' }} />
                {label}
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right dashboard mockup */}
        <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 48px' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="animate-float"
            style={{
              width: '100%',
              maxWidth: 480,
              background: '#111827',
              borderRadius: 16,
              boxShadow: '0 32px 80px rgba(0,0,0,0.3)',
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {/* Fake window chrome */}
            <div style={{ background: '#1C2537', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffbd2e' }} />
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: 4, height: 18, marginLeft: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 10, color: '#5A7090' }}>app.gradicent.io/business</span>
              </div>
            </div>
            {/* Fake dashboard */}
            <div style={{ padding: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#9AAEC5', marginBottom: 12, fontFamily: 'Syne, sans-serif' }}>Business Dashboard</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
                {[
                  { label: 'Revenue', value: '$38.2k', color: '#3B9AE1', up: true },
                  { label: 'Clients', value: '63', color: '#22C55E', up: true },
                  { label: 'Churn', value: '3.2%', color: '#F87171', up: false },
                ].map(m => (
                  <div key={m.label} style={{ background: '#1C2537', borderRadius: 8, padding: '10px', border: '1px solid #1E2D42' }}>
                    <div style={{ fontSize: 9, color: '#5A7090', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{m.label}</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: m.color, fontFamily: 'Syne, sans-serif' }}>{m.value}</div>
                  </div>
                ))}
              </div>
              {/* Fake bar chart */}
              <div style={{ background: '#1C2537', borderRadius: 8, padding: 12, border: '1px solid #1E2D42' }}>
                <div style={{ fontSize: 10, color: '#5A7090', marginBottom: 10 }}>Revenue by Month</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 60 }}>
                  {[45, 52, 48, 58, 62, 55, 68, 72, 78, 71, 82, 65].map((h, i) => (
                    <div key={i} style={{ flex: 1, background: i === 10 ? '#3B9AE1' : '#1E2D42', borderRadius: '2px 2px 0 0', height: `${h}%`, transition: 'all 0.3s' }} />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: [0, 8, 0] }}
          transition={{ delay: 1.2, duration: 1.5, repeat: Infinity }}
          style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}
          aria-hidden="true"
        >
          <ArrowDown size={20} />
        </motion.div>
      </section>

      {/* ===== STATS BAR ===== */}
      <section style={{ background: '#112C5A', padding: '32px 64px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, maxWidth: 1100, margin: '0 auto' }}>
          {[
            { target: 847, suffix: '+', label: 'Patients Managed', prefix: '' },
            { target: 63, suffix: '', label: 'Active Business Clients', prefix: '' },
            { target: 340, suffix: '%', label: 'Average ROI Achieved', prefix: '' },
            { target: 94, suffix: '%', label: 'Patient Satisfaction Rate', prefix: '' },
          ].map((stat, i) => (
            <FadeInSection key={stat.label} delay={i * 0.1}>
              <div style={{ textAlign: 'center' }}>
                <StatCounter target={stat.target} suffix={stat.suffix} prefix={stat.prefix} />
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 6 }}>{stat.label}</div>
              </div>
            </FadeInSection>
          ))}
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section style={{ padding: '100px 48px', background: 'white' }}>
        <FadeInSection>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#1171BB', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>Two Products</div>
            <h2 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 700, color: '#0D1F3C', marginBottom: 16 }}>Two products. One vision.</h2>
            <p style={{ fontSize: 17, color: '#4A6080', maxWidth: 500, margin: '0 auto', lineHeight: 1.65 }}>Built for the teams that have to think about both people and numbers every day.</p>
          </div>
        </FadeInSection>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, maxWidth: 900, margin: '0 auto' }}>
          <FadeInSection delay={0.1}>
            <div style={{ background: '#EAD9C8', borderRadius: 16, padding: 32, border: '1px solid #C4AD97' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🩺</div>
              <h3 style={{ fontFamily: 'Lora, serif', fontSize: 22, fontWeight: 700, color: '#2B2B2B', marginBottom: 12 }}>Medical Suite</h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                {['Patient records & profiles', 'Appointment calendar', 'Clinical analytics'].map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#6B6560' }}>
                    <CheckCircle2 size={14} style={{ color: '#CE7A35', flexShrink: 0 }} /> {f}
                  </li>
                ))}
              </ul>
              <Link to="/medical-landing" style={{ fontSize: 14, fontWeight: 600, color: '#CE7A35', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                Learn more <ChevronRight size={14} />
              </Link>
            </div>
          </FadeInSection>
          <FadeInSection delay={0.2}>
            <div style={{ background: '#212D40', borderRadius: 16, padding: 32, border: '1px solid #2D3D56' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>💼</div>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 700, color: '#E8EDF5', marginBottom: 12 }}>Business Suite</h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                {['Client & revenue management', 'Transaction tracking', 'Team analytics'].map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#9AAEC5' }}>
                    <CheckCircle2 size={14} style={{ color: '#3B9AE1', flexShrink: 0 }} /> {f}
                  </li>
                ))}
              </ul>
              <Link to="/products" style={{ fontSize: 14, fontWeight: 600, color: '#3B9AE1', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                Learn more <ChevronRight size={14} />
              </Link>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ===== FEATURES GRID ===== */}
      <section style={{ padding: '80px 64px', background: '#F8F9FC' }}>
        <FadeInSection>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#FFAF0F', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>Features</div>
            <h2 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 'clamp(28px, 3.5vw, 42px)', fontWeight: 700, color: '#0D1F3C' }}>Everything you need.</h2>
          </div>
        </FadeInSection>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, maxWidth: 1100, margin: '0 auto' }}>
          {features.map((f, i) => (
            <FadeInSection key={f.title} delay={i * 0.08}>
              <div style={{ background: 'white', borderRadius: 12, padding: 24, border: '1px solid #D4DCE8', transition: 'box-shadow 0.15s, transform 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 32px rgba(27,66,122,0.1)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = ''; }}
              >
                <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: '#0D1F3C', marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: '#4A6080', lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            </FadeInSection>
          ))}
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section style={{ padding: '80px 64px', background: '#1B427A' }}>
        <FadeInSection>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 700, color: 'white' }}>Trusted by teams who care</h2>
          </div>
        </FadeInSection>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, maxWidth: 1100, margin: '0 auto', alignItems: 'start' }}>
          {testimonials.map((t, i) => (
            <FadeInSection key={t.name} delay={i * 0.12}>
              <div style={{
                background: 'rgba(255,255,255,0.06)',
                borderRadius: 12,
                padding: 28,
                border: '1px solid rgba(255,255,255,0.1)',
                marginTop: i === 1 ? -20 : 0,
              }}>
                <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)', lineHeight: 1.7, marginBottom: 20, fontStyle: 'italic' }}>"{t.quote}"</p>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>{t.name}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{t.role}</div>
              </div>
            </FadeInSection>
          ))}
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section style={{ padding: '100px 48px', background: 'white', textAlign: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 1px 1px, #D4DCE8 1px, transparent 0)', backgroundSize: '32px 32px', opacity: 0.4, pointerEvents: 'none' }} />
        <FadeInSection>
          <h2 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 'clamp(28px, 3.5vw, 48px)', fontWeight: 700, color: '#0D1F3C', marginBottom: 16, position: 'relative' }}>
            Ready to transform<br />your operations?
          </h2>
          <p style={{ fontSize: 18, color: '#4A6080', marginBottom: 36, position: 'relative' }}>Start your free 30-day trial. No credit card required.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', position: 'relative' }}>
            <Link to="/login" style={{ padding: '13px 28px', background: '#CE7A35', color: 'white', borderRadius: 8, fontWeight: 700, fontSize: 15, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              Start Medical Trial
            </Link>
            <Link to="/login" style={{ padding: '13px 28px', background: '#1171BB', color: 'white', borderRadius: 8, fontWeight: 700, fontSize: 15, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              Start Business Trial
            </Link>
          </div>
        </FadeInSection>
      </section>
    </PublicLayout>
  );
}

// Stat counter display value helper
function StatCounterValue({ value, prefix, suffix }: { value: number; prefix: string; suffix: string }) {
  return <span>{prefix}{value.toLocaleString()}{suffix}</span>;
}
// Quiet the TS warning
void StatCounterValue;
