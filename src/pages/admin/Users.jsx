import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';

const AdminUsers = () => {
  const { users, orders, supportTickets, reviews, addUser, updateUser, deleteUser, refreshUsers: _refreshUsers } = useStore();
  const { isAuthenticated: _isAuthenticated, isAdmin: _isAdmin, protectPage } = useAuth();
  const { showToast, openModal, closeModal } = useUI();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'customer', phone: '', address: '', city: '', pincode: '' });

  useEffect(() => { protectPage('admin'); }, [protectPage]);
  useEffect(() => {
    if (editingUser) setFormData({ name: editingUser.name, email: editingUser.email, password: '', role: editingUser.role, phone: editingUser.phone, address: editingUser.address, city: editingUser.city, pincode: editingUser.pincode });
    else setFormData({ name: '', email: '', password: '', role: 'customer', phone: '', address: '', city: '', pincode: '' });
  }, [editingUser]);

  const userStats = useMemo(() => {
    return users.map(u => ({
      ...u,
      orderCount: orders.filter(o => o.userId === u.id).length,
      totalSpent: orders.filter(o => o.userId === u.id && o.status === 'Delivered').reduce((sum, o) => sum + o.total, 0),
      ticketCount: supportTickets.filter(t => t.userId === u.id).length,
      reviewCount: reviews.filter(r => r.userId === u.id).length,
    }));
  }, [users, orders, supportTickets, reviews]);

  const filteredUsers = useMemo(() => {
    let result = [...userStats];
    if (filter !== 'all') result = result.filter(u => u.role === filter);
    if (searchTerm) result = result.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()));
    return result;
  }, [userStats, filter, searchTerm]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || (!editingUser && !formData.password)) { showToast('Name, email, and password required', 'error'); return; }
    if (editingUser) { updateUser(editingUser.id, formData); showToast('User updated!', 'success'); }
    else { addUser(formData); showToast('User added!', 'success'); }
    closeModal('userForm'); setEditingUser(null);
  };
  const handleDelete = (id) => {
    if (window.confirm('Delete this user? This will also remove their orders and data.')) {
      deleteUser(id);
      showToast('User deleted', 'success');
    }
  };
  const toggleRole = (user) => { updateUser(user.id, { role: user.role === 'admin' ? 'customer' : 'admin' }); showToast(`${user.name} is now ${user.role === 'admin' ? 'customer' : 'admin'}`, 'success'); };

  return (
    <AdminLayout>
      <div className="admin-users">
        <PageHeader
          title="User Management"
          subtitle="Manage customer and admin accounts"
          breadcrumb={[{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Users' }]}
          actions={<button className="btn btn--primary" onClick={() => { setEditingUser(null); openModal('userForm'); }}>+ Add User</button>}
        />
        <div className="card" style={{ marginBottom: '20px' }}>
          <div className="card__body" style={{ padding: '20px' }}>
            <div className="grid-3" style={{ gap: '16px', alignItems: 'end' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label htmlFor="usr-search" className="input-label">Search Users</label>
                <input id="usr-search" type="search" className="input" placeholder="Name or email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label htmlFor="usr-filter" className="input-label">Role Filter</label>
                <select id="usr-filter" className="input select" value={filter} onChange={e => setFilter(e.target.value)}>
                  <option value="all">All Roles</option>
                  <option value="customer">Customers</option>
                  <option value="admin">Admins</option>
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
                  <th scope="col">User</th>
                  <th scope="col">Role</th>
                  <th scope="col">Contact</th>
                  <th scope="col">Orders</th>
                  <th scope="col">Total Spent</th>
                  <th scope="col">Tickets</th>
                  <th scope="col">Reviews</th>
                  <th scope="col">Joined</th>
                  <th scope="col"><span className="visually-hidden">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div className="product-cell">
                        <div className="avatar avatar--sm">{u.name.charAt(0)}</div>
                        <div><strong>{u.name}</strong><br /><small>{u.email}</small></div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge--${u.role === 'admin' ? 'primary' : 'info'}`}>{u.role}</span>
                      <button className="btn btn--ghost btn--sm btn--icon" onClick={() => toggleRole(u)} style={{ marginLeft: '8px' }} title="Toggle role" aria-label={`Toggle role for ${u.name}`}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                      </button>
                    </td>
                    <td>{u.phone}<br /><small>{u.address}, {u.city} - {u.pincode}</small></td>
                    <td>{u.orderCount}</td>
                    <td>₹{u.totalSpent}</td>
                    <td>{u.ticketCount}</td>
                    <td>{u.reviewCount}</td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn btn--ghost btn--sm btn--icon" onClick={() => { setEditingUser(u); openModal('userForm'); }} aria-label={`Edit ${u.name}`}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button className="btn btn--ghost btn--sm btn--icon btn--danger" onClick={() => handleDelete(u.id)} aria-label={`Delete ${u.name}`}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredUsers.length === 0 && (
            <div className="empty-state" style={{ padding: '60px' }}>
              <h3 className="empty-state__title">No users found</h3>
            </div>
          )}
        </div>
        {editingUser !== null && (
          <UserFormModal
            formData={formData}
            onFormChange={setFormData}
            onSubmit={handleSubmit}
            onClose={() => { closeModal('userForm'); setEditingUser(null); }}
            editing
          />
        )}
      </div>
    </AdminLayout>
  );
};

const UserFormModal = ({ formData, onFormChange, onSubmit, onClose, editing }) => (
  <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="user-form-title">
    <div className="modal modal--large" onClick={e => e.stopPropagation()}>
      <div className="modal__header">
        <h2 id="user-form-title" className="modal__title">{editing ? 'Edit' : 'Add'} User</h2>
        <button className="modal__close" onClick={onClose} aria-label="Close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      <form onSubmit={onSubmit}>
        <div className="modal__body">
          <div className="grid-2">
            <div className="input-group">
              <label htmlFor="u-name" className="input-label">Name *</label>
              <input id="u-name" name="name" type="text" className="input" value={formData.name} onChange={e => onFormChange({ ...formData, name: e.target.value })} required />
            </div>
            <div className="input-group">
              <label htmlFor="u-email" className="input-label">Email *</label>
              <input id="u-email" name="email" type="email" className="input" value={formData.email} onChange={e => onFormChange({ ...formData, email: e.target.value })} required />
            </div>
          </div>
          <div className="grid-2">
            <div className="input-group">
              <label htmlFor="u-pass" className="input-label">{editing ? 'New Password (leave blank to keep)' : 'Password'} *</label>
              <input id="u-pass" name="password" type="password" className="input" value={formData.password} onChange={e => onFormChange({ ...formData, password: e.target.value })} required={!editing} />
            </div>
            <div className="input-group">
              <label htmlFor="u-role" className="input-label">Role *</label>
              <select id="u-role" name="role" className="input select" value={formData.role} onChange={e => onFormChange({ ...formData, role: e.target.value })}>
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div className="grid-2">
            <div className="input-group">
              <label htmlFor="u-phone" className="input-label">Phone</label>
              <input id="u-phone" name="phone" type="tel" className="input" value={formData.phone} onChange={e => onFormChange({ ...formData, phone: e.target.value })} />
            </div>
            <div className="input-group">
              <label htmlFor="u-city" className="input-label">City</label>
              <input id="u-city" name="city" type="text" className="input" value={formData.city} onChange={e => onFormChange({ ...formData, city: e.target.value })} />
            </div>
          </div>
          <div className="grid-2">
            <div className="input-group">
              <label htmlFor="u-address" className="input-label">Address</label>
              <input id="u-address" name="address" type="text" className="input" value={formData.address} onChange={e => onFormChange({ ...formData, address: e.target.value })} />
            </div>
            <div className="input-group">
              <label htmlFor="u-pincode" className="input-label">Pincode</label>
              <input id="u-pincode" name="pincode" type="text" className="input" value={formData.pincode} onChange={e => onFormChange({ ...formData, pincode: e.target.value })} />
            </div>
          </div>
        </div>
        <div className="modal__footer">
          <button type="button" className="btn btn--secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn--primary">{editing ? 'Update' : 'Add'} User</button>
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

export default AdminUsers;