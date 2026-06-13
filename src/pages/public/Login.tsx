import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ChevronRight, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

type Workspace = {
  id: 'medical' | 'business';
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

export function Login() {
  const [email, setEmail] = useState('alex@gradicent.io');
  const [password, setPassword] = useState('password');
  // Default to business workspace
  const [selectedDomain, setSelectedDomain] = useState<'medical' | 'business'>('business');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    
    setError('');
    setLoading(true);
    try {
      await login(email, password, selectedDomain);
      const workspace = WORKSPACES.find(w => w.id === selectedDomain);
      navigate(workspace ? workspace.path : '/business/home');
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setLoading(true);
    // Explicitly pass the user's selected domain context 
    loginWithGoogle(selectedDomain);
  };

  return (
    <div className="login-shell" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Brand panel remains same */}
      <div className="login-form-panel" style={{ background: '#F7F9FC' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: 420 }}>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 26, fontWeight: 700, color: '#1A2332', marginBottom: 6 }}>Sign in to your account</h1>
          
          {/* Workspace Switcher / Choice (Moved to the TOP for better flow) */}
          <div style={{ marginTop: 16, marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#8B9AB0', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
              1. Select Workspace Context
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {WORKSPACES.map(ws => {
                const isSelected = selectedDomain === ws.id;
                return (
                  <button
                    key={ws.id}
                    type="button"
                    onClick={() => setSelectedDomain(ws.id)}
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
            2. Authenticate into <span style={{ color: '#1171BB' }}>{selectedDomain}</span>
          </div>

          <form onSubmit={handleFormSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email address</label>
              <input id="email" className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} disabled={loading} />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <div style={{ position: 'relative' }}>
                <input id="password" className="form-input" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} disabled={loading} style={{ paddingRight: 40 }} />
                <button type="button" onClick={() => setShowPassword(v => !v)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#8B9AB0', background: 'none', border: 'none', cursor: 'pointer' }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && <p role="alert" style={{ fontSize: 13, color: '#EF4444', background: 'rgba(239,68,68,0.08)', padding: '8px 12px', borderRadius: 6, marginBottom: 12 }}>{error}</p>}

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '11px 20px', background: '#1171BB', color: 'white', borderRadius: 8, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {loading ? <><Loader2 size={15} className="btn-spinner" /> Entering Workspace...</> : <>Access {selectedDomain === 'medical' ? 'Clinic' : 'Operations'} <ChevronRight size={16} /></>}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0' }}>
            <div style={{ flex: 1, height: 1, background: '#DDE4EE' }} />
            <span style={{ fontSize: 12, color: '#8B9AB0' }}>or SSO</span>
            <div style={{ flex: 1, height: 1, background: '#DDE4EE' }} />
          </div>

          <button type="button" onClick={handleGoogleLogin} disabled={loading} style={{ width: '100%', padding: '10px 20px', background: 'white', color: '#1A2332', border: '1px solid #DDE4EE', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>G</span> Continue to {selectedDomain.toUpperCase()} via Google
          </button>
        </motion.div>
      </div>
    </div>
  );
}