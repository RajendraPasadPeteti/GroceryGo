import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';

const Cart = () => {
  const { cart, updateCartQuantity, removeFromCart, calculateTotals, getCouponByCode } = useStore();
  const { protectPage } = useAuth();
  const { showToast } = useUI();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [totals, setTotals] = useState({ subtotal: 0, deliveryFee: 0, discount: 0, total: 0 });

  useEffect(() => {
    protectPage('user');
  }, [protectPage]);

  useEffect(() => {
    recalcTotals();
  }, [cart, couponCode]);

  const recalcTotals = () => {
    const calculated = calculateTotals(cart, couponCode || null);
    setTotals(calculated);
    if (calculated.appliedCoupon !== appliedCoupon) {
      setAppliedCoupon(calculated.appliedCoupon);
    }
  };

  const handleCouponApply = () => {
    const coupon = getCouponByCode(couponCode.toUpperCase());
    if (coupon && coupon.active) {
      const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      if (subtotal >= coupon.minOrder) {
        setAppliedCoupon(coupon);
        showToast(`Coupon applied: ${coupon.description}`, 'success');
      } else {
        showToast(`Minimum order ₹${coupon.minOrder} required`, 'warning');
        setCouponCode('');
      }
    } else {
      showToast('Invalid or expired coupon code', 'error');
    }
  };

  const handleCouponRemove = () => {
    setCouponCode('');
    setAppliedCoupon(null);
  };

  const handleQuantityChange = (productId, delta) => {
    updateCartQuantity(productId, delta);
  };

  const handleRemove = (productId) => {
    removeFromCart(productId);
    showToast('Item removed from cart', 'info');
  };

  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <header className="page-header" role="heading" aria-level="1">
          <div className="page-header__left">
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <ol className="breadcrumb__list">
                <li className="breadcrumb__item"><span className="breadcrumb__current" aria-current="page">Cart</span></li>
              </ol>
            </nav>
            <div>
              <h1 className="page-header__title">Shopping Cart</h1>
            </div>
          </div>
        </header>

        <div className="container">
          <div className="card" style={{ maxWidth: '500px', margin: 'var(--space-16) auto', padding: 'var(--space-12)', textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }}>🛍️</div>
            <h3 className="text-xl font-semibold" style={{ marginBottom: 'var(--space-2)' }}>Your cart is empty</h3>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>Add some fresh groceries to get started</p>
            <Link to="/dashboard" className="btn btn--primary btn--lg">Start Shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <header className="page-header" role="heading" aria-level="1">
        <div className="page-header__left">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <ol className="breadcrumb__list">
              <li className="breadcrumb__item"><span className="breadcrumb__current" aria-current="page">Cart</span></li>
            </ol>
          </nav>
          <div>
            <h1 className="page-header__title">Shopping Cart</h1>
            <p className="page-header__subtitle">{cart.length} item{cart.length !== 1 ? 's' : ''} in your cart</p>
          </div>
        </div>
      </header>

        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 'var(--space-8)' }}>
            {/* Cart Items */}
            <div className="cart-items">
              <div className="card" style={{ overflow: 'hidden' }}>
                <div className="table-responsive">
                  <table className="table" role="table">
                    <thead>
                      <tr>
                        <th scope="col">Product</th>
                        <th scope="col">Price</th>
                        <th scope="col">Quantity</th>
                        <th scope="col">Total</th>
                        <th scope="col"><span className="visually-hidden">Actions</span></th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart.map(item => (
                        <tr key={item.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                              <span style={{ fontSize: '2.5rem' }}>{item.icon}</span>
                              <div>
                                <h4 className="font-medium">{item.name}</h4>
                                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{item.unit}</p>
                              </div>
                            </div>
                          </td>
                          <td><span style={{ fontWeight: '500' }}>₹{item.price}</span></td>
                          <td>
                            <div className="quantity-control" style={{ maxWidth: '140px' }}>
                              <button
                                className="quantity-btn"
                                onClick={() => handleQuantityChange(item.productId, -1)}
                                aria-label="Decrease quantity"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                              </button>
                              <input
                                type="text"
                                className="quantity-value"
                                value={item.quantity}
                                readOnly
                                aria-label="Quantity"
                              />
                              <button
                                className="quantity-btn"
                                onClick={() => handleQuantityChange(item.productId, 1)}
                                aria-label="Increase quantity"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                              </button>
                            </div>
                          </td>
                          <td><strong>₹{item.price * item.quantity}</strong></td>
                          <td>
                            <button
                              className="btn btn--ghost btn--sm btn--icon"
                              onClick={() => handleRemove(item.productId)}
                              aria-label={`Remove ${item.name} from cart`}
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Cart Summary */}
            <aside style={{ position: 'sticky', top: 'var(--space-6)' }}>
              <div className="card" style={{ padding: 'var(--space-6)' }}>
                <h3 className="text-lg font-semibold" style={{ marginBottom: 'var(--space-6)' }}>Order Summary</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Subtotal ({cart.length} items)</span>
                    <span className="font-medium">₹{totals.subtotal}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Delivery Fee</span>
                    <span className="font-medium">{totals.deliveryFee === 0 ? 'Free' : `₹${totals.deliveryFee}`}</span>
                  </div>
                  {totals.discount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-error)' }}>
                      <span>Discount {appliedCoupon && `(${appliedCoupon.code})`}</span>
                      <span>−₹{totals.discount}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)' }}>
                    <span className="font-semibold text-lg">Total Payable</span>
                    <span className="font-semibold text-lg" style={{ color: 'var(--color-primary)' }}>₹{totals.total}</span>
                  </div>
                </div>

                <div style={{ marginBottom: 'var(--space-6)' }}>
                  {appliedCoupon ? (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-4)', background: 'var(--color-success-bg)', border: '1px solid var(--color-success)', borderRadius: 'var(--radius-md)' }}>
                      <span style={{ color: 'var(--color-primary-dark)', fontWeight: '500' }}>Applied: {appliedCoupon.code}</span>
                      <button className="btn btn--ghost btn--sm" onClick={handleCouponRemove}>Remove</button>
                    </div>
                  ) : (
                    <div>
                      <label htmlFor="coupon" className="input-label" style={{ marginBottom: 'var(--space-2)' }}>Coupon Code</label>
                      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        <input
                          id="coupon"
                          type="text"
                          className="input"
                          placeholder="Enter coupon code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          onKeyDown={(e) => e.key === 'Enter' && handleCouponApply()}
                          style={{ flex: 1 }}
                        />
                        <button className="btn btn--primary" onClick={handleCouponApply}>Apply</button>
                      </div>
                      <p className="input-helper" style={{ marginTop: 'var(--space-2)' }}>Try: GROCERY100, FRESH20, WELCOME50</p>
                    </div>
                  )}
                </div>

                {totals.deliveryFee > 0 && (
                  <p style={{ color: 'var(--color-primary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)', padding: 'var(--space-3)', background: 'var(--color-primary-light)', borderRadius: 'var(--radius-md)' }}>Add ₹{300 - totals.subtotal} more for free delivery!</p>
                )}

                <Link to="/checkout" className="btn btn--primary btn--full btn--lg">
                  Proceed to Checkout →
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </div>
  );
};

export default Cart;