import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';

const Home = () => {
  const { products } = useStore();
  const { isAuthenticated } = useAuth();
  const { showToast } = useUI();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (params.get('search')) {
      setSearchQuery(params.get('search'));
    }
  }, [searchParams]);

  useEffect(() => {
    const allProducts = products.filter(p => p.active && p.featured);
    setFeaturedProducts(allProducts.slice(0, 8));
  }, [products]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const handleCategoryClick = (category) => {
    window.location.href = `/products?category=${encodeURIComponent(category)}`;
  };

  const featuredCategories = [
    { name: 'Fruits & Vegetables', icon: '🥦' },
    { name: 'Dairy & Eggs', icon: '🥛' },
    { name: 'Bakery', icon: '🍞' },
    { name: 'Meat & Seafood', icon: '🍗' },
    { name: 'Beverages', icon: '🥤' },
    { name: 'Snacks', icon: '🍿' },
    { name: 'Pantry', icon: '🥫' },
    { name: 'Personal Care', icon: '🧴' },
  ];

  const heroStats = [
    { label: 'Cities Served', value: '50+', icon: '🏙️' },
    { label: 'Happy Customers', value: '10K+', icon: '😊' },
    { label: 'Products Available', value: '500+', icon: '🛒' },
    { label: 'Delivery Partners', value: '200+', icon: '🛵' },
  ];

  const benefits = [
    { icon: '🚚', title: 'Lightning Fast Delivery', desc: '15-30 minutes to your doorstep', highlight: 'No minimum order' },
    { icon: '🌱', title: 'Farm Fresh Quality', desc: 'Sourced directly from local farms', highlight: 'Quality guaranteed' },
    { icon: '💰', title: 'Best Prices', desc: 'Competitive pricing with daily deals', highlight: 'Save up to 30%' },
    { icon: '🔄', title: 'Easy Returns', desc: 'Hassle-free returns within 2 hours', highlight: 'No questions asked' },
    { icon: '📱', title: 'Real-time Tracking', desc: 'Live order tracking with rider details', highlight: 'ETA updates' },
    { icon: '🎁', title: 'Loyalty Rewards', desc: 'Earn coins on every purchase', highlight: 'Redeem for discounts' },
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="section" aria-labelledby="hero-title" style={{ paddingTop: 'var(--space-16)', paddingBottom: 'var(--space-16)', background: 'var(--color-bg)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-12)', alignItems: 'center' }}>
            <div>
              <h1 id="hero-title" className="display-1" style={{ marginBottom: 'var(--space-6)' }}>
                Fresh Groceries Delivered in <span style={{ color: 'var(--color-primary)' }}>15-30 Minutes</span>
              </h1>
              <p className="text-lg" style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-8)', maxWidth: '500px' }}>
                Quality products from local stores, delivered to your doorstep. No minimum order, free delivery above ₹300.
              </p>

              <form onSubmit={handleSearch} className="search-box" style={{ maxWidth: '500px' }} role="search">
                <label htmlFor="hero-search" className="visually-hidden">Search products</label>
                <input
                  id="hero-search"
                  type="search"
                  className="search-input"
                  placeholder="Search for fruits, vegetables, dairy & more..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoComplete="off"
                  style={{ paddingLeft: 'var(--space-12)', height: '56px', fontSize: 'var(--text-lg)' }}
                />
                <svg className="search-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <button type="submit" className="btn btn--primary btn--lg" style={{ position: 'absolute', right: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)' }}>
                  Search
                </button>
              </form>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-8)', marginTop: 'var(--space-10)' }} role="list" aria-label="Platform statistics">
                {heroStats.map((stat, i) => (
                  <div key={i} className="card" style={{ padding: 'var(--space-4) var(--space-6)', flex: '1', minWidth: '120px', textAlign: 'center' }} role="listitem">
                    <div style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-2)' }}>{stat.icon}</div>
                    <div className="display-2" style={{ color: 'var(--color-primary)', fontWeight: '700' }}>{stat.value}</div>
                    <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div aria-hidden="true" style={{ display: 'flex', justifyContent: 'center' }}>
              <div className="card" style={{ padding: 'var(--space-8)', maxWidth: '400px', width: '100%' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                  {[
                    { icon: '🍎', name: 'Fresh Apples', price: '₹120/kg', badge: '20% OFF' },
                    { icon: '🥛', name: 'Organic Milk', price: '₹55/L', badge: '15% OFF' },
                    { icon: '🍞', name: 'Artisan Bread', price: '₹45', badge: '10% OFF' },
                    { icon: '🥦', name: 'Farm Veggies', price: '₹80/kg', badge: '25% OFF' },
                  ].map((item, i) => (
                    <div key={i} className="card" style={{ padding: 'var(--space-4)', textAlign: 'center', background: 'var(--color-bg)' }}>
                      <div style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-2)' }}>{item.icon}</div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-lg font-bold" style={{ color: 'var(--color-primary)' }}>{item.price}</div>
                      <span className="badge badge--discount" style={{ marginTop: 'var(--space-2)', display: 'inline-block' }}>{item.badge}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <rect x="10" y="35" width="100" height="25" rx="5" fill="var(--color-primary)" opacity="0.9"/>
                    <rect x="25" y="20" width="70" height="15" rx="3" fill="var(--color-primary)" opacity="0.9"/>
                    <circle cx="30" cy="62" r="10" fill="#1f1f1f"/>
                    <circle cx="90" cy="62" r="10" fill="#1f1f1f"/>
                    <circle cx="30" cy="62" r="4" fill="var(--color-primary)"/>
                    <circle cx="90" cy="62" r="4" fill="var(--color-primary)"/>
                    <rect x="50" y="50" width="20" height="15" rx="2" fill="#22c55e"/>
                    <text x="55" y="62" fill="white" fontSize="8" fontWeight="bold">GO</text>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="section" aria-labelledby="categories-title">
        <div className="container">
          <header className="section-header">
            <div>
              <h2 id="categories-title" className="section-title">Shop by Category</h2>
              <p className="section-subtitle">Find everything you need, organized for easy browsing</p>
            </div>
          </header>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--space-4)' }} role="list">
            {featuredCategories.map((cat, i) => (
              <button
                key={i}
                className="card card-hover"
                onClick={() => handleCategoryClick(cat.name)}
                role="listitem"
                aria-label={`Shop ${cat.name}`}
                style={{ padding: 'var(--space-6)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-3)' }}
              >
                <div className="avatar avatar--lg" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)', fontSize: 'var(--text-2xl)' }}>{cat.icon}</div>
                <h3 className="text-base font-medium">{cat.name}</h3>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="section" aria-labelledby="featured-title">
        <div className="container">
          <header className="section-header">
            <div>
              <h2 id="featured-title" className="section-title">Featured Products</h2>
              <p className="section-subtitle">Handpicked fresh deals for you</p>
            </div>
            <Link to="/products" className="btn btn--ghost">View All Products</Link>
          </header>

          {featuredProducts.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 'var(--space-6)' }} role="list">
              {featuredProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          ) : (
            <div className="card" style={{ gridColumn: '1 / -1', padding: 'var(--space-12)', textAlign: 'center' }}>
              <div style={{ fontSize: 'var(--text-4xl)', marginBottom: 'var(--space-4)' }}>🛒</div>
              <h3 className="text-xl font-semibold" style={{ marginBottom: 'var(--space-2)' }}>No featured products yet</h3>
              <p style={{ color: 'var(--color-text-secondary)' }}>Check back later for special deals</p>
            </div>
          )}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="section" aria-labelledby="benefits-title" style={{ background: 'var(--color-bg)' }}>
        <div className="container">
          <h2 id="benefits-title" className="section-title text-center" style={{ marginBottom: 'var(--space-12)' }}>Why Choose GroceryGo?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-6)' }} role="list">
            {benefits.map((benefit, i) => (
              <article key={i} className="card card-hover" role="listitem" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
                <div style={{ fontSize: 'var(--text-4xl)', marginBottom: 'var(--space-4)' }}>{benefit.icon}</div>
                <h3 className="text-lg font-semibold" style={{ marginBottom: 'var(--space-2)' }}>{benefit.title}</h3>
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-3)' }}>{benefit.desc}</p>
                <span className="badge badge--primary">{benefit.highlight}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section" aria-labelledby="cta-title">
        <div className="container">
          <div className="card" style={{ padding: 'var(--space-12)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-12)', alignItems: 'center', background: 'linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-primary) 100%)', color: 'white' }}>
            <div>
              <h2 id="cta-title" className="display-1" style={{ color: 'white', marginBottom: 'var(--space-4)' }}>Ready to Start Shopping?</h2>
              <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 'var(--text-lg)', marginBottom: 'var(--space-8)' }}>Join thousands of happy customers getting fresh groceries delivered fast</p>
              <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
                <Link to="/products" className="btn btn--lg" style={{ background: 'white', color: 'var(--color-primary)', borderColor: 'white' }}>Shop Now</Link>
                {!isAuthenticated() && (
                  <Link to="/register" className="btn btn--outline btn--lg" style={{ borderColor: 'white', color: 'white' }}>Create Free Account</Link>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', justifyContent: 'center' }}>
              <span className="badge badge--featured">⭐ 4.8/5 Rating</span>
              <span className="badge badge--success">🚚 15-30 min</span>
              <span className="badge badge--info">🔒 Secure Payment</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const ProductCard = ({ product, index }) => {
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

  return (
    <article className="card card-hover" role="listitem" style={{ display: 'flex', flexDirection: 'column', animationDelay: `${index * 50}ms` }}>
      <div className="card__image" style={{ position: 'relative', aspectRatio: '1', background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <span style={{ fontSize: '4rem' }}>{product.icon}</span>
        {discount > 0 && (
          <span className="badge badge--discount" style={{ position: 'absolute', top: 'var(--space-3)', right: 'var(--space-3)' }}>{discount}% OFF</span>
        )}
        {product.featured && (
          <span className="badge badge--featured" style={{ position: 'absolute', top: 'var(--space-3)', left: 'var(--space-3)' }}>Featured</span>
        )}
      </div>
      <div className="card__body" style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <p className="text-xs" style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-1)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{product.category}</p>
        <h3 className="text-base font-semibold" style={{ marginBottom: 'var(--space-1)' }}>{product.name}</h3>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-3)' }}>{product.unit}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
          <span className="text-xl font-bold" style={{ color: 'var(--color-primary)' }}>₹{product.price}</span>
          {product.mrp && product.price < product.mrp && (
            <span className="text-sm" style={{ color: 'var(--color-text-secondary)', textDecoration: 'line-through' }}>₹{product.mrp}</span>
          )}
        </div>
        <div className="card__footer" style={{ paddingTop: 'var(--space-3)', borderTop: '1px solid var(--color-border)', marginTop: 'auto' }}>
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

export default Home;