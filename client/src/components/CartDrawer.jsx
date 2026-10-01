import { useEffect } from 'react';
import { formatPrice } from '../config';

export default function CartDrawer({ cart, onRemove, onClear, onClose }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Totals per currency, so mixed currencies are never added together
  const totals = cart.reduce((acc, item) => {
    acc[item.currency] = (acc[item.currency] || 0) + item.price_cents;
    return acc;
  }, {});

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <aside className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-head">
          <h2>Your cart</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {cart.length === 0 ? (
          <p className="notice">Your cart is empty.</p>
        ) : (
          <>
            <div className="cart-items">
              {cart.map((item) => (
                <div key={item.beatId} className="cart-item">
                  <div>
                    <h4>{item.title}</h4>
                    <p>{item.tierName}</p>
                  </div>
                  <div className="cart-item-right">
                    <strong>{formatPrice(item.price_cents, item.currency)}</strong>
                    <button className="remove-btn" onClick={() => onRemove(item.beatId)}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="drawer-foot">
              {Object.entries(totals).map(([currency, cents]) => (
                <div key={currency} className="cart-total">
                  <span>Total</span>
                  <strong>{formatPrice(cents, currency)}</strong>
                </div>
              ))}
              <button className="checkout-btn" disabled>
                Checkout (coming next)
              </button>
              <button className="clear-btn" onClick={onClear}>Clear cart</button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}