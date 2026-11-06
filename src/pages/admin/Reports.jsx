import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';

const AdminReports = () => {
  const { orders, products, users, coupons, reviews, supportTickets: _supportTickets, getCustomerServiceAnalytics } = useStore();
  const { isAuthenticated: _isAuthenticated, isAdmin: _isAdmin, protectPage } = useAuth();
  const { showToast } = useUI();
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [exportType, setExportType] = useState('orders');

  useEffect(() => { protectPage('admin'); }, [protectPage]);

  const filteredOrders = useMemo(() => {
    let result = [...orders];
    if (dateRange.from) result = result.filter(o => new Date(o.orderDate) >= new Date(dateRange.from));
    if (dateRange.to) result = result.filter(o => new Date(o.orderDate) <= new Date(dateRange.to));
    return result.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
  }, [orders, dateRange]);

  const analytics = getCustomerServiceAnalytics();

  const revenue = filteredOrders.filter(o => o.status === 'Delivered').reduce((sum, o) => sum + o.total, 0);
  const totalOrders = filteredOrders.length;
  const deliveredOrders = filteredOrders.filter(o => o.status === 'Delivered').length;
  const cancelledOrders = filteredOrders.filter(o => o.status === 'Cancelled').length;
  const avgOrderValue = deliveredOrders > 0 ? (revenue / deliveredOrders).toFixed(2) : 0;

  const categoryStats = useMemo(() => {
    const stats = {};
    filteredOrders.filter(o => o.status === 'Delivered').forEach(o => {
      o.items.forEach(item => {
        const cat = products.find(p => p.id === item.id)?.category || 'Other';
        if (!stats[cat]) stats[cat] = { revenue: 0, count: 0 };
        stats[cat].revenue += item.price * item.quantity;
        stats[cat].count += item.quantity;
      });
    });
    return Object.entries(stats).map(([category, data]) => ({ category, ...data })).sort((a, b) => b.revenue - a.revenue);
  }, [filteredOrders, products]);

  const paymentStats = useMemo(() => {
    const stats = { COD: 0, UPI: 0 };
    filteredOrders.filter(o => o.status === 'Delivered').forEach(o => { stats[o.paymentMethod] = (stats[o.paymentMethod] || 0) + o.total; });
    return stats;
  }, [filteredOrders]);

  const handleExport = () => {
    const data = exportType === 'orders' ? filteredOrders.map(o => ({ OrderID: o.id, Customer: o.customerName, Phone: o.phone, Items: o.items.length, Total: o.total, Payment: o.paymentMethod, Status: o.status, Date: new Date(o.orderDate).toLocaleString(), Rider: o.riderName || 'N/A' })) :
      exportType === 'products' ? products.map(p => ({ ID: p.id, Name: p.name, Category: p.category, Price: p.price, Stock: p.stock, Status: p.active ? 'Active' : 'Inactive' })) :
        exportType === 'users' ? users.map(u => ({ ID: u.id, Name: u.name, Email: u.email, Role: u.role, Orders: orders.filter(o => o.userId === u.id).length, TotalSpent: orders.filter(o => o.userId === u.id && o.status === 'Delivered').reduce((s, o) => s + o.total, 0), Joined: new Date(u.createdAt).toLocaleDateString() })) :
          coupons.map(c => ({ Code: c.code, Type: c.discountType, Value: c.discountValue, Used: c.usedCount, Limit: c.usageLimit, Active: c.active ? 'Yes' : 'No' }));
    const csv = [Object.keys(data[0] || {}).join(','), ...data.map(row => Object.values(row).map(v => `"${v}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${exportType}_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
    showToast(`${exportType.charAt(0).toUpperCase() + exportType.slice(1)} report exported`, 'success');
  };

  return (
    <AdminLayout>
      <div className="admin-reports">
        <PageHeader
          title="Reports & Analytics"
          subtitle="Business insights and data exports"
          breadcrumb={[{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Reports' }]}
        />

        <div className="card" style={{ marginBottom: '20px' }}>
          <div className="card__body" style={{ padding: '20px' }}>
            <div className="grid-4" style={{ gap: '16px', alignItems: 'end' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label htmlFor="r-from" className="input-label">From Date</label>
                <input id="r-from" type="date" className="input" value={dateRange.from} onChange={e => setDateRange({ ...dateRange, from: e.target.value })} />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label htmlFor="r-to" className="input-label">To Date</label>
                <input id="r-to" type="date" className="input" value={dateRange.to} onChange={e => setDateRange({ ...dateRange, to: e.target.value })} />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label htmlFor="r-type" className="input-label">Export Type</label>
                <select id="r-type" className="input select" value={exportType} onChange={e => setExportType(e.target.value)}>
                  <option value="orders">Orders</option>
                  <option value="products">Products</option>
                  <option value="users">Users</option>
                  <option value="coupons">Coupons</option>
                </select>
              </div>
              <button className="btn btn--primary" onClick={handleExport} style={{ height: '42px' }}>📥 Export CSV</button>
            </div>
          </div>
        </div>

        <div className="grid-4" style={{ marginBottom: '24px', gap: '16px' }}>
          <KPICard title="Total Revenue" value={`₹${revenue.toLocaleString()}`} icon="💰" trend={deliveredOrders > 0 ? `${deliveredOrders} orders` : ''} />
          <KPICard title="Orders" value={totalOrders} icon="📦" trend={`${deliveredOrders} delivered, ${cancelledOrders} cancelled`} />
          <KPICard title="Avg Order Value" value={`₹${avgOrderValue}`} icon="📊" trend="Per delivered order" />
          <KPICard title="Customers" value={users.filter(u => u.role === 'customer').length} icon="👥" trend={`${orders.length} total orders`} />
        </div>

        <div className="grid-2" style={{ gap: '20px', marginBottom: '24px' }}>
          <div className="card">
            <div className="card__header"><h3>Revenue by Category</h3></div>
            <div className="card__body">
              {categoryStats.map(cat => (
                <div key={cat.category} style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>{cat.category}</span>
                    <strong>₹{cat.revenue.toLocaleString()}</strong>
                  </div>
                  <div className="progress">
                    <div className="progress__bar" style={{ width: categoryStats[0]?.revenue ? `${(cat.revenue / categoryStats[0].revenue) * 100}%` : '0%' }}></div>
                  </div>
                  <small>{cat.count} items sold</small>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card__header"><h3>Payment Methods</h3></div>
            <div className="card__body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
                <div style={{ display: 'flex', gap: '40px', fontSize: '24px', fontWeight: '700' }}>
                  <span>COD: <span style={{ color: 'var(--color-primary)' }}>₹{paymentStats.COD.toLocaleString()}</span></span>
                  <span>UPI: <span style={{ color: 'var(--color-secondary)' }}>₹{paymentStats.UPI.toLocaleString()}</span></span>
                </div>
                <div style={{ width: '100%', maxWidth: '300px', marginTop: '20px' }}>
                  <canvas id="paymentChart" width="300" height="150"></canvas>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid-2" style={{ gap: '20px' }}>
          <div className="card">
            <div className="card__header"><h3>Support Analytics</h3></div>
            <div className="card__body">
              <div className="grid-2">
                <div>
                  <h4>Ticket Volume</h4>
                  <p style={{ fontSize: '32px', fontWeight: '700', color: 'var(--color-primary)' }}>{analytics.totalTickets}</p>
                  <small>{analytics.openTickets} open · {analytics.resolvedTickets} resolved</small>
                </div>
                <div>
                  <h4>Avg Resolution</h4>
                  <p style={{ fontSize: '32px', fontWeight: '700', color: 'var(--color-secondary)' }}>{analytics.avgResolutionTime}h</p>
                  <small>Average time to resolve</small>
                </div>
              </div>
              <div style={{ marginTop: '20px' }}>
                <h4>By Category</h4>
                {Object.entries(analytics.ticketsByCategory).map(([cat, count]) => (
                  <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
                    <span>{cat}</span>
                    <strong>{count}</strong>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '20px' }}>
                <h4>By Priority</h4>
                {Object.entries(analytics.ticketsByPriority).map(([pri, count]) => (
                  <div key={pri} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
                    <span><span className={`badge badge--${pri === 'High' ? 'danger' : pri === 'Medium' ? 'warning' : 'info'}`}>{pri}</span></span>
                    <strong>{count}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card__header"><h3>Reviews Overview</h3></div>
            <div className="card__body">
              <div className="grid-3" style={{ marginBottom: '20px' }}>
                <div style={{ textAlign: 'center', padding: '20px', background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-lg)' }}>
                  <div style={{ fontSize: '36px', fontWeight: '700', color: 'var(--color-primary)' }}>
                    {reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '—'}
                  </div>
                  <small>Avg Rating</small>
                </div>
                <div style={{ textAlign: 'center', padding: '20px', background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-lg)' }}>
                  <div style={{ fontSize: '36px', fontWeight: '700', color: 'var(--color-secondary)' }}>{reviews.length}</div>
                  <small>Total Reviews</small>
                </div>
                <div style={{ textAlign: 'center', padding: '20px', background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-lg)' }}>
                  <div style={{ fontSize: '36px', fontWeight: '700', color: 'var(--color-warning)' }}>{reviews.filter(r => !r.approved).length}</div>
                  <small>Pending Approval</small>
                </div>
              </div>
              <h4>Rating Distribution</h4>
              {[5, 4, 3, 2, 1].map(star => {
                const count = reviews.filter(r => r.rating === star).length;
                const pct = reviews.length ? (count / reviews.length) * 100 : 0;
                return (
                  <div key={star} style={{ marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>{'⭐'.repeat(star)}</span>
                      <span>{count} ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="progress" style={{ height: '8px' }}>
                      <div className="progress__bar" style={{ width: `${pct}%`, background: 'var(--color-warning)' }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

const KPICard = ({ title, value, icon, trend }) => (
  <div className="card kpi-card">
    <div className="card__body">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div className="avatar avatar--lg" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>{icon}</div>
        <div>
          <h3 className="kpi-value">{value}</h3>
          <p className="kpi-label">{title}</p>
        </div>
      </div>
      {trend && <p className="kpi-trend" style={{ marginTop: '8px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>{trend}</p>}
    </div>
  </div>
);

const PageHeader = ({ title, subtitle, breadcrumb }) => (
  <header className="page-header" role="heading" aria-level="1">
    <div className="page-header__left">
      {breadcrumb && (
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <ol className="breadcrumb__list">
            {breadcrumb.map((item, i) => (
              <li key={item.href || i} className="breadcrumb__item">
                {i > 0 && (
                  <svg className="breadcrumb__separator" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                )}
                {item.href ? <a href={item.href} className="breadcrumb__link">{item.label}</a> : <span className="breadcrumb__current" aria-current="page">{item.label}</span>}
              </li>
            ))}
          </ol>
        </nav>
      )}
      <div>
        <h1 className="page-header__title">{title}</h1>
        {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
      </div>
    </div>
  </header>
);

const AdminLayout = ({ children }) => (
  <div className="admin-layout">
    <main className="admin-layout__main">
      <main className="admin-layout__content" role="main">
        <div className="container">{children}</div>
      </main>
    </main>
  </div>
);

export default AdminReports;