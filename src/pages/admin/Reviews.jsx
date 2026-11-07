import React, { useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { useStore } from '../../context/StoreContext';
import { useUI } from '../../context/UIContext';

const initialProductReviews = [
  {
    id: 1,
    date: '2026-10-15',
    productName: 'Full Cream Milk',
    orderRef: '#GG20260920002',
    customer: 'Karthik Verma',
    rating: 5,
    qualityIssue: 'NONE (FRESH)',
    comment: 'Delivered chilled and fresh. Perfect for my morning coffee.',
  },
  {
    id: 2,
    date: '2026-10-18',
    productName: 'Fresh Apples',
    orderRef: '#GG20260920001',
    customer: 'Sneha Reddy',
    rating: 5,
    qualityIssue: 'NONE (FRESH)',
    comment: 'Apples were remarkably crisp, fresh, and sweet! Outstanding quality.',
  },
];

const initialFleetReviews = [
  {
    id: 101,
    date: '2026-10-16',
    riderName: 'Rahul Kumar',
    orderRef: '#GG20260920002',
    customer: 'Karthik Verma',
    rating: 5,
    qualityIssue: 'ON-TIME (18 MINS)',
    comment: 'Polite delivery partner, reached within 18 minutes with sealed insulated bag.',
  },
];

const AdminReviews = () => {
  const { showToast } = useUI();
  const [activeTab, setActiveTab] = useState('products');
  const [productReviews, setProductReviews] = useState(initialProductReviews);
  const [fleetReviews, setFleetReviews] = useState(initialFleetReviews);

  const handleDeleteProductReview = (id) => {
    if (window.confirm('Delete this verified review record?')) {
      setProductReviews(prev => prev.filter(r => r.id !== id));
      showToast('Review deleted', 'info');
    }
  };

  const handleDeleteFleetReview = (id) => {
    if (window.confirm('Delete this fleet review record?')) {
      setFleetReviews(prev => prev.filter(r => r.id !== id));
      showToast('Fleet review deleted', 'info');
    }
  };

  return (
    <AdminLayout>
      {/* Header matching Screenshot (351).png */}
      <div className="admin-header-row">
        <div>
          <h1 className="admin-header-title">
            <span>⭐</span>
            <span>Customer Reviews & Ratings Moderation</span>
          </h1>
          <p className="admin-header-subtitle">
            Monitor product quality ratings, reported freshness issues, and delivery fleet performance.
          </p>
        </div>
      </div>

      {/* 4 KPI Summary Cards matching Screenshot (351).png */}
      <div className="admin-kpi-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {/* Card 1: Product Quality */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-head">
            <div className="admin-kpi-icon-box" style={{ background: '#FEFCE8', color: '#CA8A04' }}>⭐</div>
            <span className="admin-kpi-pill" style={{ background: '#FEF3C7', color: '#B45309' }}>PRODUCT QUALITY</span>
          </div>
          <div className="admin-kpi-num">5.0 ⭐</div>
          <div className="admin-kpi-desc">Avg Grocery Quality Rating</div>
        </div>

        {/* Card 2: Delivery Speed */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-head">
            <div className="admin-kpi-icon-box" style={{ background: '#DCFCE7', color: '#16A34A' }}>⚡</div>
            <span className="admin-kpi-pill" style={{ background: '#DCFCE7', color: '#15803D' }}>DELIVERY SPEED</span>
          </div>
          <div className="admin-kpi-num">5.0 ⭐</div>
          <div className="admin-kpi-desc">Avg Delivery Speed Rating</div>
        </div>

        {/* Card 3: Fleet Conduct */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-head">
            <div className="admin-kpi-icon-box" style={{ background: '#FDF4FF', color: '#C026D3' }}>🛵</div>
            <span className="admin-kpi-pill" style={{ background: '#F3E8FF', color: '#7E22CE' }}>FLEET CONDUCT</span>
          </div>
          <div className="admin-kpi-num">5.0 ⭐</div>
          <div className="admin-kpi-desc">Avg Partner Conduct Rating</div>
        </div>

        {/* Card 4: Volume */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-head">
            <div className="admin-kpi-icon-box" style={{ background: '#EEF2FF', color: '#4F46E5' }}>💬</div>
            <span className="admin-kpi-pill" style={{ background: '#E0F2FE', color: '#0284C7' }}>VOLUME</span>
          </div>
          <div className="admin-kpi-num">{productReviews.length + fleetReviews.length}</div>
          <div className="admin-kpi-desc">Total Verified Customer Reviews</div>
        </div>
      </div>

      {/* Main Reviews Moderation Card matching Screenshot (351).png */}
      <div className="admin-card">
        {/* Review Tabs */}
        <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid #E5E7EB', marginBottom: '20px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('products')}
            style={{
              padding: '12px 6px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontWeight: activeTab === 'products' ? 800 : 600,
              fontSize: '14.5px',
              color: activeTab === 'products' ? '#16A34A' : '#6B7280',
              borderBottom: activeTab === 'products' ? '3px solid #16A34A' : '3px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>🍎</span>
            <span>Product Item Reviews ({productReviews.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('fleet')}
            style={{
              padding: '12px 6px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontWeight: activeTab === 'fleet' ? 800 : 600,
              fontSize: '14.5px',
              color: activeTab === 'fleet' ? '#16A34A' : '#6B7280',
              borderBottom: activeTab === 'fleet' ? '3px solid #16A34A' : '3px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>🛵</span>
            <span>Delivery Fleet Reviews ({fleetReviews.length})</span>
          </button>
        </div>

        {/* Tab 1: Product Item Reviews */}
        {activeTab === 'products' ? (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Product Name</th>
                  <th>Order Ref</th>
                  <th>Customer</th>
                  <th>Rating</th>
                  <th>Quality Issues</th>
                  <th>Comment / Feedback</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {productReviews.map(r => (
                  <tr key={r.id}>
                    <td style={{ color: '#6B7280', fontSize: '12.5px' }}>{r.date}</td>
                    <td style={{ fontWeight: 800, color: '#1F2937' }}>{r.productName}</td>
                    <td>
                      <span style={{ fontWeight: 700, color: '#16A34A', fontFamily: 'monospace' }}>
                        {r.orderRef}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{r.customer}</td>
                    <td>
                      <span style={{ fontWeight: 800, color: '#D97706', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        {r.rating} ⭐
                      </span>
                    </td>
                    <td>
                      <span className="admin-status-pill" style={{ background: '#DCFCE7', color: '#15803D' }}>
                        {r.qualityIssue}
                      </span>
                    </td>
                    <td style={{ fontSize: '13px', color: '#4B5563', maxWidth: '320px' }}>
                      {r.comment}
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleDeleteProductReview(r.id)}
                        className="admin-btn-action admin-btn-action--red"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Tab 2: Delivery Fleet Reviews */
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Rider Name</th>
                  <th>Order Ref</th>
                  <th>Customer</th>
                  <th>Rating</th>
                  <th>Delivery Speed</th>
                  <th>Comment / Feedback</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {fleetReviews.map(r => (
                  <tr key={r.id}>
                    <td style={{ color: '#6B7280', fontSize: '12.5px' }}>{r.date}</td>
                    <td style={{ fontWeight: 800, color: '#1F2937' }}>{r.riderName}</td>
                    <td>
                      <span style={{ fontWeight: 700, color: '#16A34A', fontFamily: 'monospace' }}>
                        {r.orderRef}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{r.customer}</td>
                    <td>
                      <span style={{ fontWeight: 800, color: '#D97706', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        {r.rating} ⭐
                      </span>
                    </td>
                    <td>
                      <span className="admin-status-pill" style={{ background: '#E0F2FE', color: '#0284C7' }}>
                        {r.qualityIssue}
                      </span>
                    </td>
                    <td style={{ fontSize: '13px', color: '#4B5563', maxWidth: '320px' }}>
                      {r.comment}
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleDeleteFleetReview(r.id)}
                        className="admin-btn-action admin-btn-action--red"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminReviews;
