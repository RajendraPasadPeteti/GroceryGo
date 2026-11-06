import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { useUI } from '../../context/UIContext';

const adminNavItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/admin/products', label: 'Products', icon: '🍎' },
  { path: '/admin/categories', label: 'Categories', icon: '🗂️' },
  { path: '/admin/inventory', label: 'Inventory', icon: '📦' },
  { path: '/admin/orders', label: 'Orders', icon: '🛍️' },
  { path: '/admin/riders', label: 'Riders', icon: '🛵' },
  { path: '/admin/users', label: 'Users', icon: '👥' },
  { path: '/admin/offers', label: 'Offers', icon: '🏷️' },
  { path: '/admin/reports', label: 'Reports', icon: '📈' },
  { path: '/admin/support', label: 'Support', icon: '🎧' },
  { path: '/admin/reviews', label: 'Reviews', icon: '⭐' },
];

const AdminLayout = ({ children }) => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { getAnalytics, refreshOrders } = useStore();
  const { _openModal, sidebarOpen, closeSidebar, toggleSidebar } = useUI();
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState({ pendingOrders: 0, inTransit: 0, lowStockCount: 0 });

  useEffect(() => {
    if (!isAuthenticated() || !isAdmin()) {
      navigate('/login');
      return;
    }
    const analytics = getAnalytics();
    setStats({
      pendingOrders: analytics.pendingOrders,
      inTransit: analytics.inTransit,
      lowStockCount: analytics.lowStockCount,
    });
    refreshOrders();
  }, [isAuthenticated, isAdmin, navigate, getAnalytics, refreshOrders]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const badgeCounts = {
    '/admin/orders': stats.pendingOrders,
    '/admin/inventory': stats.lowStockCount,
    '/admin/support': stats.inTransit,
  };

  return (
    <div className="admin-layout">
      <aside
        className={`admin-sidebar ${sidebarOpen ? 'admin-sidebar--open' : ''}`}
        role="navigation"
        aria-label="Admin navigation"
      >
        <div className="admin-sidebar__header">
          <a href="/admin/dashboard" className="admin-sidebar__logo">
            <span className="admin-sidebar__logo-icon" aria-hidden="true">🛒</span>
            <span className="admin-sidebar__logo-text">GroceryGo Admin</span>
          </a>
          <button
            className="admin-sidebar__close"
            onClick={closeSidebar}
            aria-label="Close sidebar"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <nav className="admin-sidebar__nav">
          <ul className="admin-sidebar__nav-list">
            {adminNavItems.map(item => {
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
              const badge = badgeCounts[item.path];
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={`admin-sidebar__nav-link ${isActive ? 'admin-sidebar__nav-link--active' : ''}`}
                    onClick={closeSidebar}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span className="admin-sidebar__nav-icon" aria-hidden="true">{item.icon}</span>
                    <span className="admin-sidebar__nav-label">{item.label}</span>
                    {badge > 0 && (
                      <span className="admin-sidebar__nav-badge badge badge--danger">{badge}</span>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="admin-sidebar__footer">
          <div className="admin-sidebar__user">
            <div className="avatar">{user?.name?.charAt(0) || 'A'}</div>
            <div className="admin-sidebar__user-info">
              <span className="admin-sidebar__user-name">{user?.name}</span>
              <span className="admin-sidebar__user-role">Administrator</span>
            </div>
          </div>
          <button className="btn btn--ghost btn--full admin-sidebar__logout" onClick={handleLogout}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Logout
          </button>
        </div>
      </aside>

      <div className="admin-layout__main">
        <header className="admin-header" role="banner">
          <button
            className="admin-header__menu-btn"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
            aria-expanded={sidebarOpen}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>

          <div className="admin-header__search">
            <label htmlFor="admin-search" className="visually-hidden">Search</label>
            <input
              id="admin-search"
              type="search"
              className="input input--sm"
              placeholder="Search orders, products, users..."
            />
          </div>

          <div className="admin-header__actions">
            <button className="btn btn--ghost btn--icon" aria-label="Notifications">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              <span className="admin-header__notification-badge">3</span>
            </button>
            <div className="admin-header__user">
              <div className="avatar">{user?.name?.charAt(0) || 'A'}</div>
              <span className="admin-header__user-name">{user?.name}</span>
            </div>
          </div>
        </header>

        <main className="admin-layout__content" role="main">
          <div className="container">{children}</div>
        </main>
      </div>

      {sidebarOpen && (
        <div
          className="admin-sidebar__overlay"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default AdminLayout;