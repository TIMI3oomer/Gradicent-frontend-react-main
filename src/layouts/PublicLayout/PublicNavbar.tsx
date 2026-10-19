import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { cn } from '../../lib/cn';

const lightPages = ['/products', '/privacy', '/terms', '/medical-landing'];

const NAV_LINKS = [
  { to: '/products', label: 'Products' },
  { to: '/medical-landing', label: 'Medical' },
  { to: '/products#business', label: 'Business' },
  { to: '/products#pricing', label: 'Pricing' },
];

export function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const isLightPage = lightPages.includes(location.pathname);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    handler();
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Close the mobile menu whenever the route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.hash]);

  return (
    <nav
      className={cn(
        'public-navbar',
        scrolled && 'scrolled',
        isLightPage && !scrolled && 'light-nav',
        menuOpen && 'menu-open'
      )}
      aria-label="Main navigation"
    >
      <Link
        to="/"
        className={cn('nav-logo', isLightPage && !scrolled && 'light-logo')}
        aria-label="Binder Software home"
      >
        <div className="nav-logo-mark">B</div>
        <span className="nav-logo-name">Binder Software</span>
      </Link>

      <div className="nav-menu" id="public-nav-menu">
        <div className="nav-links">
          {NAV_LINKS.map(link => (
            <Link key={link.label} to={link.to} className="nav-link">{link.label}</Link>
          ))}
        </div>

        <div className="nav-ctas">
          <Link to="/login" className="nav-signin">Sign In</Link>
          <Link to="/login" className="nav-start">Get Started</Link>
        </div>
      </div>

      <button
        type="button"
        className="nav-menu-toggle"
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={menuOpen}
        aria-controls="public-nav-menu"
        onClick={() => setMenuOpen(open => !open)}
      >
        {menuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>
    </nav>
  );
}
