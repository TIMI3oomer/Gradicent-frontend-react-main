import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, domain: string) => Promise<void>;
  loginWithGoogle: (domain: string) => void; 
  logout: (domain?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const API_BASE_URL = 'https://api.bindersoftware.com/api/auth'; 

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setLoading] = useState(true);

  // Session Bootstrap: Instantly runs on app load using HTTP cookies
  useEffect(() => {
    const checkCurrentUser = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/me`, { 
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include' // Tells the browser to send cross-subdomain cookies automatically
        });

        if (res.ok) {
          const json = await res.json();
          if (json.status === 'success' && json.data) {
            setUser(json.data); 
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Failed to restore auth session:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkCurrentUser();
  }, []);

  // Standard password authentication route
  const login = useCallback(async (email: string, password: string, domain: string) => {
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

    setUser(json.data);
  }, []);

  // Context sign-out routine
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
      setUser(null);
      window.location.href = '/login';
    }
  }, []);

  const loginWithGoogle = useCallback((domain: string) => {
    const currentFrontendUrl = window.location.origin;
    const frontendCallbackRoute = `${currentFrontendUrl}/${domain}/home`;

    window.location.href = `${API_BASE_URL}/start?provider=google&domain=${encodeURIComponent(domain)}&redirect_uri=${encodeURIComponent(frontendCallbackRoute)}`;
  }, []);

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated: !!user, 
        isLoading, 
        login, 
        loginWithGoogle, 
        logout 
      }}
    >
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}