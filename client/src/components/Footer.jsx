export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-brand">
        RHONNY<span>BEATZ</span>
      </div>
      <p className="footer-tagline">Original beats. Real licences. No downloads without a purchase.</p>

      <div className="footer-links">
        <a href="#beats">Beats</a>
        <a href="mailto:rhonnybeatzpro@gmail.com">Contact</a>
        <a href="#">About</a>
      </div>

      <p className="footer-copy">© {new Date().getFullYear()} Rhonny Beatz. All rights reserved.</p>
    </footer>
  );
}