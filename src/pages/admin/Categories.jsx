import React, { useState, useMemo } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { useStore } from '../../context/StoreContext';
import { useUI } from '../../context/UIContext';

const AdminCategories = () => {
  const { categories, products, addCategory, updateCategory, deleteCategory } = useStore();
  const { showToast } = useUI();

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [form, setForm] = useState({
    name: '',
    icon: '🍎',
    description: '',
    active: true,
  });

  const categoryListWithCounts = useMemo(() => {
    return (categories || []).map(cat => {
      const linkedCount = products?.filter(p => p.category?.toLowerCase() === cat.name.toLowerCase()).length || 0;
      return {
        ...cat,
        linkedCount,
      };
    });
  }, [categories, products]);

  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categoryListWithCounts;
    const q = searchTerm.toLowerCase().trim();
    return categoryListWithCounts.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.description && c.description.toLowerCase().includes(q))
    );
  }, [categoryListWithCounts, searchTerm]);

  const handleToggleStatus = (cat) => {
    if (updateCategory) {
      updateCategory(cat.id, { ...cat, active: !cat.active });
    }
    showToast(`Category ${cat.name} ${cat.active ? 'disabled' : 'activated'}`, 'info');
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Delete category ${name}?`)) {
      if (deleteCategory) deleteCategory(id);
      showToast(`Category ${name} removed`, 'info');
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      showToast('Category name is required', 'error');
      return;
    }

    if (editingCategory) {
      updateCategory(editingCategory.id, {
        ...editingCategory,
        name: form.name,
        icon: form.icon,
        description: form.description,
        active: form.active,
      });
      showToast('Category updated', 'success');
    } else {
      addCategory({
        id: 'cat-' + Date.now(),
        name: form.name,
        icon: form.icon || '📁',
        description: form.description,
        active: true,
      });
      showToast('New category added', 'success');
    }

    setShowModal(false);
    setEditingCategory(null);
    setForm({ name: '', icon: '🍎', description: '', active: true });
  };

  return (
    <AdminLayout>
      {/* Header matching Screenshot (343).png */}
      <div className="admin-header-row">
        <div>
          <h1 className="admin-header-title">
            <span>📁</span>
            <span>Category Management</span>
          </h1>
          <p className="admin-header-subtitle">
            Organize products into intuitive categories for customer browsing and quick commerce discovery.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingCategory(null);
            setForm({ name: '', icon: '🍎', description: '', active: true });
            setShowModal(true);
          }}
          className="admin-btn-primary"
          style={{ height: '42px', padding: '0 20px', fontSize: '14px' }}
        >
          + Add New Category
        </button>
      </div>

      {/* Main Table Card matching Screenshot (343).png */}
      <div className="admin-card">
        <div className="admin-card-head">
          <h2 className="admin-card-title">Grocery Categories ({filteredCategories.length})</h2>
          <div className="admin-card-actions">
            <input
              type="search"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-search-input"
              style={{ minWidth: '260px' }}
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Icon</th>
                <th>Category Name</th>
                <th>Description</th>
                <th>Products Linked</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories && filteredCategories.length > 0 ? (
                filteredCategories.map(cat => (
                  <tr key={cat.id || cat.name}>
                    <td>
                      <span style={{ fontSize: '26px' }}>{cat.icon || '📁'}</span>
                    </td>
                    <td style={{ fontWeight: 800, color: '#1F2937' }}>
                      {cat.name}
                    </td>
                    <td style={{ color: '#4B5563', fontSize: '13.5px' }}>
                      {cat.description || `Fresh & quality ${cat.name.toLowerCase()}`}
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: '#16A34A' }}>
                        {cat.linkedCount} product(s)
                      </span>
                    </td>
                    <td>
                      <span
                        className="admin-status-pill"
                        style={{
                          background: cat.active !== false ? '#DCFCE7' : '#F1F5F9',
                          color: cat.active !== false ? '#15803D' : '#64748B',
                        }}
                      >
                        {cat.active !== false ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCategory(cat);
                            setForm({
                              name: cat.name,
                              icon: cat.icon || '🍎',
                              description: cat.description || '',
                              active: cat.active !== false,
                            });
                            setShowModal(true);
                          }}
                          className="admin-btn-action"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(cat)}
                          className="admin-btn-action admin-btn-action--red"
                        >
                          {cat.active !== false ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(cat.id, cat.name)}
                          className="admin-btn-action admin-btn-action--red"
                          title="Delete category"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>
                    No categories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Category Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px', padding: '28px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1F2937', marginBottom: '16px' }}>
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h3>

            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Category Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="input"
                    placeholder="e.g. Organic Produce"
                  />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Icon</label>
                  <input
                    type="text"
                    value={form.icon}
                    onChange={e => setForm({ ...form, icon: e.target.value })}
                    className="input"
                    placeholder="e.g. 🥬"
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="input textarea"
                  style={{ minHeight: '80px' }}
                  placeholder="Short description for customer discovery..."
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className="admin-btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  {editingCategory ? 'Save Changes' : 'Create Category'}
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

export default AdminCategories;
