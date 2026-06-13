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

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

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


  const loginWithGoogle = useCallback((domain: string) => {
    const currentFrontendUrl = window.location.origin;
    
    const frontendCallbackRoute = `${currentFrontendUrl}/auth/callback`;

    window.location.href = `${API_BASE_URL}/start?provider=google&domain=${encodeURIComponent(domain)}&frontend_callback=${encodeURIComponent(frontendCallbackRoute)}`;
  }, []);
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