import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';

const Help = () => {
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useUI();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedFaqs, setExpandedFaqs] = useState(new Set());

  const faqCategories = [
    { id: 'all', label: 'All Topics', icon: '📚' },
    { id: 'orders', label: 'Orders & Delivery', icon: '📦' },
    { id: 'payments', label: 'Payments & Refunds', icon: '💳' },
    { id: 'account', label: 'Account & Profile', icon: '👤' },
    { id: 'products', label: 'Products & Quality', icon: '🛒' },
    { id: 'wallet', label: 'Wallet & Coins', icon: '💰' },
    { id: 'support', label: 'Support & Contact', icon: '🎧' },
  ];

  const faqs = [
    // Orders & Delivery
    { id: 1, category: 'orders', question: 'How long does delivery take?', answer: 'We deliver in 15-30 minutes within our service area. Delivery time may vary based on your location, traffic, and order volume. You can track your order in real-time from the Orders page.', tags: ['delivery', 'time'] },
    { id: 2, category: 'orders', question: 'What is the minimum order value?', answer: 'There is no minimum order value! You can order even a single item. However, free delivery is available on orders above ₹300. For orders below ₹300, a delivery fee of ₹29 applies.', tags: ['minimum', 'delivery fee'] },
    { id: 3, category: 'orders', question: 'Can I schedule a delivery for later?', answer: 'Yes! During checkout, you can select "Schedule for Later" and choose your preferred date and time slot (available in 1-hour windows). Scheduled orders can be modified or cancelled up to 30 minutes before the scheduled time.', tags: ['schedule', 'later'] },
    { id: 4, category: 'orders', question: 'What happens if I\'m not home during delivery?', answer: 'Our delivery partner will call you before arriving. If you\'re not available, you can ask them to leave the order at your door (for prepaid orders) or reschedule. For COD orders, the partner will wait for 5 minutes and then attempt to call again.', tags: ['not home', 'delivery'] },
    { id: 5, category: 'orders', question: 'Can I modify my order after placing it?', answer: 'You can modify your order within 5 minutes of placing it, or before the store starts preparing it. Go to Orders → View Order → Modify. Once the status changes to "Preparing", modifications are no longer possible.', tags: ['modify', 'change'] },
    { id: 6, category: 'orders', question: 'How do I track my order?', answer: 'Go to the Orders page and click "Track" on any active order. You\'ll see real-time updates including rider location, estimated arrival time, and order status. You\'ll also receive SMS/WhatsApp updates.', tags: ['track', 'tracking'] },

    // Payments & Refunds
    { id: 7, category: 'payments', question: 'What payment methods are accepted?', answer: 'We accept Cash on Delivery (COD), UPI (PhonePe, Google Pay, Paytm, BHIM), Debit/Credit Cards (Visa, Mastercard, RuPay), Net Banking, and GroceryGo Wallet balance.', tags: ['payment', 'methods'] },
    { id: 8, category: 'payments', question: 'Is it safe to save my card details?', answer: 'Yes, we use PCI DSS compliant payment processors (Razorpay/Stripe). We never store your full card details on our servers. Only tokenized references are stored for future payments, which cannot be used outside our platform.', tags: ['security', 'card'] },
    { id: 9, category: 'payments', question: 'How do refunds work?', answer: 'Refunds are processed within 2-5 business days to the original payment method. For COD orders, refunds go to your GroceryGo Wallet (instant) or bank account (2-3 days). Wallet refunds can be used immediately for future orders.', tags: ['refund', 'return'] },
    { id: 10, category: 'payments', question: 'My payment failed but money was deducted. What now?', answer: 'Don\'t worry! Failed payments are auto-refunded by banks within 24-48 hours. If the amount isn\'t refunded within 48 hours, contact support with your order ID and payment screenshot. We\'ll escalate with the payment gateway.', tags: ['failed', 'deducted'] },
    { id: 11, category: 'payments', question: 'Can I split payment between wallet and another method?', answer: 'Yes! During checkout, you can choose to pay partially from your GroceryGo Wallet and the remaining amount via UPI, Card, or COD. Your wallet balance is automatically applied first.', tags: ['split', 'wallet'] },

    // Account & Profile
    { id: 12, category: 'account', question: 'How do I reset my password?', answer: 'Click "Forgot Password" on the login page. Enter your registered email/phone to receive an OTP. Enter the OTP and set a new password. For security, the OTP expires in 5 minutes.', tags: ['password', 'reset'] },
    { id: 13, category: 'account', question: 'Can I have multiple accounts?', answer: 'Each user should have only one account per phone number/email. Multiple accounts may lead to order issues and wallet consolidation problems. If you have duplicates, contact support to merge them.', tags: ['multiple', 'accounts'] },
    { id: 14, category: 'account', question: 'How do I update my delivery address?', answer: 'Go to Profile → Addresses. You can add multiple addresses (Home, Work, Other) and set a default. During checkout, you can select any saved address or add a new one. Address changes don\'t affect active orders.', tags: ['address', 'update'] },
    { id: 15, category: 'account', question: 'How do I delete my account?', answer: 'Go to Profile → Settings → Delete Account. This action is irreversible and will delete all your order history, wallet balance, and coins. Any pending orders must be completed or cancelled first.', tags: ['delete', 'account'] },

    // Products & Quality
    { id: 16, category: 'products', question: 'What if I receive damaged/expired items?', answer: 'Report it within 2 hours of delivery via the Orders page → "Report Issue" or raise a support ticket. We\'ll arrange a free replacement or full refund (to wallet instantly). No need to return the damaged item.', tags: ['damaged', 'expired', 'quality'] },
    { id: 17, category: 'products', question: 'Are products fresh and authentic?', answer: 'Yes! We source directly from authorized distributors and local farms. All products undergo quality checks at our fulfillment centers. Perishables are stored in temperature-controlled environments. Check the "Best Before" date on delivery.', tags: ['fresh', 'authentic', 'quality'] },
    { id: 18, category: 'products', question: 'Can I return a product I don\'t like?', answer: 'For non-perishable items, returns are accepted within 7 days if unopened and in original packaging. Perishables (fruits, vegetables, dairy, bakery) cannot be returned unless damaged/expired. Raise a support ticket to initiate a return.', tags: ['return', 'don\'t like'] },
    { id: 19, category: 'products', question: 'How are fruit/vegetable weights measured?', answer: 'Weights are measured at the time of packing. There may be a 5-10% natural variation due to moisture loss. You\'re charged for the exact weight packed. If you receive significantly less, report it for a partial refund.', tags: ['weight', 'vegetables'] },

    // Wallet & Coins
    { id: 20, category: 'wallet', question: 'How do GroceryGo Coins work?', answer: 'You earn 2% coins on every order (100 coins = ₹10). Coins can be redeemed for wallet balance (minimum 100 coins). Coins expire after 365 days of inactivity. Check your Wallet page for current balance and expiry dates.', tags: ['coins', 'earn', 'redeem'] },
    { id: 21, category: 'wallet', question: 'What are the wallet limits?', answer: 'Minimum add: ₹10. Maximum per transaction: ₹50,000. Maximum wallet balance: ₹1,00,000. Monthly add limit: ₹2,00,000 (as per RBI guidelines). KYC required for balances above ₹10,000.', tags: ['limits', 'wallet'] },
    { id: 22, category: 'wallet', question: 'Can I transfer wallet balance to my bank account?', answer: 'Yes, you can withdraw wallet balance to your linked bank account (minimum ₹100). Withdrawals take 1-2 business days. Note: Promotional cashback and coin redemptions cannot be withdrawn, only used for orders.', tags: ['withdraw', 'bank'] },

    // Support & Contact
    { id: 23, category: 'support', question: 'How do I contact customer support?', answer: 'Multiple ways: (1) Call +91 98765 43210 (8 AM - 10 PM), (2) Email support@grocerygo.com, (3) Raise a ticket from the Support page, (4) Chat with us in-app (coming soon). Average response: 2 hours for tickets, instant for calls.', tags: ['contact', 'support'] },
    { id: 24, category: 'support', question: 'What are your support hours?', answer: 'Phone support: 8:00 AM to 10:00 PM daily (including weekends). Email/ticket support: 24/7 with responses within 24 hours. For urgent delivery issues, call the rider directly from the tracking page.', tags: ['hours', 'support'] },
    { id: 25, category: 'support', question: 'Where is your fulfillment center?', answer: 'Our main fulfillment center is at GroceryGo Fulfillment Center, MG Road, Vijayawada, Andhra Pradesh - 520001. We also have micro-fulfillment centers in major neighborhoods for faster delivery.', tags: ['location', 'center'] },
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = !searchQuery ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const groupedFaqs = filteredFaqs.reduce((acc, faq) => {
    if (!acc[faq.category]) acc[faq.category] = [];
    acc[faq.category].push(faq);
    return acc;
  }, {});

  const toggleFaq = (id) => {
    setExpandedFaqs(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const contactInfo = [
    { icon: '📞', title: 'Call Us', desc: 'Available 8 AM - 10 PM daily', action: <a href="tel:+919876543210" className="btn btn--primary btn--full">+91 98765 43210</a> },
    { icon: '📧', title: 'Email Us', desc: 'Response within 24 hours', action: <a href="mailto:support@grocerygo.com" className="btn btn--secondary btn--full">support@grocerygo.com</a> },
    { icon: '🏪', title: 'Visit Hub', desc: 'GroceryGo Fulfillment Center', action: (
      <address style={{ fontStyle: 'normal', color: 'var(--text-muted)' }}>
        MG Road, Vijayawada<br/>Andhra Pradesh - 520001
      </address>
    ) },
    { icon: '💬', title: 'In-App Chat', desc: 'Coming soon - Instant messaging support', action: <button className="btn btn--ghost btn--full" disabled>Notify Me</button> },
  ];

  return (
    <CustomerLayout>
      <div className="help-page">
        <header className="page-header" role="heading" aria-level="1">
          <div className="page-header__left">
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <ol className="breadcrumb__list">
                <li className="breadcrumb__item"><a href="/" className="breadcrumb__link">Home</a></li>
                <li className="breadcrumb__item"><span className="breadcrumb__current" aria-current="page">Help Center</span></li>
              </ol>
            </nav>
            <div>
              <h1 className="page-header__title">Help Center</h1>
              <p className="page-header__subtitle">Find answers to common questions or contact our support team</p>
            </div>
          </div>
        </header>

        <div className="container">
          {/* Search */}
          <section className="help-search-section">
            <div className="help-search card">
              <svg className="help-search__icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="search"
                className="help-search__input"
                placeholder="Search for help... (e.g., refund, delivery, wallet)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoComplete="off"
                aria-label="Search help articles"
              />
              <svg className="help-search__shortcut" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <kbd>⌘</kbd><kbd>K</kbd>
              </svg>
            </div>
          </section>

          {/* Categories */}
          <section className="help-categories" aria-label="Help categories">
            <div className="filter-pills" role="tablist" aria-label="Help categories">
              {faqCategories.map(cat => (
                <button
                  key={cat.id}
                  role="tab"
                  aria-selected={activeCategory === cat.id}
                  className={`filter-pill ${activeCategory === cat.id ? 'filter-pill--active' : ''}`}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  <span>{cat.icon}</span> {cat.label}
                </button>
              ))}
            </div>
          </section>

          {/* FAQs */}
          <section className="help-faqs" aria-labelledby="faqs-heading">
            <h2 id="faqs-heading" className="visually-hidden">Frequently Asked Questions</h2>

            {Object.keys(groupedFaqs).length === 0 ? (
              <div className="card empty-state" style={{ textAlign: 'center', padding: 'var(--space-16)' }}>
                <div className="empty-state__icon" style={{ fontSize: '4rem' }}>🔍</div>
                <h3 className="empty-state__title">No results found</h3>
                <p className="empty-state__desc">Try adjusting your search or browse all categories</p>
                <button className="btn btn--ghost" onClick={() => { setSearchQuery(''); setActiveCategory('all'); }} style={{ marginTop: 'var(--space-4)' }}>
                  Clear Filters
                </button>
              </div>
            ) : (
              Object.entries(groupedFaqs).map(([category, categoryFaqs]) => (
                <div key={category} className="help-category-section">
                  <h3 className="help-category-section__title">
                    {faqCategories.find(c => c.id === category)?.icon} {faqCategories.find(c => c.id === category)?.label}
                    <span className="help-category-section__count">{categoryFaqs.length} articles</span>
                  </h3>
                  <div className="faq-list">
                    {categoryFaqs.map(faq => (
                      <details
                        key={faq.id}
                        className={`faq-item ${expandedFaqs.has(faq.id) ? 'open' : ''}`}
                        onToggle={() => toggleFaq(faq.id)}
                      >
                        <summary className="faq-summary">
                          <span className="faq-summary__question">{faq.question}</span>
                          <svg className="faq-summary__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <polyline points="6 9 12 15 18 9"></polyline>
                          </svg>
                        </summary>
                        <div className="faq-content">
                          <p>{faq.answer}</p>
                          {faq.tags.length > 0 && (
                            <div className="faq-tags">
                              {faq.tags.map(tag => (
                                <span key={tag} className="badge badge--outline">{tag}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              ))
            )}
          </section>

          {/* Contact Section */}
          <section className="help-contact" aria-labelledby="contact-heading">
            <h2 id="contact-heading" className="section-title text-center" style={{ marginBottom: 'var(--space-4)' }}>Still Need Help?</h2>
            <p className="section-subtitle text-center" style={{ marginBottom: 'var(--space-12)' }}>Our support team is here to help you</p>

            <div className="help-contact__grid">
              {contactInfo.map((contact, i) => (
                <div key={i} className="help-contact__card card card-hover">
                  <div className="help-contact__icon" style={{ fontSize: '2.5rem' }}>{contact.icon}</div>
                  <h3 className="help-contact__title">{contact.title}</h3>
                  <p className="help-contact__desc">{contact.desc}</p>
                  <div className="help-contact__action">{contact.action}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Quick Links */}
          <section className="help-quick-links" aria-labelledby="quick-links-heading">
            <h2 id="quick-links-heading" className="section-title text-center" style={{ marginBottom: 'var(--space-8)' }}>Quick Links</h2>
            <div className="help-quick-links__grid">
              <Link to="/support" className="help-quick-link card card-hover">
                <span className="help-quick-link__icon">🎫</span>
                <span>Raise a Ticket</span>
              </Link>
              <Link to="/track-order" className="help-quick-link card card-hover">
                <span className="help-quick-link__icon">📍</span>
                <span>Track Order</span>
              </Link>
              <Link to="/orders" className="help-quick-link card card-hover">
                <span className="help-quick-link__icon">📦</span>
                <span>My Orders</span>
              </Link>
              <Link to="/wallet" className="help-quick-link card card-hover">
                <span className="help-quick-link__icon">💰</span>
                <span>Wallet & Coins</span>
              </Link>
              <Link to="/profile" className="help-quick-link card card-hover">
                <span className="help-quick-link__icon">👤</span>
                <span>My Profile</span>
              </Link>
              <a href="mailto:support@grocerygo.com" className="help-quick-link card card-hover">
                <span className="help-quick-link__icon">📧</span>
                <span>Email Support</span>
              </a>
            </div>
          </section>
        </div>
      </div>
    </CustomerLayout>
  );
};

const CustomerLayout = ({ children }) => (
  <div className="customer-layout">
    <main className="customer-layout__content" role="main">
      <div className="container">{children}</div>
    </main>
  </div>
);

export default Help;