import React, { useState, useMemo } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { useStore } from '../../context/StoreContext';
import { useUI } from '../../context/UIContext';

const AdminProducts = () => {
  const { products, addProduct, updateProduct, deleteProduct, categories } = useStore();
  const { showToast } = useUI();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [stockLevelFilter, setStockLevelFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [form, setForm] = useState({
    name: '',
    category: 'Fruits',
    price: 100,
    originalPrice: 125,
    unit: '1 kg',
    stock: 50,
    icon: '🍎',
    description: '',
    active: true,
  });

  const filteredProducts = useMemo(() => {
    let result = products || [];
    if (selectedCategory !== 'ALL') {
      result = result.filter(p => p.category?.toUpperCase() === selectedCategory.toUpperCase());
    }
    if (stockLevelFilter === 'IN_STOCK') {
      result = result.filter(p => p.stock > 0);
    } else if (stockLevelFilter === 'LOW_STOCK') {
      result = result.filter(p => p.stock > 0 && p.stock <= 10);
    } else if (stockLevelFilter === 'OUT_OF_STOCK') {
      result = result.filter(p => p.stock <= 0);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [products, selectedCategory, stockLevelFilter, searchTerm]);

  const handleToggleActive = (product) => {
    if (updateProduct) {
      updateProduct(product.id, { ...product, active: !product.active });
    }
    showToast(`Product ${product.name} ${product.active ? 'disabled' : 'activated'}`, 'info');
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Delete product ${name}?`)) {
      if (deleteProduct) deleteProduct(id);
      showToast(`Product ${name} deleted`, 'info');
    }
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      showToast('Product name is required', 'error');
      return;
    }

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        ...editingProduct,
        name: form.name,
        category: form.category,
        price: Number(form.price),
        originalPrice: Number(form.originalPrice),
        unit: form.unit,
        stock: Number(form.stock),
        icon: form.icon,
        description: form.description,
        active: form.active,
      });
      showToast('Product updated successfully', 'success');
    } else {
      addProduct({
        id: Date.now(),
        name: form.name,
        category: form.category,
        price: Number(form.price),
        originalPrice: Number(form.originalPrice),
        unit: form.unit,
        stock: Number(form.stock),
        icon: form.icon || '🍏',
        description: form.description,
        rating: 4.8,
        active: true,
      });
      showToast('New product added to catalog', 'success');
    }

    setShowModal(false);
    setEditingProduct(null);
  };

  return (
    <AdminLayout>
      {/* Header matching Screenshot (342).png */}
      <div className="admin-header-row">
        <div>
          <h1 className="admin-header-title">
            <span>🍎</span>
            <span>Product Catalog Management</span>
          </h1>
          <p className="admin-header-subtitle">
            Add new products, adjust pricing, update stock levels, and toggle customer availability.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingProduct(null);
            setForm({
              name: '',
              category: 'Fruits',
              price: 100,
              originalPrice: 125,
              unit: '1 kg',
              stock: 50,
              icon: '🍎',
              description: '',
              active: true,
            });
            setShowModal(true);
          }}
          className="admin-btn-primary"
          style={{ height: '42px', padding: '0 20px', fontSize: '14px' }}
        >
          + Add New Product
        </button>
      </div>

      {/* Main Table Card matching Screenshot (342).png */}
      <div className="admin-card">
        <div className="admin-card-head">
          <h2 className="admin-card-title">Product Catalog ({filteredProducts.length})</h2>
          <div className="admin-card-actions">
            <input
              type="search"
              placeholder="Search by product name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-search-input"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="admin-select"
            >
              <option value="ALL">All Categories</option>
              {categories && categories.map(c => (
                <option key={c.id || c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
            <select
              value={stockLevelFilter}
              onChange={(e) => setStockLevelFilter(e.target.value)}
              className="admin-select"
            >
              <option value="ALL">All Stock Levels</option>
              <option value="IN_STOCK">In Stock</option>
              <option value="LOW_STOCK">Low Stock (≤ 10)</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
            </select>
          </div>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Unit</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts && filteredProducts.length > 0 ? (
                filteredProducts.map((p, idx) => {
                  const inStock = p.stock > 0;
                  return (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 700, color: '#6B7280' }}>
                        #{idx + 1}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '24px' }}>{p.icon || '🍏'}</span>
                          <div>
                            <div style={{ fontWeight: 700, color: '#1F2937' }}>{p.name}</div>
                            <div style={{ fontSize: '11.5px', color: '#9CA3AF', maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {p.description || 'Fresh handpicked quality grocery item'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ color: '#4B5563', fontWeight: 500 }}>{p.category}</td>
                      <td>
                        <span style={{ fontWeight: 800, color: '#16A34A', fontSize: '14.5px' }}>
                          ₹{p.price}
                        </span>
                      </td>
                      <td style={{ color: '#6B7280' }}>{p.unit || '1 kg'}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: 700 }}>{p.stock}</span>
                          <span
                            className="admin-status-pill"
                            style={{
                              background: inStock ? '#DCFCE7' : '#FEE2E2',
                              color: inStock ? '#15803D' : '#DC2626',
                            }}
                          >
                            {inStock ? 'IN STOCK' : 'OUT OF STOCK'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span
                          className="admin-status-pill"
                          style={{
                            background: p.active !== false ? '#DCFCE7' : '#F1F5F9',
                            color: p.active !== false ? '#15803D' : '#64748B',
                          }}
                        >
                          {p.active !== false ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingProduct(p);
                              setForm({
                                name: p.name,
                                category: p.category,
                                price: p.price,
                                originalPrice: p.originalPrice || Math.round(p.price * 1.25),
                                unit: p.unit || '1 kg',
                                stock: p.stock,
                                icon: p.icon || '🍏',
                                description: p.description || '',
                                active: p.active !== false,
                              });
                              setShowModal(true);
                            }}
                            className="admin-btn-action"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleActive(p)}
                            className="admin-btn-action admin-btn-action--red"
                          >
                            {p.active !== false ? 'Disable' : 'Enable'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(p.id, p.name)}
                            className="admin-btn-action admin-btn-action--red"
                            title="Delete product"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>
                    No products found matching the criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal--large" onClick={e => e.stopPropagation()} style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1F2937', marginBottom: '16px' }}>
              {editingProduct ? 'Edit Product Details' : 'Add New Product to Catalog'}
            </h3>

            <form onSubmit={handleSaveProduct}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '14px' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="input"
                    placeholder="e.g. Fresh Mangoes"
                  />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Emoji Icon</label>
                  <input
                    type="text"
                    value={form.icon}
                    onChange={e => setForm({ ...form, icon: e.target.value })}
                    className="input"
                    placeholder="e.g. 🥭"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '14px' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Category</label>
                  <select
                    className="input select"
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                  >
                    <option value="Fruits">Fruits</option>
                    <option value="Vegetables">Vegetables</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Bakery">Bakery</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Groceries">Groceries</option>
                    <option value="Household">Household</option>
                  </select>
                </div>

                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={form.price}
                    onChange={e => setForm({ ...form, price: e.target.value })}
                    className="input"
                  />
                </div>

                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Unit</label>
                  <input
                    type="text"
                    value={form.unit}
                    onChange={e => setForm({ ...form, unit: e.target.value })}
                    className="input"
                    placeholder="e.g. 1 kg"
                  />
                </div>

                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Current Stock *</label>
                  <input
                    type="number"
                    required
                    value={form.stock}
                    onChange={e => setForm({ ...form, stock: e.target.value })}
                    className="input"
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
                  placeholder="Short product highlights and specifications..."
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className="admin-btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  {editingProduct ? 'Save Changes' : 'Add to Catalog'}
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

export default AdminProducts;
