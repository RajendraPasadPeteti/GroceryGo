import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { useUI } from '../../context/UIContext';

const Products = () => {
  const { products, categories, addToCart } = useStore();
  const { showToast } = useUI();
  const [searchParams, setSearchParams] = useSearchParams();
  const [allProducts, setAllProducts] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'relevance');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [inStockOnly, setInStockOnly] = useState(searchParams.get('inStock') === 'true');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [viewMode, setViewMode] = useState('grid');
  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    setAllProducts(products.filter(p => p.active));
    setAllCategories(categories);
  }, [products, categories]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory) params.set('category', selectedCategory);
    if (searchQuery) params.set('search', searchQuery);
    if (sortBy !== 'relevance') params.set('sort', sortBy);
    if (inStockOnly) params.set('inStock', 'true');
    if (currentPage > 1) params.set('page', currentPage.toString());
    setSearchParams(params, { replace: true });
  }, [selectedCategory, searchQuery, sortBy, inStockOnly, currentPage, setSearchParams]);

  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
      );
    }

    if (selectedCategory) {
      result = result.filter(p => p.category === selectedCategory);
    }

    if (inStockOnly) {
      result = result.filter(p => p.stock > 0);
    }

    if (priceRange[0] > 0 || priceRange[1] < 1000) {
      result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
    }

    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
      case 'popular':
        result.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
        break;
      default:
        result.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return 0;
        });
    }

    return result;
  }, [allProducts, searchQuery, selectedCategory, inStockOnly, priceRange, sortBy]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const maxPrice = useMemo(() =>
    Math.ceil(Math.max(...allProducts.map(p => p.price), 1000) / 100) * 100,
    [allProducts]
  );

  useEffect(() => {
    setPriceRange([0, maxPrice]);
  }, [maxPrice]);

  const handleCategoryChange = useCallback((category) => {
    setSelectedCategory(category === selectedCategory ? '' : category);
    setCurrentPage(1);
  }, [selectedCategory]);

  const handleSortChange = useCallback((value) => {
    setSortBy(value);
    setCurrentPage(1);
  }, []);

  const handlePriceChange = useCallback((range) => {
    setPriceRange(range);
    setCurrentPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedCategory('');
    setSearchQuery('');
    setSortBy('relevance');
    setPriceRange([0, maxPrice]);
    setInStockOnly(false);
    setCurrentPage(1);
  }, [maxPrice]);

  const hasActiveFilters = selectedCategory || searchQuery || inStockOnly || priceRange[0] > 0 || priceRange[1] < maxPrice;

  return (
    <div className="products-page">
      <header className="page-header" role="heading" aria-level="1">
        <div className="page-header__left">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <ol className="breadcrumb__list">
              <li className="breadcrumb__item">
                <Link to="/" className="breadcrumb__link">Home</Link>
              </li>
              <li className="breadcrumb__item">
                <svg className="breadcrumb__separator" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><polyline points="9 18 15 12 9 6"></polyline></svg>
                <span className="breadcrumb__current" aria-current="page">Products</span>
              </li>
            </ol>
          </nav>
          <div>
            <h1 className="page-header__title">All Products</h1>
            <p className="page-header__subtitle">{filteredProducts.length} products found{searchQuery ? ` for "${searchQuery}"` : ''}</p>
          </div>
        </div>
      </header>

      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 'var(--space-8)' }}>
          {/* Sidebar Filters */}
          <aside aria-label="Product filters" style={{ position: 'sticky', top: 'var(--space-6)', height: 'fit-content' }}>
            <div className="card">
              <div className="card__header" style={{ paddingBottom: 'var(--space-4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 className="text-lg font-semibold">Filters</h3>
                  {hasActiveFilters && (
                    <button className="btn btn--ghost btn--sm" onClick={clearFilters}>Clear All</button>
                  )}
                </div>
              </div>
              <div className="card__body" style={{ paddingTop: 0 }}>
                {/* Search */}
                <div style={{ marginBottom: 'var(--space-6)' }}>
                  <label htmlFor="product-search" className="text-sm font-medium" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>Search Products</label>
                  <div className="search-box">
                    <input
                      id="product-search"
                      type="search"
                      className="search-input"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && setCurrentPage(1)}
                    />
                    <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                  </div>
                </div>

                {/* Categories */}
                <div style={{ marginBottom: 'var(--space-6)' }}>
                  <label className="text-sm font-medium" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>Categories</label>
                  <div role="group" aria-label="Product categories" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    {allCategories.map(cat => (
                      <label key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', transition: 'background var(--transition-fast)' }}>
                        <input
                          type="radio"
                          name="category"
                          value={cat.name}
                          checked={selectedCategory === cat.name}
                          onChange={() => handleCategoryChange(cat.name)}
                          style={{ accentColor: 'var(--color-primary)' }}
                        />
                        <span style={{ flex: 1 }}>{cat.name}</span>
                        <span className="badge badge--outline" style={{ fontSize: 'var(--text-xs)' }}>
                          {allProducts.filter(p => p.category === cat.name && p.active).length}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div style={{ marginBottom: 'var(--space-6)' }}>
                  <label className="text-sm font-medium" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>Price Range</label>
                  <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                    <input
                      type="number"
                      className="input input--sm"
                      value={priceRange[0]}
                      onChange={(e) => handlePriceChange([parseInt(e.target.value) || 0, priceRange[1]])}
                      min={0}
                      max={maxPrice}
                      placeholder="Min"
                      aria-label="Minimum price"
                      style={{ width: '80px' }}
                    />
                    <span style={{ display: 'flex', alignItems: 'center', color: 'var(--color-text-secondary)' }}>–</span>
                    <input
                      type="number"
                      className="input input--sm"
                      value={priceRange[1]}
                      onChange={(e) => handlePriceChange([priceRange[0], parseInt(e.target.value) || maxPrice])}
                      min={0}
                      max={maxPrice}
                      placeholder="Max"
                      aria-label="Maximum price"
                      style={{ width: '80px' }}
                    />
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={maxPrice}
                    value={priceRange[1]}
                    onChange={(e) => handlePriceChange([priceRange[0], parseInt(e.target.value)])}
                    aria-label="Maximum price"
                    style={{ width: '100%', accentColor: 'var(--color-primary)' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                    <span>₹0</span>
                    <span>₹{maxPrice}</span>
                  </div>
                </div>

                {/* Availability */}
                <div>
                  <label className="text-sm font-medium" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>Availability</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => { setInStockOnly(e.target.checked); setCurrentPage(1); }}
                      style={{ accentColor: 'var(--color-primary)', width: '18px', height: '18px' }}
                    />
                    <span>In Stock Only</span>
                  </label>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main role="main">
            {/* Toolbar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)', marginBottom: 'var(--space-6)', padding: 'var(--space-4)', background: 'var(--color-card-bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
              <div>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }} aria-live="polite">
                  Showing {paginatedProducts.length} of {filteredProducts.length} products
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <div>
                  <label htmlFor="sort-select" className="visually-hidden">Sort by</label>
                  <select
                    id="sort-select"
                    className="input input--sm"
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    style={{ minWidth: '200px' }}
                  >
                    <option value="relevance">Relevance</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="rating">Top Rated</option>
                    <option value="newest">Newest First</option>
                    <option value="popular">Most Popular</option>
                  </select>
                </div>
                <div role="group" aria-label="View mode" style={{ display: 'flex', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                  <button
                    className={`btn btn--ghost btn--sm ${viewMode === 'grid' ? 'btn--primary' : ''}`}
                    onClick={() => setViewMode('grid')}
                    aria-label="Grid view"
                    aria-pressed={viewMode === 'grid'}
                    style={{ borderRadius: 0, borderRight: '1px solid var(--color-border)' }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <rect x="3" y="3" width="7" height="7" rx="1"></rect>
                      <rect x="14" y="3" width="7" height="7" rx="1"></rect>
                      <rect x="3" y="14" width="7" height="7" rx="1"></rect>
                      <rect x="14" y="14" width="7" height="7" rx="1"></rect>
                    </svg>
                  </button>
                  <button
                    className={`btn btn--ghost btn--sm ${viewMode === 'list' ? 'btn--primary' : ''}`}
                    onClick={() => setViewMode('list')}
                    aria-label="List view"
                    aria-pressed={viewMode === 'list'}
                    style={{ borderRadius: 0 }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <line x1="3" y1="6" x2="21" y2="6"></line>
                      <line x1="3" y1="12" x2="21" y2="12"></line>
                      <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Products Grid/List */}
            {paginatedProducts.length > 0 ? (
              <div
                style={{
                  display: viewMode === 'grid' ? 'grid' : 'flex',
                  gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(240px, 1fr))' : undefined,
                  flexDirection: viewMode === 'list' ? 'column' : undefined,
                  gap: 'var(--space-6)'
                }}
                role="list"
                aria-label="Products"
              >
                {paginatedProducts.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} viewMode={viewMode} />
                ))}
              </div>
            ) : (
              <div className="card" style={{ textAlign: 'center', padding: 'var(--space-16)' }}>
                <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }}>🔍</div>
                <h3 className="text-xl font-semibold" style={{ marginBottom: 'var(--space-2)' }}>No products found</h3>
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>
                  {searchQuery ? `No products match "${searchQuery}"` : 'No products available in this category'}
                </p>
                {hasActiveFilters && (
                  <button className="btn btn--primary" onClick={clearFilters}>
                    Clear Filters
                  </button>
                )}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <nav className="pagination" aria-label="Product pagination" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-8)' }}>
                <button
                  className="btn btn--outline btn--sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                </button>
                <div role="group" aria-label="Page numbers" style={{ display: 'flex', gap: 'var(--space-1)' }}>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        className={`btn btn--sm ${currentPage === pageNum ? 'btn--primary' : 'btn--outline'}`}
                        onClick={() => setCurrentPage(pageNum)}
                        aria-label={`Page ${pageNum}`}
                        aria-current={currentPage === pageNum ? 'page' : undefined}
                        style={{ minWidth: '40px' }}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  className="btn btn--outline btn--sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </nav>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

