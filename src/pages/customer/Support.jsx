import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';

const supportCategories = [
  { id: 'Order Issues', label: 'Order Issues', icon: '📦' },
  { id: 'Item Quality', label: 'Item Quality', icon: '🍎' },
  { id: 'Delivery & Partner', label: 'Delivery & Partner', icon: '🛵' },
  { id: 'Payment & UPI', label: 'Payment & UPI', icon: '💳' },
  { id: 'Other Inquiries', label: 'Other Inquiries', icon: '💬' },
];

const Support = () => {
  const { supportTickets, createSupportTicket, orders } = useStore();
  const { user } = useAuth();
  const { showToast } = useUI();

  const [selectedDept, setSelectedDept] = useState('Order Issues');
  const [formData, setFormData] = useState({
    fullName: user?.name || 'sohith',
    email: user?.email || 'sohithnagendra80@gmail.com',
    relatedOrder: '',
    urgencyPriority: 'Medium (Standard Query)',
    subject: '',
    description: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.description.trim()) {
      showToast('Please provide a subject and detailed description', 'error');
      return;
    }

    const newTicket = {
      id: '#SUP' + String(Date.now()).slice(-5),
      customerName: formData.fullName,
      customerEmail: formData.email,
      orderRef: formData.relatedOrder || (orders[0] ? orders[0].id : '#GG202611059708'),
      category: selectedDept,
      priority: formData.urgencyPriority.split(' ')[0],
      subject: formData.subject,
      description: formData.description,
      status: 'Open',
      createdAt: new Date().toISOString(),
      adminResponse: null,
    };

    if (createSupportTicket) {
      createSupportTicket(newTicket);
    }

    showToast('Support ticket raised successfully!', 'success');
    setFormData(prev => ({ ...prev, subject: '', description: '' }));
  };

  return (
    <div style={{ background: '#F8FAF9', minHeight: '80vh', padding: '36px 0 64px' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '28px', alignItems: 'flex-start' }}>
          {/* Left Column: Raise Ticket Form matching Screenshot (338).png */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1F2937', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
              <span>📝</span>
              <span>Raise a Support Ticket</span>
            </h2>

            <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '14px' }}>
              Select the department or issue category:
            </div>

            {/* Department Category Buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '24px' }}>
              {supportCategories.map(cat => {
                const isActive = selectedDept === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedDept(cat.id)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: isActive ? '1px solid #16A34A' : '1px solid #E5E7EB',
                      background: isActive ? '#F0FDF4' : '#FFFFFF',
                      color: isActive ? '#15803D' : '#374151',
                      fontWeight: isActive ? 700 : 500,
                      fontSize: '13.5px',
                      cursor: 'pointer',
                      transition: 'all 120ms ease',
                    }}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="input"
                    required
                  />
                </div>

                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Related Order (Optional)</label>
                  <select
                    name="relatedOrder"
                    value={formData.relatedOrder}
                    onChange={handleChange}
                    className="input select"
                  >
                    <option value="">-- No specific order --</option>
                    {orders && orders.map(o => (
                      <option key={o.id} value={o.id}>Order {o.id} (₹{o.total})</option>
                    ))}
                  </select>
                </div>

                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Urgency Priority *</label>
                  <select
                    name="urgencyPriority"
                    value={formData.urgencyPriority}
                    onChange={handleChange}
                    className="input select"
                  >
                    <option value="Low (General Inquiry)">Low (General Inquiry)</option>
                    <option value="Medium (Standard Query)">Medium (Standard Query)</option>
                    <option value="High (Urgent Escalation)">High (Urgent Escalation)</option>
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Issue Subject *</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Brief summary of your query or issue"
                  className="input"
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Detailed Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Please describe what happened, including any item names, timings, or payment references..."
                  className="input textarea"
                  style={{ minHeight: '110px' }}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn--primary btn--full"
                style={{ height: '46px', fontSize: '15px', fontWeight: 700, marginTop: '8px' }}
              >
                🚀 Submit Support Ticket
              </button>
            </form>
          </div>

          {/* Right Column: Tickets & Quick Assistance */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Card 1: My Support Tickets */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1F2937', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <span>📋</span>
                <span>My Support Tickets ( {supportTickets?.length || 0} )</span>
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {supportTickets && supportTickets.length > 0 ? (
                  supportTickets.slice(0, 3).map(ticket => (
                    <div
                      key={ticket.id}
                      style={{
                        background: '#F9FAFB',
                        border: '1px solid #E5E7EB',
                        borderRadius: '12px',
                        padding: '14px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 800, fontSize: '14px', color: '#16A34A' }}>{ticket.id}</span>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '9999px',
                            background: ticket.status === 'Resolved' ? '#DCFCE7' : '#FEF3C7',
                            color: ticket.status === 'Resolved' ? '#15803D' : '#B45309',
                            textTransform: 'uppercase',
                          }}
                        >
                          {ticket.status || 'OPEN'}
                        </span>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '14px', color: '#1F2937' }}>
                        {ticket.subject || 'General Inquiry'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6B7280', margin: '4px 0' }}>
                        Category: <strong>{ticket.category || 'General'}</strong> • Priority: <strong>{ticket.priority || 'Medium'}</strong>
                      </div>
                      <p style={{ fontSize: '12.5px', color: '#4B5563', margin: 0, fontStyle: 'italic' }}>
                        "{ticket.description}"
                      </p>
                      {ticket.adminResponse && (
                        <div style={{ marginTop: '8px', padding: '8px 10px', background: '#F0FDF4', borderRadius: '8px', fontSize: '12px', color: '#15803D' }}>
                          💬 <strong>Support:</strong> {ticket.adminResponse}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p style={{ fontSize: '13px', color: '#9CA3AF', margin: 0 }}>No active support tickets found.</p>
                )}
              </div>
            </div>

            {/* Card 2: Quick Assistance */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1F2937', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
                <span>📞</span>
                <span>Quick Assistance</span>
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#F9FAFB', padding: '12px 14px', borderRadius: '10px' }}>
                  <span style={{ fontSize: '24px' }}>📱</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: '#1F2937' }}>Customer Helpline</div>
                    <div style={{ fontSize: '12.5px', color: '#6B7280' }}>+91 98765 43210 (7 AM - 11 PM Daily)</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#F9FAFB', padding: '12px 14px', borderRadius: '10px' }}>
                  <span style={{ fontSize: '24px' }}>✉️</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: '#1F2937' }}>Priority Support Email</div>
                    <div style={{ fontSize: '12.5px', color: '#6B7280' }}>support@grocerygo.com</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#F9FAFB', padding: '12px 14px', borderRadius: '10px' }}>
                  <span style={{ fontSize: '24px' }}>📍</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: '#1F2937' }}>Dispatch Fulfillment Hub</div>
                    <div style={{ fontSize: '12.5px', color: '#6B7280' }}>Bandar Road, Vijayawada, AP - 520001</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
