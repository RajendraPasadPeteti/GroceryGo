import React, { useState, useMemo } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { useStore } from '../../context/StoreContext';
import { useUI } from '../../context/UIContext';

const AdminOffers = () => {
  const { coupons, addCoupon, updateCoupon, deleteCoupon } = useStore();
  const { showToast } = useUI();

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);

  const [form, setForm] = useState({
    code: '',
    description: '',
    discount: 100,
    minOrder: 500,
    active: true,
  });

  const filteredCoupons = useMemo(() => {
    let result = coupons || [];
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter(c =>
        c.code?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [coupons, searchTerm]);

  const handleToggleStatus = (coupon) => {
    if (updateCoupon) {
      updateCoupon(coupon.id, { ...coupon, active: !coupon.active });
    }
    showToast(`Coupon ${coupon.code} ${coupon.active ? 'disabled' : 'activated'}`, 'info');
  };

  const handleDelete = (id, code) => {
    if (window.confirm(`Delete promotion code ${code}?`)) {
      if (deleteCoupon) deleteCoupon(id);
      showToast(`Coupon ${code} removed`, 'info');
    }
  };

  const handleSaveCoupon = (e) => {
    e.preventDefault();
    if (!form.code.trim()) {
      showToast('Coupon code is required', 'error');
      return;
    }

    if (editingCoupon) {
      updateCoupon(editingCoupon.id, {
        ...editingCoupon,
        code: form.code.toUpperCase().trim(),
        description: form.description,
        discount: Number(form.discount),
        minOrder: Number(form.minOrder),
        active: form.active,
      });
      showToast('Coupon updated successfully', 'success');
    } else {
      addCoupon({
        id: 'coup-' + Date.now(),
        code: form.code.toUpperCase().trim(),
        description: form.description || `₹${form.discount} OFF on orders above ₹${form.minOrder}`,
        discount: Number(form.discount),
        minOrder: Number(form.minOrder),
        active: true,
      });
      showToast('New coupon created!', 'success');
    }

    setShowModal(false);
    setEditingCoupon(null);
    setForm({ code: '', description: '', discount: 100, minOrder: 500, active: true });
  };

  return (
    <AdminLayout>
      {/* Page Header matching Screenshot (3) */}
      <div className="admin-header-row">
        <div>
          <h1 className="admin-header-title">
            <span>🏷️</span>
            <span>Promotional Offers & Coupon Codes</span>
          </h1>
          <p className="admin-header-subtitle">
            Create customer discount codes, set minimum cart spend requirements, and boost conversion.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingCoupon(null);
            setForm({ code: '', description: '', discount: 100, minOrder: 500, active: true });
            setShowModal(true);
          }}
          className="admin-btn-primary"
          style={{ height: '42px', padding: '0 20px', fontSize: '14px' }}
        >
          + Create New Coupon
        </button>
      </div>

      {/* Main Table Card matching Screenshot (3) */}
      <div className="admin-card">
        <div className="admin-card-head">
          <h2 className="admin-card-title">Active Promotion Campaigns</h2>
          <div className="admin-card-actions">
            <input
              type="search"
              placeholder="Search coupon code or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-search-input"
              style={{ minWidth: '280px' }}
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Offer Campaign</th>
                <th>Discount Value</th>
                <th>Minimum Cart Spend</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCoupons && filteredCoupons.length > 0 ? (
                filteredCoupons.map(c => (
                  <tr key={c.id}>
                    <td>
                      <span
                        style={{
                          background: '#DCFCE7',
                          color: '#15803D',
                          fontFamily: 'monospace',
                          fontWeight: 800,
                          fontSize: '13.5px',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          border: '1px solid #BBF7D0',
                        }}
                      >
                        {c.code}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: '#1F2937' }}>
                      {c.description || `₹${c.discount} OFF on orders above ₹${c.minOrder}`}
                    </td>
                    <td style={{ fontWeight: 700, color: '#1F2937' }}>
                      ₹{c.discount || c.value} OFF
                    </td>
                    <td style={{ fontWeight: 600, color: '#4B5563' }}>
                      ₹{c.minOrder || c.minimumCartSpend || 0}
                    </td>
                    <td>
                      <span
                        className="admin-status-pill"
                        style={{
                          background: c.active !== false ? '#DCFCE7' : '#F1F5F9',
                          color: c.active !== false ? '#15803D' : '#64748B',
                        }}
                      >
                        {c.active !== false ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCoupon(c);
                            setForm({
                              code: c.code,
                              description: c.description,
                              discount: c.discount || c.value || 50,
                              minOrder: c.minOrder || c.minimumCartSpend || 250,
                              active: c.active !== false,
                            });
                            setShowModal(true);
                          }}
                          className="admin-btn-action"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(c)}
                          className="admin-btn-action admin-btn-action--red"
                        >
                          {c.active !== false ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(c.id, c.code)}
                          className="admin-btn-action admin-btn-action--red"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>
                    No promotion campaigns found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Coupon Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '460px', padding: '28px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1F2937', marginBottom: '16px' }}>
              {editingCoupon ? 'Edit Coupon Campaign' : 'Create New Discount Coupon'}
            </h3>

            <form onSubmit={handleSaveCoupon}>
              <div className="input-group">
                <label className="input-label">Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GROCERY100"
                  value={form.code}
                  onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  className="input"
                  style={{ textTransform: 'uppercase', fontFamily: 'monospace', fontWeight: 700 }}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Campaign Description</label>
                <input
                  type="text"
                  placeholder="e.g. ₹100 OFF on orders above ₹500"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label className="input-label">Discount Value (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={form.discount}
                    onChange={e => setForm({ ...form, discount: e.target.value })}
                    className="input"
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Min Cart Spend (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={form.minOrder}
                    onChange={e => setForm({ ...form, minOrder: e.target.value })}
                    className="input"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className="admin-btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  {editingCoupon ? 'Save Coupon' : 'Create Coupon'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn--secondary" style={{ flex: 1, justifyContent: 'center' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminOffers;
