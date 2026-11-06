import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';

const CustomerDashboard = () => {
  const { products, categories, addToCart, getCartCount } = useStore();
  const { user: _user, isAuthenticated: _isAuthenticated, isCustomer: _isCustomer, protectPage } = useAuth();
  const { showToast, openModal, searchQuery, setSearchQuery } = useUI();
  const [_cartCount, _setCartCount] = useState(0);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalQty, setModalQty] = useState(1);

  useEffect(() => {
    protectPage('user');
  }, [protectPage]);

  useEffect(() => {
    const updateCount = () => setCartCount(getCartCount());
    updateCount();
    window.addEventListener('cart-updated', updateCount);
    return () => window.removeEventListener('cart-updated', updateCount);
  }, [getCartCount]);

  useEffect(() => {
    let filtered = products.filter(p => p.active);
    if (activeCategory !== 'all') {
      filtered = filtered.filter(p => p.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      );
    }
    setFilteredProducts(filtered);
  }, [products, activeCategory, searchQuery]);

  const handleAddToCart = (productId, qty = 1) => {
    if (addToCart(productId, qty)) {
      showToast('Added to cart!', 'success');
      window.dispatchEvent(new CustomEvent('cart-updated'));
      if (selectedProduct) setSelectedProduct(null);
    }
  };

  const openProductModal = (product) => {
    setSelectedProduct(product);
    setModalQty(1);
    openModal('productDetail');
  };

  return (
    <CustomerLayout>
      <div className="customer-dashboard">
        <PageHeader
          title="Shop Groceries"
          subtitle="Browse and add items to your cart"
          breadcrumb={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Shop' }
          ]}
        />

        <div className="dashboard-toolbar">
          <div className="search-box" style={{ flex: 1, maxWidth: '400px' }}>
            <input
              type="search"
              className="search-input"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search products"
            />
          </div>
        </div>

        <div className="filter-pills" role="group" aria-label="Filter by category">
          <button
            className={`filter-pill ${activeCategory === 'all' ? 'filter-pill--active' : ''}`}
            onClick={() => setActiveCategory('all')}
            role="tab"
            aria-selected={activeCategory === 'all'}
          >
            All Items
          </button>
          {categories.filter(c => c.active).map(category => (
            <button
              key={category.id}
              className={`filter-pill ${activeCategory === category.name ? 'filter-pill--active' : ''}`}
              onClick={() => setActiveCategory(category.name)}
              role="tab"
              aria-selected={activeCategory === category.name}
            >
              {category.name}
            </button>
          ))}
        </div>

        <div className="product-grid" role="list">
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
              onViewDetails={openProductModal}
            />
          ))}
          {filteredProducts.length === 0 && (
            <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
              <div className="empty-state__icon">🔍</div>
              <h3 className="empty-state__title">No products found</h3>
              <p className="empty-state__desc">Try adjusting your filters or search terms</p>
            </div>
          )}
        </div>

        {selectedProduct && (
          <ProductModal
            product={selectedProduct}
            quantity={modalQty}
            onQuantityChange={setModalQty}
            onAddToCart={handleAddToCart}
            onClose={() => setSelectedProduct(null)}
          />
        )}
      </div>
    </CustomerLayout>
  );
};

