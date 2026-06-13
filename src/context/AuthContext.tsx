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
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => void;
  logout: () => void;
}

interface AuthError extends Error {
  code: 'INVALID_CREDENTIALS' | 'NETWORK_ERROR' | 'SERVER_ERROR';
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem('gradicent_user');
    if (!raw) return null;

    const parsed = JSON.parse(raw) as User & { _storedAt?: number };
    const TOKEN_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

    if (parsed._storedAt && Date.now() - parsed._storedAt > TOKEN_TTL_MS) {
      localStorage.removeItem('gradicent_user');
      localStorage.removeItem('gradicent_token');
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function createAuthError(
  message: string,
  code: AuthError['code']
): AuthError {
  const err = new Error(message) as AuthError;
  err.code = code;
  return err;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Rehydrate on mount (avoids SSR mismatch and isolates storage access)
  useEffect(() => {
    setUser(getStoredUser());
    setIsLoading(false);
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
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
