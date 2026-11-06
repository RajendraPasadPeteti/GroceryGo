import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';

const Profile = () => {
  const { getOrdersByUserId, getSupportTicketsByUserId } = useStore();
  const { user, protectPage, updateProfile } = useAuth();
  const { showToast } = useUI();
  const [activeTab, setActiveTab] = useState('profile');
  const [orders, setOrders] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    protectPage('user');
    loadData();
  }, [protectPage]);

  const loadData = () => {
    if (user) {
      setFormData({
        name: user.name,
        phone: user.phone,
        address: user.address,
      });
      setOrders(getOrdersByUserId(user.id));
      setTickets(getSupportTicketsByUserId(user.id));
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSave = async () => {
    setSaving(true);
    const result = await updateProfile(formData);
    setSaving(false);
    if (result.success) {
      showToast('Profile updated successfully!', 'success');
    } else {
      showToast(result.error, 'error');
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordSave = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      showToast('Password updated successfully!', 'success');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }, 1000);
  };

  const completedOrders = orders.filter(o => o.status === 'Delivered').length;
  const totalSpent = orders
    .filter(o => o.status === 'Delivered')
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <CustomerLayout>
      <div className="profile-page">
        <header className="page-header" role="heading" aria-level="1">
          <div className="page-header__left">
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <ol className="breadcrumb__list">
                <li className="breadcrumb__item"><span className="breadcrumb__current" aria-current="page">My Profile</span></li>
              </ol>
            </nav>
            <div>
              <h1 className="page-header__title">My Profile</h1>
              <p className="page-header__subtitle">Manage your account and view order history</p>
            </div>
          </div>
        </header>

        <div className="profile-tabs">
          <div className="profile-tabs__nav" role="tablist">
            <button
              role="tab"
              aria-selected={activeTab === 'profile'}
              className={`profile-tabs__tab ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              👤 Profile
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'orders'}
              className={`profile-tabs__tab ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              📦 Orders ({orders.length})
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'tickets'}
              className={`profile-tabs__tab ${activeTab === 'tickets' ? 'active' : ''}`}
              onClick={() => setActiveTab('tickets')}
            >
              🎧 Support ({tickets.length})
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'security'}
              className={`profile-tabs__tab ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              🔒 Security
            </button>
          </div>

          <div className="profile-tabs__content" role="tabpanel">
            {activeTab === 'profile' && (
              <div className="profile-section">
                <div className="profile-header card">
                  <div className="profile-avatar">
                    <div className="avatar avatar--lg">{user?.name?.charAt(0) || 'U'}</div>
                  </div>
                  <div className="profile-info">
                    <h2>{user?.name}</h2>
                    <p>{user?.email}</p>
                    <span className="badge badge--primary">{user?.role === 'admin' ? 'Administrator' : 'Customer'}</span>
                  </div>
                </div>

                <div className="card profile-form">
                  <h3 className="profile-form__title">Personal Information</h3>
                  <div className="grid-2">
                    <div className="input-group">
                      <label htmlFor="name" className="input-label">Full Name</label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        className="input"
                        value={formData.name}
                        onChange={handleProfileChange}
                      />
                    </div>
                    <div className="input-group">
                      <label htmlFor="phone" className="input-label">Phone Number</label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        className="input"
                        value={formData.phone}
                        onChange={handleProfileChange}
                      />
                    </div>
                  </div>
                  <div className="input-group">
                    <label htmlFor="address" className="input-label">Delivery Address</label>
                    <textarea
                      id="address"
                      name="address"
                      className="input textarea"
                      value={formData.address}
                      onChange={handleProfileChange}
                      rows={3}
                    />
                  </div>
                  <button className="btn btn--primary" onClick={handleProfileSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>

                <div className="stats-grid profile-stats">
                  <div className="stat-card card">
                    <div className="stat-card__icon">📦</div>
                    <div className="stat-card__value">{orders.length}</div>
                    <div className="stat-card__label">Total Orders</div>
                  </div>
                  <div className="stat-card card">
                    <div className="stat-card__icon">✅</div>
                    <div className="stat-card__value">{completedOrders}</div>
                    <div className="stat-card__label">Completed</div>
                  </div>
                  <div className="stat-card card">
                    <div className="stat-card__icon">💰</div>
                    <div className="stat-card__value">₹{totalSpent.toLocaleString()}</div>
                    <div className="stat-card__label">Total Spent</div>
                  </div>
                  <div className="stat-card card">
                    <div className="stat-card__icon">🎧</div>
                    <div className="stat-card__value">{tickets.length}</div>
                    <div className="stat-card__label">Support Tickets</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="profile-section">
                <h3 className="profile-form__title">Order History</h3>
                {orders.length === 0 ? (
                  <div className="empty-state card">
                    <div className="empty-state__icon">📦</div>
                    <h4 className="empty-state__title">No orders yet</h4>
                    <p className="empty-state__desc">Your order history will appear here</p>
                  </div>
                ) : (
                  <div className="orders-list">
                    {orders.map(order => (
                      <div key={order.id} className="card order-summary">
                        <div className="order-summary__header">
                          <span className="order-summary__id">{order.id}</span>
                          <span className={`badge badge--${getStatusBadge(order.status)}`}>{order.status}</span>
                        </div>
                        <div className="order-summary__details">
                          <span>{new Date(order.orderDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
                          <span>{order.items.length} items</span>
                          <strong>₹{order.total}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'tickets' && (
              <div className="profile-section">
                <h3 className="profile-form__title">Support Tickets</h3>
                {tickets.length === 0 ? (
                  <div className="empty-state card">
                    <div className="empty-state__icon">🎧</div>
                    <h4 className="empty-state__title">No support tickets</h4>
                    <p className="empty-state__desc">Your support tickets will appear here</p>
                  </div>
                ) : (
                  <div className="tickets-list">
                    {tickets.map(ticket => (
                      <div key={ticket.id} className="card ticket-summary">
                        <div className="ticket-summary__header">
                          <span className="ticket-summary__id">{ticket.id}</span>
                          <span className={`badge badge--${getTicketStatusBadge(ticket.status)}`}>{ticket.status}</span>
                        </div>
                        <div className="ticket-summary__details">
                          <h4>{ticket.subject}</h4>
                          <span>{ticket.category} • {new Date(ticket.createdAt).toLocaleDateString()}</span>
                        </div>
                        {ticket.adminResponse && (
                          <div className="ticket-summary__response">
                            <strong>Admin Response:</strong> {ticket.adminResponse}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'security' && (
              <div className="profile-section">
                <div className="card profile-form">
                  <h3 className="profile-form__title">Change Password</h3>
                  <div className="input-group">
                    <label htmlFor="currentPassword" className="input-label">Current Password</label>
                    <input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      className="input"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="newPassword" className="input-label">New Password</label>
                    <input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      className="input"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="confirmPassword" className="input-label">Confirm New Password</label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      className="input"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                    />
                  </div>
                  <button className="btn btn--primary" onClick={handlePasswordSave} disabled={saving}>
                    {saving ? 'Updating...' : 'Update Password'}
                  </button>
                </div>

                <div className="card profile-form" style={{ marginTop: '24px' }}>
                  <h3 className="profile-form__title">Account Security</h3>
                  <ul className="security-list">
                    <li>🔐 Password authentication enabled</li>
                    <li>📱 No 2FA configured (demo account)</li>
                    <li>📧 Email verified: {user?.email}</li>
                    <li>📞 Phone verified: {user?.phone}</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
};

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

export default Profile;