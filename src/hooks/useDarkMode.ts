import { useLocalStorage } from './useLocalStorage';
import { useEffect } from 'react';

export function useDarkMode(): [boolean, () => void] {
  const [isDark, setIsDark] = useLocalStorage('gradicent-dark-mode', false);

  useEffect(() => {
    const el = document.querySelector('.business-layout-root');
    if (el) {
      if (isDark) el.classList.add('dark');
      else el.classList.remove('dark');
    }
  }, [isDark]);

  const toggleDark = () => setIsDark(!isDark);

  return [isDark, toggleDark];
}
