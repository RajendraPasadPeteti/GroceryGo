import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';

const orderStatuses = [
  'Order Placed',
  'Confirmed',
  'Preparing',
  'Rider Assigned',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
];

const getStatusIndex = (status) => orderStatuses.indexOf(status);

const getStatusBadge = (status) => {
  switch (status) {
    case 'Delivered': return 'success';
    case 'Cancelled': return 'danger';
    case 'Out for Delivery':
    case 'Rider Assigned': return 'primary';
    case 'Preparing':
    case 'Confirmed': return 'info';
    default: return 'info';
  }
};

const itemIssueOptions = [
  'Damaged packaging',
  'Not fresh / Spoiled',
  'Expired / Past date',
  'Wrong item delivered',
  'Missing quantity',
];

const packageConditionOptions = ['Pristine', 'Good', 'Torn / Crushed', 'Spilled / Leaked'];

const Orders = () => {
  const { getOrdersByUserId, cancelOrder, addReview } = useStore();
  const { user, protectPage } = useAuth();
  const { showToast, openModal } = useUI();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [reviewType, setReviewType] = useState(null);
  const [reviewData, setReviewData] = useState({
    productId: null,
    rating: 0,
    issues: [],
    comment: '',
    speedRating: 0,
    riderRating: 0,
    packageCondition: '',
    remarks: '',
  });

  useEffect(() => {
    protectPage('user');
    loadOrders();
  }, [protectPage]);

  useEffect(() => {
    loadOrders();
  }, [user]);

  const loadOrders = () => {
    if (user) {
      const userOrders = getOrdersByUserId(user.id);
      setOrders(userOrders);
    }
  };

  const handleCancel = (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      if (cancelOrder(orderId)) {
        showToast('Order cancelled successfully', 'success');
        loadOrders();
      }
    }
  };

  const openItemReview = (order) => {
    setSelectedOrder(order);
    setReviewType('item');
    setReviewData({
      productId: order.items[0]?.productId || null,
      rating: 0,
      issues: [],
      comment: '',
      speedRating: 0,
      riderRating: 0,
      packageCondition: '',
      remarks: '',
    });
    openModal('review');
  };

  const openDeliveryReview = (order) => {
    setSelectedOrder(order);
    setReviewType('delivery');
    setReviewData({
      productId: null,
      rating: 0,
      issues: [],
      comment: '',
      speedRating: 0,
      riderRating: 0,
      packageCondition: '',
      remarks: '',
    });
    openModal('review');
  };

  const openIssueReport = (order) => {
    window.location.href = `/support?orderId=${order.id}`;
  };

  const handleReviewSubmit = () => {
    if (!selectedOrder) return;

    if (reviewType === 'item') {
      if (!reviewData.rating) {
        showToast('Please select a rating', 'warning');
        return;
      }
      addReview({
        type: 'item',
        orderId: selectedOrder.id,
        productId: reviewData.productId,
        productName: selectedOrder.items.find(i => i.productId === reviewData.productId)?.name || '',
        userId: user.id,
        userName: user.name,
        rating: reviewData.rating,
        issues: reviewData.issues,
        comment: reviewData.comment,
      });
      showToast('Item review submitted!', 'success');
    } else {
      if (!reviewData.speedRating || !reviewData.riderRating) {
        showToast('Please rate both speed and rider', 'warning');
        return;
      }
      addReview({
        type: 'delivery',
        orderId: selectedOrder.id,
        riderName: selectedOrder.riderName,
        userId: user.id,
        userName: user.name,
        speedRating: reviewData.speedRating,
        riderRating: reviewData.riderRating,
        packageCondition: reviewData.packageCondition,
        remarks: reviewData.remarks,
      });
      showToast('Delivery review submitted!', 'success');
    }
    openModal('review', { open: false });
  };

  return (
    <CustomerLayout>
      <div className="orders-page">
        <header className="page-header" role="heading" aria-level="1">
          <div className="page-header__left">
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <ol className="breadcrumb__list">
                <li className="breadcrumb__item"><span className="breadcrumb__current" aria-current="page">My Orders</span></li>
              </ol>
            </nav>
            <div>
              <h1 className="page-header__title">My Orders</h1>
              <p className="page-header__subtitle">Track and manage your orders</p>
            </div>
          </div>
        </header>

        {orders.length === 0 ? (
          <div className="empty-state card" style={{ maxWidth: '600px', margin: '60px auto' }}>
            <div className="empty-state__icon">📦</div>
            <h3 className="empty-state__title">No orders yet</h3>
            <p className="empty-state__desc">Start shopping to see your orders here</p>
            <a href="/dashboard" className="btn btn--primary btn--lg mt-20">Start Shopping</a>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                onCancel={handleCancel}
                onItemReview={openItemReview}
                onDeliveryReview={openDeliveryReview}
                onReportIssue={openIssueReport}
              />
            ))}
          </div>
        )}

        {reviewType && selectedOrder && (
          <ReviewModal
            type={reviewType}
            order={selectedOrder}
            data={reviewData}
            onDataChange={setReviewData}
            onSubmit={handleReviewSubmit}
            onClose={() => { setReviewType(null); setSelectedOrder(null); }}
          />
        )}
      </div>
    </CustomerLayout>
  );
};

