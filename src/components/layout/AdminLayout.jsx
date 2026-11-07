import React, { useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const adminNavItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/admin/products', label: 'Products', icon: '🍎' },
  { path: '/admin/categories', label: 'Categories', icon: '📁' },
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
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const navRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const scrollNav = (direction) => {
    if (navRef.current) {
      navRef.current.scrollBy({ left: direction === 'left' ? -150 : 150, behavior: 'smooth' });
    }
  };

  return (
    <div className="admin-shell">
      {/* Top persistent Admin Bar */}
      <header className="admin-topbar" role="banner">
        <div className="admin-topbar__left">
          <a href="/admin/dashboard" className="admin-topbar__brand">
            <span aria-hidden="true">🛒</span>
            <span>GroceryGo</span>
          </a>
          <span className="admin-topbar__console-pill">ADMIN CONSOLE</span>
        </div>

        {/* Scrollable Navigation Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', flex: 1, justifyContent: 'center', maxWidth: '880px', position: 'relative' }}>
          <button
            onClick={() => scrollNav('left')}
            aria-label="Scroll navigation left"
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#9CA3AF', padding: '0 4px', fontSize: '14px' }}
          >
            ◀
          </button>
          <nav className="admin-topbar__tabs" ref={navRef} role="navigation" aria-label="Admin tabs">
            {adminNavItems.map(item => {
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`admin-topbar__tab ${isActive ? 'admin-topbar__tab--active' : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span aria-hidden="true">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
          <button
            onClick={() => scrollNav('right')}
            aria-label="Scroll navigation right"
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#9CA3AF', padding: '0 4px', fontSize: '14px' }}
          >
            ▶
          </button>
        </div>

        {/* User Pill & Logout */}
        <div className="admin-topbar__right">
          <span className="admin-topbar__admin-btn">
            <span aria-hidden="true">👤</span>
            <span>{user?.name || 'Administrator'}</span>
          </span>
          <button
            onClick={handleLogout}
            className="admin-topbar__logout-btn"
            aria-label="Logout from Admin"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Admin Content Container */}
      <main className="admin-main" role="main">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
