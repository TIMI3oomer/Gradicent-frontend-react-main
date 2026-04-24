import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface ThemeContextValue {
  isDark: boolean;
  toggleDark: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({ isDark: false, toggleDark: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useLocalStorage('gradicent-dark-mode', false);
  const [, setAnimating] = useState(false);

  const toggleDark = useCallback(() => {
    setAnimating(true);
    setIsDark(!isDark);
    setTimeout(() => setAnimating(false), 600);
  }, [isDark, setIsDark]);

  return (
    <ThemeContext.Provider value={{ isDark, toggleDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