const OrderCard = ({ order, onCancel, onItemReview, onDeliveryReview, onReportIssue }) => {
  const statusIndex = getStatusIndex(order.status);
  const canCancel = statusIndex < 3 && order.status !== 'Cancelled';
  const isDelivered = order.status === 'Delivered';

  return (
    <article className="card order-card">
      <div className="order-card__header">
        <div className="order-card__meta">
          <span className="order-card__id">{order.id}</span>
          <span className="order-card__date">{new Date(order.orderDate).toLocaleDateString('en-IN', {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
          })}</span>
        </div>
        <div className="order-card__status">
          <span className={`badge badge--${getStatusBadge(order.status)}`}>{order.status}</span>
        </div>
      </div>

      {order.riderName && order.status !== 'Delivered' && order.status !== 'Cancelled' && (
        <div className="order-card__rider">
          <div className="order-card__rider-label">🛵 Rider Assigned</div>
          <div className="order-card__rider-info">
            <div className="avatar">{order.riderName?.charAt(0) || 'R'}</div>
            <div>
              <strong>{order.riderName}</strong>
              <span>{order.riderVehicle}</span>
            </div>
            <a href={`tel:${order.riderPhone}`} className="btn btn--ghost btn--sm btn--icon" aria-label="Call rider">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
            </a>
          </div>
        </div>
      )}

      <div className="order-card__stepper" role="navigation" aria-label="Order progress">
        <div className="stepper">
          {orderStatuses.map((status, index) => (
            <div
              key={status}
              className={`stepper__item ${index < statusIndex ? 'stepper__item--completed' : index === statusIndex ? 'stepper__item--active' : ''}`}
            >
              <div className="stepper__circle">
                {index < statusIndex ? '✓' : index + 1}
              </div>
              <span className="stepper__label">{status}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="order-card__items">
        {order.items.map(item => (
          <div key={item.id} className="order-item">
            <span className="order-item__emoji">{item.icon}</span>
            <div className="order-item__info">
              <span className="order-item__name">{item.name}</span>
              <span className="order-item__details">{item.quantity} × {item.unit} • ₹{item.price}</span>
            </div>
            <span className="order-item__total">₹{item.price * item.quantity}</span>
          </div>
        ))}
      </div>

      <div className="order-card__summary">
        <div className="order-card__total">
          <span>Total</span>
          <strong>₹{order.total}</strong>
        </div>
        <div className="order-card__payment">
          <span>{order.paymentMethod}</span>
          <span className={`badge badge--${order.paymentStatus === 'Paid' ? 'success' : 'warning'}`}>
            {order.paymentStatus}
          </span>
        </div>
      </div>

      <div className="order-card__actions">
        {canCancel && (
          <button className="btn btn--danger btn--sm" onClick={() => onCancel(order.id)}>
            Cancel Order
          </button>
        )}
        {isDelivered && (
          <>
            <button className="btn btn--secondary btn--sm" onClick={() => onItemReview(order)}>
              ⭐ Review Items
            </button>
            <button className="btn btn--secondary btn--sm" onClick={() => onDeliveryReview(order)}>
              🚚 Review Delivery
            </button>
            <button className="btn btn--ghost btn--sm" onClick={() => onReportIssue(order)}>
              ⚠️ Report Issue
            </button>
          </>
        )}
      </div>
    </article>
  );
};

const ReviewModal = ({ type, order, data, onDataChange, onSubmit, onClose }) => {
  const product = order.items.find(i => i.productId === data.productId) || order.items[0];

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="review-modal-title">
      <div className="modal modal--review" onClick={e => e.stopPropagation()}>
        <div className="modal__header">
          <h2 id="review-modal-title" className="modal__title">
            {type === 'item' ? '⭐ Review Item' : '🚚 Review Delivery'}
          </h2>
          <button className="modal__close" onClick={onClose} aria-label="Close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div className="modal__body">
          {type === 'item' ? (
            <div>
              <div className="review-item__product">
                <span className="review-item__emoji">{product.icon}</span>
                <div>
                  <strong>{product.name}</strong>
                  <span>{product.unit}</span>
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Your Rating</label>
                <div className="rating" role="radiogroup" aria-label="Select rating">
                  {[1,2,3,4,5].map(star => (
                    <button
                      key={star}
                      type="button"
                      className={`rating__star ${data.rating >= star ? 'rating__star--filled' : ''}`}
                      onClick={() => onDataChange({...data, rating: star})}
                      aria-label={`${star} star${star > 1 ? 's' : ''}`}
                    >★</button>
                  ))}
                </div>
              </div>

              {data.rating <= 3 && data.rating > 0 && (
                <div className="input-group">
                  <label className="input-label">Issues (select all that apply)</label>
                  <div className="review-issues">
                    {itemIssueOptions.map(issue => (
                      <label key={issue} className="review-issue__label">
                        <input
                          type="checkbox"
                          checked={data.issues.includes(issue)}
                          onChange={(e) => onDataChange({
                            ...data,
                            issues: e.target.checked
                              ? [...data.issues, issue]
                              : data.issues.filter(i => i !== issue)
                          })}
                        />
                        <span>{issue}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="input-group">
                <label htmlFor="itemComment" className="input-label">Comment (optional)</label>
                <textarea
                  id="itemComment"
                  className="input textarea"
                  value={data.comment}
                  onChange={(e) => onDataChange({...data, comment: e.target.value})}
                  placeholder="Share your experience..."
                  rows={3}
                />
              </div>
            </div>
          ) : (
            <div>
              <div className="review-delivery__rider">
                <div className="avatar avatar--lg">{order.riderName?.charAt(0) || 'R'}</div>
                <div>
                  <strong>{order.riderName}</strong>
                  <span>{order.riderVehicle}</span>
                </div>
              </div>

              <div className="grid-2">
                <div className="input-group">
                  <label className="input-label">Delivery Speed</label>
                  <div className="rating" role="radiogroup" aria-label="Rate delivery speed">
                    {[1,2,3,4,5].map(star => (
                      <button
                        key={`speed-${star}`}
                        type="button"
                        className={`rating__star ${data.speedRating >= star ? 'rating__star--filled' : ''}`}
                        onClick={() => onDataChange({...data, speedRating: star})}
                        aria-label={`${star} star${star > 1 ? 's' : ''}`}
                      >★</button>
                    ))}
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Rider Politeness</label>
                  <div className="rating" role="radiogroup" aria-label="Rate rider politeness">
                    {[1,2,3,4,5].map(star => (
                      <button
                        key={`rider-${star}`}
                        type="button"
                        className={`rating__star ${data.riderRating >= star ? 'rating__star--filled' : ''}`}
                        onClick={() => onDataChange({...data, riderRating: star})}
                        aria-label={`${star} star${star > 1 ? 's' : ''}`}
                      >★</button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="packageCondition" className="input-label">Package Condition</label>
                <select
                  id="packageCondition"
                  className="input select"
                  value={data.packageCondition}
                  onChange={(e) => onDataChange({...data, packageCondition: e.target.value})}
                >
                  <option value="">Select condition</option>
                  {packageConditionOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label htmlFor="remarks" className="input-label">Remarks (optional)</label>
                <textarea
                  id="remarks"
                  className="input textarea"
                  value={data.remarks}
                  onChange={(e) => onDataChange({...data, remarks: e.target.value})}
                  placeholder="Any additional comments..."
                  rows={3}
                />
              </div>
            </div>
          )}
        </div>
        <div className="modal__footer">
          <button className="btn btn--secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn--primary" onClick={onSubmit}>Submit Review</button>
        </div>
      </div>
    </div>
  );
};

const CustomerLayout = ({ children }) => (
  <div className="customer-layout">
    <main className="customer-layout__content" role="main">
      <div className="container">{children}</div>
    </main>
  </div>
);

export default Orders;