import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getTheme, setTheme } from '../theme';

export default function Header({ cartCount, onOpenCart, user, onOpenAuth, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setThemeState] = useState(getTheme());

  function closeMenu() {
    setMenuOpen(false);
  }

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    setThemeState(next);
  }

  return (
    <header className="site-header">
      <Link to="/" className="logo" onClick={closeMenu}>
        RHONNY<span>BEATZ</span>
      </Link>
      <div className="header-spacer" />

      {/* Desktop nav */}
      <nav className="desktop-nav">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/videos" className="nav-link">Videos</Link>
        <Link to="/news" className="nav-link">News</Link>
        <Link to="/contact" className="nav-link">Contact</Link>
        <a
          href="https://www.youtube.com/@rhonnybeatz"
          target="_blank"
          rel="noopener noreferrer"
          className="yt-icon-link"
          aria-label="YouTube"
        >
          ▶
        </a>
        {user?.role === 'admin' && (
          <Link to="/admin" className="admin-link">Dashboard</Link>
        )}
      </nav>

      <button className="theme-btn" onClick={toggleTheme} aria-label="Toggle theme">
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>

      <button className="cart-btn" onClick={onOpenCart}>
        Cart{cartCount > 0 && <span className="cart-count">{cartCount}</span>}
      </button>

      {/* Desktop login/user */}
      <div className="desktop-auth">
        {user ? (
          <div className="user-area">
            <span className="user-email">{user.email}</span>
            <button className="login-btn" onClick={onLogout}>Log out</button>
          </div>
        ) : (
          <button className="login-btn" onClick={onOpenAuth}>Log in</button>
        )}
      </div>

      {/* Hamburger, mobile only */}
      <button
        className={`hamburger ${menuOpen ? 'open' : ''}`}
        onClick={() => setMenuOpen((v) => !v)}
        aria-label="Menu"
        aria-expanded={menuOpen}
      >
        <span /><span /><span />
      </button>

      {/* Mobile slide-down menu */}
      {menuOpen && (
        <div className="mobile-menu">
          <Link to="/" className="mobile-link" onClick={closeMenu}>Home</Link>
          <Link to="/videos" className="mobile-link" onClick={closeMenu}>Videos</Link>
          <Link to="/news" className="mobile-link" onClick={closeMenu}>News</Link>
          <Link to="/contact" className="mobile-link" onClick={closeMenu}>Contact</Link>
          <a
            href="https://www.youtube.com/@rhonnybeatz"
            target="_blank"
            rel="noopener noreferrer"
            className="mobile-link"
            onClick={closeMenu}
          >
            YouTube ▶
          </a>
          {user?.role === 'admin' && (
            <Link to="/admin" className="mobile-link" onClick={closeMenu}>Dashboard</Link>
          )}
          <div className="mobile-menu-divider" />
          {user ? (
            <>
              <span className="mobile-user-email">{user.email}</span>
              <button className="mobile-link mobile-link-btn" onClick={() => { onLogout(); closeMenu(); }}>
                Log out
              </button>
            </>
          ) : (
            <button className="mobile-link mobile-link-btn" onClick={() => { onOpenAuth(); closeMenu(); }}>
              Log in
            </button>
          )}
        </div>
      )}
    </header>
  );
}