import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ChevronRight, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// ─── Types ────────────────────────────────────────────────────────────────────

type Workspace = {
  label: string;
  desc: string;
  path: string;
  color: string;
  border: string;
  textColor: string;
  descColor: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const WORKSPACES: Workspace[] = [
  {
    label: '🩺 Medical',
    desc: 'Patient care & clinic management',
    path: '/medical/home',
    color: '#EAD9C8',
    border: '#C4AD97',
    textColor: '#2B2B2B',
    descColor: 'rgba(43,43,43,0.55)',
  },
  {
    label: '💼 Business',
    desc: 'Client ops & finance',
    path: '/business/home',
    color: '#212D40',
    border: '#2D3D56',
    textColor: '#E8EDF5',
    descColor: 'rgba(232,237,245,0.5)',
  },
];

const FEATURES = [
  { icon: '🩺', text: 'HIPAA-compliant medical records & scheduling' },
  { icon: '💼', text: 'Full CRM & financial operations suite' },
  { icon: '📊', text: 'Real-time analytics for both domains' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function BrandPanel() {
  return (
    <div
      className="login-brand-panel"
      style={{ background: 'linear-gradient(145deg, #1B427A 0%, #0D2952 100%)' }}
    >
      {/* dot-grid overlay */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 48 }}>
          <div
            style={{
              width: 36, height: 36,
              background: '#FFAF0F', borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: 16,
              color: '#1B427A', fontFamily: 'Syne, sans-serif',
            }}
          >
            G
          </div>
          <span style={{ fontSize: 20, fontWeight: 700, color: 'white', fontFamily: 'Syne, sans-serif' }}>
            Gradicent
          </span>
        </div>

        <h2
          style={{
            fontFamily: 'Fraunces, Georgia, serif',
            fontSize: 36, fontWeight: 700,
            color: 'white', marginBottom: 12, lineHeight: 1.2,
          }}
        >
          Welcome back to<br />Gradicent
        </h2>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, marginBottom: 40 }}>
          The dual-domain platform for modern healthcare and business operations.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {FEATURES.map(f => (
            <div key={f.text} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{f.icon}</span>
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>
                {f.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Divider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
      <div style={{ flex: 1, height: 1, background: '#DDE4EE' }} />
      <span style={{ fontSize: 12, color: '#8B9AB0' }}>or</span>
      <div style={{ flex: 1, height: 1, background: '#DDE4EE' }} />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function Login() {
  const [email, setEmail] = useState('alex@gradicent.io');
  const [password, setPassword] = useState('password');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  // Shared login + navigate helper used by both the form and workspace tiles
  const authenticate = async (destination: string) => {
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate(destination);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      setError(
        code === 'INVALID_CREDENTIALS'
          ? 'Invalid email or password.'
          : 'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    void authenticate('/medical/home');
  };

  // loginWithGoogle does a hard redirect — no navigate() needed
  const handleGoogle = () => {
    loginWithGoogle();
  };

  return (
    <div className="login-shell" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <BrandPanel />

      {/* ── Right form panel ── */}
      <div className="login-form-panel" style={{ background: '#F7F9FC' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ width: '100%', maxWidth: 420 }}
        >
          <h1
            style={{
              fontFamily: 'Syne, sans-serif',
              fontSize: 26, fontWeight: 700,
              color: '#1A2332', marginBottom: 6,
            }}
          >
            Sign in to your account
          </h1>
          <p style={{ fontSize: 14, color: '#5A6880', marginBottom: 28 }}>
            Use the pre-filled credentials to demo the app
          </p>

          {/* ── Credential form ── */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email address</label>
              <input
                id="email"
                className="form-input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  className="form-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={loading}
                  style={{ paddingRight: 40 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                    color: '#8B9AB0', background: 'none', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p
                role="alert"
                style={{
                  fontSize: 13, color: '#EF4444',
                  background: 'rgba(239,68,68,0.08)',
                  padding: '8px 12px', borderRadius: 6, marginBottom: 12,
                }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '11px 20px',
                background: '#1171BB', color: 'white',
                borderRadius: 8, fontWeight: 600, fontSize: 15,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.75 : 1,
                marginBottom: 16, border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                fontFamily: 'Inter, sans-serif', transition: 'background 0.15s',
              }}
            >
              {loading
                ? <><Loader2 size={15} className="btn-spinner" /> Signing in...</>
                : <>Sign In <ChevronRight size={16} /></>
              }
            </button>
          </form>

          <Divider />

          {/* ── SSO buttons ── */}
          {(
            [
              { provider: 'Google',    icon: <span style={{ fontSize: 18 }}>G</span>,                              onClick: handleGoogle },
              { provider: 'Microsoft', icon: <span style={{ fontSize: 16, fontWeight: 800 }}>M</span>, onClick: undefined },
            ] as const
          ).map(({ provider, icon, onClick }) => (
            <button
              key={provider}
              onClick={onClick}
              disabled={loading || !onClick}
              style={{
                width: '100%', padding: '10px 20px',
                background: 'white', color: '#1A2332',
                border: '1px solid #DDE4EE', borderRadius: 8,
                fontWeight: 600, fontSize: 14,
                cursor: loading || !onClick ? 'not-allowed' : 'pointer',
                opacity: !onClick ? 0.5 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                marginBottom: 8, fontFamily: 'Inter, sans-serif',
                transition: 'background 0.12s',
              }}
            >
              {icon} Continue with {provider}
            </button>
          ))}

          {/* ── Workspace chooser ── */}
          <div style={{ borderTop: '1px solid #DDE4EE', paddingTop: 20, marginTop: 16, marginBottom: 16 }}>
            <div
              style={{
                fontSize: 12, fontWeight: 600, color: '#8B9AB0',
                textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12,
              }}
            >
              Choose your workspace
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {WORKSPACES.map(ws => (
                <button
                  key={ws.path}
                  onClick={() => void authenticate(ws.path)}
                  disabled={loading}
                  style={{
                    padding: 12,
                    background: ws.color, border: `1px solid ${ws.border}`,
                    borderRadius: 10, cursor: loading ? 'not-allowed' : 'pointer',
                    textAlign: 'left', transition: 'transform 0.12s, box-shadow 0.12s',
                    opacity: loading ? 0.65 : 1,
                  }}
                  onMouseEnter={e => {
                    if (!loading) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)';
                    }
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = '';
                    e.currentTarget.style.boxShadow = '';
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 700, color: ws.textColor, marginBottom: 3 }}>
                    {ws.label}
                  </div>
                  <div style={{ fontSize: 11, color: ws.descColor }}>
                    {ws.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ textAlign: 'center', fontSize: 13, color: '#8B9AB0' }}>
            Don't have an account?{' '}
            <Link to="/products" style={{ color: '#1171BB', fontWeight: 600, textDecoration: 'none' }}>
              Sign up free
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
