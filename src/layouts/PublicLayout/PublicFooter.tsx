import { Link } from 'react-router-dom';
import { Linkedin, Twitter, Youtube } from 'lucide-react';

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
          <div className="footer-social-row">
            <a href="#" className="footer-social-link" aria-label="LinkedIn"><Linkedin size={14} /></a>
            <a href="#" className="footer-social-link" aria-label="Twitter/X"><Twitter size={14} /></a>
            <a href="#" className="footer-social-link" aria-label="YouTube"><Youtube size={14} /></a>
          </div>
        </div>

        <div>
          <div className="footer-col-title">Product</div>
          <Link to="/products" className="footer-link">Pricing</Link>
          <a href="#" className="footer-link">Changelog</a>
          <a href="#" className="footer-link">Roadmap</a>
          <a href="#" className="footer-link">API Docs</a>
        </div>

        <div>
          <div className="footer-col-title">Medical</div>
          <Link to="/medical-landing" className="footer-link">Overview</Link>
          <a href="#" className="footer-link">Patients</a>
          <a href="#" className="footer-link">Scheduling</a>
          <a href="#" className="footer-link">Analytics</a>
        </div>

        <div>
          <div className="footer-col-title">Business</div>
          <a href="#" className="footer-link">Overview</a>
          <a href="#" className="footer-link">Clients</a>
          <a href="#" className="footer-link">Finance</a>
          <a href="#" className="footer-link">Team</a>
        </div>

        <div>
          <div className="footer-col-title">Legal</div>
          <Link to="/privacy" className="footer-link">Privacy Policy</Link>
          <Link to="/terms" className="footer-link">Terms of Service</Link>
          <a href="#" className="footer-link">Security</a>
          <a href="#" className="footer-link">HIPAA</a>
        </div>
      </div>

      <div className="footer-bar">
        <span>© 2024 Gradicent, Inc. All rights reserved.</span>
        <div className="footer-bar-links">
          <Link to="/privacy" className="footer-bar-link">Privacy</Link>
          <Link to="/terms" className="footer-bar-link">Terms</Link>
          <a href="#" className="footer-bar-link">Cookies</a>
        </div>
      </div>
    </footer>
  );
}
