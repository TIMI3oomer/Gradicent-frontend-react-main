import { type ReactNode } from 'react';
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

  return (
    <div className={`business-layout-root business-theme${isDark ? ' dark' : ''}`}>
      <a href="#biz-main-content" className="skip-link">Skip to content</a>
      <div className="business-layout">
        <BusinessSidebar />
        <div className="business-main">
          <BusinessTopBar title={title} />
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