const ProductCard = ({ product, onAddToCart, onViewDetails }) => {
  const discount = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;
  const outOfStock = product.stock <= 0;

  return (
    <article className="product-card card" role="listitem">
      <div className="product-card__badges">
        {discount > 0 && <span className="badge badge--discount">-{discount}%</span>}
        {product.featured && <span className="badge badge--featured">Featured</span>}
        {outOfStock && <span className="badge badge--danger">Out of Stock</span>}
      </div>
      <button
        className="product-card__image-btn"
        onClick={() => onViewDetails(product)}
        aria-label={`View details for ${product.name}`}
      >
        <span className="product-card__emoji">{product.icon}</span>
      </button>
      <div className="product-card__content">
        <h3 className="product-card__name">{product.name}</h3>
        <p className="product-card__meta">{product.category} • {product.unit}</p>
        <div className="product-card__rating">
          <span className="product-card__stars" aria-label={`${product.rating} out of 5 stars`}>
            {'★'.repeat(Math.floor(product.rating))}{'☆'.repeat(5 - Math.floor(product.rating))}
          </span>
          <span className="product-card__rating-value">{product.rating}</span>
        </div>
        <div className="product-card__price">
          <span className="product-card__current-price">₹{product.price}</span>
          {product.originalPrice > product.price && (
            <span className="product-card__original-price">₹{product.originalPrice}</span>
          )}
          <span className="product-card__unit">/{product.unit}</span>
        </div>
      </div>
      <button
        className="btn btn--primary btn--full product-card__add-btn"
        onClick={() => onAddToCart(product.id)}
        disabled={outOfStock}
        aria-label={outOfStock ? `${product.name} is out of stock` : `Add ${product.name} to cart`}
      >
        {outOfStock ? 'Out of Stock' : 'Add to Cart'}
      </button>
    </article>
  );
};

const ProductModal = ({ product, quantity, onQuantityChange, onAddToCart, onClose }) => {
  const discount = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal modal--product" onClick={e => e.stopPropagation()}>
        <div className="modal__header">
          <h2 id="modal-title" className="modal__title">{product.name}</h2>
          <button className="modal__close" onClick={onClose} aria-label="Close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div className="modal__body">
          <div className="product-modal__main">
            <div className="product-modal__image">
              <span className="product-modal__emoji">{product.icon}</span>
            </div>
            <div className="product-modal__info">
              <div className="product-modal__badges">
                {discount > 0 && <span className="badge badge--discount">-{discount}%</span>}
                {product.featured && <span className="badge badge--featured">Featured</span>}
              </div>
              <h3 className="product-modal__name">{product.name}</h3>
              <p className="product-modal__meta">{product.category} • {product.unit}</p>
              <div className="product-modal__rating">
                <span className="product-modal__stars" aria-label={`${product.rating} out of 5 stars`}>
                  {'★'.repeat(Math.floor(product.rating))}{'☆'.repeat(5 - Math.floor(product.rating))}
                </span>
                <span className="product-modal__rating-value">{product.rating}</span>
                <span className="product-modal__stock">
                  {product.stock > 10 ? 'In Stock' : product.stock > 0 ? `Only ${product.stock} left` : 'Out of Stock'}
                </span>
              </div>
              <p className="product-modal__description">{product.description}</p>
              <div className="product-modal__price">
                <span className="product-modal__current-price">₹{product.price}</span>
                {product.originalPrice > product.price && (
                  <span className="product-modal__original-price">₹{product.originalPrice}</span>
                )}
                <span className="product-modal__unit">/{product.unit}</span>
              </div>
              <div className="product-modal__quantity">
                <label className="input-label">Quantity</label>
                <div className="quantity-control" style={{ width: 'fit-content' }}>
                  <button
                    className="quantity-btn"
                    onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                  >−</button>
                  <span className="quantity-value">{quantity}</span>
                  <button
                    className="quantity-btn"
                    onClick={() => onQuantityChange(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                    aria-label="Increase quantity"
                  >+</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="modal__footer">
          <button className="btn btn--secondary" onClick={onClose}>Cancel</button>
          <button
            className="btn btn--primary btn--lg"
            onClick={() => onAddToCart(product.id, quantity)}
            disabled={product.stock <= 0}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

const PageHeader = ({ title, subtitle, breadcrumb }) => (
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
  </header>
);

const CustomerLayout = ({ children }) => (
  <div className="customer-layout">
    <main className="customer-layout__content" role="main">
      <div className="container">{children}</div>
    </main>
  </div>
);

export default CustomerDashboard;