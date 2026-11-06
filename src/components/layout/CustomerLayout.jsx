import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';

const customerNavItems = [
  { path: '/dashboard', label: 'Shop', icon: '🛒' },
  { path: '/cart', label: 'Cart', icon: '🛍️' },
  { path: '/orders', label: 'Orders', icon: '📦' },
  { path: '/profile', label: 'Profile', icon: '👤' },
  { path: '/support', label: 'Support', icon: '🎧' },
];

const CustomerLayout = ({ children }) => {
  const { user, logout, isAuthenticated, isCustomer } = useAuth();
  const { sidebarOpen, closeSidebar, toggleSidebar } = useUI();
  const location = useLocation();

  if (!isAuthenticated() || !isCustomer()) {
    return <div className="customer-layout">{children}</div>;
  }

  return (
    <div className="customer-layout">
      <aside
        className={`customer-sidebar ${sidebarOpen ? 'customer-sidebar--open' : ''}`}
        role="navigation"
        aria-label="Customer navigation"
      >
        <div className="customer-sidebar__header">
          <div className="customer-sidebar__logo">
            <span className="customer-sidebar__logo-icon" aria-hidden="true">🛒</span>
            <span className="customer-sidebar__logo-text">GroceryGo</span>
          </div>
          <button
            className="customer-sidebar__close"
            onClick={closeSidebar}
            aria-label="Close sidebar"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="customer-sidebar__user">
          <div className="avatar avatar--lg">{user?.name?.charAt(0) || 'U'}</div>
          <div className="customer-sidebar__user-info">
            <h4 className="customer-sidebar__user-name">{user?.name}</h4>
            <p className="customer-sidebar__user-email">{user?.email}</p>
          </div>
        </div>

        <nav className="customer-sidebar__nav">
          <ul className="customer-sidebar__nav-list">
            {customerNavItems.map(item => {
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={`customer-sidebar__nav-link ${isActive ? 'customer-sidebar__nav-link--active' : ''}`}
                    onClick={closeSidebar}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span className="customer-sidebar__nav-icon" aria-hidden="true">{item.icon}</span>
                    <span className="customer-sidebar__nav-label">{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="customer-sidebar__footer">
          <button className="btn btn--danger btn--full" onClick={logout}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Logout
          </button>
        </div>
      </aside>

      <div className="customer-layout__main">
        <header className="customer-header" role="banner">
          <button
            className="customer-header__menu-btn"
            onClick={toggleSidebar}
            aria-label="Toggle menu"
            aria-expanded={sidebarOpen}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
          <h1 className="customer-header__title">My GroceryGo</h1>
          <div className="avatar">{user?.name?.charAt(0) || 'U'}</div>
        </header>

        <main className="customer-layout__content" role="main">
          <div className="container">{children}</div>
        </main>
      </div>

      {sidebarOpen && (
        <div
          className="customer-sidebar__overlay"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default CustomerLayout;