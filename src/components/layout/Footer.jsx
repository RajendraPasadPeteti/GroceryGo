import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer" role="contentinfo">
      <div className="container">
        <div className="footer__grid">
          {/* Brand info */}
          <div>
            <Link to="/" className="footer__logo">
              <span aria-hidden="true">🛒</span>
              <span>GroceryGo</span>
            </Link>
            <p className="footer__tagline">
              Your everyday online grocery shopping and express delivery partner. Farm-fresh fruits, vegetables, dairy, and household essentials.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="footer__title">Quick Links</h4>
            <ul className="footer__list">
              <li><Link to="/">Home</Link></li>
              <li><a href="/#categories">Categories</a></li>
              <li><a href="/#featured">Featured Products</a></li>
              <li><a href="/#deals">Deals & Offers</a></li>
              <li><Link to="/products">All Groceries</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="footer__title">Customer Service</h4>
            <ul className="footer__list">
              <li><Link to="/support">Help & Support Desk</Link></li>
              <li><Link to="/track-order">Track My Order</Link></li>
              <li><Link to="/cart">View Cart</Link></li>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register">Register</Link></li>
            </ul>
          </div>

          {/* Contact & Location */}
          <div>
            <h4 className="footer__title">Contact & Location</h4>
            <ul className="footer__list" style={{ gap: '12px' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📍</span>
                <span>Vijayawada, Andhra Pradesh</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>✉️</span>
                <a href="mailto:support@grocerygo.com">support@grocerygo.com</a>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📞</span>
                <a href="tel:+919876543210">+91 98765 43210</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <p>© 2026 GroceryGo. All Rights Reserved. Online Grocery Shopping & Delivery Management System.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
