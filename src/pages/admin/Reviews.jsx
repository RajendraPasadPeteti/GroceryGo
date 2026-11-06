import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';

const AdminReviews = () => {
  const { reviews, products: _products, users: _users, orders: _orders, updateReview, deleteReview, refreshReviews: _refreshReviews } = useStore();
  const { isAuthenticated: _isAuthenticated, isAdmin: _isAdmin, protectPage } = useAuth();
  const { showToast } = useUI();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { protectPage('admin'); }, [protectPage]);

  const filteredReviews = useMemo(() => {
    let result = [...reviews].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (filter !== 'all') result = result.filter(r => r.approved === (filter === 'approved'));
    if (searchTerm) result = result.filter(r => r.id.toLowerCase().includes(searchTerm.toLowerCase()) || r.productName.toLowerCase().includes(searchTerm.toLowerCase()) || r.userName.toLowerCase().includes(searchTerm.toLowerCase()));
    return result;
  }, [reviews, filter, searchTerm]);

  const handleApprove = (reviewId) => {
    updateReview(reviewId, { approved: true });
    showToast('Review approved', 'success');
  };

  const handleReject = (reviewId) => {
    updateReview(reviewId, { approved: false });
    showToast('Review rejected', 'success');
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this review permanently?')) {
      deleteReview(id);
      showToast('Review deleted', 'success');
    }
  };

  const stats = useMemo(() => ({
    total: reviews.length,
    approved: reviews.filter(r => r.approved).length,
    pending: reviews.filter(r => !r.approved).length,
    avgRating: reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '—',
  }), [reviews]);

  return (
    <AdminLayout>
      <div className="admin-reviews">
        <PageHeader
          title="Reviews & Ratings"
          subtitle="Moderate customer reviews"
          breadcrumb={[{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Reviews' }]}
        />

        <div className="grid-4" style={{ gap: '16px', marginBottom: '24px' }}>
          <KPICard title="Total Reviews" value={stats.total} icon="⭐" />
          <KPICard title="Approved" value={stats.approved} icon="✅" trend={`${stats.pending} pending`} />
          <KPICard title="Avg Rating" value={stats.avgRating} icon="📊" trend="Out of 5.0" />
          <KPICard title="Products Reviewed" value={[...new Set(reviews.map(r => r.productId))].length} icon="📦" />
        </div>

        <div className="card" style={{ marginBottom: '20px' }}>
          <div className="card__body" style={{ padding: '20px' }}>
            <div className="grid-3" style={{ gap: '16px', alignItems: 'end' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label htmlFor="rev-search" className="input-label">Search</label>
                <input id="rev-search" type="search" className="input" placeholder="Product, customer, review text..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label htmlFor="rev-filter" className="input-label">Status</label>
                <select id="rev-filter" className="input select" value={filter} onChange={e => setFilter(e.target.value)}>
                  <option value="all">All</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="table-responsive">
            <table className="table" role="table">
              <thead>
                <tr>
                  <th scope="col">Review</th>
                  <th scope="col">Product</th>
                  <th scope="col">Customer</th>
                  <th scope="col">Rating</th>
                  <th scope="col">Order</th>
                  <th scope="col">Date</th>
                  <th scope="col">Status</th>
                  <th scope="col"><span className="visually-hidden">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {filteredReviews.map(r => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ maxWidth: '300px' }}>
                        <p style={{ margin: 0, fontWeight: '500' }}>"{r.comment}"</p>
                        <small style={{ color: 'var(--color-text-secondary)' }}>{r.comment.length > 100 ? r.comment.substring(0, 100) + '...' : r.comment}</small>
                      </div>
                    </td>
                    <td>{r.productIcon} {r.productName}</td>
                    <td>{r.userName}<br /><small>{r.userEmail}</small></td>
                    <td><span style={{ fontSize: '18px' }}>{'⭐'.repeat(r.rating)}</span><br /><small>{r.rating}/5</small></td>
                    <td><small>{r.orderId}</small></td>
                    <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td><span className={`badge badge--${r.approved ? 'success' : 'warning'}`}>{r.approved ? 'Approved' : 'Pending'}</span></td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn btn--ghost btn--sm btn--icon" onClick={() => r.approved ? handleReject(r.id) : handleApprove(r.id)} title={r.approved ? 'Reject' : 'Approve'} aria-label={r.approved ? `Reject review for ${r.productName}` : `Approve review for ${r.productName}`}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{r.approved ? <path d="M18 6L6 18M6 6l12 12" /> : <polyline points="20 6 9 17 4 12"></polyline>}</svg>
                        </button>
                        <button className="btn btn--ghost btn--sm btn--icon btn--danger" onClick={() => handleDelete(r.id)} aria-label={`Delete review for ${r.productName}`}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredReviews.length === 0 && (
            <div className="empty-state" style={{ padding: '60px' }}>
              <div className="empty-state__icon">⭐</div>
              <h3 className="empty-state__title">No reviews found</h3>
            </div>
          )}
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

export default AdminReviews;