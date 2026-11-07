import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { useUI } from '../../context/UIContext';

const Cart = () => {
  const { cart, updateCartQuantity, removeFromCart, clearCart, getCouponByCode } = useStore();
  const { showToast } = useUI();
  const navigate = useNavigate();

  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }, [cart]);

  const discount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.type === 'percentage') {
      return Math.round((subtotal * appliedCoupon.value) / 100);
    }
    return Math.min(appliedCoupon.value, subtotal);
  }, [subtotal, appliedCoupon]);

  const deliveryFee = subtotal >= 300 || subtotal === 0 ? 0 : 40;
  const total = Math.max(0, subtotal - discount + deliveryFee);

  const handleQuantity = (productId, delta) => {
    updateCartQuantity(productId, delta);
    window.dispatchEvent(new CustomEvent('cart-updated'));
  };

  const handleRemove = (productId) => {
    removeFromCart(productId);
    showToast('Item removed from cart', 'info');
    window.dispatchEvent(new CustomEvent('cart-updated'));
  };

  const handleClearAll = () => {
    if (window.confirm('Clear all items from your cart?')) {
      clearCart();
      showToast('Cart cleared', 'info');
      window.dispatchEvent(new CustomEvent('cart-updated'));
    }
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const code = couponInput.trim().toUpperCase();
    if (!code) return;

    const coupon = getCouponByCode ? getCouponByCode(code) : null;
    if (coupon && coupon.active !== false) {
      if (subtotal < (coupon.minOrder || coupon.minimumCartSpend || 0)) {
        showToast(`Minimum cart spend ₹${coupon.minOrder || coupon.minimumCartSpend} required for this coupon`, 'warning');
        return;
      }
      setAppliedCoupon({
        code: coupon.code,
        value: coupon.discount || coupon.value || 100,
        type: 'fixed',
      });
      showToast(`Coupon ${code} applied successfully!`, 'success');
    } else if (code === 'GROCERY100') {
      if (subtotal < 500) {
        showToast('Minimum cart spend ₹500 required for GROCERY100', 'warning');
        return;
      }
      setAppliedCoupon({ code: 'GROCERY100', value: 100, type: 'fixed' });
      showToast('₹100 discount applied!', 'success');
    } else if (code === 'WELCOME50') {
      if (subtotal < 250) {
        showToast('Minimum cart spend ₹250 required for WELCOME50', 'warning');
        return;
      }
      setAppliedCoupon({ code: 'WELCOME50', value: 50, type: 'fixed' });
      showToast('₹50 discount applied!', 'success');
    } else {
      showToast('Invalid coupon code', 'error');
    }
  };

  const totalItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div style={{ background: '#F8FAF9', minHeight: '80vh', padding: '36px 0 64px' }}>
      <div className="container">
        {/* Page Heading */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#1F2937', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🛒</span>
            <span>Your Shopping Cart</span>
          </h1>
          <p style={{ fontSize: '14px', color: '#6B7280', marginTop: '4px' }}>
            Review items in your cart and proceed to checkout.
          </p>
        </div>

        {cart.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '28px', alignItems: 'flex-start' }}>
            {/* Left Column: Cart Items Card */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid #F3F4F6', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1F2937' }}>
                  Cart Items ({totalItemsCount})
                </h2>
                <button
                  type="button"
                  onClick={handleClearAll}
                  style={{ background: 'none', border: 'none', color: '#DC2626', fontWeight: 600, fontSize: '13.5px', cursor: 'pointer' }}
                >
                  Clear All
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {cart.map(item => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 0',
                      borderBottom: '1px solid #F3F4F6',
                      gap: '16px',
                    }}
                  >
                    {/* Item Info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                      <div
                        style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '12px',
                          background: '#F9FAFB',
                          border: '1px solid #E5E7EB',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '28px',
                          flexShrink: 0,
                        }}
                      >
                        {item.icon || '🍏'}
                      </div>
                      <div>
                        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1F2937' }}>{item.name}</h3>
                        <div style={{ fontSize: '12.5px', color: '#6B7280', margin: '2px 0 4px' }}>
                          {item.category} • {item.unit || '1 kg'}
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#16A34A' }}>
                          ₹{item.price} each
                        </div>
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        background: '#FFFFFF',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => handleQuantity(item.id, -1)}
                        style={{ width: '32px', height: '32px', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 700, color: '#4B5563', fontSize: '16px' }}
                      >
                        -
                      </button>
                      <span style={{ width: '32px', textAlign: 'center', fontSize: '14px', fontWeight: 700, color: '#1F2937' }}>
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleQuantity(item.id, 1)}
                        style={{ width: '32px', height: '32px', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 700, color: '#4B5563', fontSize: '16px' }}
                      >
                        +
                      </button>
                    </div>

                    {/* Total Price */}
                    <div style={{ minWidth: '70px', textAlign: 'right', fontWeight: 800, fontSize: '16px', color: '#1F2937' }}>
                      ₹{item.price * item.quantity}
                    </div>

                    {/* Delete Icon */}
                    <button
                      type="button"
                      onClick={() => handleRemove(item.id)}
                      title="Remove item"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#9CA3AF', padding: '4px' }}
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Order Summary Card */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1F2937', marginBottom: '18px' }}>
                Order Summary
              </h2>

              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                <input
                  type="text"
                  placeholder="COUPON CODE (E.G. GROCERY100)"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  style={{
                    flex: 1,
                    height: '42px',
                    padding: '0 12px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '12.5px',
                    textTransform: 'uppercase',
                    outline: 'none',
                  }}
                />
                <button
                  type="submit"
                  style={{
                    height: '42px',
                    padding: '0 18px',
                    background: '#FFFFFF',
                    border: '1px solid #16A34A',
                    color: '#16A34A',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '13.5px',
                    cursor: 'pointer',
                    transition: 'all 150ms ease',
                  }}
                >
                  Apply
                </button>
              </form>

              {appliedCoupon && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F0FDF4', border: '1px solid #DCFCE7', borderRadius: '8px', padding: '8px 12px', marginBottom: '16px', fontSize: '13px', color: '#15803D' }}>
                  <span>🏷️ <strong>{appliedCoupon.code}</strong> applied</span>
                  <button type="button" onClick={() => setAppliedCoupon(null)} style={{ border: 'none', background: 'none', color: '#DC2626', cursor: 'pointer', fontWeight: 600 }}>
                    Remove
                  </button>
                </div>
              )}

              {/* Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: '#4B5563', paddingBottom: '16px', borderBottom: '1px solid #F3F4F6' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Subtotal</span>
                  <span style={{ fontWeight: 600, color: '#1F2937' }}>₹{subtotal}</span>
                </div>

                {discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16A34A' }}>
                    <span>Coupon Discount</span>
                    <span style={{ fontWeight: 600 }}>-₹{discount}</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Estimated Delivery</span>
                  <span style={{ fontWeight: 700, color: deliveryFee === 0 ? '#16A34A' : '#1F2937' }}>
                    {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                  </span>
                </div>
              </div>

              {/* Free Delivery unlocked alert banner */}
              <div
                style={{
                  background: '#F0FDF4',
                  border: '1px solid #DCFCE7',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  margin: '16px 0',
                  fontSize: '13px',
                  color: '#15803D',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>🎉</span>
                <span>Congratulations! You have unlocked <strong>FREE Delivery</strong></span>
              </div>

              {/* Total Amount */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '20px 0 24px' }}>
                <span style={{ fontSize: '18px', fontWeight: 800, color: '#1F2937' }}>Total Amount</span>
                <span style={{ fontSize: '24px', fontWeight: 900, color: '#16A34A' }}>₹{total}</span>
              </div>

              {/* Proceed Button */}
              <button
                type="button"
                onClick={() => navigate('/checkout')}
                className="btn btn--primary btn--full"
                style={{ height: '48px', fontSize: '15px', fontWeight: 700 }}
              >
                Proceed to Checkout →
              </button>
            </div>
          </div>
        ) : (
          <div className="empty-state" style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '64px' }}>
            <div className="empty-state__icon">🛒</div>
            <h2 className="empty-state__title">Your shopping cart is empty</h2>
            <p className="empty-state__desc">Browse our fresh grocery catalog and add items to your cart.</p>
            <Link to="/products" className="btn btn--primary">
              Start Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
