import type { ReactNode } from 'react';
import { PublicNavbar } from './PublicNavbar';
import { PublicFooter } from './PublicFooter';

export function PublicLayout({ children, showFooter = true }: { children: ReactNode; showFooter?: boolean }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PublicNavbar />
      <main style={{ flex: 1 }}>{children}</main>
      {showFooter && <PublicFooter />}
    </div>
  );
}
