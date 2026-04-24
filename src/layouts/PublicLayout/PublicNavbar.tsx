import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/cn';

const lightPages = ['/products', '/privacy', '/terms', '/medical-landing'];

export function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isLightPage = lightPages.includes(location.pathname);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <nav
      className={cn(
        'public-navbar',
        scrolled && 'scrolled',
        isLightPage && !scrolled && 'light-nav'
      )}
      aria-label="Main navigation"
    >
      <Link
        to="/"
        className={cn('nav-logo', isLightPage && !scrolled && 'light-logo')}
        aria-label="Gradicent home"
      >
        <div className="nav-logo-mark">G</div>
        <span className="nav-logo-name">Gradicent</span>
      </Link>

      <div className="nav-links">
        <Link to="/products" className="nav-link">Products</Link>
        <Link to="/medical-landing" className="nav-link">Medical</Link>
        <Link to="/products" className="nav-link">Business</Link>
        <Link to="/products" className="nav-link">Pricing</Link>
      </div>

      <div className="nav-ctas">
        <Link to="/login" className="nav-signin">Sign In</Link>
        <Link to="/login" className="nav-start">Get Started</Link>
      </div>
    </nav>
  );
}
