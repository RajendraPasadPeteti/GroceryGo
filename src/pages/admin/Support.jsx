import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';

const AdminSupport = () => {
  const { supportTickets, users: _users, updateSupportTicket, addSupportTicket: _addSupportTicket, refreshSupportTickets: _refreshSupportTickets } = useStore();
  const { isAuthenticated: _isAuthenticated, isAdmin: _isAdmin, protectPage } = useAuth();
  const { showToast } = useUI();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => { protectPage('admin'); }, [protectPage]);

  const filteredTickets = useMemo(() => {
    let result = [...supportTickets].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (filter !== 'all') result = result.filter(t => t.status === filter);
    if (searchTerm) result = result.filter(t => t.id.toLowerCase().includes(searchTerm.toLowerCase()) || t.subject.toLowerCase().includes(searchTerm.toLowerCase()) || t.userName.toLowerCase().includes(searchTerm.toLowerCase()));
    return result;
  }, [supportTickets, filter, searchTerm]);

  const handleStatusChange = (ticketId, newStatus) => {
    updateSupportTicket(ticketId, { status: newStatus });
    showToast(`Ticket ${ticketId} marked as ${newStatus}`, 'success');
    if (selectedTicket?.id === ticketId) setSelectedTicket({ ...selectedTicket, status: newStatus });
  };

  const handleReply = (ticketId) => {
    if (!replyText.trim()) { showToast('Reply cannot be empty', 'error'); return; }
    updateSupportTicket(ticketId, {
      status: 'Resolved',
      adminReply: replyText,
      adminReplyAt: new Date().toISOString(),
      resolvedAt: new Date().toISOString()
    });
    showToast('Reply sent and ticket resolved', 'success');
    setReplyText('');
    setSelectedTicket({ ...selectedTicket, status: 'Resolved', adminReply: replyText, adminReplyAt: new Date().toISOString() });
  };

  const handleReopen = (ticketId) => {
    updateSupportTicket(ticketId, { status: 'Open', adminReply: '', adminReplyAt: null, resolvedAt: null });
    showToast('Ticket reopened', 'success');
    if (selectedTicket?.id === ticketId) setSelectedTicket({ ...selectedTicket, status: 'Open', adminReply: '', adminReplyAt: null, resolvedAt: null });
  };

  return (
    <AdminLayout>
      <div className="admin-support">
        <PageHeader
          title="Support Tickets"
          subtitle="Manage customer support requests"
          breadcrumb={[{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Support' }]}
        />

        <div className="grid-3" style={{ gap: '20px', marginBottom: '24px' }}>
          <div className="card">
            <div className="card__body">
              <h4>All Tickets</h4>
              <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--color-primary)' }}>{supportTickets.length}</div>
            </div>
          </div>
          <div className="card">
            <div className="card__body">
              <h4>Open</h4>
              <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--color-warning)' }}>{supportTickets.filter(t => t.status === 'Open').length}</div>
            </div>
          </div>
          <div className="card">
            <div className="card__body">
              <h4>Resolved</h4>
              <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--color-success)' }}>{supportTickets.filter(t => t.status === 'Resolved').length}</div>
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: '20px' }}>
          <div className="card__body" style={{ padding: '20px' }}>
            <div className="grid-3" style={{ gap: '16px', alignItems: 'end' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label htmlFor="sup-search" className="input-label">Search</label>
                <input id="sup-search" type="search" className="input" placeholder="Ticket ID, subject, customer..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label htmlFor="sup-filter" className="input-label">Status</label>
                <select id="sup-filter" className="input select" value={filter} onChange={e => setFilter(e.target.value)}>
                  <option value="all">All Statuses</option>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="grid-2" style={{ gap: '20px' }}>
          <div className="card" style={{ flex: 1 }}>
            <div className="card__header"><h3>Tickets</h3></div>
            <div className="card__body" style={{ padding: 0, maxHeight: '600px', overflow: 'auto' }}>
              {filteredTickets.map(t => (
                <div key={t.id} className={`ticket-row ${selectedTicket?.id === t.id ? 'selected' : ''}`} onClick={() => setSelectedTicket(t)} style={{ display: 'flex', alignItems: 'center', padding: '16px', borderBottom: '1px solid var(--color-border)', cursor: 'pointer', transition: 'background 0.2s' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                      <strong>{t.id}</strong>
                      <span className={`badge badge--${t.status === 'Open' ? 'warning' : t.status === 'In Progress' ? 'info' : t.status === 'Resolved' ? 'success' : 'danger'}`}>{t.status}</span>
                      <span className={`badge badge--${t.priority === 'High' ? 'danger' : t.priority === 'Medium' ? 'warning' : 'info'}`}>{t.priority}</span>
                    </div>
                    <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '14px' }}>{t.subject} — {t.userName}</p>
                    <small>{new Date(t.createdAt).toLocaleString()}</small>
                  </div>
                </div>
              ))}
              {filteredTickets.length === 0 && (
                <div className="empty-state" style={{ padding: '60px' }}>
                  <h3 className="empty-state__title">No tickets found</h3>
                </div>
              )}
            </div>
          </div>

          <div className="card" style={{ flex: 1 }}>
            <div className="card__header"><h3>{selectedTicket ? 'Ticket Details' : 'Select a Ticket'}</h3></div>
            <div className="card__body">
              {selectedTicket ? (
                <>
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h4 style={{ margin: 0 }}>{selectedTicket.subject}</h4>
                      <span className={`badge badge--${selectedTicket.status === 'Open' ? 'warning' : selectedTicket.status === 'In Progress' ? 'info' : selectedTicket.status === 'Resolved' ? 'success' : 'danger'}`}>{selectedTicket.status}</span>
                    </div>
                    <p style={{ margin: '0 0 8px', color: 'var(--color-text-secondary)' }}><strong>Category:</strong> {selectedTicket.category} | <strong>Priority:</strong> <span className={`badge badge--${selectedTicket.priority === 'High' ? 'danger' : selectedTicket.priority === 'Medium' ? 'warning' : 'info'}`}>{selectedTicket.priority}</span></p>
                    <p style={{ margin: 0 }}><strong>Customer:</strong> {selectedTicket.userName} ({selectedTicket.userEmail})</p>
                    <p style={{ margin: '8px 0 0' }}><strong>Created:</strong> {new Date(selectedTicket.createdAt).toLocaleString()}</p>
                  </div>
                  <div style={{ marginBottom: '20px', padding: '16px', background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                    <strong>Message:</strong>
                    <p style={{ margin: '8px 0 0', whiteSpace: 'pre-wrap' }}>{selectedTicket.message}</p>
                  </div>
                  {selectedTicket.orderId && (
                    <div style={{ marginBottom: '20px', padding: '12px', background: 'var(--color-primary-light)', borderRadius: 'var(--radius-md)' }}>
                      <strong>Related Order:</strong> {selectedTicket.orderId}
                    </div>
                  )}
                  {selectedTicket.adminReply && (
                    <div style={{ marginBottom: '20px', padding: '16px', background: 'var(--color-success-light)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-success)' }}>
                      <strong>Admin Reply ({new Date(selectedTicket.adminReplyAt).toLocaleString()}):</strong>
                      <p style={{ margin: '8px 0 0', whiteSpace: 'pre-wrap' }}>{selectedTicket.adminReply}</p>
                    </div>
                  )}
                  <div style={{ marginBottom: '20px' }}>
                    <h4>Admin Response</h4>
                    <textarea value={replyText} onChange={e => setReplyText(e.target.value)} className="input textarea" rows={4} placeholder="Type your reply here..." style={{ marginBottom: '12px' }} />
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn--primary" onClick={() => handleReply(selectedTicket.id)} disabled={selectedTicket.status === 'Resolved' || selectedTicket.status === 'Closed'}>Send & Resolve</button>
                      <button className="btn btn--secondary" onClick={() => handleStatusChange(selectedTicket.id, 'In Progress')} disabled={selectedTicket.status !== 'Open'}>Mark In Progress</button>
                      {(selectedTicket.status === 'Resolved' || selectedTicket.status === 'Closed') && <button className="btn btn--ghost" onClick={() => handleReopen(selectedTicket.id)}>Reopen</button>}
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-text-secondary)' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎫</div>
                  <h3>No ticket selected</h3>
                  <p>Click on a ticket from the list to view details and respond</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

const PageHeader = ({ title, subtitle, breadcrumb }) => (
  <header className="page-header" role="heading" aria-level="1">
    <div className="page-header__left">
      {breadcrumb && (
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <ol className="breadcrumb__list">
            {breadcrumb.map((item, i) => (
              <li key={item.href || i} className="breadcrumb__item">
                {i > 0 && (
                  <svg className="breadcrumb__separator" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                )}
                {item.href ? <a href={item.href} className="breadcrumb__link">{item.label}</a> : <span className="breadcrumb__current" aria-current="page">{item.label}</span>}
              </li>
            ))}
          </ol>
        </nav>
      )}
      <div>
        <h1 className="page-header__title">{title}</h1>
        {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
      </div>
    </div>
  </header>
);

const AdminLayout = ({ children }) => (
  <div className="admin-layout">
    <main className="admin-layout__main">
      <main className="admin-layout__content" role="main">
        <div className="container">{children}</div>
      </main>
    </main>
  </div>
);

export default AdminSupport;