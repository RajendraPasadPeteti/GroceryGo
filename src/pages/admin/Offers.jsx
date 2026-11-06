import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';

const AdminOffers = () => {
  const { coupons, addCoupon, updateCoupon, deleteCoupon, refreshCoupons: _refreshCoupons } = useStore();
  const { isAuthenticated: _isAuthenticated, isAdmin: _isAdmin, protectPage } = useAuth();
  const { showToast, openModal, closeModal } = useUI();
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState({ code: '', description: '', discountType: 'percentage', discountValue: 0, minOrderValue: 0, maxDiscount: 0, usageLimit: 1, validFrom: '', validUntil: '', active: true });

  useEffect(() => { protectPage('admin'); }, [protectPage]);
  useEffect(() => {
    if (editingCoupon) setFormData({ ...editingCoupon, validFrom: editingCoupon.validFrom?.split('T')[0], validUntil: editingCoupon.validUntil?.split('T')[0] });
    else setFormData({ code: '', description: '', discountType: 'percentage', discountValue: 0, minOrderValue: 0, maxDiscount: 0, usageLimit: 1, validFrom: '', validUntil: '', active: true });
  }, [editingCoupon]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.code || !formData.discountValue) { showToast('Code and discount value required', 'error'); return; }
    const data = { ...formData, validFrom: formData.validFrom ? new Date(formData.validFrom).toISOString() : null, validUntil: formData.validUntil ? new Date(formData.validUntil).toISOString() : null };
    if (editingCoupon) { updateCoupon(editingCoupon.id, data); showToast('Coupon updated!', 'success'); }
    else { addCoupon(data); showToast('Coupon added!', 'success'); }
    closeModal('couponForm'); setEditingCoupon(null);
  };
  const handleDelete = (id) => { if (window.confirm('Delete this coupon?')) { deleteCoupon(id); showToast('Coupon deleted', 'success'); } };
  const toggleActive = (coupon) => { updateCoupon(coupon.id, { active: !coupon.active }); showToast(`${coupon.code} ${coupon.active ? 'deactivated' : 'activated'}`, 'success'); };

  return (
    <AdminLayout>
      <div className="admin-offers">
        <PageHeader
          title="Offers & Coupons"
          subtitle="Manage discount coupons and promotions"
          breadcrumb={[{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Offers' }]}
          actions={<button className="btn btn--primary" onClick={() => { setEditingCoupon(null); openModal('couponForm'); }}>+ Add Coupon</button>}
        />
        <div className="card">
          <div className="table-responsive">
            <table className="table" role="table">
              <thead>
                <tr>
                  <th scope="col">Code</th>
                  <th scope="col">Description</th>
                  <th scope="col">Discount</th>
                  <th scope="col">Min Order</th>
                  <th scope="col">Max Discount</th>
                  <th scope="col">Usage</th>
                  <th scope="col">Validity</th>
                  <th scope="col">Status</th>
                  <th scope="col"><span className="visually-hidden">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {coupons.map(c => (
                  <tr key={c.id}>
                    <td><strong>{c.code}</strong></td>
                    <td>{c.description}</td>
                    <td>{c.discountType === 'percentage' ? c.discountValue + '%' : '₹' + c.discountValue}</td>
                    <td>₹{c.minOrderValue}</td>
                    <td>{c.maxDiscount ? c.discountType === 'percentage' ? c.maxDiscount + '%' : '₹' + c.maxDiscount : 'No limit'}</td>
                    <td>{c.usedCount}/{c.usageLimit}</td>
                    <td>{c.validFrom ? new Date(c.validFrom).toLocaleDateString() : '—'} to {c.validUntil ? new Date(c.validUntil).toLocaleDateString() : '—'}</td>
                    <td>
                      <span className={`badge badge--${c.active ? 'success' : 'danger'}`}>{c.active ? 'Active' : 'Inactive'}</span>
                      <button className="btn btn--ghost btn--sm btn--icon" onClick={() => toggleActive(c)} style={{ marginLeft: '8px' }} title="Toggle" aria-label={`Toggle ${c.code}`}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg>
                      </button>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn btn--ghost btn--sm btn--icon" onClick={() => { setEditingCoupon(c); openModal('couponForm'); }} aria-label={`Edit ${c.code}`}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button className="btn btn--ghost btn--sm btn--icon btn--danger" onClick={() => handleDelete(c.id)} aria-label={`Delete ${c.code}`}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {coupons.length === 0 && (
            <div className="empty-state" style={{ padding: '60px' }}>
              <div className="empty-state__icon">🎟️</div>
              <h3 className="empty-state__title">No coupons found</h3>
            </div>
          )}
        </div>
        {editingCoupon !== null && (
          <CouponFormModal
            formData={formData}
            onFormChange={setFormData}
            onSubmit={handleSubmit}
            onClose={() => { closeModal('couponForm'); setEditingCoupon(null); }}
            editing
          />
        )}
      </div>
    </AdminLayout>
  );
};

const CouponFormModal = ({ formData, onFormChange, onSubmit, onClose, editing }) => (
  <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="coupon-form-title">
    <div className="modal modal--large" onClick={e => e.stopPropagation()}>
      <div className="modal__header">
        <h2 id="coupon-form-title" className="modal__title">{editing ? 'Edit' : 'Add'} Coupon</h2>
        <button className="modal__close" onClick={onClose} aria-label="Close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      <form onSubmit={onSubmit}>
        <div className="modal__body">
          <div className="grid-2">
            <div className="input-group">
              <label htmlFor="c-code" className="input-label">Coupon Code *</label>
              <input id="c-code" name="code" type="text" className="input" value={formData.code} onChange={e => onFormChange({ ...formData, code: e.target.value.toUpperCase() })} required />
            </div>
            <div className="input-group">
              <label htmlFor="c-desc" className="input-label">Description</label>
              <input id="c-desc" name="description" type="text" className="input" value={formData.description} onChange={e => onFormChange({ ...formData, description: e.target.value })} />
            </div>
          </div>
          <div className="grid-3">
            <div className="input-group">
              <label htmlFor="c-type" className="input-label">Discount Type *</label>
              <select id="c-type" name="discountType" className="input select" value={formData.discountType} onChange={e => onFormChange({ ...formData, discountType: e.target.value })}>
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
            <div className="input-group">
              <label htmlFor="c-value" className="input-label">Discount Value *</label>
              <input id="c-value" name="discountValue" type="number" className="input" value={formData.discountValue} onChange={e => onFormChange({ ...formData, discountValue: Number(e.target.value) })} min="1" step={formData.discountType === 'percentage' ? 1 : 0.5} required />
            </div>
            <div className="input-group">
              <label htmlFor="c-max" className="input-label">Max Discount (0 = no limit)</label>
              <input id="c-max" name="maxDiscount" type="number" className="input" value={formData.maxDiscount} onChange={e => onFormChange({ ...formData, maxDiscount: Number(e.target.value) })} min="0" step={formData.discountType === 'percentage' ? 1 : 0.5} />
            </div>
          </div>
          <div className="grid-3">
            <div className="input-group">
              <label htmlFor="c-min" className="input-label">Min Order Value</label>
              <input id="c-min" name="minOrderValue" type="number" className="input" value={formData.minOrderValue} onChange={e => onFormChange({ ...formData, minOrderValue: Number(e.target.value) })} min="0" step="0.5" />
            </div>
            <div className="input-group">
              <label htmlFor="c-limit" className="input-label">Usage Limit</label>
              <input id="c-limit" name="usageLimit" type="number" className="input" value={formData.usageLimit} onChange={e => onFormChange({ ...formData, usageLimit: Number(e.target.value) })} min="1" />
            </div>
            <div className="input-group">
              <label htmlFor="c-valid" className="input-label">Valid Until</label>
              <input id="c-valid" name="validUntil" type="date" className="input" value={formData.validUntil} onChange={e => onFormChange({ ...formData, validUntil: e.target.value })} />
            </div>
          </div>
          <div className="grid-2">
            <div className="input-group">
              <label htmlFor="c-from" className="input-label">Valid From</label>
              <input id="c-from" name="validFrom" type="date" className="input" value={formData.validFrom} onChange={e => onFormChange({ ...formData, validFrom: e.target.value })} />
            </div>
            <div className="input-group checkbox-group">
              <label className="checkbox-label">
                <input type="checkbox" checked={formData.active} onChange={e => onFormChange({ ...formData, active: e.target.checked })} className="checkbox" />
                <span className="checkbox-custom"></span> Active
              </label>
            </div>
          </div>
        </div>
        <div className="modal__footer">
          <button type="button" className="btn btn--secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn--primary">{editing ? 'Update' : 'Add'} Coupon</button>
        </div>
      </form>
    </div>
  </div>
);

const PageHeader = ({ title, subtitle, breadcrumb, actions }) => (
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
    {actions && <div className="page-header__actions">{actions}</div>}
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

export default AdminOffers;