import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';

const AdminProducts = () => {
  const { products, categories, addProduct, updateProduct, deleteProduct, refreshProducts: _refreshProducts, refreshCategories: _refreshCategories } = useStore();
  const { isAuthenticated: _isAuthenticated, isAdmin: _isAdmin, protectPage } = useAuth();
  const { showToast, openModal, closeModal } = useUI();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    icon: '🍎',
    category: '',
    price: 0,
    originalPrice: 0,
    unit: '',
    stock: 0,
    discount: 0,
    description: '',
    featured: false,
    active: true,
  });

  useEffect(() => {
    protectPage('admin');
  }, [protectPage]);

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name,
        icon: editingProduct.icon,
        category: editingProduct.category,
        price: editingProduct.price,
        originalPrice: editingProduct.originalPrice,
        unit: editingProduct.unit,
        stock: editingProduct.stock,
        discount: editingProduct.discount,
        description: editingProduct.description,
        featured: editingProduct.featured,
        active: editingProduct.active,
      });
    } else {
      setFormData({
        name: '',
        icon: '🍎',
        category: categories[0]?.name || '',
        price: 0,
        originalPrice: 0,
        unit: '',
        stock: 0,
        discount: 0,
        description: '',
        featured: false,
        active: true,
      });
    }
  }, [editingProduct, categories]);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.category || !formData.unit) {
      showToast('Please fill in all required fields', 'error');
      return;
    }
    if (formData.price < 0 || formData.stock < 0) {
      showToast('Price and stock must be positive numbers', 'error');
      return;
    }
    if (editingProduct) {
      updateProduct(editingProduct.id, formData);
      showToast('Product updated successfully!', 'success');
    } else {
      addProduct(formData);
      showToast('Product added successfully!', 'success');
    }
    closeModal('productForm');
    setEditingProduct(null);
  };

  const handleDelete = (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProduct(productId);
      showToast('Product deleted', 'success');
    }
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    openModal('productForm');
  };

  const openAdd = () => {
    setEditingProduct(null);
    openModal('productForm');
  };

  return (
    <AdminLayout>
      <div className="admin-products">
        <PageHeader
          title="Products Management"
          subtitle="Manage grocery products, pricing, and inventory"
          breadcrumb={[{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Products' }]}
          actions={<button className="btn btn--primary" onClick={openAdd}>+ Add Product</button>}
        />

        <div className="card">
          <div className="card__body" style={{ padding: '20px' }}>
            <div className="grid-3" style={{ gap: '16px', alignItems: 'end' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label htmlFor="product-search" className="input-label">Search Products</label>
                <input
                  id="product-search"
                  type="search"
                  className="input"
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label htmlFor="category-filter" className="input-label">Category</label>
                <select
                  id="category-filter"
                  className="input select"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {categories.filter(c => c.active).map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
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
                  <th scope="col">Icon</th>
                  <th scope="col">Name</th>
                  <th scope="col">Category</th>
                  <th scope="col">Price</th>
                  <th scope="col">Original</th>
                  <th scope="col">Unit</th>
                  <th scope="col">Stock</th>
                  <th scope="col">Discount</th>
                  <th scope="col">Rating</th>
                  <th scope="col">Status</th>
                  <th scope="col"><span className="visually-hidden">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(product => (
                  <tr key={product.id}>
                    <td><span className="product-emoji">{product.icon}</span></td>
                    <td><strong>{product.name}</strong></td>
                    <td>{product.category}</td>
                    <td>₹{product.price}</td>
                    <td>{product.originalPrice > product.price ? `₹${product.originalPrice}` : '—'}</td>
                    <td>{product.unit}</td>
                    <td>
                      <span className={`badge badge--${product.stock === 0 ? 'danger' : product.stock <= 10 ? 'warning' : 'success'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td>{product.discount > 0 ? `${product.discount}%` : '—'}</td>
                    <td>
                      <span className="rating-display">
                        {'★'.repeat(Math.floor(product.rating))}{'☆'.repeat(5 - Math.floor(product.rating))}
                        <span className="rating-value">{product.rating}</span>
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge--${product.active ? 'success' : 'danger'}`}>
                        {product.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn btn--ghost btn--sm btn--icon" onClick={() => openEdit(product)} aria-label={`Edit ${product.name}`}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button className="btn btn--ghost btn--sm btn--icon btn--danger" onClick={() => handleDelete(product.id)} aria-label={`Delete ${product.name}`}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredProducts.length === 0 && (
            <div className="empty-state" style={{ padding: '60px 20px' }}>
              <div className="empty-state__icon">📦</div>
              <h3 className="empty-state__title">No products found</h3>
              <p className="empty-state__desc">Try adjusting your search or filters</p>
            </div>
          )}
        </div>

        {editingProduct !== null && (
          <ProductFormModal
            formData={formData}
            onFormChange={setFormData}
            onSubmit={handleSubmit}
            onClose={() => { closeModal('productForm'); setEditingProduct(null); }}
            categories={categories}
            editing={!!editingProduct}
          />
        )}
      </div>
    </AdminLayout>
  );
};

const ProductFormModal = ({ formData, onFormChange, onSubmit, onClose, categories, editing }) => (
  <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="product-form-title">
    <div className="modal modal--large" onClick={e => e.stopPropagation()}>
      <div className="modal__header">
        <h2 id="product-form-title" className="modal__title">{editing ? 'Edit Product' : 'Add New Product'}</h2>
        <button className="modal__close" onClick={onClose} aria-label="Close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <form onSubmit={onSubmit}>
        <div className="modal__body">
          <div className="grid-2">
            <div className="input-group">
              <label htmlFor="p-name" className="input-label">Product Name *</label>
              <input
                id="p-name"
                name="name"
                type="text"
                className="input"
                value={formData.name}
                onChange={(e) => onFormChange({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="p-icon" className="input-label">Emoji Icon *</label>
              <input
                id="p-icon"
                name="icon"
                type="text"
                className="input"
                value={formData.icon}
                onChange={(e) => onFormChange({ ...formData, icon: e.target.value })}
                placeholder="🍎"
                maxLength={2}
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="p-category" className="input-label">Category *</label>
              <select
                id="p-category"
                name="category"
                className="input select"
                value={formData.category}
                onChange={(e) => onFormChange({ ...formData, category: e.target.value })}
                required
              >
                {categories.filter(c => c.active).map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.icon} {cat.name}</option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label htmlFor="p-unit" className="input-label">Unit *</label>
              <input
                id="p-unit"
                name="unit"
                type="text"
                className="input"
                value={formData.unit}
                onChange={(e) => onFormChange({ ...formData, unit: e.target.value })}
                placeholder="e.g., 1 kg, 500 ml, 1 pack"
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="p-price" className="input-label">Price (₹) *</label>
              <input
                id="p-price"
                name="price"
                type="number"
                className="input"
                value={formData.price}
                onChange={(e) => onFormChange({ ...formData, price: Number(e.target.value) })}
                min="0"
                step="0.01"
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="p-original-price" className="input-label">Original Price (₹)</label>
              <input
                id="p-original-price"
                name="originalPrice"
                type="number"
                className="input"
                value={formData.originalPrice}
                onChange={(e) => onFormChange({ ...formData, originalPrice: Number(e.target.value) })}
                min="0"
                step="0.01"
              />
            </div>
            <div className="input-group">
              <label htmlFor="p-stock" className="input-label">Stock Quantity *</label>
              <input
                id="p-stock"
                name="stock"
                type="number"
                className="input"
                value={formData.stock}
                onChange={(e) => onFormChange({ ...formData, stock: Number(e.target.value) })}
                min="0"
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="p-discount" className="input-label">Discount (%)</label>
              <input
                id="p-discount"
                name="discount"
                type="number"
                className="input"
                value={formData.discount}
                onChange={(e) => onFormChange({ ...formData, discount: Number(e.target.value) })}
                min="0"
                max="100"
              />
            </div>
          </div>
          <div className="input-group">
            <label htmlFor="p-description" className="input-label">Description</label>
            <textarea
              id="p-description"
              name="description"
              className="input textarea"
              value={formData.description}
              onChange={(e) => onFormChange({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Product description..."
            />
          </div>
          <div className="input-group checkbox-group" style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => onFormChange({ ...formData, featured: e.target.checked })}
                className="checkbox"
              />
              <span className="checkbox-custom"></span>
              Featured Product
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => onFormChange({ ...formData, active: e.target.checked })}
                className="checkbox"
              />
              <span className="checkbox-custom"></span>
              Active
            </label>
          </div>
        </div>
        <div className="modal__footer">
          <button type="button" className="btn btn--secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn--primary">{editing ? 'Update Product' : 'Add Product'}</button>
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
            {breadcrumb.map((item, index) => (
              <li key={item.href || index} className="breadcrumb__item">
                {index > 0 && <svg className="breadcrumb__separator" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>}
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

export default AdminProducts;