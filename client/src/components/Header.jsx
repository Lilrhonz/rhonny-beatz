import { Link } from 'react-router-dom';
export default function Header({ cartCount, onOpenCart, user, onOpenAuth, onLogout }) {
  return (
    <header className="site-header">
            <Link to="/" className="logo">
        RHONNY<span>BEATZ</span>
      </Link>
      <div className="header-spacer" />
      <button className="cart-btn" onClick={onOpenCart}>
        Cart{cartCount > 0 && <span className="cart-count">{cartCount}</span>}
      </button>
      {user ? (
        <div className="user-area">
          <span className="user-email">{user.email}</span>
          <button className="login-btn" onClick={onLogout}>Log out</button>
        </div>
      ) : (
        <button className="login-btn" onClick={onOpenAuth}>Log in</button>
      )}
    </header>
  );
}