import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const finishLogin = async () => {
      const token = searchParams.get('token');
      const domain = searchParams.get('domain') || 'medical';

      if (token) {
        localStorage.setItem('gradicent_access_token', token);
      }

      try {
        const response = await fetch('https://api.bindersoftware.com/api/auth/me', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          credentials: 'include',
        });

        if (!response.ok) {
          console.error('Failed to verify session status code:', response.status);
          navigate('/login');
          return;
        }

        const json = await response.json();
        const user = json.data;
        console.log('Authenticated user data:', user);

        localStorage.setItem(
          'gradicent_user',
          JSON.stringify({
            ...user,
            _storedAt: Date.now(),
          })
        );

        console.log(`/${domain}/home`);
        navigate(`/${domain}/home`);
      } catch (err) {
        console.error('Error processing authentication token sync:', err);
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