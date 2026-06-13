
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const finishLogin = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        });

        if (!response.ok) {
          navigate('/login');
          return;
        }

        const { user } = await response.json();

        localStorage.setItem(
          'gradicent_user',
          JSON.stringify({
            ...user,
            _storedAt: Date.now(),
          })
        );

        navigate('/medical/home');
      } catch {
        navigate('/login');
      }
    };

    void finishLogin();
  }, [navigate]);

  return <div>Signing you in...</div>;
}