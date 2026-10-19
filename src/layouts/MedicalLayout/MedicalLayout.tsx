import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MedicalSidebar } from './MedicalSidebar';
import { MedicalTopBar } from './MedicalTopBar';
import { useTheme } from '../../context/ThemeContext';

interface MedicalLayoutProps {
  children: ReactNode;
  title: string;
  breadcrumb?: string;
  actionLabel?: string;
  actionPath?: string;
}

const MOBILE_QUERY = '(max-width: 900px)';
const MEDICAL_MENU_BUTTON_ID = 'medical-menu-toggle';
const MEDICAL_SIDEBAR_ID = 'medical-sidebar';

export function MedicalLayout({ children, title, breadcrumb, actionLabel, actionPath }: MedicalLayoutProps) {
  const { isDark } = useTheme();
  const { pathname } = useLocation();
  const [navOpen, setNavOpen] = useState(false);

  const closeNav = useCallback((restoreFocus = false) => {
    setNavOpen(false);
    if (restoreFocus) document.getElementById(MEDICAL_MENU_BUTTON_ID)?.focus();
  }, []);

  // Close the drawer whenever the route changes
  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!navOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeNav(true);
    };

    // Close if the viewport grows past the mobile breakpoint while open
    const media = window.matchMedia(MOBILE_QUERY);
    const onMediaChange = (event: MediaQueryListEvent) => {
      if (!event.matches) setNavOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);
    media.addEventListener('change', onMediaChange);

    // Move focus into the drawer so keyboard users land on the navigation
    const firstLink = document.querySelector<HTMLElement>(`#${MEDICAL_SIDEBAR_ID} a, #${MEDICAL_SIDEBAR_ID} button`);
    firstLink?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      media.removeEventListener('change', onMediaChange);
    };
  }, [navOpen, closeNav]);

  return (
    <div className={`medical-layout medical-theme${isDark ? ' dark' : ''}`}>
      <a href="#main-content" className="skip-link">Skip to content</a>
      <MedicalSidebar id={MEDICAL_SIDEBAR_ID} open={navOpen} onNavigate={() => closeNav()} />
      {navOpen && (
        <div
          className="medical-sidebar-backdrop"
          aria-hidden="true"
          onClick={() => closeNav(true)}
        />
      )}
      <div className="medical-main">
        <MedicalTopBar
          title={title}
          breadcrumb={breadcrumb}
          actionLabel={actionLabel}
          actionPath={actionPath}
          menuOpen={navOpen}
          menuButtonId={MEDICAL_MENU_BUTTON_ID}
          sidebarId={MEDICAL_SIDEBAR_ID}
          onMenuToggle={() => setNavOpen(open => !open)}
        />
        <motion.main
          id="main-content"
          className="medical-content"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
