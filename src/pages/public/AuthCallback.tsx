import { useEffect } from 'react';
import { useNavigate, useSearchParams, type NavigateFunction } from 'react-router-dom';

export function AuthCallback() {
  const navigate: NavigateFunction = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const finishLogin = async () => {
      const token = searchParams.get('token');
      const domain = searchParams.get('domain') || 'medical';

      if (token) {

        navigate(`/${domain}/home`);
      } else {
        console.error('Error processing authentication token');
        navigate('/login');
      }
    };

    void finishLogin();
  }, [navigate, searchParams]);

  return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#F7F9FC', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <h3 style={{ marginBottom: 6, fontWeight: 600, color: '#1A2332' }}>Securing Workspace Session...</h3>
        <p style={{ color: '#8B9AB0', fontSize: 14 }}>Preparing your dashboard setup.</p>
      </div>
    </div>
  );
}