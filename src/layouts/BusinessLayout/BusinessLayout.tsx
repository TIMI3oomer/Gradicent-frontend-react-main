import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BusinessSidebar } from './BusinessSidebar';
import { BusinessTopBar } from './BusinessTopBar';
import { useTheme } from '../../context/ThemeContext';

interface BusinessLayoutProps {
  children: ReactNode;
  title: string;
}

export function BusinessLayout({ children, title }: BusinessLayoutProps) {
  const { isDark } = useTheme();
  const { pathname } = useLocation();
  // Off-canvas navigation drawer (only visible below 900px, see business.css)
  const [navOpen, setNavOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const closeNav = useCallback(() => {
    setNavOpen(false);
    menuButtonRef.current?.focus();
  }, []);

  // Close the drawer whenever the route changes
  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  // Close on Escape
  useEffect(() => {
    if (!navOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeNav();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [navOpen, closeNav]);

  return (
    <div className={`business-layout-root business-theme${isDark ? ' dark' : ''}${navOpen ? ' biz-nav-open' : ''}`}>
      <a href="#biz-main-content" className="skip-link">Skip to content</a>
      <div className="business-layout">
        <BusinessSidebar open={navOpen} onClose={closeNav} />
        <div
          className={`biz-sidebar-backdrop${navOpen ? ' visible' : ''}`}
          onClick={closeNav}
          aria-hidden="true"
        />
        <div className="business-main">
          <BusinessTopBar
            title={title}
            menuOpen={navOpen}
            onMenuClick={() => setNavOpen(true)}
            menuButtonRef={menuButtonRef}
          />
          <motion.main
            id="biz-main-content"
            className="business-content"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          >
            {children}
          </motion.main>
        </div>
      </div>
    </div>
  );
}
