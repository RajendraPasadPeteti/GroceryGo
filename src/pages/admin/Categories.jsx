import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';

const AdminCategories = () => {
  const { categories, products, addCategory, updateCategory, deleteCategory, refreshCategories: _refreshCategories, refreshProducts } = useStore();
  const { isAuthenticated: _isAuthenticated, isAdmin: _isAdmin, protectPage } = useAuth();
  const { showToast, openModal, closeModal } = useUI();
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', icon: '📦', description: '', active: true });

  useEffect(() => {
    protectPage('admin');
  }, [protectPage]);

  useEffect(() => {
    if (editingCategory) {
      setFormData({ name: editingCategory.name, icon: editingCategory.icon, description: editingCategory.description, active: editingCategory.active });
    } else {
      setFormData({ name: '', icon: '📦', description: '', active: true });
    }
  }, [editingCategory]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.icon) { showToast('Name and icon are required', 'error'); return; }
    if (editingCategory) { updateCategory(editingCategory.id, formData); showToast('Category updated!', 'success'); }
    else { addCategory(formData); showToast('Category added!', 'success'); }
    closeModal('categoryForm'); setEditingCategory(null);
  };

  const handleDelete = (category) => {
    const linkedProducts = products.filter(p => p.category === category.name).length;
    if (linkedProducts > 0) {
      if (!window.confirm(`This category has ${linkedProducts} products. They will be reassigned to the first available category. Continue?`)) return;
    }
    if (deleteCategory(category.id)) { showToast('Category deleted', 'success'); refreshProducts(); }
  };

  return (
    <AdminLayout>
      <div className="admin-categories">
        <PageHeader
          title="Categories"
          subtitle="Manage product categories"
          breadcrumb={[{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Categories' }]}
          actions={<button className="btn btn--primary" onClick={() => { setEditingCategory(null); openModal('categoryForm'); }}>+ Add Category</button>}
        />
        <div className="card">
          <div className="table-responsive">
            <table className="table" role="table">
              <thead>
                <tr>
                  <th scope="col">Icon</th>
                  <th scope="col">Name</th>
                  <th scope="col">Description</th>
                  <th scope="col">Products</th>
                  <th scope="col">Status</th>
                  <th scope="col"><span className="visually-hidden">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {categories.map(cat => {
                  const count = products.filter(p => p.category === cat.name && p.active).length;
                  return (
                    <tr key={cat.id}>
                      <td><span className="category-icon">{cat.icon}</span></td>
                      <td><strong>{cat.name}</strong></td>
                      <td>{cat.description}</td>
                      <td>{count}</td>
                      <td><span className={`badge badge--${cat.active ? 'success' : 'danger'}`}>{cat.active ? 'Active' : 'Inactive'}</span></td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn btn--ghost btn--sm btn--icon" onClick={() => { setEditingCategory(cat); openModal('categoryForm'); }} aria-label={`Edit ${cat.name}`}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                          </button>
                          <button className="btn btn--ghost btn--sm btn--icon btn--danger" onClick={() => handleDelete(cat)} aria-label={`Delete ${cat.name}`}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        {editingCategory !== null && (
          <CategoryFormModal
            formData={formData}
            onFormChange={setFormData}
            onSubmit={handleSubmit}
            onClose={() => { closeModal('categoryForm'); setEditingCategory(null); }}
            editing
          />
        )}
      </div>
    </AdminLayout>
  );
};

const CategoryFormModal = ({ formData, onFormChange, onSubmit, onClose, editing }) => (
  <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="category-form-title">
    <div className="modal" onClick={e => e.stopPropagation()}>
      <div className="modal__header">
        <h2 id="category-form-title" className="modal__title">{editing ? 'Edit' : 'Add'} Category</h2>
        <button className="modal__close" onClick={onClose} aria-label="Close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      <form onSubmit={onSubmit}>
        <div className="modal__body">
          <div className="grid-2">
            <div className="input-group">
              <label htmlFor="c-name" className="input-label">Name *</label>
              <input id="c-name" name="name" type="text" className="input" value={formData.name} onChange={e => onFormChange({ ...formData, name: e.target.value })} required />
            </div>
            <div className="input-group">
              <label htmlFor="c-icon" className="input-label">Emoji Icon *</label>
              <input id="c-icon" name="icon" type="text" className="input" value={formData.icon} onChange={e => onFormChange({ ...formData, icon: e.target.value })} placeholder="🍎" maxLength={2} required />
            </div>
          </div>
          <div className="input-group">
            <label htmlFor="c-desc" className="input-label">Description</label>
            <textarea id="c-desc" name="description" className="input textarea" value={formData.description} onChange={e => onFormChange({ ...formData, description: e.target.value })} rows={3} />
          </div>
          <div className="input-group checkbox-group">
            <label className="checkbox-label">
              <input type="checkbox" checked={formData.active} onChange={e => onFormChange({ ...formData, active: e.target.checked })} className="checkbox" />
              <span className="checkbox-custom"></span> Active
            </label>
          </div>
        </div>
        <div className="modal__footer">
          <button type="button" className="btn btn--secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn--primary">{editing ? 'Update' : 'Add'} Category</button>
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

export default AdminCategories;