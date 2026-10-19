import { Link } from 'react-router-dom';

export function PublicFooter() {
  return (
    <footer className="public-footer">
      <div className="footer-grid">
        <div className="footer-brand-col">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ width: 32, height: 32, background: '#FFAF0F', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: '#1B427A', fontFamily: 'Syne' }}>G</div>
            <span style={{ fontSize: 18, fontWeight: 700, color: 'white', fontFamily: 'Syne, sans-serif' }}>Gradicent</span>
          </div>
          <p className="footer-brand-desc">
            The dual-domain platform for medical teams and business operations. Everything you need, in one place.
          </p>
        </div>

        <div>
          <div className="footer-col-title">Product</div>
          <Link to="/products#pricing" className="footer-link">Pricing</Link>
          <Link to="/login" className="footer-link">Sign In</Link>
          <Link to="/login" className="footer-link">Get Started</Link>
        </div>

        <div>
          <div className="footer-col-title">Medical</div>
          <Link to="/medical-landing" className="footer-link">Overview</Link>
          <Link to="/products#medical" className="footer-link">Medical Plans</Link>
          <Link to="/login?domain=medical" className="footer-link">Clinic Sign In</Link>
        </div>

        <div>
          <div className="footer-col-title">Business</div>
          <Link to="/products#business" className="footer-link">Business Plans</Link>
          <Link to="/login?domain=business" className="footer-link">Operations Sign In</Link>
        </div>

        <div>
          <div className="footer-col-title">Legal</div>
          <Link to="/privacy" className="footer-link">Privacy Policy</Link>
          <Link to="/terms" className="footer-link">Terms of Service</Link>
        </div>
      </div>

      <div className="footer-bar">
        <span>© {new Date().getFullYear()} Gradicent, Inc. All rights reserved.</span>
        <div className="footer-bar-links">
          <Link to="/privacy" className="footer-bar-link">Privacy</Link>
          <Link to="/terms" className="footer-bar-link">Terms</Link>
        </div>
      </div>
    </footer>
  );
}
