import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProductById, products, addToCart, addReview, getReviews } = useStore();
  const { user, isAuthenticated, protectPage } = useAuth();
  const { showToast } = useUI();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [reviewForm, setReviewForm] = useState({ rating: 0, title: '', comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    protectPage('user');
    const productData = getProductById(id);
    if (!productData) {
      showToast('Product not found', 'error');
      navigate('/products');
      return;
    }
    setProduct(productData);

    const productReviews = getReviews().filter(r => r.productId === id);
    setReviews(productReviews);

    const related = products
      .filter(p => p.active && p.id !== id && p.category === productData.category)
      .slice(0, 4);
    setRelatedProducts(related);
  }, [id, getProductById, products, getReviews, navigate, protectPage, showToast]);

  const handleQuantityChange = useCallback((delta) => {
    if (product) {
      setQuantity(prev => Math.max(1, Math.min(product.stock, prev + delta)));
    }
  }, [product]);

  const handleAddToCart = useCallback(() => {
    if (!product) return;
    if (quantity > product.stock) {
      showToast('Not enough stock available', 'error');
      return;
    }
    addToCart(product.id, quantity);
    showToast(`${product.name} added to cart`, 'success');
  }, [product, quantity, addToCart, showToast]);

  const handleBuyNow = useCallback(() => {
    if (!product) return;
    if (quantity > product.stock) {
      showToast('Not enough stock available', 'error');
      return;
    }
    addToCart(product.id, quantity);
    navigate('/checkout');
  }, [product, quantity, addToCart, navigate]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast('Please login to write a review', 'error');
      navigate('/login');
      return;
    }
    if (reviewForm.rating === 0) {
      showToast('Please select a rating', 'error');
      return;
    }
    if (!reviewForm.comment.trim()) {
      showToast('Please write a review', 'error');
      return;
    }
    setSubmittingReview(true);
    try {
      addReview({
        productId: id,
        userId: user.id,
        userName: user.name,
        rating: reviewForm.rating,
        title: reviewForm.title,
        comment: reviewForm.comment,
      });
      showToast('Review submitted successfully', 'success');
      setReviewForm({ rating: 0, title: '', comment: '' });
      setShowReviewModal(false);
      const updatedReviews = getReviews().filter(r => r.productId === id);
      setReviews(updatedReviews);
    } catch {
      showToast('Failed to submit review', 'error');
    }
    setSubmittingReview(false);
  };

  if (!product) {
    return (
      <div className="product-detail-page">
        <div className="card" style={{ maxWidth: '400px', margin: 'var(--space-16) auto', padding: 'var(--space-12)', textAlign: 'center' }} role="status" aria-label="Loading product">
          <div className="spinner" style={{ margin: '0 auto var(--space-4)' }}></div>
          <p style={{ color: 'var(--color-text-secondary)' }}>Loading product...</p>
        </div>
      </div>
    );
  }

  const discount = product.mrp && product.price < product.mrp
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    percentage: reviews.length > 0 ? (reviews.filter(r => r.rating === star).length / reviews.length) * 100 : 0,
  }));

  const renderStars = (value, size = 'md') => {
    const fullStars = Math.floor(value);
    const hasHalfStar = value % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    const starSize = size === 'lg' ? '1.5rem' : size === 'sm' ? '0.875rem' : '1.125rem';

    return (
      <div className="rating rating--readonly" style={{ fontSize: starSize, display: 'inline-flex', gap: '2px' }} aria-label={`${value} out of 5 stars`}>
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

  return (
    <div className="product-detail-page">
      <header className="page-header" role="heading" aria-level="1">
        <div className="page-header__left">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <ol className="breadcrumb__list">
              <li className="breadcrumb__item"><Link to="/" className="breadcrumb__link">Home</Link></li>
              <li className="breadcrumb__item"><svg className="breadcrumb__separator" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><polyline points="9 18 15 12 9 6"></polyline></svg><Link to="/products" className="breadcrumb__link">Products</Link></li>
              <li className="breadcrumb__item"><svg className="breadcrumb__separator" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><polyline points="9 18 15 12 9 6"></polyline></svg><Link to={`/products?category=${encodeURIComponent(product.category)}`} className="breadcrumb__link">{product.category}</Link></li>
              <li className="breadcrumb__item"><svg className="breadcrumb__separator" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><polyline points="9 18 15 12 9 6"></polyline></svg><span className="breadcrumb__current" aria-current="page">{product.name}</span></li>
            </ol>
          </nav>
          <div>
            <h1 className="page-header__title">{product.name}</h1>
            <p className="page-header__subtitle">{product.category}</p>
          </div>
        </div>
      </header>

      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 480px', gap: 'var(--space-8)' }}>
          {/* Product Gallery */}
          <section aria-labelledby="product-title">
            <div className="card" style={{ position: 'relative', aspectRatio: '1', background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: 'var(--radius-xl)' }}>
              <span style={{ fontSize: '6rem' }}>{product.icon}</span>
              {product.badges && product.badges.length > 0 && (
                <div style={{ position: 'absolute', top: 'var(--space-4)', left: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  {product.badges.map((badge, i) => (
                    <span key={i} className={`badge badge--${badge.type || 'primary'}`}>{badge.text}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Stock indicator */}
            <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-4)', background: product.stock > 10 ? 'var(--color-success-bg)' : product.stock > 0 ? 'var(--color-warning-bg)' : 'var(--color-error-bg)', borderRadius: 'var(--radius-md)', border: product.stock > 10 ? '1px solid var(--color-success)' : product.stock > 0 ? '1px solid var(--color-warning)' : '1px solid var(--color-error)' }}>
              {product.stock > 10 ? (
                <span style={{ color: 'var(--color-primary-dark)', fontWeight: '500' }}>✅ In Stock ({product.stock} {product.unit} available)</span>
              ) : product.stock > 0 ? (
                <span style={{ color: '#B45309', fontWeight: '500' }}>⚠️ Only {product.stock} {product.unit} left!</span>
              ) : (
                <span style={{ color: 'var(--color-error)', fontWeight: '500' }}>❌ Out of Stock</span>
              )}
            </div>
          </section>

          {/* Product Info */}
          <section aria-labelledby="product-title">
            <div className="product-info" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
              <h1 id="product-title" className="display-1" style={{ marginBottom: 'var(--space-2)' }}>{product.name}</h1>

              <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
                <span className="badge badge--outline">{product.category}</span>
                <span className="badge badge--outline">{product.unit}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                {renderStars(avgRating, 'lg')}
                {reviews.length > 0 && (
                  <button className="btn btn--ghost btn--sm" onClick={() => setActiveTab('reviews')}>
                    {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                <span className="display-2" style={{ color: 'var(--color-primary)' }}>₹{product.price}</span>
                {discount > 0 && (
                  <>
                    <span className="text-lg" style={{ color: 'var(--color-text-secondary)', textDecoration: 'line-through' }}>₹{product.mrp}</span>
                    <span className="badge badge--discount">{discount}% OFF</span>
                  </>
                )}
              </div>

              {product.description && (
                <div className="card" style={{ padding: 'var(--space-6)' }}>
                  <h3 className="text-lg font-semibold" style={{ marginBottom: 'var(--space-3)' }}>Description</h3>
                  <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.7' }}>{product.description}</p>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="card" style={{ padding: 'var(--space-6)' }}>
                <label htmlFor="quantity" className="input-label" style={{ marginBottom: 'var(--space-3)' }}>Quantity</label>
                <div className="quantity-control" role="group" aria-label="Product quantity" style={{ maxWidth: '200px', marginBottom: 'var(--space-3)' }}>
                  <button
                    className="quantity-btn"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  </button>
                  <input
                    id="quantity"
                    type="number"
                    className="quantity-value"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                    min={1}
                    max={product.stock}
                    readOnly
                    aria-label="Quantity"
                  />
                  <button
                    className="quantity-btn"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stock}
                    aria-label="Increase quantity"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  </button>
                </div>
                <p className="input-helper">Available: {product.stock} {product.unit}</p>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                <button
                  className="btn btn--primary btn--lg btn--full"
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  style={{ flex: '2' }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" style={{ marginRight: 'var(--space-2)' }}>
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                  Add to Cart
                </button>
                <button
                  className="btn btn--secondary btn--lg"
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  style={{ flex: '1' }}
                >
                  Buy Now
                </button>
              </div>

              {/* Wishlist/Share */}
              <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                <button className="btn btn--ghost" aria-label="Add to wishlist">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" style={{ marginRight: 'var(--space-2)' }}>
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                  Wishlist
                </button>
                <button className="btn btn--ghost" aria-label="Share product">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" style={{ marginRight: 'var(--space-2)' }}>
                    <circle cx="18" cy="5" r="3"></circle>
                    <circle cx="6" cy="12" r="3"></circle>
                    <circle cx="18" cy="19" r="3"></circle>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                  </svg>
                  Share
                </button>
              </div>

              {/* Trust Badges */}
              <div style={{ display: 'flex', gap: 'var(--space-6)', flexWrap: 'wrap', marginTop: 'var(--space-4)', paddingTop: 'var(--space-6)', borderTop: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-text-secondary)' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                  <span>Secure Payment</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-text-secondary)' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                  </svg>
                  <span>Easy Returns</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-text-secondary)' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M21 12.79A9 9 0 1 1 14.21 3 7 7 0 0 0 21 12.79z"></path>
                  </svg>
                  <span>Fast Delivery</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Product Tabs */}
        <section aria-labelledby="tabs-heading" style={{ marginTop: 'var(--space-16)' }}>
          <div role="tablist" style={{ display: 'flex', gap: 'var(--space-1)', borderBottom: '1px solid var(--color-border)', marginBottom: 'var(--space-6)' }}>
            <button
              role="tab"
              aria-selected={activeTab === 'description'}
              className={`btn btn--ghost ${activeTab === 'description' ? 'btn--primary' : ''}`}
              onClick={() => setActiveTab('description')}
              id="tab-description"
              aria-controls="panel-description"
              style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0', borderBottom: 'none', padding: 'var(--space-3) var(--space-6)' }}
            >
              📝 Description
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'specifications'}
              className={`btn btn--ghost ${activeTab === 'specifications' ? 'btn--primary' : ''}`}
              onClick={() => setActiveTab('specifications')}
              id="tab-specifications"
              aria-controls="panel-specifications"
              style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0', borderBottom: 'none', padding: 'var(--space-3) var(--space-6)' }}
            >
              📋 Specifications
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'reviews'}
              className={`btn btn--ghost ${activeTab === 'reviews' ? 'btn--primary' : ''}`}
              onClick={() => setActiveTab('reviews')}
              id="tab-reviews"
              aria-controls="panel-reviews"
              style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0', borderBottom: 'none', padding: 'var(--space-3) var(--space-6)' }}
            >
              ⭐ Reviews ({reviews.length})
            </button>
          </div>

          <div style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: '0 0 var(--radius-xl) var(--radius-xl)', overflow: 'hidden' }}>
            {/* Description Panel */}
            <div
              role="tabpanel"
              id="panel-description"
              aria-labelledby="tab-description"
              hidden={activeTab !== 'description'}
              style={{ padding: 'var(--space-8)' }}
            >
              <h3 className="text-xl font-semibold" style={{ marginBottom: 'var(--space-4)' }}>Product Description</h3>
              <div style={{ color: 'var(--color-text-secondary)', lineHeight: '1.8' }}>
                {product.description ? (
                  <p>{product.description}</p>
                ) : (
                  <p>No description available for this product.</p>
                )}
              </div>
            </div>

            {/* Specifications Panel */}
            <div
              role="tabpanel"
              id="panel-specifications"
              aria-labelledby="tab-specifications"
              hidden={activeTab !== 'specifications'}
              style={{ padding: 'var(--space-8)' }}
            >
              <h3 className="text-xl font-semibold" style={{ marginBottom: 'var(--space-6)' }}>Specifications</h3>
              <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 'var(--space-4) var(--space-8)' }}>
                <div><dt className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Category</dt><dd className="font-medium">{product.category}</dd></div>
                <div><dt className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Unit</dt><dd className="font-medium">{product.unit}</dd></div>
                <div><dt className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Price</dt><dd className="font-medium" style={{ color: 'var(--color-primary)' }}>₹{product.price}</dd></div>
                {product.mrp && <><dt className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>MRP</dt><dd className="font-medium" style={{ color: 'var(--color-text-secondary)', textDecoration: 'line-through' }}>₹{product.mrp}</dd></>}
                <div><dt className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Stock Available</dt><dd className="font-medium">{product.stock} {product.unit}</dd></div>
                <div><dt className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Status</dt><dd className="font-medium">{product.active ? 'Active' : 'Inactive'}</dd></div>
                {product.brand && <><dt className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Brand</dt><dd className="font-medium">{product.brand}</dd></>}
                {product.origin && <><dt className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Origin</dt><dd className="font-medium">{product.origin}</dd></>}
                {product.shelfLife && <><dt className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Shelf Life</dt><dd className="font-medium">{product.shelfLife}</dd></>}
                {product.storageInstructions && <><dt className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Storage</dt><dd className="font-medium">{product.storageInstructions}</dd></>}
              </dl>
            </div>

            {/* Reviews Panel */}
            <div
              role="tabpanel"
              id="panel-reviews"
              aria-labelledby="tab-reviews"
              hidden={activeTab !== 'reviews'}
              style={{ padding: 'var(--space-8)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-8)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
                <h3 className="text-xl font-semibold">Customer Reviews</h3>
                {isAuthenticated() && (
                  <button className="btn btn--primary btn--sm" onClick={() => setShowReviewModal(true)}>
                    Write a Review
                  </button>
                )}
              </div>

              {reviews.length > 0 && (
                <div className="card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-8)', background: 'var(--color-bg)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 'var(--space-8)', alignItems: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div className="display-1" style={{ color: 'var(--color-primary)', fontWeight: '700' }}>{avgRating.toFixed(1)}</div>
                      {renderStars(avgRating, 'lg')}
                      <div className="text-sm" style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-2)' }}>{reviews.length} reviews</div>
                    </div>
                    <div role="img" aria-label="Rating distribution">
                      {ratingDistribution.map(({ star, percentage }) => (
                        <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
                          <span className="text-sm" style={{ color: 'var(--color-text-secondary)', minWidth: '40px' }}>{star}★</span>
                          <div style={{ flex: 1, height: '8px', background: 'var(--color-border)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                            <div
                              style={{ width: `${percentage}%`, height: '100%', background: 'var(--color-primary)', borderRadius: 'var(--radius-full)', transition: 'width 0.5s ease' }}
                              role="progressbar"
                              aria-valuenow={Math.round(percentage)}
                              aria-valuemin={0}
                              aria-valuemax={100}
                              aria-label={`${star} star: ${Math.round(percentage)}%`}
                            ></div>
                          </div>
                          <span className="text-sm" style={{ color: 'var(--color-text-secondary)', minWidth: '40px', textAlign: 'right' }}>{Math.round(percentage)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div>
                {reviews.length === 0 ? (
                  <div className="card" style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>⭐</div>
                    <h4 className="text-xl font-semibold" style={{ marginBottom: 'var(--space-2)' }}>No reviews yet</h4>
                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>Be the first to review this product!</p>
                    {isAuthenticated() && (
                      <button className="btn btn--primary" onClick={() => setShowReviewModal(true)}>
                        Write a Review
                      </button>
                    )}
                  </div>
                ) : (
                  reviews.map(review => (
                    <article key={review.id} className="card" style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-6)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                          <div className="avatar avatar--sm">{review.userName?.charAt(0).toUpperCase()}</div>
                          <div>
                            <strong>{review.userName}</strong>
                            <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{new Date(review.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</div>
                          </div>
                        </div>
                        {renderStars(review.rating, 'sm')}
                      </div>
                      {review.title && <h4 className="font-semibold" style={{ marginBottom: 'var(--space-2)' }}>{review.title}</h4>}
                      <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>{review.comment}</p>
                    </article>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section aria-labelledby="related-title" style={{ marginTop: 'var(--space-16)' }}>
            <h2 id="related-title" className="section-title">You May Also Like</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 'var(--space-6)' }}>
              {relatedProducts.map((p, i) => (
                <RelatedProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="modal-overlay" onClick={() => setShowReviewModal(false)} role="dialog" aria-modal="true" aria-labelledby="review-modal-title" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-4)', zIndex: 'var(--z-modal)' }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
            <div className="card__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 id="review-modal-title" className="text-xl font-semibold">Write a Review for {product.name}</h2>
              <button className="btn btn--ghost btn--icon" onClick={() => setShowReviewModal(false)} aria-label="Close review modal" style={{ padding: 'var(--space-2)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <form onSubmit={handleReviewSubmit} noValidate>
              <div className="card__body" style={{ padding: 'var(--space-6)' }}>
                <div className="input-group" style={{ marginBottom: 'var(--space-6)' }}>
                  <label className="input-label">Your Rating <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <div className="rating" role="radiogroup" aria-label="Select rating" style={{ fontSize: '2rem', display: 'flex', gap: 'var(--space-2)' }}>
                    {[5, 4, 3, 2, 1].map(star => (
                      <button
                        key={star}
                        type="button"
                        className={`rating__star ${reviewForm.rating >= star ? 'rating__star--filled' : ''}`}
                        onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                        role="radio"
                        aria-checked={reviewForm.rating >= star}
                        aria-label={`${star} star${star !== 1 ? 's' : ''}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div className="input-group" style={{ marginBottom: 'var(--space-6)' }}>
                  <label htmlFor="review-title" className="input-label">Review Title</label>
                  <input
                    id="review-title"
                    type="text"
                    className="input"
                    placeholder="Summarize your experience"
                    value={reviewForm.title}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="review-comment" className="input-label">Your Review <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <textarea
                    id="review-comment"
                    className="input"
                    placeholder="Share your detailed experience..."
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                    rows={4}
                    required
                  />
                </div>
              </div>
              <div className="card__footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', paddingTop: 'var(--space-4)' }}>
                <button type="button" className="btn btn--secondary" onClick={() => setShowReviewModal(false)}>Cancel</button>
                <button type="submit" className="btn btn--primary" disabled={submittingReview}>
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const RelatedProductCard = ({ product, index }) => {
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
      <div className="rating rating--readonly" style={{ fontSize: '1rem', display: 'inline-flex', gap: '1px' }}>
        {[...Array(fullStars)].map((_, i) => <span key={i} className="rating__star rating__star--filled">★</span>)}
        {hasHalfStar && <span className="rating__star rating__star--filled">★</span>}
        {[...Array(emptyStars)].map((_, i) => <span key={i} className="rating__star">★</span>)}
      </div>
    );
  };

  return (
    <article className="card card-hover" style={{ display: 'flex', flexDirection: 'column', animationDelay: `${index * 30}ms` }}>
      <Link to={`/products/${product.id}`} className="product-card__link" aria-label={`View ${product.name}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div style={{ position: 'relative', aspectRatio: '1', background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <span style={{ fontSize: '4rem' }}>{product.icon}</span>
          {discount > 0 && <span className="badge badge--discount" style={{ position: 'absolute', top: 'var(--space-3)', right: 'var(--space-3)' }}>{discount}% OFF</span>}
          {product.featured && <span className="badge badge--featured" style={{ position: 'absolute', top: 'var(--space-3)', left: 'var(--space-3)' }}>Featured</span>}
        </div>
        <div style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', flex: 1 }}>
          <p className="text-xs" style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-1)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{product.category}</p>
          <h3 className="text-base font-semibold" style={{ marginBottom: 'var(--space-1)' }}>{product.name}</h3>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-3)' }}>{product.unit}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
            <span className="text-xl font-bold" style={{ color: 'var(--color-primary)' }}>₹{product.price}</span>
            {product.mrp && product.price < product.mrp && <span className="text-sm" style={{ color: 'var(--color-text-secondary)', textDecoration: 'line-through' }}>₹{product.mrp}</span>}
          </div>
        </div>
      </Link>
      <div style={{ padding: 'var(--space-4)', paddingTop: 0, borderTop: '1px solid var(--color-border)', marginTop: 'auto' }}>
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
    </article>
  );
};

export default ProductDetail;