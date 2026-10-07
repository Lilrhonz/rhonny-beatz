import { Link } from 'react-router-dom';
import NewsletterForm from './NewsletterForm';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-brand">
        RHONNY<span>BEATZ</span>
      </div>
      <p className="footer-tagline">Original beats. Real licences. No downloads without a purchase.</p>

      <div className="newsletter-block">
        <p className="newsletter-label">Get notified when new beats drop</p>
        <NewsletterForm />
      </div>

      <div className="footer-links">
        <a href="#beats">Beats</a>
                <Link to="/contact">Contact</Link>
        <Link to="/videos">Videos</Link>
      </div>

      <p className="footer-copy">© {new Date().getFullYear()} Rhonny Beatz. All rights reserved.</p>
    </footer>
  );
}