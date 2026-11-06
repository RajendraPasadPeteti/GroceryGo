import React from 'react';

const currentYear = new Date().getFullYear();

const Footer = () => {

  const footerLinks = {
    company: [
      { label: 'About Us', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Press', href: '#' },
      { label: 'Blog', href: '#' },
    ],
    support: [
      { label: 'Help Center', href: '/support' },
      { label: 'Contact Us', href: '/support' },
      { label: 'FAQs', href: '#' },
      { label: 'Returns & Refunds', href: '#' },
    ],
    legal: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
      { label: 'Cookie Policy', href: '#' },
    ],
    connect: [
      { label: 'Facebook', href: '#', icon: '📘' },
      { label: 'Twitter', href: '#', icon: '🐦' },
      { label: 'Instagram', href: '#', icon: '📷' },
      { label: 'LinkedIn', href: '#', icon: '💼' },
    ],
  };

  return (
    <footer className="footer" role="contentinfo">
      <div className="container">
        <div className="footer__grid">
          <div className="footer__brand">
            <a href="/" className="footer__logo" aria-label="GroceryGo Home">
              <span className="footer__logo-icon" aria-hidden="true">🛒</span>
              <span className="footer__logo-text">GroceryGo</span>
            </a>
            <p className="footer__tagline">Groceries delivered fast & fresh in 15-30 minutes</p>
            <div className="footer__social">
              {footerLinks.connect.map(item => (
                <a key={item.label} href={item.href} className="footer__social-link" aria-label={item.label}>
                  {item.icon}
                </a>
              ))}
            </div>
          </div>

          <nav className="footer__nav" aria-label="Company links">
            <h4 className="footer__nav-title">Company</h4>
            <ul className="footer__nav-list">
              {footerLinks.company.map(item => (
                <li key={item.label}><a href={item.href} className="footer__nav-link">{item.label}</a></li>
              ))}
            </ul>
          </nav>

          <nav className="footer__nav" aria-label="Support links">
            <h4 className="footer__nav-title">Support</h4>
            <ul className="footer__nav-list">
              {footerLinks.support.map(item => (
                <li key={item.label}><a href={item.href} className="footer__nav-link">{item.label}</a></li>
              ))}
            </ul>
          </nav>

          <nav className="footer__nav" aria-label="Legal links">
            <h4 className="footer__nav-title">Legal</h4>
            <ul className="footer__nav-list">
              {footerLinks.legal.map(item => (
                <li key={item.label}><a href={item.href} className="footer__nav-link">{item.label}</a></li>
              ))}
            </ul>
          </nav>

          <div className="footer__contact">
            <h4 className="footer__nav-title">Contact Us</h4>
            <address className="footer__address">
              <p><strong>Customer Support Hotline:</strong></p>
              <p><a href="tel:+919876543210" className="footer__contact-link">+91 98765 43210</a></p>
              <p><strong>Email:</strong></p>
              <p><a href="mailto:support@grocerygo.com" className="footer__contact-link">support@grocerygo.com</a></p>
              <p><strong>Fulfillment Center:</strong></p>
              <p>GroceryGo Warehouse, MG Road<br/>Vijayawada, Andhra Pradesh - 520001</p>
            </address>
          </div>
        </div>

        <div className="footer__bottom">
          <p className="footer__copyright">&copy; {currentYear} GroceryGo. All rights reserved.</p>
          <p className="footer__tagline-small">Made with ❤️ for academic project demonstration</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;