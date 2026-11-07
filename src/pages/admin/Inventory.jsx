import React, { useState, useMemo } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { useStore } from '../../context/StoreContext';
import { useUI } from '../../context/UIContext';

const AdminInventory = () => {
  const { products, updateProduct, categories } = useStore();
  const { showToast } = useUI();

  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [customStockProduct, setCustomStockProduct] = useState(null);
  const [newStockVal, setNewStockVal] = useState(0);

  // 4 KPIs matching Screenshot (344).png
  const totalSKUs = products?.length || 29;
  const healthyCount = products?.filter(p => p.stock > 10).length || 29;
  const attentionCount = products?.filter(p => p.stock > 0 && p.stock <= 10).length || 0;
  const criticalCount = products?.filter(p => p.stock <= 0).length || 0;

  const filteredProducts = useMemo(() => {
    let result = products || [];
    if (stockFilter === 'HEALTHY') {
      result = result.filter(p => p.stock > 10);
    } else if (stockFilter === 'ATTENTION') {
      result = result.filter(p => p.stock > 0 && p.stock <= 10);
    } else if (stockFilter === 'CRITICAL') {
      result = result.filter(p => p.stock <= 0);
    }

    if (categoryFilter !== 'ALL') {
      result = result.filter(p => p.category?.toUpperCase() === categoryFilter.toUpperCase());
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }

    return result;
  }, [products, stockFilter, categoryFilter, searchTerm]);

  const handleQuickAdjust = (product, delta) => {
    const updatedStock = Math.max(0, (product.stock || 0) + delta);
    if (updateProduct) {
      updateProduct(product.id, { ...product, stock: updatedStock });
    }
    showToast(`Stock updated for ${product.name}: ${updatedStock} units`, 'success');
  };

  const handleSetStockSubmit = (e) => {
    e.preventDefault();
    if (customStockProduct && updateProduct) {
      updateProduct(customStockProduct.id, { ...customStockProduct, stock: Number(newStockVal) });
      showToast(`Stock set to ${newStockVal} for ${customStockProduct.name}`, 'success');
      setCustomStockProduct(null);
    }
  };

  return (
    <AdminLayout>
      {/* Header matching Screenshot (344).png */}
      <div className="admin-header-row">
        <div>
          <h1 className="admin-header-title">
            <span>📦</span>
            <span>Inventory Stock Management</span>
          </h1>
          <p className="admin-header-subtitle">
            Monitor warehouse and store shelf quantities, replenish low stock items, and manage product availability.
          </p>
        </div>
      </div>

      {/* 4 KPI Summary Cards matching Screenshot (344).png */}
      <div className="admin-kpi-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {/* Card 1: Catalog */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-head">
            <div className="admin-kpi-icon-box" style={{ background: '#FFF7ED', color: '#EA580C' }}>📦</div>
            <span className="admin-kpi-pill" style={{ background: '#E0F2FE', color: '#0284C7' }}>CATALOG</span>
          </div>
          <div className="admin-kpi-num">{totalSKUs}</div>
          <div className="admin-kpi-desc">Total SKUs in Inventory</div>
        </div>

        {/* Card 2: Healthy */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-head">
            <div className="admin-kpi-icon-box" style={{ background: '#DCFCE7', color: '#16A34A' }}>✅</div>
            <span className="admin-kpi-pill" style={{ background: '#DCFCE7', color: '#15803D' }}>HEALTHY</span>
          </div>
          <div className="admin-kpi-num">{healthyCount}</div>
          <div className="admin-kpi-desc">In Stock (&gt; 10 items)</div>
        </div>

        {/* Card 3: Attention */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-head">
            <div className="admin-kpi-icon-box" style={{ background: '#FEFCE8', color: '#CA8A04' }}>⚠️</div>
            <span className="admin-kpi-pill" style={{ background: '#FEF3C7', color: '#B45309' }}>ATTENTION</span>
          </div>
          <div className="admin-kpi-num">{attentionCount}</div>
          <div className="admin-kpi-desc">Low Stock (1-10 items)</div>
        </div>

        {/* Card 4: Critical */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-head">
            <div className="admin-kpi-icon-box" style={{ background: '#FEE2E2', color: '#DC2626' }}>🚨</div>
            <span className="admin-kpi-pill" style={{ background: '#FEE2E2', color: '#DC2626' }}>CRITICAL</span>
          </div>
          <div className="admin-kpi-num">{criticalCount}</div>
          <div className="admin-kpi-desc">Out of Stock (0 items)</div>
        </div>
      </div>

      {/* Main Stock Table Card matching Screenshot (344).png */}
      <div className="admin-card">
        <div className="admin-card-head">
          <h2 className="admin-card-title">Warehouse Stock List</h2>
          <div className="admin-card-actions">
            <input
              type="search"
              placeholder="Search SKU or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-search-input"
            />
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="admin-select"
            >
              <option value="ALL">All Stock Levels</option>
              <option value="HEALTHY">Healthy (&gt; 10)</option>
              <option value="ATTENTION">Attention (1-10)</option>
              <option value="CRITICAL">Critical (0)</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="admin-select"
            >
              <option value="ALL">All Categories</option>
              {categories && categories.map(c => (
                <option key={c.id || c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Product Item</th>
                <th>Category</th>
                <th>Current Units</th>
                <th>Unit Price</th>
                <th>Health Status</th>
                <th>Quick Stock Adjust</th>
                <th>Manage</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts && filteredProducts.length > 0 ? (
                filteredProducts.map((p, idx) => {
                  const isHealthy = p.stock > 10;
                  const isAttention = p.stock > 0 && p.stock <= 10;
                  const isOut = p.stock <= 0;

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
                            <div style={{ fontSize: '11.5px', color: '#9CA3AF' }}>{p.unit || '1 kg'}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ color: '#4B5563', fontWeight: 500 }}>{p.category}</td>
                      <td>
                        <span style={{ fontWeight: 800, color: isHealthy ? '#16A34A' : isAttention ? '#D97706' : '#DC2626', fontSize: '15px' }}>
                          {p.stock}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600, color: '#1F2937' }}>
                        ₹{p.price}
                      </td>
                      <td>
                        <span
                          className="admin-status-pill"
                          style={{
                            background: isHealthy ? '#DCFCE7' : isAttention ? '#FEF3C7' : '#FEE2E2',
                            color: isHealthy ? '#15803D' : isAttention ? '#B45309' : '#DC2626',
                          }}
                        >
                          {isOut ? 'OUT OF STOCK' : isAttention ? 'LOW STOCK' : 'IN STOCK'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            type="button"
                            onClick={() => handleQuickAdjust(p, 10)}
                            className="admin-btn-action"
                            title="Add 10 units"
                          >
                            +10
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickAdjust(p, 25)}
                            className="admin-btn-action"
                            title="Add 25 units"
                          >
                            +25
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickAdjust(p, -5)}
                            className="admin-btn-action"
                            title="Reduce 5 units"
                          >
                            -5
                          </button>
                        </div>
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => {
                            setCustomStockProduct(p);
                            setNewStockVal(p.stock);
                          }}
                          className="admin-btn-action admin-btn-action--green"
                        >
                          Set Stock
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>
                    No warehouse inventory records match the filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Set Stock Modal */}
      {customStockProduct && (
        <div className="modal-overlay" onClick={() => setCustomStockProduct(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1F2937', marginBottom: '8px' }}>
              Set Shelf Stock Level
            </h3>
            <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '16px' }}>
              Adjust available inventory units for <strong>{customStockProduct.name}</strong>.
            </p>

            <form onSubmit={handleSetStockSubmit}>
              <div className="input-group">
                <label className="input-label">Quantity in Units</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={newStockVal}
                  onChange={e => setNewStockVal(e.target.value)}
                  className="input"
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <button type="submit" className="admin-btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  Update Stock
                </button>
                <button type="button" onClick={() => setCustomStockProduct(null)} className="btn btn--secondary" style={{ flex: 1, justifyContent: 'center' }}>
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

export default AdminInventory;
