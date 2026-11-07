import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { useUI } from '../../context/UIContext';

const Navbar = () => {
  const { user, logout, isAuthenticated, isCustomer, isAdmin } = useAuth();
  const { getCartCount, updateDeliveryLocation, deliveryLocation } = useStore();
  const { searchQuery, setSearchQuery } = useUI();
  const [cartCount, setCartCount] = useState(0);
  const [location, setLocation] = useState('Vijayawada');
  const navigate = useNavigate();
  const routerLocation = useLocation();

  useEffect(() => {
    const updateCount = () => setCartCount(getCartCount());
    updateCount();
    window.addEventListener('cart-updated', updateCount);
    return () => window.removeEventListener('cart-updated', updateCount);
  }, [getCartCount]);

  useEffect(() => {
    if (deliveryLocation) {
      setLocation(deliveryLocation.split(' - ')[0] || deliveryLocation);
    }
  }, [deliveryLocation]);

  const handleLocationChange = () => {
    const newLocation = prompt('Enter delivery location (e.g. Vijayawada - 520001):', deliveryLocation || 'Vijayawada - 520001');
    if (newLocation && newLocation.trim()) {
      updateDeliveryLocation(newLocation.trim());
      setLocation(newLocation.trim().split(' - ')[0]);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (routerLocation.pathname !== '/products') {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar" role="banner">
      <div className="navbar__container">
        {/* Left: Brand Logo & Delivery Location */}
        <div className="navbar__left">
          <Link to="/" className="navbar__logo" aria-label="GroceryGo Home">
            <span className="navbar__logo-icon" aria-hidden="true">🛒</span>
            <span className="navbar__logo-text">GroceryGo</span>
          </Link>

          <button
            type="button"
            className="navbar__location-btn"
            onClick={handleLocationChange}
            title="Change Delivery Location"
          >
            <span className="navbar__location-icon" aria-hidden="true">📍</span>
            <span style={{ textAlign: 'left' }}>
              <span className="navbar__location-sub">Deliver to</span>
              <span className="navbar__location-main">{location}</span>
            </span>
          </button>
        </div>

        {/* Center: Search Bar */}
        <form onSubmit={handleSearchSubmit} className="navbar__search-wrapper" role="search">
          <span className="navbar__search-icon" aria-hidden="true">🔍</span>
          <input
            type="search"
            className="navbar__search-input"
            placeholder="Search for groceries, fruits, vegetables..."
            value={searchQuery}
            onChange={handleSearchChange}
            aria-label="Search products"
          />
        </form>

        {/* Right Navigation */}
        <nav className="navbar__right" aria-label="Main Navigation">
          {isAuthenticated() && isCustomer() ? (
            /* Logged in Customer Navigation */
            <>
              <Link
                to="/products"
                className={`navbar__link ${routerLocation.pathname === '/products' || routerLocation.pathname === '/dashboard' ? 'navbar__link--active' : ''}`}
              >
                Shop
              </Link>
              <Link
                to="/orders"
                className={`navbar__link ${routerLocation.pathname === '/orders' ? 'navbar__link--active' : ''}`}
              >
                My Orders
              </Link>
              <Link to="/cart" className="navbar__cart-pill">
                <span>🛒 Cart</span>
                <span className="navbar__cart-badge">{cartCount}</span>
              </Link>
              <Link
                to="/support"
                className={`navbar__link ${routerLocation.pathname === '/support' ? 'navbar__link--active' : ''}`}
              >
                🎧 Support
              </Link>
              <Link
                to="/profile"
                className={`navbar__link ${routerLocation.pathname === '/profile' ? 'navbar__link--active' : ''}`}
              >
                👤 Profile
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="navbar__link"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626' }}
              >
                Logout
              </button>
            </>
          ) : isAuthenticated() && isAdmin() ? (
            /* Logged in Admin shortcut in customer navbar */
            <>
              <Link to="/admin/dashboard" className="btn btn--primary btn--sm" style={{ height: '36px' }}>
                Admin Console
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="navbar__link"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626' }}
              >
                Logout
              </button>
            </>
          ) : (
            /* Guest Navigation */
            <>
              <Link to="/" className={`navbar__link ${routerLocation.pathname === '/' ? 'navbar__link--active' : ''}`}>
                Home
              </Link>
              <a href="/#categories" className="navbar__link">
                Categories
              </a>
              <a href="/#featured" className="navbar__link">
                Featured
              </a>
              <a href="/#deals" className="navbar__link">
                Deals
              </a>
              <Link to="/products" className={`navbar__link ${routerLocation.pathname === '/products' ? 'navbar__link--active' : ''}`}>
                Products
              </Link>
              <Link to="/support" className={`navbar__link ${routerLocation.pathname === '/support' ? 'navbar__link--active' : ''}`}>
                Support
              </Link>
              <Link to="/login" className="navbar__link" style={{ fontWeight: 600 }}>
                👤 Login
              </Link>
              <Link to="/register" className="navbar__link" style={{ color: '#16A34A', fontWeight: 700 }}>
                Register
              </Link>
              <Link to="/cart" className="navbar__cart-pill">
                <span>🛒 Cart</span>
                <span className="navbar__cart-badge">{cartCount}</span>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
