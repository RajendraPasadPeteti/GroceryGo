import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';

const Checkout = () => {
  const { cart, calculateTotals, createOrder, getCurrentUserId } = useStore();
  const { user, protectPage } = useAuth();
  const { showToast } = useUI();
  const navigate = useNavigate();

  const [step, setStep] = useState('address');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [upiVpa, setUpiVpa] = useState('');
  const [upiLoading, setUpiLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
  });
  const [errors, setErrors] = useState({});
  const [order, setOrder] = useState(null);
  const txnCounter = useRef(0);

  useEffect(() => {
    protectPage('user');
    if (cart.length === 0) {
      navigate('/cart');
      return;
    }
    if (user) {
      setFormData({
        fullName: user.name,
        phone: user.phone,
        address: user.address.split(',')[0] || '',
        city: 'Vijayawada',
        pincode: '520001',
      });
    }
  }, [protectPage, cart, user, navigate]);

  const totals = calculateTotals(cart);

  const validateAddress = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) newErrors.phone = 'Enter a valid 10-digit phone number';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.pincode) newErrors.pincode = 'Pincode is required';
    else if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = 'Enter a valid 6-digit pincode';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    if (validateAddress()) {
      setStep('payment');
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (paymentMethod === 'upi') {
      if (!upiVpa || !upiVpa.includes('@')) {
        showToast('Enter a valid UPI ID (e.g., demo@grocerygo)', 'error');
        return;
      }
      await simulateUpiPayment();
    } else {
      placeOrder();
    }
  };

  const simulateUpiPayment = async () => {
    setUpiLoading(true);
    showToast('Authorizing UPI payment...', 'info');
    await new Promise(resolve => setTimeout(resolve, 1500));
    setUpiLoading(false);
    const success = true;
    if (success) {
      showToast('Payment successful!', 'success');
      txnCounter.current += 1;
      placeOrder('UPI', 'Paid', `TXN${txnCounter.current}`);
    } else {
      showToast('Payment failed. Please try again.', 'error');
    }
  };

  const placeOrder = async (method = 'Cash on Delivery', _status = 'Pending', _txnId = null) => {
    const userId = getCurrentUserId();
    try {
      const newOrder = createOrder({
        userId,
        customerName: formData.fullName,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        pincode: formData.pincode,
        paymentMethod: method,
        couponCode: null,
        items: cart,
      });
      setOrder(newOrder);
      setStep('success');
      showToast('Order placed successfully!', 'success');
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const handleSimulateFailure = () => {
    setUpiLoading(false);
    showToast('Payment declined (simulated)', 'error');
  };

  // Render steps
  if (step === 'address') {
    return (
      <CustomerLayout>
        <div className="checkout-page">
          <CheckoutStepper currentStep={1} />

          <header className="page-header" role="heading" aria-level="1">
            <div className="page-header__left">
              <nav className="breadcrumb" aria-label="Breadcrumb">
                <ol className="breadcrumb__list">
                  <li className="breadcrumb__item"><a href="/cart" className="breadcrumb__link">Cart</a></li>
                  <li className="breadcrumb__item"><span className="breadcrumb__current" aria-current="page">Checkout</span></li>
                </ol>
              </nav>
              <div>
                <h1 className="page-header__title">Checkout</h1>
                <p className="page-header__subtitle">Enter delivery details</p>
              </div>
            </div>
          </header>

          <form onSubmit={handleAddressSubmit} className="checkout-form">
            <div className="card checkout-form__section">
              <h3 className="checkout-form__section-title">Delivery Address</h3>

              <div className="grid-2">
                <div className="input-group">
                  <label htmlFor="fullName" className="input-label">Full Name</label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    className={`input ${errors.fullName ? 'input--error' : ''}`}
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    aria-invalid={!!errors.fullName}
                  />
                  {errors.fullName && <span className="input-error" role="alert">{errors.fullName}</span>}
                </div>

                <div className="input-group">
                  <label htmlFor="phone" className="input-label">Phone Number</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    className={`input ${errors.phone ? 'input--error' : ''}`}
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    aria-invalid={!!errors.phone}
                  />
                  {errors.phone && <span className="input-error" role="alert">{errors.phone}</span>}
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="address" className="input-label">Full Address</label>
                <textarea
                  id="address"
                  name="address"
                  className={`input textarea ${errors.address ? 'input--error' : ''}`}
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="House/Flat No., Building, Street, Area"
                  aria-invalid={!!errors.address}
                />
                {errors.address && <span className="input-error" role="alert">{errors.address}</span>}
              </div>

              <div className="grid-2">
                <div className="input-group">
                  <label htmlFor="city" className="input-label">City</label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    className={`input ${errors.city ? 'input--error' : ''}`}
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="City"
                    aria-invalid={!!errors.city}
                  />
                  {errors.city && <span className="input-error" role="alert">{errors.city}</span>}
                </div>

                <div className="input-group">
                  <label htmlFor="pincode" className="input-label">Pincode</label>
                  <input
                    id="pincode"
                    name="pincode"
                    type="text"
                    className={`input ${errors.pincode ? 'input--error' : ''}`}
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="6-digit pincode"
                    aria-invalid={!!errors.pincode}
                  />
                  {errors.pincode && <span className="input-error" role="alert">{errors.pincode}</span>}
                </div>
              </div>
            </div>

            <div className="checkout-form__actions">
              <button type="button" className="btn btn--secondary" onClick={() => navigate('/cart')}>
                Back to Cart
              </button>
              <button type="submit" className="btn btn--primary btn--lg">Continue to Payment →</button>
            </div>
          </form>
        </div>
      </CustomerLayout>
    );
  }

  if (step === 'payment') {
    return (
      <CustomerLayout>
        <div className="checkout-page">
          <CheckoutStepper currentStep={2} />

          <header className="page-header" role="heading" aria-level="1">
            <div className="page-header__left">
              <nav className="breadcrumb" aria-label="Breadcrumb">
                <ol className="breadcrumb__list">
                  <li className="breadcrumb__item"><a href="/cart" className="breadcrumb__link">Cart</a></li>
                  <li className="breadcrumb__item"><span className="breadcrumb__current" aria-current="page">Checkout</span></li>
                </ol>
              </nav>
              <div>
                <h1 className="page-header__title">Payment</h1>
                <p className="page-header__subtitle">Choose your payment method</p>
              </div>
            </div>
          </header>

          <form onSubmit={handlePaymentSubmit} className="checkout-form">
            <div className="card checkout-form__section">
              <h3 className="checkout-form__section-title">Payment Method</h3>

              <div className="payment-options">
                <label className={`payment-option ${paymentMethod === 'cod' ? 'payment-option--selected' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                  />
                  <div className="payment-option__content">
                    <div className="payment-option__icon">💵</div>
                    <div className="payment-option__info">
                      <strong>Cash on Delivery</strong>
                      <span>Pay when your order arrives</span>
                    </div>
                  </div>
                  <svg className="payment-option__check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </label>

                <label className={`payment-option ${paymentMethod === 'upi' ? 'payment-option--selected' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="upi"
                    checked={paymentMethod === 'upi'}
                    onChange={() => setPaymentMethod('upi')}
                  />
                  <div className="payment-option__content">
                    <div className="payment-option__icon">📱</div>
                    <div className="payment-option__info">
                      <strong>UPI — Demo Payment</strong>
                      <span>Pay instantly with UPI (simulated)</span>
                    </div>
                  </div>
                  <svg className="payment-option__check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </label>
              </div>

              {paymentMethod === 'upi' && (
                <div className="upi-form" style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
                  <h4 className="checkout-form__section-title" style={{ fontSize: '1rem' }}>Enter UPI ID</h4>
                  <div className="input-group">
                    <label htmlFor="upiVpa" className="input-label">UPI ID (VPA)</label>
                    <input
                      id="upiVpa"
                      type="text"
                      className="input"
                      placeholder="demo@grocerygo or rahul@okhdfcbank"
                      value={upiVpa}
                      onChange={(e) => setUpiVpa(e.target.value)}
                    />
                  </div>

                  <div className="upi-qr" style={{ textAlign: 'center', margin: '24px 0' }}>
                    <div className="upi-qr__placeholder" style={{
                      width: '200px', height: '200px', margin: '0 auto',
                      border: '2px dashed var(--border)', borderRadius: 'var(--radius)',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      background: 'var(--bg)'
                    }}>
                      <span style={{ fontSize: '4rem' }}>📱</span>
                      <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Demo QR Code</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Scan with any UPI app</p>
                    </div>
                  </div>

                  <div className="upi-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <button
                      type="button"
                      className="btn btn--primary btn--lg"
                      onClick={simulateUpiPayment}
                      disabled={upiLoading}
                    >
                      {upiLoading ? (
                        <>
                          <span className="btn__spinner" aria-hidden="true">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="31.4 31.4" className="btn__spinner-circle" />
                            </svg>
                          </span>
                          Authorizing...
                        </>
                      ) : (
                        '✅ Authorize UPI (Simulate Success)'
                      )}
                    </button>
                    <button
                      type="button"
                      className="btn btn--danger btn--lg"
                      onClick={handleSimulateFailure}
                      disabled={upiLoading}
                    >
                      ❌ Simulate Failure
                    </button>
                  </div>

                  <p className="input-helper" style={{ textAlign: 'center', marginTop: '12px' }}>
                    This is a demo payment simulator. No real money is charged.
                  </p>
                </div>
              )}
            </div>

            <div className="checkout-form__actions">
              <button type="button" className="btn btn--secondary" onClick={() => setStep('address')}>
                ← Back
              </button>
              <button type="submit" className="btn btn--primary btn--lg" disabled={upiLoading}>
                {upiLoading ? 'Processing...' : paymentMethod === 'upi' ? 'Pay with UPI' : 'Place Order'}
              </button>
            </div>
          </form>
        </div>
      </CustomerLayout>
    );
  }

  // Success step
  return (
    <CustomerLayout>
      <div className="checkout-page">
        <CheckoutStepper currentStep={3} completed />

        <header className="page-header" role="heading" aria-level="1">
          <div className="page-header__left">
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <ol className="breadcrumb__list">
                <li className="breadcrumb__item"><a href="/cart" className="breadcrumb__link">Cart</a></li>
                <li className="breadcrumb__item"><span className="breadcrumb__current" aria-current="page">Checkout</span></li>
              </ol>
            </nav>
            <div>
              <h1 className="page-header__title">Order Confirmed!</h1>
              <p className="page-header__subtitle">Your order {order?.id} has been placed successfully</p>
            </div>
          </div>
        </header>

        <div className="success-card card">
          <div className="success-card__icon" aria-hidden="true">✅</div>
          <h2 className="success-card__title">Thank you for your order!</h2>
          <p className="success-card__message">Your groceries will be delivered soon</p>

          <div className="success-card__details">
            <div className="success-card__detail">
              <strong>Order ID:</strong> {order?.id}
            </div>
            <div className="success-card__detail">
              <strong>Payment:</strong> {order?.paymentMethod} {order?.paymentStatus === 'Paid' ? '(Paid)' : '(Pay on Delivery)'}
            </div>
            {order?.transactionId && (
              <div className="success-card__detail">
                <strong>Transaction:</strong> {order?.transactionId}
              </div>
            )}
            <div className="success-card__detail">
              <strong>Total:</strong> ₹{order?.total}
            </div>
            <div className="success-card__detail">
              <strong>Delivery to:</strong> {order?.address}, {order?.city} - {order?.pincode}
            </div>
          </div>

          <div className="success-card__actions">
            <button className="btn btn--primary btn--lg" onClick={() => navigate('/orders')}>
              Track Order Now
            </button>
            <Link to="/dashboard" className="btn btn--secondary btn--lg">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
  }

const CheckoutStepper = ({ currentStep, completed }) => (
  <div className="checkout-stepper" role="navigation" aria-label="Checkout progress">
    <div className="stepper">
      <div className={`stepper__item ${currentStep >= 1 ? (currentStep > 1 || completed ? 'stepper__item--completed' : 'stepper__item--active') : ''}`}>
        <div className="stepper__circle">{currentStep > 1 || completed ? '✓' : '1'}</div>
        <span className="stepper__label">Address</span>
      </div>
      <div className={`stepper__item ${currentStep >= 2 ? (currentStep > 2 || completed ? 'stepper__item--completed' : 'stepper__item--active') : ''}`}>
        <div className="stepper__circle">{currentStep > 2 || completed ? '✓' : '2'}</div>
        <span className="stepper__label">Payment</span>
      </div>
      <div className={`stepper__item ${completed ? 'stepper__item--completed' : ''}`}>
        <div className="stepper__circle">{completed ? '✓' : '3'}</div>
        <span className="stepper__label">Confirm</span>
      </div>
    </div>
  </div>
);

const CustomerLayout = ({ children }) => (
  <div className="customer-layout">
    <main className="customer-layout__content" role="main">
      <div className="container">{children}</div>
    </main>
  </div>
);

export default Checkout;