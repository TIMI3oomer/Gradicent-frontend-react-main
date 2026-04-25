import { type ReactNode } from 'react';
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

export function MedicalLayout({ children, title, breadcrumb, actionLabel, actionPath }: MedicalLayoutProps) {
  const { isDark } = useTheme();

  return (
    <div className={`medical-layout medical-theme${isDark ? ' dark' : ''}`}>
      <a href="#main-content" className="skip-link">Skip to content</a>
      <MedicalSidebar />
      <div className="medical-main">
        <MedicalTopBar title={title} breadcrumb={breadcrumb} actionLabel={actionLabel} actionPath={actionPath} />
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
