import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';

const TrackOrder = () => {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const { getOrderById, getOrdersByUserId } = useStore();
  const { user, protectPage } = useAuth();
  const { showToast } = useUI();
  const [order, setOrder] = useState(null);
  const [trackingEvents, setTrackingEvents] = useState([]);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    protectPage('user');
    const orderData = orderId ? getOrderById(orderId) : null;

    if (!orderData) {
      const paramOrderId = searchParams.get('orderId');
      if (paramOrderId) {
        const paramOrder = getOrderById(paramOrderId);
        if (paramOrder) setOrder(paramOrder);
      } else if (user) {
        const orders = getOrdersByUserId(user.id);
        if (orders.length > 0) setOrder(orders[0]);
      }
    } else {
      setOrder(orderData);
    }
  }, [orderId, searchParams, getOrderById, getOrdersByUserId, user, protectPage]);

  useEffect(() => {
    if (order) {
      const events = generateTrackingEvents(order);
      setTrackingEvents(events);
      setActiveStep(events.findIndex(e => e.status === order.status));
      if (activeStep === -1) setActiveStep(events.length - 1);
    }
  }, [order]);

  const generateTrackingEvents = (order) => {
    const baseEvents = [
      { status: 'Confirmed', label: 'Order Confirmed', description: 'Your order has been confirmed', icon: '✅', time: order.orderDate },
      { status: 'Preparing', label: 'Preparing', description: 'Your items are being picked and packed', icon: '📦', time: order.preparedAt },
      { status: 'Rider Assigned', label: 'Rider Assigned', description: 'A delivery partner has been assigned', icon: '🛵', time: order.assignedAt },
      { status: 'Out for Delivery', label: 'Out for Delivery', description: 'Your order is on the way', icon: '🚚', time: order.dispatchedAt },
      { status: 'Delivered', label: 'Delivered', description: 'Your order has been delivered', icon: '🎉', time: order.deliveredAt },
    ];

    if (order.status === 'Cancelled') {
      return [
        { status: 'Confirmed', label: 'Order Confirmed', description: 'Your order was confirmed', icon: '✅', time: order.orderDate },
        { status: 'Cancelled', label: 'Cancelled', description: 'Order was cancelled', icon: '❌', time: order.cancelledAt || order.updatedAt },
      ];
    }

    return baseEvents.map((event, index) => ({
      ...event,
      completed: order.status === event.status ||
        (order.status !== 'Confirmed' && index < baseEvents.findIndex(e => e.status === order.status)),
      current: order.status === event.status,
    }));
  };

  const formatTime = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'success';
      case 'Cancelled': return 'danger';
      case 'Out for Delivery': return 'warning';
      case 'Rider Assigned': return 'primary';
      case 'Preparing': return 'info';
      case 'Confirmed': return 'primary';
      default: return 'primary';
    }
  };

  const isDelivered = order?.status === 'Delivered';
  const isCancelled = order?.status === 'Cancelled';
  const isActive = !isDelivered && !isCancelled;

  if (!order) {
    return (
      <CustomerLayout>
        <div className="track-order-page">
          <header className="page-header" role="heading" aria-level="1">
            <div className="page-header__left">
              <nav className="breadcrumb" aria-label="Breadcrumb">
                <ol className="breadcrumb__list">
                  <li className="breadcrumb__item"><a href="/" className="breadcrumb__link">Home</a></li>
                  <li className="breadcrumb__item"><span className="breadcrumb__current" aria-current="page">Track Order</span></li>
                </ol>
              </nav>
              <div>
                <h1 className="page-header__title">Track Order</h1>
                <p className="page-header__subtitle">Enter your order ID to track your delivery</p>
              </div>
            </div>
          </header>
          <div className="container">
            <div className="card track-order-search">
              <h3 className="track-order-search__title">Track Your Order</h3>
              <form className="track-order-search__form" onSubmit={(e) => { e.preventDefault(); }}>
                <div className="input-group">
                  <label htmlFor="track-order-id" className="input-label">Order ID</label>
                  <input
                    id="track-order-id"
                    type="text"
                    className="input"
                    placeholder="Enter your order ID (e.g., ORD-123456)"
                    autoComplete="off"
                  />
                </div>
                <button type="submit" className="btn btn--primary btn--full">Track Order</button>
              </form>
              <p className="track-order-search__note">
                Find your order ID in the confirmation email or SMS.
              </p>
            </div>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="track-order-page">
        <header className="page-header" role="heading" aria-level="1">
          <div className="page-header__left">
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <ol className="breadcrumb__list">
                <li className="breadcrumb__item"><a href="/" className="breadcrumb__link">Home</a></li>
                <li className="breadcrumb__item"><a href="/orders" className="breadcrumb__link">Orders</a></li>
                <li className="breadcrumb__item"><span className="breadcrumb__current" aria-current="page">Track Order</span></li>
              </ol>
            </nav>
            <div>
              <h1 className="page-header__title">Track Order</h1>
              <p className="page-header__subtitle">Order {order.id}</p>
            </div>
          </div>
        </header>

          <div className="container">
            <div className="track-order-layout">
              {/* Main Tracking */}
              <main className="track-order-main">
                {/* Order Status Card */}
                <section className="card order-status-card" aria-labelledby="status-title">
                  <div className="order-status-card__header">
                    <h2 id="status-title" className="order-status-card__title">Order Status</h2>
                    <span className={`badge badge--${getStatusColor(order.status)} badge--lg`}>
                      {order.status}
                    </span>
                  </div>

                  {/* Stepper */}
                  <div className="stepper order-stepper" role="navigation" aria-label="Order progress">
                    {trackingEvents.map((event, index) => (
                      <div key={event.status} className={`stepper__item ${event.completed ? 'stepper__item--completed' : ''} ${event.current ? 'stepper__item--active' : ''}`}>
                        <div className="stepper__circle" style={{
                          background: event.completed || event.current ? 'var(--color-primary)' : 'var(--color-bg-elevated)',
                          borderColor: event.completed || event.current ? 'var(--color-primary)' : 'var(--color-border)',
                          color: event.completed || event.current ? 'var(--color-text-inverse)' : 'var(--color-text-muted)',
                        }}>
                          {event.completed ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          ) : (
                            index + 1
                          )}
                        </div>
                        <div className="stepper__label">{event.label}</div>
                        {index < trackingEvents.length - 1 && (
                          <div className="stepper__line" style={{
                            background: event.completed ? 'var(--color-primary)' : 'var(--color-border)'
                          }}></div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Current Status Details */}
                  <div className="order-status-card__current">
                    <div className="order-status-card__icon" style={{ background: `var(--color-${getStatusColor(order.status)}-light, var(--primary-light))` }}>
                      <span style={{ fontSize: '2rem' }}>{trackingEvents.find(e => e.status === order.status)?.icon || '📦'}</span>
                    </div>
                    <div>
                      <h3 className="order-status-card__current-title">{order.status}</h3>
                      <p className="order-status-card__current-desc">
                        {trackingEvents.find(e => e.status === order.status)?.description || 'Your order is being processed'}
                      </p>
                      {order.status !== 'Delivered' && order.status !== 'Cancelled' && order.eta && (
                        <p className="order-status-card__eta">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                          </svg>
                          Estimated delivery: {new Date(order.eta).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="order-timeline" role="list" aria-label="Order timeline">
                    {trackingEvents.map((event, index) => (
                      <div key={event.status} className={`order-timeline__item ${event.completed ? 'completed' : ''} ${event.current ? 'current' : ''}`} role="listitem">
                        <div className="order-timeline__marker" style={{
                          background: event.completed || event.current ? 'var(--color-primary)' : 'var(--color-border)',
                          borderColor: event.completed || event.current ? 'var(--color-primary)' : 'var(--color-border)',
                        }}>
                          {event.completed && (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          )}
                        </div>
                        <div className="order-timeline__content">
                          <div className="order-timeline__header">
                            <h4 className="order-timeline__event">{event.label}</h4>
                            <time className="order-timeline__time" dateTime={event.time}>
                              {formatTime(event.time)}
                            </time>
                          </div>
                          <p className="order-timeline__desc">{event.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Order Details */}
                <section className="card order-details-card" aria-labelledby="details-title">
                  <h2 id="details-title" className="order-details-card__title">Order Details</h2>

                  <div className="order-details-grid">
                    <div className="order-details__section">
                      <h3 className="order-details__section-title">Items</h3>
                      <div className="order-items">
                        {order.items?.map((item, index) => (
                          <div key={index} className="order-item">
                            <div className="order-item__image">
                              <span style={{ fontSize: '2rem' }}>{item.icon || '📦'}</span>
                            </div>
                            <div className="order-item__info">
                              <h4 className="order-item__name">{item.name}</h4>
                              <p className="order-item__meta">{item.quantity} × {item.unit} @ ₹{item.price}</p>
                            </div>
                            <div className="order-item__total">₹{item.quantity * item.price}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="order-details__section">
                      <h3 className="order-details__section-title">Delivery Address</h3>
                      <address className="order-address">
                        <p><strong>{order.customerName}</strong></p>
                        <p>{order.deliveryAddress}</p>
                        {order.deliveryPhone && <p><a href={`tel:${order.deliveryPhone}`}>{order.deliveryPhone}</a></p>}
                      </address>
                    </div>

                    <div className="order-details__section">
                      <h3 className="order-details__section-title">Payment</h3>
                      <dl className="payment-details">
                        <div><dt>Method</dt><dd>{order.paymentMethod}</dd></div>
                        <div><dt>Status</dt><dd><span className={`badge badge--${order.paymentStatus === 'Paid' ? 'success' : 'warning'}`}>{order.paymentStatus}</span></dd></div>
                        {order.transactionId && <div><dt>Transaction ID</dt><dd>{order.transactionId}</dd></div>}
                      </dl>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="order-summary">
                    <div className="order-summary__row"><span>Subtotal</span><span>₹{order.subtotal}</span></div>
                    {order.discount > 0 && <div className="order-summary__row order-summary__row--discount"><span>Discount</span><span>-₹{order.discount}</span></div>}
                    {order.deliveryFee > 0 && <div className="order-summary__row"><span>Delivery Fee</span><span>₹{order.deliveryFee}</span></div>}
                    <div className="order-summary__row order-summary__row--total"><span>Total</span><span>₹{order.total}</span></div>
                  </div>
                </section>

                {/* Rider Info */}
                {order.riderName && isActive && (
                  <section className="card rider-card" aria-labelledby="rider-title">
                    <h2 id="rider-title" className="rider-card__title">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M12 6v6l4 2"></path>
                      </svg>
                      Your Delivery Partner
                    </h2>
                    <div className="rider-card__content">
                      <div className="rider-card__avatar">
                        <div className="avatar avatar--xl">{order.riderName?.charAt(0).toUpperCase()}</div>
                      </div>
                      <div className="rider-card__info">
                        <h3 className="rider-card__name">{order.riderName}</h3>
                        <p className="rider-card__vehicle">{order.riderVehicle}</p>
                        <div className="rider-card__actions">
                          <a href={`tel:${order.riderPhone}`} className="btn btn--primary btn--sm">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                            </svg>
                            Call
                          </a>
                          <button className="btn btn--ghost btn--sm">Chat</button>
                        </div>
                      </div>
                      {order.riderLocation && (
                        <div className="rider-card__location">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                          </svg>
                          <span>Current location: {order.riderLocation}</span>
                        </div>
                      )}
                    </div>
                  </section>
                )}

                {/* Delivered Confirmation */}
                {isDelivered && (
                  <section className="card delivered-card" aria-labelledby="delivered-title">
                    <div className="delivered-card__icon">🎉</div>
                    <h2 id="delivered-title" className="delivered-card__title">Order Delivered!</h2>
                    <p className="delivered-card__desc">Your order was delivered on {formatTime(order.deliveredAt)}</p>
                    <div className="delivered-card__actions">
                      <button className="btn btn--primary" onClick={() => showToast('Review submitted', 'success')}>
                        Rate Your Experience
                      </button>
                      <button className="btn btn--secondary">Reorder</button>
                    </div>
                  </section>
                )}

                {/* Cancelled Info */}
                {isCancelled && (
                  <section className="card cancelled-card" aria-labelledby="cancelled-title">
                    <div className="cancelled-card__icon">❌</div>
                    <h2 id="cancelled-title" className="cancelled-card__title">Order Cancelled</h2>
                    <p className="cancelled-card__desc">Your order was cancelled on {formatTime(order.cancelledAt || order.updatedAt)}</p>
                    {order.cancellationReason && (
                      <p className="cancelled-card__reason">Reason: {order.cancellationReason}</p>
                    )}
                    <div className="cancelled-card__actions">
                      <Link to="/products" className="btn btn--primary">Shop Again</Link>
                      <Link to="/support" className="btn btn--secondary">Contact Support</Link>
                    </div>
                  </section>
                )}
              </main>

              {/* Sidebar */}
              <aside className="track-order-sidebar">
                <section className="card order-summary-card" aria-labelledby="summary-title">
                  <h2 id="summary-title" className="order-summary-card__title">Order Summary</h2>

                  <div className="order-summary-card__meta">
                    <div className="order-summary-card__row">
                      <span className="order-summary-card__label">Order ID</span>
                      <span className="order-summary-card__value">{order.id}</span>
                    </div>
                    <div className="order-summary-card__row">
                      <span className="order-summary-card__label">Order Date</span>
                      <span className="order-summary-card__value">{formatTime(order.orderDate)}</span>
                    </div>
                    <div className="order-summary-card__row">
                      <span className="order-summary-card__label">Items</span>
                      <span className="order-summary-card__value">{order.items?.length || 0} items</span>
                    </div>
                    <div className="order-summary-card__row">
                      <span className="order-summary-card__label">Payment</span>
                      <span className="order-summary-card__value">{order.paymentMethod}</span>
                    </div>
                  </div>

                  <div className="order-summary-card__divider"></div>

                  <div className="order-summary-card__totals">
                    <div className="order-summary-card__row"><span>Subtotal</span><span>₹{order.subtotal}</span></div>
                    {order.discount > 0 && <div className="order-summary-card__row order-summary-card__row--discount"><span>Discount</span><span>-₹{order.discount}</span></div>}
                    {order.deliveryFee > 0 && <div className="order-summary-card__row"><span>Delivery Fee</span><span>₹{order.deliveryFee}</span></div>}
                    <div className="order-summary-card__row order-summary-card__row--total"><span>Total Paid</span><span>₹{order.total}</span></div>
                  </div>

                  <div className="order-summary-card__actions">
                    <Link to="/orders" className="btn btn--secondary btn--full">View All Orders</Link>
                    <button className="btn btn--primary btn--full" onClick={() => navigator.share?.({ title: `Order ${order.id}`, text: `Order total: ₹${order.total}` }).catch(() => showToast('Share not supported', 'info'))}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <circle cx="18" cy="5" r="3"></circle>
                        <circle cx="6" cy="12" r="3"></circle>
                        <circle cx="18" cy="19" r="3"></circle>
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                      </svg>
                      Share Order
                    </button>
                  </div>
                </section>

                {/* Help Card */}
                <section className="card help-card" aria-labelledby="help-title">
                  <h3 id="help-title" className="help-card__title">Need Help?</h3>
                  <p className="help-card__desc">Having issues with your delivery?</p>
                  <div className="help-card__actions">
                    <a href="tel:+919876543210" className="btn btn--primary btn--full">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                      </svg>
                      Call Support
                    </a>
                    <Link to="/support" className="btn btn--secondary btn--full">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                      </svg>
                      Raise Ticket
                    </Link>
                  </div>
                </section>
              </aside>
            </div>
          </div>
        </div>
      </CustomerLayout>
    );
  }

const CustomerLayout = ({ children }) => (
  <div className="customer-layout">
    <main className="customer-layout__content" role="main">
      <div className="container">{children}</div>
    </main>
  </div>
);

export default TrackOrder;