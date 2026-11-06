import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { useUI } from '../../context/UIContext';

const Navbar = () => {
  const { user, logout: _logout, isAuthenticated, isCustomer } = useAuth();
  const { getCartCount, updateDeliveryLocation, deliveryLocation } = useStore();
  const { openModal, searchQuery, setSearchQuery, openSidebar } = useUI();
  const [cartCount, setCartCount] = useState(0);
  const [location, setLocation] = useState('Vijayawada - 520001');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const updateCount = () => setCartCount(getCartCount());
    updateCount();
    window.addEventListener('cart-updated', updateCount);
    return () => window.removeEventListener('cart-updated', updateCount);
  }, [getCartCount]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setLocation(deliveryLocation);
  }, [deliveryLocation]);

  const handleLocationChange = () => {
    const newLocation = prompt('Enter delivery location (City - Pincode):', location);
    if (newLocation && newLocation.trim()) {
      updateDeliveryLocation(newLocation.trim());
      setLocation(newLocation.trim());
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    // Search is handled by the page component
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/#categories', label: 'Categories' },
    { href: '/#featured', label: 'Featured' },
    { href: '/#deals', label: 'Deals' },
    { href: '/#products', label: 'Products' },
    { href: '/support', label: 'Support' },
  ];

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`} role="banner">
      <div className="container navbar__container">
        <a href="/" className="navbar__logo" aria-label="GroceryGo Home">
          <span className="navbar__logo-icon" aria-hidden="true">🛒</span>
          <span className="navbar__logo-text">GroceryGo</span>
        </a>

        <button className="navbar__menu-btn" onClick={openSidebar} aria-label="Open menu" aria-expanded={false}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>

        <div className="navbar__search" role="search">
          <label htmlFor="nav-search" className="visually-hidden">Search products</label>
          <input
            id="nav-search"
            type="search"
            className="search-input"
            placeholder="Search groceries..."
            value={searchQuery}
            onChange={handleSearch}
            autoComplete="off"
          />
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>

        <nav className="navbar__nav" role="navigation" aria-label="Main navigation">
          <ul className="navbar__nav-list">
            {navLinks.map(link => (
              <li key={link.href}>
                <a href={link.href} className="navbar__nav-link">{link.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="navbar__actions">
          <button
            className="navbar__location"
            onClick={handleLocationChange}
            aria-label={`Delivery location: ${location}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <span className="navbar__location-text">
              <strong>{location.split(' - ')[0]}</strong>
            </span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>

          {isAuthenticated() ? (
            <>
              {isCustomer() && (
                <a href="/cart" className="navbar__cart" aria-label={`Cart: ${cartCount} items`}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                  {cartCount > 0 && (
                    <span className="navbar__cart-badge" aria-label={`${cartCount} items in cart`}>{cartCount}</span>
                  )}
                </a>
              )}

              <div className="navbar__user-menu">
                <button className="navbar__user-btn" onClick={() => openModal('userMenu')} aria-label="User menu" aria-expanded="false">
                  <div className="avatar avatar--sm">{user?.name?.charAt(0) || 'U'}</div>
                  <span className="navbar__user-name">{user?.name}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <polyline points="18 15 12 9 6 15"></polyline>
                  </svg>
                </button>
              </div>
            </>
          ) : (
            <div className="navbar__auth">
              <a href="/login" className="btn btn--ghost btn--sm">Login</a>
              <a href="/register" className="btn btn--primary btn--sm">Register</a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;