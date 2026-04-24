import { useNavigate } from 'react-router-dom';
import { PublicLayout } from '../../layouts/PublicLayout/PublicLayout';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <PublicLayout>
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '48px 24px' }}>
        <div style={{ fontSize: 120, fontWeight: 900, color: 'var(--navy)', fontFamily: "'Fraunces', serif", lineHeight: 1, marginBottom: 16, opacity: 0.1 }}>404</div>
        <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--navy)', fontFamily: "'Fraunces', serif", marginBottom: 12 }}>Page Not Found</div>
        <p style={{ fontSize: 16, color: '#6b7280', maxWidth: 440, marginBottom: 32, lineHeight: 1.7 }}>
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => navigate('/')}
            style={{ padding: '12px 28px', background: 'var(--navy)', color: 'white', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}
          >
            Go Home
          </button>
          <button
            onClick={() => navigate(-1)}
            style={{ padding: '12px 28px', background: 'transparent', color: 'var(--navy)', border: '1px solid var(--navy)', borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}
          >
            Go Back
          </button>
        </div>
      </div>
    </PublicLayout>
  );
}
