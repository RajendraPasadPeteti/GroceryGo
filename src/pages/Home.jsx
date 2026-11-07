import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { useUI } from '../context/UIContext';

const Home = () => {
  const { products, addToCart } = useStore();
  const { showToast } = useUI();
  const navigate = useNavigate();
  const [addedItems, setAddedItems] = useState({});

  const categoriesList = [
    { name: 'Fruits', icon: '🍎', desc: 'Fresh farm-picked fruits' },
    { name: 'Vegetables', icon: '🥦', desc: 'Fresh green vegetables' },
    { name: 'Dairy', icon: '🥛', desc: 'Milk, butter, and cheese' },
    { name: 'Bakery', icon: '🍞', desc: 'Bread, buns, and cookies' },
    { name: 'Snacks', icon: '🍪', desc: 'Chips, snacks, and treats' },
    { name: 'Beverages', icon: '🥤', desc: 'Juices and cold drinks' },
    { name: 'Groceries', icon: '🥫', desc: 'Pantry staples & spices' },
    { name: 'Household', icon: '🧼', desc: 'Cleaners & hygiene' },
  ];

  const featuredList = products.slice(0, 8);

  const handleAdd = (product, e) => {
    e.stopPropagation();
    addToCart(product.id, 1);
    setAddedItems(prev => ({ ...prev, [product.id]: (prev[product.id] || 0) + 1 }));
    showToast(`${product.name} added to cart!`, 'success');
    window.dispatchEvent(new CustomEvent('cart-updated'));
  };

  return (
    <div className="home-page" style={{ background: '#F8FAF9' }}>
      {/* Hero Section */}
      <section
        style={{
          background: 'linear-gradient(180deg, #F0FDF4 0%, #FFFFFF 100%)',
          padding: '48px 0 64px',
          borderBottom: '1px solid #E5E7EB',
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 0.8fr',
              alignItems: 'center',
              gap: '40px',
            }}
          >
            {/* Left Column */}
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#FFFFFF',
                  border: '1px solid #DCFCE7',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#15803D',
                  marginBottom: '20px',
                }}
              >
                <span>⚡</span>
                <span>Fast & Fresh Delivery in 15-30 Mins</span>
              </div>

              <h1
                style={{
                  fontSize: '44px',
                  fontWeight: 900,
                  color: '#1F2937',
                  lineHeight: 1.15,
                  letterSpacing: '-0.03em',
                  marginBottom: '16px',
                }}
              >
                Groceries Delivered <br />
                <span style={{ color: '#16A34A' }}>Fast & Fresh</span>
              </h1>

              <p
                style={{
                  fontSize: '16px',
                  color: '#4B5563',
                  lineHeight: 1.6,
                  maxWidth: '520px',
                  marginBottom: '28px',
                }}
              >
                Your everyday groceries, farm-fresh fruits, vegetables, dairy and snacks delivered directly to your doorstep.
              </p>

              <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '40px' }}>
                <Link
                  to="/products"
                  className="btn btn--primary"
                  style={{ height: '48px', padding: '0 26px', fontSize: '15px' }}
                >
                  Shop Now →
                </Link>
                <a
                  href="#categories"
                  className="btn btn--secondary"
                  style={{ height: '48px', padding: '0 24px', fontSize: '15px', color: '#16A34A', borderColor: '#16A34A' }}
                >
                  Browse Categories
                </a>
              </div>

              {/* 3 Benefit Badges */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '16px',
                  paddingTop: '20px',
                  borderTop: '1px solid #E5E7EB',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: '#1F2937' }}>⚡ 15-30 Mins</div>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>Express doorstep delivery</div>
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: '#1F2937' }}>🥦 100% Fresh</div>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>Handpicked quality items</div>
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: '#1F2937' }}>💰 Best Deals</div>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>Daily discounts & coupons</div>
                </div>
              </div>
            </div>

            {/* Right Column Illustration */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div
                style={{
                  position: 'relative',
                  width: '380px',
                  height: '380px',
                  background: 'radial-gradient(circle, #FFFFFF 60%, #F0FDF4 100%)',
                  borderRadius: '50%',
                  border: '8px solid #FFFFFF',
                  boxShadow: '0 20px 40px -15px rgba(22, 163, 74, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div style={{ fontSize: '110px', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.1))' }}>
                  🛒
                </div>

                {/* Floating Emojis */}
                <div
                  style={{
                    position: 'absolute',
                    top: '20px',
                    left: '50px',
                    background: '#FFFFFF',
                    width: '54px',
                    height: '54px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.06)',
                  }}
                >
                  🍎
                </div>
                <div
                  style={{
                    position: 'absolute',
                    top: '30px',
                    right: '40px',
                    background: '#FFFFFF',
                    width: '54px',
                    height: '54px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.06)',
                  }}
                >
                  🥦
                </div>
                <div
                  style={{
                    position: 'absolute',
                    bottom: '40px',
                    left: '40px',
                    background: '#FFFFFF',
                    width: '54px',
                    height: '54px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.06)',
                  }}
                >
                  🥛
                </div>
                <div
                  style={{
                    position: 'absolute',
                    bottom: '50px',
                    right: '50px',
                    background: '#FFFFFF',
                    width: '54px',
                    height: '54px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.06)',
                  }}
                >
                  🍞
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" style={{ padding: '48px 0' }}>
        <div className="container">
          <div style={{ marginBottom: '24px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#16A34A', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              SHOP BY CATEGORY
            </span>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1F2937', marginTop: '4px' }}>
              Explore Grocery Categories
            </h2>
          </div>

          <div className="category-grid">
            {categoriesList.map(cat => (
              <div
                key={cat.name}
                className="category-card"
                onClick={() => navigate(`/products?category=${encodeURIComponent(cat.name)}`)}
                role="button"
                tabIndex={0}
              >
                <div className="category-card__icon">{cat.icon}</div>
                <div className="category-card__name">{cat.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section id="featured" style={{ padding: '24px 0 48px' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#16A34A', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                FRESH PICKS
              </span>
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1F2937', marginTop: '4px' }}>
                Featured Fresh Groceries
              </h2>
            </div>
            <Link to="/products" style={{ color: '#16A34A', fontWeight: 700, fontSize: '14px' }}>
              Explore All →
            </Link>
          </div>

          <div className="product-grid">
            {featuredList.map(p => (
              <div
                key={p.id}
                className="catalog-product-card"
                onClick={() => navigate(`/products/${p.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <span
                  className="badge badge--danger"
                  style={{ position: 'absolute', top: '14px', left: '14px', fontSize: '11px', fontWeight: 700 }}
                >
                  -20%
                </span>

                <div className="catalog-product-card__image-container">
                  <span>{p.icon || '🍏'}</span>
                </div>

                <h3 className="catalog-product-card__title">{p.name}</h3>
                <div className="catalog-product-card__subtitle">
                  {p.category} • {p.unit || '1 kg'}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12.5px', color: '#D97706', marginBottom: '8px' }}>
                  <span>⭐</span>
                  <span style={{ fontWeight: 700, color: '#1F2937' }}>{p.rating || 4.7}</span>
                  <span style={{ color: '#9CA3AF' }}>(40+ reviews)</span>
                </div>

                <div className="catalog-product-card__footer">
                  <div>
                    <span className="catalog-product-card__price">₹{p.price}</span>
                    <span className="catalog-product-card__original-price">
                      ₹{p.originalPrice || Math.round(p.price * 1.25)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleAdd(p, e)}
                    className="catalog-product-card__add-btn"
                  >
                    {addedItems[p.id] ? `ADD (${addedItems[p.id]})` : 'ADD'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section id="deals" style={{ padding: '24px 0 64px' }}>
        <div className="container">
          <div
            style={{
              background: '#F0FDF4',
              border: '1px solid #DCFCE7',
              borderRadius: '20px',
              padding: '40px 48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '24px',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <h3 style={{ fontSize: '26px', fontWeight: 800, color: '#1F2937', marginBottom: '8px' }}>
                Everything you need, just a few clicks away.
              </h3>
              <p style={{ fontSize: '15px', color: '#4B5563' }}>
                Create your GroceryGo account and start shopping today.
              </p>
            </div>

            <Link
              to="/products"
              className="btn btn--primary"
              style={{ height: '46px', padding: '0 24px', fontSize: '15px', fontWeight: 700 }}
            >
              Get Started →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
