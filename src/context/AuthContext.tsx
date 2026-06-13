import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import type { User } from '../types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string, domain: string) => Promise<void>;
  loginWithGoogle: (domain: string) => void; // Sync operation because it triggers a full page redirect
  logout: (domain?: string) => Promise<void>;
}

interface AuthError extends Error {
  code: 'INVALID_CREDENTIALS' | 'NETWORK_ERROR' | 'SERVER_ERROR';
}

// Configure your Flask API base URL here
const API_BASE_URL = 'https://gradicent-api.vercel.app/api/auth'; 

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkCurrentUser = async () => {
      try {
        // credentials: 'include' ensures Flask session cookies are transmitted
        const res = await fetch(`${API_BASE_URL}/me`, { credentials: 'include' });
        if (res.ok) {
          const json = await res.json();
          if (json.status === 'success' && json.data) {
            setUser(json.data); // Normalized user structure returned by backend
          }
        }
      } catch (err) {
        console.error('Failed to restore auth session:', err);
      } finally {
        setLoading(false);
      }
    };

    checkCurrentUser();
  }, []);

  const login = useCallback(async (email: string, password: string, domain: string) => {
    // Note: auth_routes.py snippet only handles OAuth natively. If you have a password route, 
    // ensure it processes the domain payload exactly like this block.
    const res = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, domain }),
      credentials: 'include'
    });

    const json = await res.json();
    if (!res.ok || json.status === 'error') {
      throw new Error(json.message || 'Authentication failed');
    }

    setUser(json.data.user);
  }, []);

  const loginWithGoogle = useCallback((domain: string) => {
    window.location.href = `${API_BASE_URL}/start?provider=google&domain=${encodeURIComponent(domain)}`;
  }, []);

  const logout = useCallback(async (domain: string = 'business') => {
    try {
      await fetch(`${API_BASE_URL}/signout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain }),
        credentials: 'include'
      });
    } catch (err) {
      console.error('Logout request failed:', err);
    } finally {
      // Always reset local context state regardless of backend errors
      setUser(null);
      window.location.href = '/login';
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
  setIsLoading(true);

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        email,
        password,
      }),
    });

    if (response.status === 401) {
      throw createAuthError(
        'Invalid email or password.',
        'INVALID_CREDENTIALS'
      );
    }

    if (!response.ok) {
      throw createAuthError(
        'Failed to authenticate.',
        'SERVER_ERROR'
      );
    }

    const { user } = await response.json();

    setUser(user);

    localStorage.setItem(
      'gradicent_user',
      JSON.stringify({
        ...user,
        _storedAt: Date.now(),
      })
    );
  } catch (err) {
    if ((err as AuthError).code) throw err;

    throw createAuthError(
      'Network error.',
      'NETWORK_ERROR'
    );
  } finally {
    setIsLoading(false);
  }
}, []);

const loginWithGoogle = useCallback(() => {
  const state = crypto.randomUUID();

  sessionStorage.setItem('oauth_state', state);

  window.location.href =
    `https://gradicent-api.vercel.app/api/auth/start?state=${encodeURIComponent(state)}`;
}, []);

  const logout = useCallback(async () => {
    try {
      if (!import.meta.env.DEV) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include',
        });
      }
    } finally {
      localStorage.removeItem('gradicent_token');
      localStorage.removeItem('gradicent_user');
      sessionStorage.removeItem('oauth_state');
      setUser(null);
      navigate('/login');
    }
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, loginWithGoogle, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}