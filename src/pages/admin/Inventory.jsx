import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';

const AdminInventory = () => {
  const { products, updateProduct, refreshProducts: _refreshProducts } = useStore();
  const { protectPage } = useAuth();
  const { showToast } = useUI();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { protectPage('admin'); }, [protectPage]);

  const filteredProducts = useMemo(() => {
    let result = products.filter(p => p.active);
    if (searchTerm) {
      result = result.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (filter === 'low') {
      result = result.filter(p => p.stock > 0 && p.stock <= 10);
    } else if (filter === 'out') {
      result = result.filter(p => p.stock === 0);
    } else if (filter === 'healthy') {
      result = result.filter(p => p.stock > 10);
    }
    return result;
  }, [products, filter, searchTerm]);

  const quickRestock = (productId, amount) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      updateProduct(productId, { stock: product.stock + amount });
      showToast(`Added ${amount} to ${product.name}`, 'success');
    }
  };

  return (
    <AdminLayout>
      <div className="admin-inventory">
        <PageHeader
          title="Inventory Management"
          subtitle="Monitor and manage stock levels"
          breadcrumb={[{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Inventory' }]}
        />
        <div className="card" style={{ marginBottom: '20px' }}>
          <div className="card__body" style={{ padding: '20px' }}>
            <div className="grid-3" style={{ gap: '16px', alignItems: 'end' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label htmlFor="inv-search" className="input-label">Search Products</label>
                <input
                  id="inv-search"
                  type="search"
                  className="input"
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label htmlFor="inv-filter" className="input-label">Stock Filter</label>
                <select
                  id="inv-filter"
                  className="input select"
                  value={filter}
                  onChange={e => setFilter(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="healthy">Healthy (10+)</option>
                  <option value="low">Low Stock (1-10)</option>
                  <option value="out">Out of Stock (0)</option>
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
                  <th scope="col">Product</th>
                  <th scope="col">Category</th>
                  <th scope="col">Unit</th>
                  <th scope="col">Stock</th>
                  <th scope="col">Status</th>
                  <th scope="col">Quick Restock</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div className="product-cell">
                        <span className="product-cell__emoji">{p.icon}</span>
                        <span>{p.name}</span>
                      </div>
                    </td>
                    <td>{p.category}</td>
                    <td>{p.unit}</td>
                    <td><strong>{p.stock}</strong></td>
                    <td>
                      <span className={`badge badge--${p.stock === 0 ? 'danger' : p.stock <= 10 ? 'warning' : 'success'}`}>
                        {p.stock === 0 ? 'Out of Stock' : p.stock <= 10 ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons" style={{ gap: '4px' }}>
                        <button className="btn btn--ghost btn--sm" onClick={() => quickRestock(p.id, 10)} disabled={p.stock === 0}>+10</button>
                        <button className="btn btn--ghost btn--sm" onClick={() => quickRestock(p.id, 25)} disabled={p.stock === 0}>+25</button>
                        <button className="btn btn--ghost btn--sm" onClick={() => quickRestock(p.id, 50)} disabled={p.stock === 0}>+50</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredProducts.length === 0 && (
            <div className="empty-state" style={{ padding: '60px' }}>
              <div className="empty-state__icon">📦</div>
              <h3 className="empty-state__title">No products found</h3>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

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
                {item.href ? (
                  <a href={item.href} className="breadcrumb__link">{item.label}</a>
                ) : (
                  <span className="breadcrumb__current" aria-current="page">{item.label}</span>
                )}
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

export default AdminInventory;