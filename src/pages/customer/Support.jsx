import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';

const ticketCategories = [
  'Order Issues',
  'Item Quality',
  'Delivery & Partner',
  'Payment & UPI',
  'Other',
];

const ticketPriorities = ['Low', 'Medium', 'High', 'Urgent'];

const Support = () => {
  const { getOrdersByUserId, createSupportTicket, getSupportTicketsByUserId } = useStore();
  const { user, protectPage } = useAuth();
  const { showToast } = useUI();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('raise');
  const [formData, setFormData] = useState({
    category: 'Order Issues',
    priority: 'Medium',
    orderId: '',
    subject: '',
    description: '',
  });
  const [tickets, setTickets] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    protectPage('user');
    loadData();
  }, [protectPage]);

  useEffect(() => {
    const orderId = searchParams.get('orderId');
    if (orderId) {
      setFormData(prev => ({ ...prev, orderId, category: 'Order Issues' }));
      setActiveTab('raise');
    }
  }, [searchParams]);

  const loadData = () => {
    if (user) {
      setOrders(getOrdersByUserId(user.id));
      setTickets(getSupportTicketsByUserId(user.id));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.description.trim()) {
      showToast('Please fill in all required fields', 'error');
      return;
    }
    setSubmitting(true);
    try {
      createSupportTicket({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        userPhone: user.phone,
        orderId: formData.orderId || null,
        category: formData.category,
        priority: formData.priority,
        subject: formData.subject,
        description: formData.description,
      });
      showToast('Support ticket created successfully!', 'success');
      setFormData({
        category: 'Order Issues',
        priority: 'Medium',
        orderId: '',
        subject: '',
        description: '',
      });
      setActiveTab('my-tickets');
      loadData();
    } catch {
      showToast('Failed to create ticket', 'error');
    }
    setSubmitting(false);
  };

  return (
    <CustomerLayout>
      <div className="support-page">
        <header className="page-header" role="heading" aria-level="1">
          <div className="page-header__left">
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <ol className="breadcrumb__list">
                <li className="breadcrumb__item"><span className="breadcrumb__current" aria-current="page">Help & Support</span></li>
              </ol>
            </nav>
            <div>
              <h1 className="page-header__title">Help & Support</h1>
              <p className="page-header__subtitle">Get help with your orders, deliveries, and account</p>
            </div>
          </div>
        </header>

        <div className="support-tabs">
          <div className="support-tabs__nav" role="tablist">
            <button
              role="tab"
              aria-selected={activeTab === 'raise'}
              className={`support-tabs__tab ${activeTab === 'raise' ? 'active' : ''}`}
              onClick={() => setActiveTab('raise')}
            >
              📝 Raise Ticket
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'my-tickets'}
              className={`support-tabs__tab ${activeTab === 'my-tickets' ? 'active' : ''}`}
              onClick={() => setActiveTab('my-tickets')}
            >
              📋 My Tickets ({tickets.length})
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'help'}
              className={`support-tabs__tab ${activeTab === 'help' ? 'active' : ''}`}
              onClick={() => setActiveTab('help')}
            >
              ❓ Quick Help
            </button>
          </div>

          <div className="support-tabs__content" role="tabpanel">
            {activeTab === 'raise' && (
              <div className="card support-form">
                <h3 className="support-form__title">Raise a Support Ticket</h3>
                <form onSubmit={handleSubmit} noValidate>
                  <div className="input-group">
                    <label className="input-label">Issue Category</label>
                    <div className="category-pills" role="radiogroup" aria-label="Select issue category">
                      {ticketCategories.map(cat => (
                        <label key={cat} className={`category-pill ${formData.category === cat ? 'active' : ''}`}>
                          <input
                            type="radio"
                            name="category"
                            value={cat}
                            checked={formData.category === cat}
                            onChange={handleChange}
                          />
                          {cat}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid-2">
                    <div className="input-group">
                      <label htmlFor="priority" className="input-label">Priority</label>
                      <select
                        id="priority"
                        name="priority"
                        className="input select"
                        value={formData.priority}
                        onChange={handleChange}
                      >
                        {ticketPriorities.map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>

                    <div className="input-group">
                      <label htmlFor="orderId" className="input-label">Related Order (Optional)</label>
                      <select
                        id="orderId"
                        name="orderId"
                        className="input select"
                        value={formData.orderId}
                        onChange={handleChange}
                      >
                        <option value="">Select an order</option>
                        {orders.map(order => (
                          <option key={order.id} value={order.id}>
                            {order.id} - ₹{order.total} ({order.status})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="input-group">
                    <label htmlFor="subject" className="input-label">Subject *</label>
                    <input
                      id="subject"
                      name="subject"
                      type="text"
                      className="input"
                      placeholder="Brief summary of the issue"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label htmlFor="description" className="input-label">Description *</label>
                    <textarea
                      id="description"
                      name="description"
                      className="input textarea"
                      placeholder="Describe your issue in detail..."
                      value={formData.description}
                      onChange={handleChange}
                      rows={5}
                      required
                    />
                  </div>

                  <div className="alert alert--info" style={{ marginTop: '16px' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="16" x2="12" y2="12"></line>
                      <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                    <div>
                      <strong>Auto-filled:</strong> Your name, email, and phone will be automatically included.
                    </div>
                  </div>

                  <button type="submit" className="btn btn--primary btn--full" disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit Ticket'}
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'my-tickets' && (
              <div className="support-tickets">
                {tickets.length === 0 ? (
                  <div className="empty-state card">
                    <div className="empty-state__icon">📋</div>
                    <h3 className="empty-state__title">No tickets yet</h3>
                    <p className="empty-state__desc">Your support tickets will appear here</p>
                  </div>
                ) : (
                  <div className="tickets-list">
                    {tickets.map(ticket => (
                      <article key={ticket.id} className="card ticket-card">
                        <div className="ticket-card__header">
                          <div className="ticket-card__meta">
                            <span className="ticket-card__id">{ticket.id}</span>
                            <span className={`badge badge--${getTicketStatusBadge(ticket.status)}`}>{ticket.status}</span>
                          </div>
                          <span className="ticket-card__date">{new Date(ticket.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                        </div>
                        <div className="ticket-card__details">
                          <h4>{ticket.subject}</h4>
                          <div className="ticket-card__badges">
                            <span className="badge badge--info">{ticket.category}</span>
                            <span className="badge badge--warning">{ticket.priority}</span>
                          </div>
                          <p className="ticket-card__description">{ticket.description}</p>
                          {ticket.orderId && (
                            <p className="ticket-card__order">Related Order: <strong>{ticket.orderId}</strong></p>
                          )}
                        </div>
                        {ticket.adminResponse && (
                          <div className="ticket-card__response">
                            <div className="ticket-card__response-label">Admin Response</div>
                            <p>{ticket.adminResponse}</p>
                            <small>Responded on {new Date(ticket.resolvedAt).toLocaleDateString()}</small>
                          </div>
                        )}
                      </article>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'help' && (
              <div className="help-section">
                <div className="help-cards">
                  <div className="help-card card">
                    <div className="help-card__icon">📞</div>
                    <h3>Call Us</h3>
                    <p>Available 8 AM - 10 PM daily</p>
                    <a href="tel:+919876543210" className="btn btn--primary btn--full">+91 98765 43210</a>
                  </div>
                  <div className="help-card card">
                    <div className="help-card__icon">📧</div>
                    <h3>Email Us</h3>
                    <p>Response within 24 hours</p>
                    <a href="mailto:support@grocerygo.com" className="btn btn--secondary btn--full">support@grocerygo.com</a>
                  </div>
                  <div className="help-card card">
                    <div className="help-card__icon">🏪</div>
                    <h3>Visit Hub</h3>
                    <p>GroceryGo Fulfillment Center</p>
                    <address style={{ fontStyle: 'normal', color: 'var(--text-muted)' }}>
                      MG Road, Vijayawada<br/>Andhra Pradesh - 520001
                    </address>
                  </div>
                </div>

                <div className="help-faq card" style={{ marginTop: '24px' }}>
                  <h3 className="help-faq__title">Frequently Asked Questions</h3>
                  <div className="faq-list">
                    {[
                      { q: 'How long does delivery take?', a: 'We deliver in 15-30 minutes within our service area.' },
                      { q: 'What payment methods are accepted?', a: 'Cash on Delivery (COD) and UPI payments.' },
                      { q: 'Can I cancel my order?', a: 'Yes, you can cancel before the order is dispatched.' },
                      { q: 'What if items are damaged?', a: 'Report via support ticket within 2 hours of delivery for replacement.' },
                      { q: 'Is there a minimum order?', a: 'No minimum order. Free delivery on orders above ₹300.' },
                    ].map((faq, i) => (
                      <details key={i} className="faq-item">
                        <summary>{faq.q}</summary>
                        <p>{faq.a}</p>
                      </details>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
};

const getTicketStatusBadge = (status) => {
  switch (status) {
    case 'Resolved': return 'success';
    case 'In Progress': return 'primary';
    default: return 'warning';
  }
};

const CustomerLayout = ({ children }) => (
  <div className="customer-layout">
    <main className="customer-layout__content" role="main">
      <div className="container">{children}</div>
    </main>
  </div>
);

export default Support;