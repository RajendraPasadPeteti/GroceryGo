import React, { useEffect, useMemo, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const { getAnalytics, products, orders } = useStore();
  const { protectPage } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    protectPage('admin');
    loadAnalytics();
  }, [protectPage]);

  const loadAnalytics = () => {
    const data = getAnalytics();
    setAnalytics(data);
    setRecentOrders(orders.slice(0, 5));
  };

  const stats = useMemo(() => {
    if (!analytics) return [];
    return [
      { label: 'Total Revenue', value: `₹${analytics.totalRevenue.toLocaleString()}`, icon: '💰', color: 'primary' },
      { label: 'Total Orders', value: analytics.totalOrders, icon: '📦', color: 'primary' },
      { label: 'Pending Orders', value: analytics.pendingOrders, icon: '⏳', color: 'warning' },
      { label: 'Delivered Orders', value: analytics.deliveredOrders, icon: '✅', color: 'success' },
      { label: 'Cancelled Orders', value: analytics.cancelledOrders, icon: '❌', color: 'danger' },
      { label: 'Active SKUs', value: products.filter(p => p.active).length, icon: '🍎', color: 'info' },
      { label: 'Low Stock Items', value: analytics.lowStockCount, icon: '⚠️', color: analytics.lowStockCount > 0 ? 'danger' : 'success' },
      { label: 'Total Riders', value: analytics.totalRiders, icon: '🛵', color: 'primary' },
      { label: 'Available Riders', value: analytics.availableRiders, icon: '✅', color: 'success' },
      { label: 'In Transit', value: analytics.inTransit, icon: '🚚', color: 'warning' },
      { label: 'Registered Users', value: analytics.registeredUsers, icon: '👥', color: 'info' },
    ];
  }, [analytics, products]);

  if (!analytics) return <div className="page-loading" role="status" aria-label="Loading dashboard">Loading...</div>;

  return (
    <AdminLayout>
      <div className="admin-dashboard">
        <header className="page-header" role="heading" aria-level="1">
          <div className="page-header__left">
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <ol className="breadcrumb__list">
                <li className="breadcrumb__item"><span className="breadcrumb__current" aria-current="page">Dashboard</span></li>
              </ol>
            </nav>
            <div>
              <h1 className="page-header__title">Dashboard</h1>
              <p className="page-header__subtitle">Operations overview & customer experience analytics</p>
            </div>
          </div>
        </header>

        <div className="stats-grid" role="list">
          {stats.map((stat, i) => (
            <div key={i} className="stat-card card" role="listitem">
              <div className="stat-card__icon" style={{ background: `var(--${stat.color}-light, var(--primary-light))` }}>
                <span style={{ fontSize: '1.5rem' }}>{stat.icon}</span>
              </div>
              <div className="stat-card__value">{stat.value}</div>
              <div className="stat-card__label">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="dashboard-grid">
          <section className="card dashboard-section" aria-labelledby="cx-title">
            <h3 id="cx-title" className="dashboard-section__title">Customer Experience Analytics</h3>
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
              <div className="stat-card">
                <div className="stat-card__icon" style={{ background: 'var(--success-bg)' }}>
                  <span style={{ fontSize: '1.5rem' }}>⭐</span>
                </div>
                <div className="stat-card__value">{analytics.avgItemRating} / 5</div>
                <div className="stat-card__label">Avg Product Quality</div>
              </div>
              <div className="stat-card">
                <div className="stat-card__icon" style={{ background: 'var(--primary-light)' }}>
                  <span style={{ fontSize: '1.5rem' }}>🚚</span>
                </div>
                <div className="stat-card__value">{analytics.avgDeliveryRating} / 5</div>
                <div className="stat-card__label">Avg Delivery Rating</div>
              </div>
              <div className="stat-card">
                <div className="stat-card__icon" style={{ background: 'var(--warning-bg)' }}>
                  <span style={{ fontSize: '1.5rem' }}>🎫</span>
                </div>
                <div className="stat-card__value">{analytics.openTickets}</div>
                <div className="stat-card__label">Open Tickets</div>
              </div>
              <div className="stat-card">
                <div className="stat-card__icon" style={{ background: 'var(--success-bg)' }}>
                  <span style={{ fontSize: '1.5rem' }}>✅</span>
                </div>
                <div className="stat-card__value">{analytics.resolvedTickets}</div>
                <div className="stat-card__label">Resolved Cases</div>
              </div>
              <div className="stat-card">
                <div className="stat-card__icon" style={{ background: 'var(--danger-bg)' }}>
                  <span style={{ fontSize: '1.5rem' }}>📋</span>
                </div>
                <div className="stat-card__value" style={{ fontSize: '0.875rem' }}>{analytics.mostReportedIssue}</div>
                <div className="stat-card__label">Top Issue</div>
              </div>
              <div className="stat-card">
                <div className="stat-card__icon" style={{ background: 'var(--primary-light)' }}>
                  <span style={{ fontSize: '1.5rem' }}>⭐</span>
                </div>
                <div className="stat-card__value" style={{ fontSize: '0.875rem' }}>{analytics.mostReviewedProduct || 'N/A'}</div>
                <div className="stat-card__label">Most Reviewed</div>
              </div>
            </div>
          </section>
        </div>

        <div className="dashboard-grid">
          <section className="card dashboard-section" aria-labelledby="recent-orders-title">
            <div className="dashboard-section__header">
              <h3 id="recent-orders-title" className="dashboard-section__title">Recent Customer Orders</h3>
              <a href="/admin/orders" className="btn btn--ghost btn--sm">View All</a>
            </div>
            <div className="table-responsive">
              <table className="table" role="table">
                <thead>
                  <tr>
                    <th scope="col">Order ID</th>
                    <th scope="col">Customer</th>
                    <th scope="col">Total</th>
                    <th scope="col">Status</th>
                    <th scope="col">Date</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(order => (
                    <tr key={order.id}>
                      <td><strong>{order.id}</strong></td>
                      <td>{order.customerName}</td>
                      <td>₹{order.total}</td>
                      <td><span className={`badge badge--${getStatusBadge(order.status)}`}>{order.status}</span></td>
                      <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                      <td>
                        <a href={`/admin/orders/${order.id}`} className="btn btn--ghost btn--sm">Manage</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="card dashboard-section" aria-labelledby="low-stock-title">
            <div className="dashboard-section__header">
              <h3 id="low-stock-title" className="dashboard-section__title">Low Stock Alerts</h3>
              <a href="/admin/inventory" className="btn btn--ghost btn--sm">View All</a>
            </div>
            <div className="table-responsive">
              <table className="table" role="table">
                <thead>
                  <tr>
                    <th scope="col">Product</th>
                    <th scope="col">Stock</th>
                    <th scope="col">Category</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {products.filter(p => p.active && p.stock <= 10).slice(0, 5).map(product => (
                    <tr key={product.id}>
                      <td>
                        <div className="product-cell">
                          <span className="product-cell__emoji">{product.icon}</span>
                          <span>{product.name}</span>
                        </div>
                      </td>
                      <td><span className={`badge badge--${product.stock === 0 ? 'danger' : 'warning'}`}>{product.stock} {product.unit}</span></td>
                      <td>{product.category}</td>
                      <td>
                        <a href={`/admin/products?edit=${product.id}`} className="btn btn--ghost btn--sm">Restock</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <section className="card dashboard-section" aria-labelledby="in-transit-title">
          <h3 id="in-transit-title" className="dashboard-section__title">Live Delivery Transit</h3>
          <div className="table-responsive">
            <table className="table" role="table">
              <thead>
                <tr>
                  <th scope="col">Order ID</th>
                  <th scope="col">Customer</th>
                  <th scope="col">Rider</th>
                  <th scope="col">Vehicle</th>
                  <th scope="col">Phone</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.filter(o => o.status === 'Out for Delivery').map(order => (
                  <tr key={order.id}>
                    <td><strong>{order.id}</strong></td>
                    <td>{order.customerName}</td>
                    <td>{order.riderName || '—'}</td>
                    <td>{order.riderVehicle || '—'}</td>
                    <td><a href={`tel:${order.riderPhone}`}>{order.riderPhone || '—'}</a></td>
                    <td><span className="badge badge--warning">{order.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AdminLayout>
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

const AdminLayout = ({ children }) => (
  <div className="admin-layout">
    <main className="admin-layout__main">
      <main className="admin-layout__content" role="main">
        <div className="container">{children}</div>
      </main>
    </main>
  </div>
);

export default AdminDashboard;