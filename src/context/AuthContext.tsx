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

  useEffect(() => {
    const checkCurrentUser = async () => {
      const token = localStorage.getItem('gradicent_access_token');
      
      // If there's no token and no local session, we can stop loading early
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/me`, { 
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Crucial header link
          },
          credentials: 'include' 
        });

        if (res.ok) {
          const json = await res.json();
          if (json.status === 'success' && json.data) {
            setUser(json.data); 
          } else {
            // Token is invalid/expired
            localStorage.removeItem('gradicent_access_token');
          }
        } else {
          localStorage.removeItem('gradicent_access_token');
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

    // Save token if returned inside the login response structure
    if (json.data?.token || json.data?.access_token) {
      localStorage.setItem('gradicent_access_token', json.data.token || json.data.access_token);
    } else if (json.token) {
      localStorage.setItem('gradicent_access_token', json.token);
    }

    setUser(json.data);
  }, []);

  const logout = useCallback(async (domain: string = 'business') => {
    const token = localStorage.getItem('gradicent_access_token');
    try {
      await fetch(`${API_BASE_URL}/signout`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ domain }),
        credentials: 'include'
      });
    } catch (err) {
      console.error('Logout request failed:', err);
    } finally {
      // Complete cleanup
      localStorage.removeItem('gradicent_access_token');
      localStorage.removeItem('gradicent_user');
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