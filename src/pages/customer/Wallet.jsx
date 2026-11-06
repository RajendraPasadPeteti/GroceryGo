import React, { useEffect, useState, useCallback } from 'react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';

const Wallet = () => {
  const { user, protectPage } = useAuth();
  const { getOrdersByUserId } = useStore();
  const { showToast } = useUI();

  const [wallet, setWallet] = useState({
    balance: 0,
    coins: 0,
    transactions: [],
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [addMoneyAmount, setAddMoneyAmount] = useState('');
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [processing, setProcessing] = useState(false);

  const presets = [100, 200, 500, 1000, 2000, 5000];

  useEffect(() => {
    protectPage('user');
    loadWalletData();
  }, [protectPage]);

  const loadWalletData = useCallback(() => {
    if (!user) return;

    const storedWallet = JSON.parse(localStorage.getItem(`grocerygo_wallet_${user.id}`) || '{}');
    const storedTransactions = JSON.parse(localStorage.getItem(`grocerygo_transactions_${user.id}`) || '[]');

    let transactions = storedTransactions;
    if (transactions.length === 0 && user.id) {
      const orders = getOrdersByUserId(user.id);
      transactions = orders.flatMap(order => [
        {
          id: `txn_${order.id}_debit`,
          type: 'debit',
          amount: order.total,
          description: `Order ${order.id}`,
          date: order.orderDate,
          status: 'completed',
          orderId: order.id,
        },
        ...(order.paymentStatus === 'Paid' ? [{
          id: `txn_${order.id}_credit`,
          type: 'credit',
          amount: Math.floor(order.total * 0.02),
          description: `Coins earned from order ${order.id}`,
          date: order.orderDate,
          status: 'completed',
          orderId: order.id,
        }] : []),
      ]).sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    const totalCredits = transactions.filter(t => t.type === 'credit' && t.status === 'completed').reduce((sum, t) => sum + t.amount, 0);
    const totalDebits = transactions.filter(t => t.type === 'debit' && t.status === 'completed').reduce((sum, t) => sum + t.amount, 0);
    const coinsEarned = transactions.filter(t => t.type === 'credit' && t.description.includes('Coins')).reduce((sum, t) => sum + t.amount, 0);

    setWallet({
      balance: storedWallet.balance || 0,
      coins: storedWallet.coins || coinsEarned,
      transactions: transactions.slice(0, 50),
    });
  }, [user, getOrdersByUserId]);

  const saveWallet = useCallback((updates) => {
    if (!user) return;
    const newWallet = { ...wallet, ...updates };
    setWallet(newWallet);
    localStorage.setItem(`grocerygo_wallet_${user.id}`, JSON.stringify({
      balance: newWallet.balance,
      coins: newWallet.coins,
    }));
  }, [user, wallet]);

  const saveTransactions = useCallback((transactions) => {
    if (!user) return;
    localStorage.setItem(`grocerygo_transactions_${user.id}`, JSON.stringify(transactions));
    setWallet(prev => ({ ...prev, transactions }));
  }, [user]);

  const handleAddMoney = async (e) => {
    e.preventDefault();
    const amount = parseFloat(addMoneyAmount);
    if (!amount || amount < 10) {
      showToast('Minimum add amount is ₹10', 'error');
      return;
    }
    if (amount > 50000) {
      showToast('Maximum add amount is ₹50,000', 'error');
      return;
    }

    setProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const transaction = {
        id: `txn_${Date.now()}`,
        type: 'credit',
        amount,
        description: `Added money via ${paymentMethod.toUpperCase()}`,
        date: new Date().toISOString(),
        status: 'completed',
      };

      const updatedTransactions = [transaction, ...wallet.transactions];
      saveTransactions(updatedTransactions);
      saveWallet({ balance: wallet.balance + amount });

      showToast(`₹${amount} added to wallet successfully!`, 'success');
      setAddMoneyAmount('');
      setSelectedPreset(null);
    } catch {
      showToast('Failed to add money. Please try again.', 'error');
    }
    setProcessing(false);
  };

  const handlePresetSelect = (amount) => {
    setAddMoneyAmount(amount.toString());
    setSelectedPreset(amount);
  };

  const handleCoinsRedeem = async () => {
    if (wallet.coins < 100) {
      showToast('Minimum 100 coins required for redemption', 'error');
      return;
    }

    const amount = Math.floor(wallet.coins / 100) * 10;
    const coinsToRedeem = Math.floor(wallet.coins / 100) * 100;

    setProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const transaction = {
        id: `txn_${Date.now()}`,
        type: 'credit',
        amount,
        description: `Redeemed ${coinsToRedeem} coins`,
        date: new Date().toISOString(),
        status: 'completed',
      };

      const updatedTransactions = [transaction, ...wallet.transactions];
      saveTransactions(updatedTransactions);
      saveWallet({
        balance: wallet.balance + amount,
        coins: wallet.coins - coinsToRedeem,
      });

      showToast(`${coinsToRedeem} coins redeemed for ₹${amount}!`, 'success');
    } catch {
      showToast('Failed to redeem coins', 'error');
    }
    setProcessing(false);
  };

  const getFilteredTransactions = useCallback((type) => {
    if (type === 'all') return wallet.transactions;
    return wallet.transactions.filter(t => t.type === type);
  }, [wallet.transactions]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  return (
    <CustomerLayout>
      <div className="wallet-page">
        <header className="page-header" role="heading" aria-level="1">
          <div className="page-header__left">
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <ol className="breadcrumb__list">
                <li className="breadcrumb__item"><a href="/" className="breadcrumb__link">Home</a></li>
                <li className="breadcrumb__item"><a href="/dashboard" className="breadcrumb__link">Dashboard</a></li>
                <li className="breadcrumb__item"><span className="breadcrumb__current" aria-current="page">Wallet</span></li>
              </ol>
            </nav>
            <div>
              <h1 className="page-header__title">My Wallet</h1>
              <p className="page-header__subtitle">Manage your wallet balance, coins, and transactions</p>
            </div>
          </div>
        </header>

        <div className="container">
          {/* Wallet Balance Cards */}
          <div className="wallet-balance-grid">
            <div className="wallet-balance-card card card-hover">
              <div className="wallet-balance-card__icon" style={{ background: 'var(--color-primary-light)' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                  <line x1="9" y1="12" x2="15" y2="12"></line>
                  <line x1="12" y1="9" x2="12" y2="15"></line>
                </svg>
              </div>
              <div className="wallet-balance-card__content">
                <p className="wallet-balance-card__label">Wallet Balance</p>
                <p className="wallet-balance-card__amount">₹{wallet.balance.toFixed(2)}</p>
              </div>
              <button className="btn btn--ghost btn--sm wallet-balance-card__action" onClick={() => setActiveTab('add-money')}>
                Add Money
              </button>
            </div>

            <div className="wallet-balance-card card card-hover">
              <div className="wallet-balance-card__icon" style={{ background: 'var(--color-warning-500)' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
              <div className="wallet-balance-card__content">
                <p className="wallet-balance-card__label">GroceryGo Coins</p>
                <p className="wallet-balance-card__amount">{wallet.coins.toLocaleString()} coins</p>
              </div>
              {wallet.coins >= 100 && (
                <button className="btn btn--ghost btn--sm wallet-balance-card__action" onClick={handleCoinsRedeem}>
                  Redeem
                </button>
              )}
            </div>

            <div className="wallet-balance-card card card-hover">
              <div className="wallet-balance-card__icon" style={{ background: 'var(--color-success-500)' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
              <div className="wallet-balance-card__content">
                <p className="wallet-balance-card__label">Total Savings</p>
                <p className="wallet-balance-card__amount">₹{wallet.transactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0).toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="wallet-tabs" role="tablist">
            <button
              role="tab"
              aria-selected={activeTab === 'overview'}
              className={`wallet-tabs__tab ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
              id="tab-overview"
              aria-controls="panel-overview"
            >
              Overview
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'add-money'}
              className={`wallet-tabs__tab ${activeTab === 'add-money' ? 'active' : ''}`}
              onClick={() => setActiveTab('add-money')}
              id="tab-add-money"
              aria-controls="panel-add-money"
            >
              Add Money
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'coins'}
              className={`wallet-tabs__tab ${activeTab === 'coins' ? 'active' : ''}`}
              onClick={() => setActiveTab('coins')}
              id="tab-coins"
              aria-controls="panel-coins"
            >
              Coins & Rewards
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'transactions'}
              className={`wallet-tabs__tab ${activeTab === 'transactions' ? 'active' : ''}`}
              onClick={() => setActiveTab('transactions')}
              id="tab-transactions"
              aria-controls="panel-transactions"
            >
              Transactions
            </button>
          </div>

          {/* Tab Panels */}
          <div className="wallet-tabs__panels">
            {/* Overview Panel */}
            <div
              role="tabpanel"
              id="panel-overview"
              aria-labelledby="tab-overview"
              hidden={activeTab !== 'overview'}
              className="wallet-tabs__panel"
            >
              <div className="wallet-overview">
                <section className="card wallet-quick-actions">
                  <h3 className="wallet-quick-actions__title">Quick Actions</h3>
                  <div className="wallet-quick-actions__grid">
                    <button className="wallet-quick-action card-hover" onClick={() => setActiveTab('add-money')}>
                      <div className="wallet-quick-action__icon" style={{ background: 'var(--color-primary-light)' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <line x1="12" y1="5" x2="12" y2="19"></line>
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                      </div>
                      <span>Add Money</span>
                    </button>
                    <button className="wallet-quick-action card-hover" onClick={() => setActiveTab('coins')}>
                      <div className="wallet-quick-action__icon" style={{ background: 'var(--color-warning-500)' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <circle cx="12" cy="12" r="10"></circle>
                        </svg>
                      </div>
                      <span>View Coins</span>
                    </button>
                    <button className="wallet-quick-action card-hover" onClick={() => setActiveTab('transactions')}>
                      <div className="wallet-quick-action__icon" style={{ background: 'var(--color-success-500)' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                        </svg>
                      </div>
                      <span>Transactions</span>
                    </button>
                    <a href="/orders" className="wallet-quick-action card-hover">
                      <div className="wallet-quick-action__icon" style={{ background: 'var(--color-info-500)' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <path d="M21 12.79A9 9 0 1 1 14.21 3 7 7 0 0 0 21 12.79z"></path>
                        </svg>
                      </div>
                      <span>My Orders</span>
                    </a>
                  </div>
                </section>

                <section className="card wallet-recent-transactions">
                  <div className="wallet-recent-transactions__header">
                    <h3 className="wallet-recent-transactions__title">Recent Transactions</h3>
                    <button className="btn btn--ghost btn--sm" onClick={() => setActiveTab('transactions')}>
                      View All
                    </button>
                  </div>
                  {wallet.transactions.length === 0 ? (
                    <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
                      <div className="empty-state__icon">💳</div>
                      <h4 className="empty-state__title">No transactions yet</h4>
                      <p className="empty-state__desc">Your transaction history will appear here</p>
                    </div>
                  ) : (
                    <div className="wallet-recent-transactions__list">
                      {wallet.transactions.slice(0, 5).map(txn => (
                        <TransactionItem key={txn.id} transaction={txn} />
                      ))}
                    </div>
                  )}
                </section>

                <section className="card wallet-offers">
                  <h3 className="wallet-offers__title">Wallet Offers</h3>
                  <div className="wallet-offers__grid">
                    <div className="wallet-offer card-hover">
                      <div className="wallet-offer__badge">NEW</div>
                      <h4>First Wallet Top-up</h4>
                      <p>Get ₹50 cashback on your first wallet top-up of ₹200+</p>
                      <span className="wallet-offer__code">WELCOME50</span>
                    </div>
                    <div className="wallet-offer card-hover">
                      <div className="wallet-offer__badge">HOT</div>
                      <h4>Weekend Bonus</h4>
                      <p>Extra 5% coins on wallet top-ups every Saturday & Sunday</p>
                      <span className="wallet-offer__code">WEEKEND5</span>
                    </div>
                    <div className="wallet-offer card-hover">
                      <h4>Refer & Earn</h4>
                      <p>Invite friends and earn 200 coins each when they add ₹100+</p>
                      <span className="wallet-offer__code">REFER200</span>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            {/* Add Money Panel */}
            <div
              role="tabpanel"
              id="panel-add-money"
              aria-labelledby="tab-add-money"
              hidden={activeTab !== 'add-money'}
              className="wallet-tabs__panel"
            >
              <section className="card add-money-section">
                <h3 className="add-money-section__title">Add Money to Wallet</h3>
                <p className="add-money-section__subtitle">Minimum ₹10 • Maximum ₹50,000 per transaction</p>

                <form onSubmit={handleAddMoney} className="add-money-form" noValidate>
                  <div className="input-group">
                    <label htmlFor="add-amount" className="input-label">Amount <span className="text-danger">*</span></label>
                    <div className="input-group-inline">
                      <span className="input-addon">₹</span>
                      <input
                        id="add-amount"
                        type="number"
                        className="input"
                        placeholder="Enter amount"
                        value={addMoneyAmount}
                        onChange={(e) => { setAddMoneyAmount(e.target.value); setSelectedPreset(null); }}
                        min={10}
                        max={50000}
                        step={10}
                        required
                      />
                    </div>
                    <p className="input-helper">Enter amount between ₹10 and ₹50,000</p>
                  </div>

                  <div className="add-money-presets">
                    <label className="input-label">Quick Amount</label>
                    <div className="add-money-presets__grid">
                      {presets.map(amount => (
                        <button
                          key={amount}
                          type="button"
                          className={`add-money-preset ${selectedPreset === amount ? 'active' : ''}`}
                          onClick={() => handlePresetSelect(amount)}
                        >
                          ₹{amount}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="input-group">
                    <label className="input-label">Payment Method</label>
                    <div className="payment-methods" role="radiogroup" aria-label="Select payment method">
                      {[
                        { id: 'upi', label: 'UPI', icon: '📱', desc: 'PhonePe, GPay, Paytm, etc.' },
                        { id: 'card', label: 'Debit/Credit Card', icon: '💳', desc: 'Visa, Mastercard, RuPay' },
                        { id: 'netbanking', label: 'Net Banking', icon: '🏦', desc: 'All major banks' },
                        { id: 'wallet', label: 'Wallet Balance', icon: '💰', desc: 'Use existing balance' },
                      ].map(method => (
                        <label key={method.id} className={`payment-method ${paymentMethod === method.id ? 'active' : ''}`}>
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method.id}
                            checked={paymentMethod === method.id}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                          />
                          <div className="payment-method__content">
                            <span className="payment-method__icon">{method.icon}</span>
                            <div className="payment-method__info">
                              <strong>{method.label}</strong>
                              <span>{method.desc}</span>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="add-money-security">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    </svg>
                    <span>Secured by 256-bit encryption • No storage of card details</span>
                  </div>

                  <button type="submit" className="btn btn--primary btn--lg btn--full" disabled={processing || !addMoneyAmount}>
                    {processing ? 'Processing...' : `Add ₹${addMoneyAmount || '0'} to Wallet`}
                  </button>
                </form>
              </section>

              <section className="card wallet-limits">
                <h4 className="wallet-limits__title">Wallet Limits</h4>
                <dl className="wallet-limits__list">
                  <div><dt>Minimum Add</dt><dd>₹10</dd></div>
                  <div><dt>Maximum Add (per transaction)</dt><dd>₹50,000</dd></div>
                  <div><dt>Maximum Wallet Balance</dt><dd>₹1,00,000</dd></div>
                  <div><dt>Monthly Add Limit</dt><dd>₹2,00,000</dd></div>
                </dl>
              </section>
            </div>

            {/* Coins Panel */}
            <div
              role="tabpanel"
              id="panel-coins"
              aria-labelledby="tab-coins"
              hidden={activeTab !== 'coins'}
              className="wallet-tabs__panel"
            >
              <section className="card coins-overview">
                <div className="coins-overview__header">
                  <div className="coins-overview__balance">
                    <span className="coins-overview__label">Your Coins</span>
                    <span className="coins-overview__amount">{wallet.coins.toLocaleString()}</span>
                  </div>
                  <div className="coins-overview__value">
                    <span>≈ ₹{(wallet.coins / 10).toFixed(2)} value</span>
                    <span className="coins-overview__rate">(100 coins = ₹10)</span>
                  </div>
                </div>

                <div className="coins-overview__actions">
                  {wallet.coins >= 100 && (
                    <button className="btn btn--primary" onClick={handleCoinsRedeem} disabled={processing}>
                      {processing ? 'Redeeming...' : `Redeem for ₹${Math.floor(wallet.coins / 100) * 10}`}
                    </button>
                  )}
                  <button className="btn btn--secondary" disabled>Coins History</button>
                </div>

                <div className="coins-overview__earn">
                  <h4>How to Earn Coins</h4>
                  <ul className="coins-earn-list">
                    <li><strong>Shop:</strong> Earn 2% coins on every order (100 coins = ₹10)</li>
                    <li><strong>Refer:</strong> Get 200 coins when a friend signs up and adds ₹100+</li>
                    <li><strong>Review:</strong> Earn 50 coins for each product review</li>
                    <li><strong>Wallet Top-up:</strong> Bonus coins on weekend top-ups</li>
                  </ul>
                </div>
              </section>

              <section className="card coins-tiers">
                <h3 className="coins-tiers__title">Loyalty Tiers</h3>
                <div className="coins-tiers__grid">
                  {[
                    { name: 'Bronze', minCoins: 0, color: '#cd7f32', benefits: ['2% coins on orders', 'Standard support'] },
                    { name: 'Silver', minCoins: 5000, color: '#c0c0c0', benefits: ['3% coins on orders', 'Priority support', 'Free delivery'] },
                    { name: 'Gold', minCoins: 20000, color: '#ffd700', benefits: ['5% coins on orders', 'Dedicated support', 'Free delivery', 'Early access to sales'] },
                    { name: 'Platinum', minCoins: 50000, color: '#e5e4e2', benefits: ['7% coins on orders', 'VIP support', 'Free delivery', 'Exclusive deals', 'Personal shopper'] },
                  ].map((tier, index) => {
                    const isCurrent = wallet.coins >= tier.minCoins && (!index || wallet.coins >= tier.minCoins);
                    const isNext = index > 0 && wallet.coins < tier.minCoins && wallet.coins >= (index > 1 ? 20000 : 5000);
                    return (
                      <div key={tier.name} className={`coins-tier card ${isCurrent ? 'current' : ''} ${isNext ? 'next' : ''}`}>
                        <div className="coins-tier__header" style={{ borderColor: tier.color }}>
                          <h4 className="coins-tier__name">{tier.name}</h4>
                          <span className="coins-tier__requirement">{tier.minCoins.toLocaleString()}+ coins</span>
                        </div>
                        <ul className="coins-tier__benefits">
                          {tier.benefits.map((benefit, i) => (
                            <li key={i}>{benefit}</li>
                          ))}
                        </ul>
                        {isCurrent && <span className="badge badge--success">Current Tier</span>}
                        {isNext && <span className="badge badge--primary">Next Tier</span>}
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>

            {/* Transactions Panel */}
            <div
              role="tabpanel"
              id="panel-transactions"
              aria-labelledby="tab-transactions"
              hidden={activeTab !== 'transactions'}
              className="wallet-tabs__panel"
            >
              <section className="card transactions-section">
                <div className="transactions-section__header">
                  <h3 className="transactions-section__title">Transaction History</h3>
                  <div className="transactions-section__filters">
                    <select
                      className="input select"
                      value={activeTab}
                      onChange={(e) => setActiveTab(e.target.value)}
                      aria-label="Filter transactions"
                    >
                      <option value="transactions">All</option>
                      <option value="credit">Credits</option>
                      <option value="debit">Debits</option>
                    </select>
                  </div>
                </div>

                {wallet.transactions.length === 0 ? (
                  <div className="empty-state" style={{ padding: 'var(--space-16)' }}>
                    <div className="empty-state__icon">📋</div>
                    <h4 className="empty-state__title">No transactions</h4>
                    <p className="empty-state__desc">Your transaction history will appear here</p>
                  </div>
                ) : (
                  <div className="transactions-table-wrapper">
                    <table className="table" role="table">
                      <thead>
                        <tr>
                          <th scope="col">Date</th>
                          <th scope="col">Description</th>
                          <th scope="col">Type</th>
                          <th scope="col">Amount</th>
                          <th scope="col">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {wallet.transactions.map(txn => (
                          <tr key={txn.id}>
                            <td>{formatDate(txn.date)}</td>
                            <td>{txn.description}</td>
                            <td>
                              <span className={`badge badge--${txn.type === 'credit' ? 'success' : 'primary'}`}>
                                {txn.type === 'credit' ? '+' : '-'}{txn.type}
                              </span>
                            </td>
                            <td className={txn.type === 'credit' ? 'text-success' : 'text-danger'}>
                              {txn.type === 'credit' ? '+' : '-'}₹{txn.amount.toFixed(2)}
                            </td>
                            <td>
                              <span className={`badge badge--${txn.status === 'completed' ? 'success' : 'warning'}`}>
                                {txn.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
};

const TransactionItem = ({ transaction }) => (
  <div className="transaction-item">
    <div className="transaction-item__icon" style={{
      background: transaction.type === 'credit' ? 'var(--color-success-500)' : 'var(--color-primary)'
    }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        {transaction.type === 'credit' ? (
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
        ) : (
          <path d="M21 12H3"></path>
        )}
      </svg>
    </div>
    <div className="transaction-item__details">
      <p className="transaction-item__description">{transaction.description}</p>
      <p className="transaction-item__date">{new Date(transaction.date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
    </div>
    <div className="transaction-item__amount" style={{ color: transaction.type === 'credit' ? 'var(--color-success-600)' : 'var(--color-primary)' }}>
      {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
    </div>
  </div>
);

const CustomerLayout = ({ children }) => (
  <div className="customer-layout">
    <main className="customer-layout__content" role="main">
      <div className="container">{children}</div>
    </main>
  </div>
);

export default Wallet;