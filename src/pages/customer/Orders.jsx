import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';

const progressionStages = [
  { step: 1, label: 'Order Placed' },
  { step: 2, label: 'Confirmed' },
  { step: 3, label: 'Preparing' },
  { step: 4, label: 'Rider Assigned' },
  { step: 5, label: 'Out for Delivery' },
  { step: 6, label: 'Delivered' },
];

const getStepNumber = (status) => {
  switch (status?.toLowerCase()) {
    case 'order placed': return 1;
    case 'confirmed': return 2;
    case 'preparing': return 3;
    case 'rider assigned': return 4;
    case 'out for delivery': return 5;
    case 'delivered': return 6;
    default: return 1;
  }
};

const Orders = () => {
  const { orders, cancelOrder, createSupportTicket } = useStore();
  const { user } = useAuth();
  const { showToast } = useUI();
  const navigate = useNavigate();

  const [reportingOrder, setReportingOrder] = useState(null);
  const [issueCategory, setIssueCategory] = useState('Missing Items from Package');
  const [urgencyPriority, setUrgencyPriority] = useState('Medium Priority');
  const [issueDescription, setIssueDescription] = useState('');

  const handleCancel = (orderId) => {
    if (window.confirm(`Are you sure you want to cancel order ${orderId}?`)) {
      if (cancelOrder) cancelOrder(orderId);
      showToast(`Order ${orderId} cancelled`, 'info');
    }
  };

  const handleReportSubmit = (e) => {
    e.preventDefault();
    if (!issueDescription.trim()) {
      showToast('Please describe the problem', 'error');
      return;
    }

    if (createSupportTicket) {
      createSupportTicket({
        id: '#SUP' + String(Date.now()).slice(-5),
        orderRef: reportingOrder.id,
        category: issueCategory,
        priority: urgencyPriority.split(' ')[0],
        subject: `Issue with Order ${reportingOrder.id}`,
        description: issueDescription,
        customerName: reportingOrder.customerName || user?.name || 'Customer',
        customerEmail: user?.email || 'customer@grocerygo.com',
        status: 'Open',
        createdAt: new Date().toISOString(),
      });
    }

    showToast('Support ticket raised successfully!', 'success');
    setReportingOrder(null);
    setIssueDescription('');
  };

  return (
    <div style={{ background: '#F8FAF9', minHeight: '80vh', padding: '36px 0 64px' }}>
      <div className="container">
        {/* Header matching Screenshot (336).png */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#1F2937', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📦</span>
              <span>My Orders</span>
            </h1>
            <p style={{ fontSize: '14px', color: '#6B7280', marginTop: '4px' }}>
              Track your grocery deliveries in real time, review past purchases, or request customer support.
            </p>
          </div>

          <Link to="/products" className="btn btn--primary" style={{ height: '42px', padding: '0 18px', fontWeight: 700 }}>
            + Shop More Groceries
          </Link>
        </div>

        {/* Orders List */}
        {orders && orders.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {orders.map(order => {
              const currentStep = getStepNumber(order.status);
              const isCancelled = order.status === 'Cancelled';

              return (
                <div
                  key={order.id}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '16px',
                    padding: '24px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  }}
                >
                  {/* Order Head */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1F2937' }}>
                        Order {order.id}
                      </h2>
                      <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '3px' }}>
                        Placed on {new Date(order.orderDate).toLocaleString()} • Mode: {order.paymentMethod} ({order.paymentStatus || 'Pending'})
                      </div>
                    </div>

                    <span
                      style={{
                        padding: '4px 12px',
                        borderRadius: '9999px',
                        fontSize: '12px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        background: isCancelled ? '#FEE2E2' : currentStep === 6 ? '#DCFCE7' : '#E0F2FE',
                        color: isCancelled ? '#DC2626' : currentStep === 6 ? '#15803D' : '#0284C7',
                      }}
                    >
                      {order.status || 'ORDER PLACED'}
                    </span>
                  </div>

                  {/* Live Delivery Progression matching Screenshot (336).png */}
                  {!isCancelled && (
                    <div
                      style={{
                        background: '#FAFAFA',
                        border: '1px solid #F3F4F6',
                        borderRadius: '12px',
                        padding: '20px 24px',
                        marginBottom: '24px',
                      }}
                    >
                      <div style={{ fontSize: '11px', fontWeight: 800, color: '#6B7280', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '20px' }}>
                        LIVE DELIVERY PROGRESSION
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                        {/* Connecting track line */}
                        <div
                          style={{
                            position: 'absolute',
                            top: '16px',
                            left: '30px',
                            right: '30px',
                            height: '2px',
                            background: '#E5E7EB',
                            zIndex: 0,
                          }}
                        />

                        {progressionStages.map(stage => {
                          const isDone = currentStep >= stage.step;
                          const isCurrent = currentStep === stage.step;

                          return (
                            <div
                              key={stage.step}
                              style={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                position: 'relative',
                                zIndex: 1,
                              }}
                            >
                              <div
                                style={{
                                  width: '34px',
                                  height: '34px',
                                  borderRadius: '50%',
                                  background: isDone ? '#FFFFFF' : '#FFFFFF',
                                  border: isDone ? '2px solid #16A34A' : '2px solid #E5E7EB',
                                  color: isDone ? '#16A34A' : '#9CA3AF',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '13px',
                                  fontWeight: 700,
                                  boxShadow: isCurrent ? '0 0 0 3px rgba(22, 163, 74, 0.2)' : 'none',
                                }}
                              >
                                {isDone ? '✓' : stage.step}
                              </div>
                              <span
                                style={{
                                  fontSize: '12px',
                                  marginTop: '8px',
                                  fontWeight: isDone ? 700 : 500,
                                  color: isDone ? '#16A34A' : '#9CA3AF',
                                  textAlign: 'center',
                                }}
                              >
                                {stage.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Items List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                    {order.items && order.items.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>{item.icon || '🍏'}</span>
                          <span style={{ fontWeight: 600, color: '#1F2937' }}>
                            {item.name} × {item.quantity} ({item.unit || '1 kg'})
                          </span>
                        </div>
                        <span style={{ fontWeight: 700, color: '#1F2937' }}>
                          ₹{item.price * item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Report issue link */}
                  <div style={{ textAlign: 'right', marginBottom: '20px' }}>
                    <button
                      type="button"
                      onClick={() => setReportingOrder(order)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#B91C1C',
                        fontWeight: 600,
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <span>⚠️ Have an issue with this order? Report to Support</span>
                    </button>
                  </div>

                  {/* Bottom Footer Bar */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '16px',
                      borderTop: '1px solid #F3F4F6',
                      flexWrap: 'wrap',
                      gap: '12px',
                    }}
                  >
                    <div style={{ fontSize: '13px', color: '#6B7280' }}>
                      <strong>Delivering to:</strong> {order.customerName || 'Customer'}, {order.address || 'Address'}, {order.city || 'City'} - {order.pincode || 'Pincode'}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                        <button
                          type="button"
                          onClick={() => handleCancel(order.id)}
                          style={{
                            border: '1px solid #FECACA',
                            background: '#FFFFFF',
                            color: '#DC2626',
                            borderRadius: '8px',
                            padding: '6px 14px',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Cancel Order
                        </button>
                      )}

                      <div style={{ fontSize: '13px', color: '#6B7280' }}>
                        Total Paid: <span style={{ fontSize: '18px', fontWeight: 900, color: '#16A34A', marginLeft: '4px' }}>₹{order.total}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state" style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '64px' }}>
            <div className="empty-state__icon">📦</div>
            <h2 className="empty-state__title">No orders found</h2>
            <p className="empty-state__desc">You haven't placed any orders yet. Start shopping our fresh catalog!</p>
            <Link to="/products" className="btn btn--primary">
              Shop Now
            </Link>
          </div>
        )}

        {/* Report an Order Issue Modal matching Screenshot (337).png */}
        {reportingOrder && (
          <div className="modal-overlay" onClick={() => setReportingOrder(null)}>
            <div
              className="modal"
              style={{ maxWidth: '520px', padding: '32px' }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#B91C1C', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>⚠️</span>
                    <span>Report an Order Issue</span>
                  </h2>
                  <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '2px' }}>
                    Generate a high-priority customer support ticket.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setReportingOrder(null)}
                  style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer', color: '#9CA3AF' }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleReportSubmit}>
                <div className="input-group">
                  <label className="input-label">Associated Order Ref</label>
                  <input
                    type="text"
                    disabled
                    value={`Order ${reportingOrder.id}`}
                    className="input"
                    style={{ background: '#F9FAFB', fontWeight: 600, color: '#4B5563' }}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Issue Category *</label>
                  <select
                    className="input select"
                    value={issueCategory}
                    onChange={(e) => setIssueCategory(e.target.value)}
                  >
                    <option value="Missing Items from Package">Missing Items from Package</option>
                    <option value="Damaged / Spoiled Items">Damaged / Spoiled Items</option>
                    <option value="Late Delivery">Late Delivery</option>
                    <option value="Wrong Items Delivered">Wrong Items Delivered</option>
                    <option value="Payment / Billing Issue">Payment / Billing Issue</option>
                    <option value="Other Inquiries">Other Inquiries</option>
                  </select>
                </div>

                <div className="input-group">
                  <label className="input-label">Urgency Priority</label>
                  <select
                    className="input select"
                    value={urgencyPriority}
                    onChange={(e) => setUrgencyPriority(e.target.value)}
                  >
                    <option value="Low Priority">Low Priority</option>
                    <option value="Medium Priority">Medium Priority</option>
                    <option value="High Priority / Critical">High Priority / Critical</option>
                  </select>
                </div>

                <div className="input-group">
                  <label className="input-label">Describe the Problem *</label>
                  <textarea
                    rows={4}
                    className="input textarea"
                    placeholder="Please provide specific details so our support team can resolve this quickly..."
                    value={issueDescription}
                    onChange={(e) => setIssueDescription(e.target.value)}
                    style={{ minHeight: '90px' }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn--danger btn--full"
                  style={{ height: '44px', fontWeight: 700, fontSize: '14.5px', marginTop: '12px', background: '#DC2626' }}
                >
                  🚨 Submit Support Ticket
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