const ProductCard = ({ product, index, viewMode }) => {
  const { addToCart } = useStore();
  const { showToast } = useUI();
  const [adding, setAdding] = useState(false);

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    setAdding(true);
    try {
      addToCart(product.id, 1);
      showToast(`${product.name} added to cart`, 'success');
    } catch {
      showToast('Failed to add to cart', 'error');
    }
    setAdding(false);
  };

  const discount = product.mrp && product.price < product.mrp
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;

  const renderStars = (value) => {
    const fullStars = Math.floor(value);
    const hasHalfStar = value % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    return (
      <div className="rating rating--readonly" aria-label={`${value} out of 5 stars`} style={{ display: 'flex', gap: '2px' }}>
        {[...Array(fullStars)].map((_, i) => (
          <span key={i} className="rating__star rating__star--filled" aria-hidden="true">★</span>
        ))}
        {hasHalfStar && <span className="rating__star rating__star--filled" aria-hidden="true">★</span>}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={i} className="rating__star" aria-hidden="true">★</span>
        ))}
      </div>
    );
  };

  if (viewMode === 'list') {
    return (
      <article className="card" role="listitem" style={{ display: 'grid', gridTemplateColumns: '100px 1fr auto', gap: 'var(--space-6)', alignItems: 'center', padding: 'var(--space-4)' }}>
        <div style={{ position: 'relative', aspectRatio: '1', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <span style={{ fontSize: '3rem' }}>{product.icon}</span>
          {discount > 0 && <span className="badge badge--discount" style={{ position: 'absolute', top: 'var(--space-2)', right: 'var(--space-2)' }}>{discount}% OFF</span>}
          {product.featured && <span className="badge badge--featured" style={{ position: 'absolute', top: 'var(--space-2)', left: 'var(--space-2)' }}>Featured</span>}
        </div>
        <div>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-1)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{product.category}</p>
          <h3 className="text-lg font-semibold" style={{ marginBottom: 'var(--space-1)' }}>{product.name}</h3>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)' }}>{product.description}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap', marginBottom: 'var(--space-2)' }}>
            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{product.unit}</span>
            {renderStars(product.rating || 0)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span className="text-xl font-bold" style={{ color: 'var(--color-primary)' }}>₹{product.price}</span>
            {product.mrp && product.price < product.mrp && (
              <span className="text-sm" style={{ color: 'var(--color-text-secondary)', textDecoration: 'line-through' }}>₹{product.mrp}</span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {product.stock > 0 ? (
            <button
              className="btn btn--primary"
              onClick={handleAddToCart}
              disabled={adding}
              aria-label={adding ? `Adding ${product.name} to cart` : `Add ${product.name} to cart`}
            >
              {adding ? 'Adding...' : 'Add to Cart'}
            </button>
          ) : (
            <button className="btn btn--secondary" disabled aria-label={`${product.name} is out of stock`}>
              Out of Stock
            </button>
          )}
        </div>
      </article>
    );
  }

  return (
    <article className="card card-hover" role="listitem" style={{ display: 'flex', flexDirection: 'column', animationDelay: `${index * 30}ms` }}>
      <div style={{ position: 'relative', aspectRatio: '1', background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <span style={{ fontSize: '4rem' }}>{product.icon}</span>
        {discount > 0 && (
          <span className="badge badge--discount" style={{ position: 'absolute', top: 'var(--space-3)', right: 'var(--space-3)' }}>{discount}% OFF</span>
        )}
        {product.featured && (
          <span className="badge badge--featured" style={{ position: 'absolute', top: 'var(--space-3)', left: 'var(--space-3)' }}>Featured</span>
        )}
        {product.stock === 0 && (
          <span className="badge badge--danger" style={{ position: 'absolute', bottom: 'var(--space-3)', left: 'var(--space-3)', right: 'var(--space-3)' }}>Out of Stock</span>
        )}
      </div>
      <div style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <p className="text-xs" style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-1)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{product.category}</p>
        <h3 className="text-base font-semibold" style={{ marginBottom: 'var(--space-1)' }}>{product.name}</h3>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-3)' }}>{product.unit}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
          <span className="text-xl font-bold" style={{ color: 'var(--color-primary)' }}>₹{product.price}</span>
          {product.mrp && product.price < product.mrp && (
            <span className="text-sm" style={{ color: 'var(--color-text-secondary)', textDecoration: 'line-through' }}>₹{product.mrp}</span>
          )}
        </div>
        <div style={{ marginTop: 'auto', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--color-border)' }}>
          {product.stock > 0 ? (
            <button
              className="btn btn--primary btn--full"
              onClick={handleAddToCart}
              disabled={adding}
              aria-label={adding ? `Adding ${product.name} to cart` : `Add ${product.name} to cart`}
            >
              {adding ? 'Adding...' : 'Add to Cart'}
            </button>
          ) : (
            <button className="btn btn--secondary btn--full" disabled aria-label={`${product.name} is out of stock`}>
              Out of Stock
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

export default Products;