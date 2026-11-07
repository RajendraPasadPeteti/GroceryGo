import React, { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { useUI } from '../../context/UIContext';

const filterCategories = [
  { id: 'all', label: 'All Items', icon: '' },
  { id: 'Fruits', label: 'Fruits', icon: '🍎' },
  { id: 'Vegetables', label: 'Vegetables', icon: '🥦' },
  { id: 'Dairy', label: 'Dairy', icon: '🥛' },
  { id: 'Bakery', label: 'Bakery', icon: '🍞' },
  { id: 'Snacks', label: 'Snacks', icon: '🍪' },
  { id: 'Beverages', label: 'Beverages', icon: '🥤' },
  { id: 'Groceries', label: 'Groceries', icon: '🥫' },
  { id: 'Household', label: 'Household', icon: '🧼' },
];

const Products = () => {
  const { products, addToCart } = useStore();
  const { showToast } = useUI();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'all');
  const [searchKeyword, setSearchKeyword] = useState(searchParams.get('search') || '');
  const [addedItems, setAddedItems] = useState({});

  const filteredProducts = useMemo(() => {
    let result = products.filter(p => p.active !== false);

    if (activeCategory !== 'all') {
      result = result.filter(p => p.category.toLowerCase().includes(activeCategory.toLowerCase()));
    }

    if (searchKeyword.trim()) {
      const q = searchKeyword.toLowerCase().trim();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    }

    return result;
  }, [products, activeCategory, searchKeyword]);

  const handleCategorySelect = (catId) => {
    setActiveCategory(catId);
    if (catId === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', catId);
    }
    setSearchParams(searchParams);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchKeyword) {
      searchParams.set('search', searchKeyword);
    } else {
      searchParams.delete('search');
    }
    setSearchParams(searchParams);
  };

  const handleAddToCart = (product, e) => {
    e.stopPropagation();
    addToCart(product.id, 1);
    setAddedItems(prev => ({ ...prev, [product.id]: (prev[product.id] || 0) + 1 }));
    showToast(`${product.name} added to cart!`, 'success');
    window.dispatchEvent(new CustomEvent('cart-updated'));
  };

  return (
    <div style={{ background: '#F8FAF9', minHeight: '80vh', padding: '32px 0 64px' }}>
      <div className="container">
        {/* Search Bar matching Screenshot (330).png */}
        <form onSubmit={handleSearchSubmit} style={{ maxWidth: '640px', margin: '0 auto 28px', position: 'relative' }}>
          <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px', color: '#9CA3AF' }}>
            🔍
          </span>
          <input
            type="search"
            placeholder="Search by grocery name, category, or keyword..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            style={{
              width: '100%',
              height: '48px',
              padding: '0 20px 0 46px',
              border: '1px solid #E5E7EB',
              borderRadius: '9999px',
              background: '#FFFFFF',
              fontSize: '14.5px',
              color: '#1F2937',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
              outline: 'none',
            }}
          />
        </form>

        {/* Category Pills matching Screenshot (330).png */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            overflowX: 'auto',
            paddingBottom: '16px',
            marginBottom: '24px',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          {filterCategories.map(cat => {
            const isActive = activeCategory.toLowerCase() === cat.id.toLowerCase();
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategorySelect(cat.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 18px',
                  borderRadius: '9999px',
                  border: isActive ? '1px solid #16A34A' : '1px solid #E5E7EB',
                  background: isActive ? '#16A34A' : '#FFFFFF',
                  color: isActive ? '#FFFFFF' : '#374151',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 120ms ease',
                  boxShadow: isActive ? '0 2px 4px rgba(22, 163, 74, 0.2)' : 'none',
                }}
              >
                {cat.icon && <span aria-hidden="true">{cat.icon}</span>}
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Header row with count */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#1F2937' }}>
            {activeCategory === 'all' ? 'All Products' : activeCategory}
          </h2>
          <span style={{ fontSize: '14px', color: '#6B7280', fontWeight: 500 }}>
            {filteredProducts.length} products available
          </span>
        </div>

        {/* 4-Column Product Grid matching Screenshot (330).png */}
        {filteredProducts.length > 0 ? (
          <div className="product-grid">
            {filteredProducts.map(p => {
              const inStock = p.stock > 0;
              return (
                <div
                  key={p.id}
                  className="catalog-product-card"
                  onClick={() => navigate(`/products/${p.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <span
                    className={`badge ${inStock ? 'badge--primary' : 'badge--danger'}`}
                    style={{ position: 'absolute', top: '14px', left: '14px', fontSize: '11px', fontWeight: 700 }}
                  >
                    {inStock ? 'IN STOCK' : 'OUT OF STOCK'}
                  </span>

                  <div className="catalog-product-card__image-container">
                    <span>{p.icon || '🍏'}</span>
                  </div>

                  <h3 className="catalog-product-card__title">{p.name}</h3>
                  <div className="catalog-product-card__subtitle">
                    {p.category} • {p.unit || '1 kg'}
                  </div>

                  <p className="catalog-product-card__desc">
                    {p.description || 'Farm-fresh quality handpicked grocery item for everyday essentials.'}
                  </p>

                  <div className="catalog-product-card__footer">
                    <div>
                      <span className="catalog-product-card__price">₹{p.price}</span>
                      {p.originalPrice && (
                        <span className="catalog-product-card__original-price">₹{p.originalPrice}</span>
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={!inStock}
                      onClick={(e) => handleAddToCart(p, e)}
                      className="catalog-product-card__add-btn"
                    >
                      {addedItems[p.id] ? `ADD (${addedItems[p.id]})` : 'ADD +'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state" style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '64px' }}>
            <div className="empty-state__icon">🔍</div>
            <h3 className="empty-state__title">No matching groceries found</h3>
            <p className="empty-state__desc">Try checking your spelling or clearing active search filters.</p>
            <button
              type="button"
              onClick={() => { setActiveCategory('all'); setSearchKeyword(''); }}
              className="btn btn--primary"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
