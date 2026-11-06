import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';

const AdminRiders = () => {
  const { riders, addRider, updateRider, deleteRider, refreshRiders: _refreshRiders } = useStore();
  const { isAuthenticated: _isAuthenticated, isAdmin: _isAdmin, protectPage } = useAuth();
  const { showToast, openModal, closeModal } = useUI();
  const [editingRider, setEditingRider] = useState(null);
  const [formData, setFormData] = useState({ name: '', phone: '', vehicleType: 'Bike', vehicleNumber: '', status: 'Available' });

  useEffect(() => { protectPage('admin'); }, [protectPage]);
  useEffect(() => { if (editingRider) setFormData({ name: editingRider.name, phone: editingRider.phone, vehicleType: editingRider.vehicleType, vehicleNumber: editingRider.vehicleNumber, status: editingRider.status }); else setFormData({ name: '', phone: '', vehicleType: 'Bike', vehicleNumber: '', status: 'Available' }); }, [editingRider]);

  const handleSubmit = (e) => { e.preventDefault(); if (!formData.name || !formData.phone || !formData.vehicleNumber) { showToast('All fields required', 'error'); return; } if (editingRider) { updateRider(editingRider.id, formData); showToast('Rider updated!', 'success'); } else { addRider(formData); showToast('Rider added!', 'success'); } closeModal('riderForm'); setEditingRider(null); };
  const handleDelete = (id) => { if (window.confirm('Delete this rider?')) { deleteRider(id); showToast('Rider deleted', 'success'); } };
  const toggleStatus = (rider) => { const statuses = ['Available', 'Busy', 'Offline', 'Suspended']; const next = statuses[(statuses.indexOf(rider.status) + 1) % statuses.length]; updateRider(rider.id, { status: next }); showToast(`${rider.name} is now ${next}`, 'success'); };

  return (
    <AdminLayout>
      <div className="admin-riders">
        <PageHeader
          title="Delivery Fleet"
          subtitle="Manage delivery riders"
          breadcrumb={[{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Riders' }]}
          actions={<button className="btn btn--primary" onClick={() => { setEditingRider(null); openModal('riderForm'); }}>+ Add Rider</button>}
        />
        <div className="card">
          <div className="table-responsive">
            <table className="table" role="table">
              <thead>
                <tr>
                  <th scope="col">Rider</th>
                  <th scope="col">Phone</th>
                  <th scope="col">Vehicle</th>
                  <th scope="col">Status</th>
                  <th scope="col">Rating</th>
                  <th scope="col">Assigned Orders</th>
                  <th scope="col"><span className="visually-hidden">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {riders.map(r => (
                  <tr key={r.id}>
                    <td>
                      <div className="product-cell">
                        <div className="avatar avatar--sm">{r.name.charAt(0)}</div>
                        <span>{r.name}</span>
                      </div>
                    </td>
                    <td>{r.phone}</td>
                    <td>{r.vehicleType} - {r.vehicleNumber}</td>
                    <td>
                      <span className={`badge badge--${r.status === 'Available' ? 'success' : r.status === 'Busy' ? 'warning' : r.status === 'Offline' ? 'info' : 'danger'}`}>
                        {r.status}
                      </span>
                      <button className="btn btn--ghost btn--sm btn--icon" onClick={() => toggleStatus(r)} style={{ marginLeft: '8px' }} title="Cycle status" aria-label={`Cycle status for ${r.name}`}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
                      </button>
                    </td>
                    <td>⭐ {r.rating}</td>
                    <td>{(r.assignedOrders || []).length}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn btn--ghost btn--sm btn--icon" onClick={() => { setEditingRider(r); openModal('riderForm'); }} aria-label={`Edit ${r.name}`}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button className="btn btn--ghost btn--sm btn--icon btn--danger" onClick={() => handleDelete(r.id)} aria-label={`Delete ${r.name}`}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {editingRider !== null && (
          <RiderFormModal
            formData={formData}
            onFormChange={setFormData}
            onSubmit={handleSubmit}
            onClose={() => { closeModal('riderForm'); setEditingRider(null); }}
            editing
          />
        )}
      </div>
    </AdminLayout>
  );
};

const RiderFormModal = ({ formData, onFormChange, onSubmit, onClose, editing }) => (
  <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="rider-form-title">
    <div className="modal" onClick={e => e.stopPropagation()}>
      <div className="modal__header">
        <h2 id="rider-form-title" className="modal__title">{editing ? 'Edit' : 'Add'} Rider</h2>
        <button className="modal__close" onClick={onClose} aria-label="Close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      <form onSubmit={onSubmit}>
        <div className="modal__body">
          <div className="grid-2">
            <div className="input-group">
              <label htmlFor="r-name" className="input-label">Name *</label>
              <input id="r-name" name="name" type="text" className="input" value={formData.name} onChange={e => onFormChange({ ...formData, name: e.target.value })} required />
            </div>
            <div className="input-group">
              <label htmlFor="r-phone" className="input-label">Phone *</label>
              <input id="r-phone" name="phone" type="tel" className="input" value={formData.phone} onChange={e => onFormChange({ ...formData, phone: e.target.value })} required />
            </div>
          </div>
          <div className="grid-2">
            <div className="input-group">
              <label htmlFor="r-vehicle" className="input-label">Vehicle Type *</label>
              <select id="r-vehicle" name="vehicleType" className="input select" value={formData.vehicleType} onChange={e => onFormChange({ ...formData, vehicleType: e.target.value })}>
                <option value="Bike">Bike</option>
                <option value="Scooter">Scooter</option>
                <option value="Electric Scooter">Electric Scooter</option>
                <option value="Bicycle">Bicycle</option>
              </select>
            </div>
            <div className="input-group">
              <label htmlFor="r-number" className="input-label">Vehicle Number *</label>
              <input id="r-number" name="vehicleNumber" type="text" className="input" value={formData.vehicleNumber} onChange={e => onFormChange({ ...formData, vehicleNumber: e.target.value })} required />
            </div>
          </div>
          <div className="input-group">
            <label htmlFor="r-status" className="input-label">Status</label>
            <select id="r-status" name="status" className="input select" value={formData.status} onChange={e => onFormChange({ ...formData, status: e.target.value })}>
              <option value="Available">Available</option>
              <option value="Busy">Busy</option>
              <option value="Offline">Offline</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>
        <div className="modal__footer">
          <button type="button" className="btn btn--secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn--primary">{editing ? 'Update' : 'Add'} Rider</button>
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

export default AdminRiders;