import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const MOCK_USER: User = {
  id: 'usr-001',
  name: 'Dr. Alex Morgan',
  email: 'alex@gradicent.io',
  avatar: null,
  role: 'both',
  plan: 'Pro',
  specialty: 'Internal Medicine',
  licenseNumber: 'MD-123456',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('gradicent_user');
    if (stored) {
      try { return JSON.parse(stored) as User; } catch { return null; }
    }
    return null;
  });

  const login = useCallback(async (email: string, password: string) => {
    void email;
    void password;
    await new Promise(resolve => setTimeout(resolve, 800));
    localStorage.setItem('gradicent_token', 'dev-token-gradicent-2024');
    localStorage.setItem('gradicent_user', JSON.stringify(MOCK_USER));
    setUser(MOCK_USER);
  }, []);

  const loginWithGoogle = useCallback(async () => {
    await new Promise(resolve => setTimeout(resolve, 600));
    localStorage.setItem('gradicent_token', 'dev-token-gradicent-2024');
    localStorage.setItem('gradicent_user', JSON.stringify(MOCK_USER));
    setUser(MOCK_USER);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('gradicent_token');
    localStorage.removeItem('gradicent_user');
    setUser(null);
    window.location.href = '/login';
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
