import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';

const Checkout = () => {
  const { cart, createOrder, clearCart } = useStore();
  const { user } = useAuth();
  const { showToast } = useUI();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [upiAuthorized, setUpiAuthorized] = useState(false);
  const [upiVpa, setUpiVpa] = useState('demo@grocerygo');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  const [formData, setFormData] = useState({
    fullName: user?.name || 'sohith',
    phone: user?.phone || '9848483113',
    address: user?.address || '41-1/20-17 Balaji nagar',
    city: 'Vijayawada',
    pincode: '520013',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (cart.length === 0 && !placedOrder) {
      navigate('/cart');
    }
  }, [cart, placedOrder, navigate]);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = 0; // FREE Delivery unlocked
  const total = subtotal + deliveryFee;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone Number is required';
    if (!formData.address.trim()) newErrors.address = 'Delivery address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = () => {
    if (!validate()) {
      showToast('Please fill all required delivery details', 'error');
      return;
    }

    if (paymentMethod === 'upi' && !upiAuthorized) {
      showToast('Please authorize the UPI payment simulation first', 'warning');
      return;
    }

    setIsSubmitting(true);

    const orderId = '#GG' + new Date().getFullYear() + String(Date.now()).slice(-8);
    const orderData = {
      id: orderId,
      customerName: formData.fullName,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      pincode: formData.pincode,
      items: cart.map(i => ({
        id: i.id,
        name: i.name,
        icon: i.icon || '🍏',
        price: i.price,
        quantity: i.quantity,
        unit: i.unit || '1 kg',
      })),
      total: total,
      paymentMethod: paymentMethod === 'cod' ? 'Cash on Delivery' : 'UPI',
      paymentStatus: paymentMethod === 'cod' ? 'Pending' : 'Paid',
      status: 'Order Placed',
      orderDate: new Date().toISOString(),
      riderName: null,
      riderPhone: null,
    };

    if (createOrder) {
      createOrder(orderData);
    }

    clearCart();
    window.dispatchEvent(new CustomEvent('cart-updated'));
    setIsSubmitting(false);
    setPlacedOrder(orderData);
    showToast('Order placed successfully!', 'success');
  };

  // If order was successfully placed, render Order Success View matching Screenshot (335).png
  if (placedOrder) {
    return (
      <div style={{ background: '#F8FAF9', minHeight: '80vh', padding: '48px 0 64px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '24px',
            maxWidth: '620px',
            width: '100%',
            padding: '40px',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎉</div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#16A34A', marginBottom: '8px' }}>
            Order Placed Successfully!
          </h1>
          <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '28px' }}>
            Thank you for shopping with GroceryGo! Your order has been placed and is being prepared.
          </p>

          <div
            style={{
              background: '#F9FAFB',
              border: '1px solid #E5E7EB',
              borderRadius: '16px',
              padding: '20px 24px',
              textAlign: 'left',
              fontSize: '13.5px',
              color: '#374151',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              marginBottom: '32px',
            }}
          >
            <div>
              <strong>Order ID:</strong> <span style={{ color: '#16A34A', fontWeight: 700 }}>{placedOrder.id}</span>
            </div>
            <div>
              <strong>Recipient:</strong> {placedOrder.customerName} ({placedOrder.phone})
            </div>
            <div>
              <strong>Delivery Address:</strong> {placedOrder.address}, {placedOrder.city} - {placedOrder.pincode}
            </div>
            <div>
              <strong>Payment Mode:</strong> {placedOrder.paymentMethod} ({placedOrder.paymentStatus})
            </div>
            <div>
              <strong>Items Ordered:</strong> {placedOrder.items.length} product(s)
            </div>
            <div>
              <strong>Total Paid:</strong> <span style={{ color: '#16A34A', fontWeight: 800 }}>₹{placedOrder.total}</span>
            </div>
            <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>
              Order Placed on {new Date(placedOrder.orderDate).toLocaleString()}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => navigate('/orders')}
              className="btn btn--primary"
              style={{ height: '44px', padding: '0 22px' }}
            >
              📦 Track Order Now
            </button>
            <button
              type="button"
              onClick={() => navigate('/products')}
              className="btn btn--secondary"
              style={{ height: '44px', padding: '0 22px', color: '#16A34A', borderColor: '#16A34A' }}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#F8FAF9', minHeight: '80vh', padding: '36px 0 64px' }}>
      <div className="container">
        {/* Title */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#1F2937', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📍</span>
            <span>Finalize Your Order</span>
          </h1>
          <p style={{ fontSize: '14px', color: '#6B7280', marginTop: '4px' }}>
            Enter your delivery address and choose your payment method.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '28px', alignItems: 'flex-start' }}>
          {/* Left Column: Cards 1 & 2 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Card 1: Delivery Address & Details */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1F2937', marginBottom: '20px' }}>
                Delivery Address & Details
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={`input ${errors.fullName ? 'input--error' : ''}`}
                    placeholder="e.g. Sohith"
                  />
                  {errors.fullName && <span className="input-error">{errors.fullName}</span>}
                </div>

                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Phone Number *</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`input ${errors.phone ? 'input--error' : ''}`}
                    placeholder="e.g. 9848483113"
                  />
                  {errors.phone && <span className="input-error">{errors.phone}</span>}
                </div>
              </div>

              <div className="input-group" style={{ marginBottom: '16px' }}>
                <label className="input-label">Delivery Address (House/Flat, Street, Landmark) *</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className={`input textarea ${errors.address ? 'input--error' : ''}`}
                  style={{ minHeight: '70px' }}
                  placeholder="e.g. 41-1/20-17 Balaji nagar"
                />
                {errors.address && <span className="input-error">{errors.address}</span>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={`input ${errors.city ? 'input--error' : ''}`}
                    placeholder="e.g. Vijayawada"
                  />
                  {errors.city && <span className="input-error">{errors.city}</span>}
                </div>

                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Pincode *</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    className={`input ${errors.pincode ? 'input--error' : ''}`}
                    placeholder="e.g. 520013"
                  />
                  {errors.pincode && <span className="input-error">{errors.pincode}</span>}
                </div>
              </div>
            </div>

            {/* Card 2: Payment Method */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1F2937', marginBottom: '16px' }}>
                Payment Method (Simulated Academic Demo)
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Cash on Delivery option */}
                <div
                  onClick={() => setPaymentMethod('cod')}
                  style={{
                    border: paymentMethod === 'cod' ? '2px solid #16A34A' : '1px solid #E5E7EB',
                    borderRadius: '12px',
                    padding: '16px',
                    cursor: 'pointer',
                    background: paymentMethod === 'cod' ? '#F0FDF4' : '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'all 120ms ease',
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    style={{ accentColor: '#16A34A', width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '15px', color: '#1F2937', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>💵</span>
                      <span>Cash on Delivery (COD)</span>
                    </div>
                    <div style={{ fontSize: '12.5px', color: '#6B7280', marginTop: '2px' }}>
                      Pay with cash or UPI to the delivery rider at your doorstep
                    </div>
                  </div>
                </div>

                {/* UPI Simulator option */}
                <div
                  onClick={() => setPaymentMethod('upi')}
                  style={{
                    border: paymentMethod === 'upi' ? '2px solid #16A34A' : '1px solid #E5E7EB',
                    borderRadius: '12px',
                    padding: '16px',
                    cursor: 'pointer',
                    background: paymentMethod === 'upi' ? '#F0FDF4' : '#FFFFFF',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    transition: 'all 120ms ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'upi'}
                      onChange={() => setPaymentMethod('upi')}
                      style={{ accentColor: '#16A34A', width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '15px', color: '#1F2937', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>📱</span>
                        <span>UPI — Demo Payment Simulator</span>
                      </div>
                      <div style={{ fontSize: '12.5px', color: '#6B7280', marginTop: '2px' }}>
                        Simulate instant UPI authorization (GPay, PhonePe, Paytm, BHIM)
                      </div>
                    </div>
                  </div>

                  {paymentMethod === 'upi' && (
                    <div
                      style={{
                        background: '#FFFFFF',
                        border: '1px dashed #16A34A',
                        borderRadius: '10px',
                        padding: '16px',
                        marginTop: '8px',
                      }}
                      onClick={e => e.stopPropagation()}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#15803D' }}>
                          📱 Fast UPI Checkout Simulation
                        </span>
                        <span className="badge badge--success" style={{ fontSize: '10px' }}>
                          Zero Real Money
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: '12px', color: '#6B7280', display: 'block', marginBottom: '4px' }}>
                            Virtual Payment Address (UPI ID)
                          </label>
                          <input
                            type="text"
                            value={upiVpa}
                            onChange={(e) => setUpiVpa(e.target.value)}
                            className="input"
                            style={{ height: '38px', fontSize: '13px' }}
                          />
                          <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '4px' }}>
                            Supported: @oksbi, @okhdfcbank, @icici, @paytm, @ybl
                          </div>
                        </div>

                        {/* QR Box */}
                        <div
                          style={{
                            width: '90px',
                            height: '90px',
                            background: '#F9FAFB',
                            border: '1px solid #E5E7EB',
                            borderRadius: '8px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11px',
                            color: '#6B7280',
                            textAlign: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <span style={{ fontSize: '24px' }}>🏁</span>
                          <span style={{ fontWeight: 700, color: '#16A34A', marginTop: '2px' }}>₹{total}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setUpiAuthorized(true);
                            showToast('UPI payment authorized (Demo)', 'success');
                          }}
                          className="btn btn--primary"
                          style={{ flex: 1, height: '36px', fontSize: '13px' }}
                        >
                          {upiAuthorized ? '✓ Authorized' : '✔ Authorize UPI (Simulate Success)'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setUpiAuthorized(false);
                            showToast('UPI simulation rejected', 'error');
                          }}
                          className="btn btn--danger"
                          style={{ height: '36px', fontSize: '13px' }}
                        >
                          ✕ Simulate Failure
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Place Order CTA Button */}
            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
              className="btn btn--primary btn--full"
              style={{ height: '50px', fontSize: '16px', fontWeight: 800 }}
            >
              {paymentMethod === 'cod'
                ? '🛍️ Place Order (Cash on Delivery)'
                : '⚡ Pay via UPI & Place Order'}
            </button>
          </div>

          {/* Right Column: Order Summary Card */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1F2937', marginBottom: '18px' }}>
              Order Summary
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid #F3F4F6', marginBottom: '16px' }}>
              {cart.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13.5px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{item.icon || '🍏'}</span>
                    <span style={{ color: '#1F2937', fontWeight: 600 }}>{item.name} × {item.quantity}</span>
                  </div>
                  <span style={{ fontWeight: 700, color: '#1F2937' }}>₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: '#4B5563', paddingBottom: '16px', borderBottom: '1px solid #F3F4F6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal</span>
                <span style={{ fontWeight: 600, color: '#1F2937' }}>₹{subtotal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Delivery Fee</span>
                <span style={{ fontWeight: 700, color: '#16A34A' }}>FREE</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px' }}>
              <span style={{ fontSize: '18px', fontWeight: 800, color: '#1F2937' }}>Total Amount</span>
              <span style={{ fontSize: '24px', fontWeight: 900, color: '#16A34A' }}>₹{total}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
