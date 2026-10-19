import { useState } from 'react';
import { useNavigate, useLocation, useSearchParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ChevronRight, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { errorMessage } from '../../components/shared/apiHelpers';

type Domain = 'medical' | 'business';

type Workspace = {
  id: Domain;
  label: string;
  desc: string;
  path: string;
  color: string;
  border: string;
  textColor: string;
  descColor: string;
};

const WORKSPACES: Workspace[] = [
  {
    id: 'medical',
    label: '🩺 Medical',
    desc: 'Patient care & clinic management',
    path: '/medical/home',
    color: '#EAD9C8',
    border: '#C4AD97',
    textColor: '#2B2B2B',
    descColor: 'rgba(43,43,43,0.55)',
  },
  {
    id: 'business',
    label: '💼 Business',
    desc: 'Client ops & finance',
    path: '/business/home',
    color: '#212D40',
    border: '#2D3D56',
    textColor: '#E8EDF5',
    descColor: 'rgba(232,237,245,0.5)',
  },
];

const isDomain = (value: string | null | undefined): value is Domain => value === 'medical' || value === 'business';

export function Login() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
  // Pre-select the workspace from ?domain= or from the protected page the user was sent here from
  const initialDomain: Domain = isDomain(searchParams.get('domain'))
    ? (searchParams.get('domain') as Domain)
    : from?.startsWith('/medical') ? 'medical' : 'business';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<Domain>(initialDomain);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, loginWithGoogle, isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();

  const workspacePath = (domain: Domain) => WORKSPACES.find(w => w.id === domain)?.path ?? '/business/home';
  const destinationFor = (domain: Domain) => (from && from.startsWith(`/${domain}`) ? from : workspacePath(domain));

  // Already signed in: skip the form
  if (!isLoading && isAuthenticated) {
    const signedInDomain: Domain = user?.role === 'medical' ? 'medical' : user?.role === 'business' ? 'business' : selectedDomain;
    return <Navigate to={destinationFor(signedInDomain)} replace />;
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) { setError('Please enter your email and password.'); return; }

    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password, selectedDomain);
      navigate(destinationFor(selectedDomain), { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      // Wrong credentials come back as a generic failure; anything else (network, server) gets a readable message
      setError(!message || message === 'Authentication failed' || /invalid|incorrect|credentials|password/i.test(message)
        ? 'Invalid email or password. Please try again.'
        : errorMessage(err, 'Sign in failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setLoading(true);
    // Explicitly pass the user's selected domain context
    loginWithGoogle(selectedDomain);
  };

  const selectedLabel = selectedDomain === 'medical' ? 'Medical' : 'Business';

  return (
    <div className="login-shell" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div className="login-brand-panel" style={{ background: '#1B427A', color: 'white' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, color: 'white', marginBottom: 40 }} aria-label="Binder Software home">
          <span style={{ width: 36, height: 36, background: '#FFAF0F', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 15, color: '#1B427A', fontFamily: 'Syne, sans-serif' }}>B</span>
          <span style={{ fontSize: 18, fontWeight: 700, fontFamily: 'Syne, sans-serif' }}>Binder Software</span>
        </Link>
        <h2 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 'clamp(26px, 3vw, 36px)', fontWeight: 700, lineHeight: 1.2, marginBottom: 14 }}>
          One login for your clinic and your business.
        </h2>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: 'rgba(255,255,255,0.7)', maxWidth: 360 }}>
          Pick a workspace, sign in, and pick up right where you left off.
        </p>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 32, fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>
          <ArrowLeft size={14} /> Back to website
        </Link>
      </div>

      <div className="login-form-panel" style={{ background: '#F7F9FC' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: 420 }}>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 26, fontWeight: 700, color: '#1A2332', marginBottom: 6 }}>Sign in to your account</h1>

          <div style={{ marginTop: 16, marginBottom: 24 }}>
            <div id="workspace-label" style={{ fontSize: 11, fontWeight: 600, color: '#8B9AB0', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
              1. Choose your workspace
            </div>
            <div role="group" aria-labelledby="workspace-label" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {WORKSPACES.map(ws => {
                const isSelected = selectedDomain === ws.id;
                return (
                  <button
                    key={ws.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setSelectedDomain(ws.id)}
                    disabled={loading}
                    style={{
                      padding: 12,
                      background: ws.color,
                      border: isSelected ? '3px solid #1171BB' : `1px solid ${ws.border}`,
                      borderRadius: 10,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transform: isSelected ? 'scale(1.02)' : 'none',
                      boxShadow: isSelected ? '0 4px 12px rgba(17,113,187,0.15)' : 'none',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ fontSize: 14, fontWeight: 700, color: ws.textColor, marginBottom: 3 }}>
                      {ws.label} {isSelected && '✓'}
                    </div>
                    <div style={{ fontSize: 11, color: ws.descColor }}>{ws.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ fontSize: 11, fontWeight: 600, color: '#8B9AB0', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
            2. Sign in to <span style={{ color: '#1171BB' }}>{selectedLabel}</span>
          </div>

          <form onSubmit={handleFormSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email address</label>
              <input id="email" className="form-input" type="email" autoComplete="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} disabled={loading} />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <div style={{ position: 'relative' }}>
                <input id="password" className="form-input" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} disabled={loading} style={{ paddingRight: 40 }} />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#8B9AB0', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && <p role="alert" style={{ fontSize: 13, color: '#EF4444', background: 'rgba(239,68,68,0.08)', padding: '8px 12px', borderRadius: 6, marginBottom: 12 }}>{error}</p>}

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '11px 20px', background: '#1171BB', color: 'white', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.85 : 1, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {loading ? <><Loader2 size={15} className="btn-spinner" /> Signing in…</> : <>Sign in to {selectedLabel} <ChevronRight size={16} /></>}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0' }}>
            <div style={{ flex: 1, height: 1, background: '#DDE4EE' }} />
            <span style={{ fontSize: 12, color: '#8B9AB0' }}>or</span>
            <div style={{ flex: 1, height: 1, background: '#DDE4EE' }} />
          </div>

          <button type="button" onClick={handleGoogleLogin} disabled={loading} style={{ width: '100%', padding: '10px 20px', background: 'white', color: '#1A2332', border: '1px solid #DDE4EE', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
              <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
            </svg>
            Continue with Google
          </button>
        </motion.div>
      </div>
    </div>
  );
}
