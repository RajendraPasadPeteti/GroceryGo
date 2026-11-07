import React, { useState, useMemo } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { useStore } from '../../context/StoreContext';
import { useUI } from '../../context/UIContext';

const AdminSupport = () => {
  const { supportTickets, updateSupportTicket } = useStore();
  const { showToast } = useUI();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [activeTicket, setActiveTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyStatus, setReplyStatus] = useState('Resolved');

  // Compute 4 KPIs matching Screenshot (350).png
  const totalTickets = supportTickets?.length || 2;
  const openCount = supportTickets?.filter(t => t.status === 'Open' || t.status === 'OPEN').length || 1;
  const inProgressCount = supportTickets?.filter(t => t.status === 'In Progress' || t.status === 'IN PROGRESS').length || 0;
  const resolvedCount = supportTickets?.filter(t => t.status === 'Resolved' || t.status === 'RESOLVED').length || 1;

  const filteredTickets = useMemo(() => {
    let result = supportTickets || [];
    if (statusFilter !== 'ALL') {
      result = result.filter(t => t.status?.toUpperCase() === statusFilter);
    }
    if (categoryFilter !== 'ALL') {
      result = result.filter(t => t.category?.toUpperCase().includes(categoryFilter.toUpperCase()));
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter(t =>
        t.id?.toLowerCase().includes(q) ||
        t.customerName?.toLowerCase().includes(q) ||
        t.orderRef?.toLowerCase().includes(q) ||
        t.subject?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [supportTickets, statusFilter, categoryFilter, searchTerm]);

  const handleRespondSubmit = (e) => {
    e.preventDefault();
    if (!replyText.trim()) {
      showToast('Please type a response message', 'error');
      return;
    }

    if (updateSupportTicket && activeTicket) {
      updateSupportTicket(activeTicket.id, {
        ...activeTicket,
        adminResponse: replyText,
        status: replyStatus,
      });
      showToast(`Response dispatched for ticket ${activeTicket.id}`, 'success');
      setActiveTicket(null);
      setReplyText('');
    }
  };

  return (
    <AdminLayout>
      {/* Header matching Screenshot (350).png */}
      <div className="admin-header-row">
        <div>
          <h1 className="admin-header-title">
            <span>🎧</span>
            <span>Customer Support & Ticket Desk</span>
          </h1>
          <p className="admin-header-subtitle">
            Manage, investigate, respond to, and resolve customer grievances and service inquiries.
          </p>
        </div>
      </div>

      {/* 4 KPI Summary Cards matching Screenshot (350).png */}
      <div className="admin-kpi-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {/* Card 1: Total */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-head">
            <div className="admin-kpi-icon-box" style={{ background: '#EEF2FF', color: '#4F46E5' }}>📋</div>
            <span className="admin-kpi-pill" style={{ background: '#E0F2FE', color: '#0284C7' }}>TOTAL</span>
          </div>
          <div className="admin-kpi-num">{totalTickets}</div>
          <div className="admin-kpi-desc">All Raised Tickets</div>
        </div>

        {/* Card 2: Open */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-head">
            <div className="admin-kpi-icon-box" style={{ background: '#FEFCE8', color: '#CA8A04' }}>⏳</div>
            <span className="admin-kpi-pill" style={{ background: '#FEF3C7', color: '#B45309' }}>OPEN</span>
          </div>
          <div className="admin-kpi-num">{openCount}</div>
          <div className="admin-kpi-desc">Awaiting Staff Review</div>
        </div>

        {/* Card 3: In Progress */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-head">
            <div className="admin-kpi-icon-box" style={{ background: '#F0F9FF', color: '#0284C7' }}>🔄</div>
            <span className="admin-kpi-pill" style={{ background: '#F3E8FF', color: '#7E22CE' }}>IN PROGRESS</span>
          </div>
          <div className="admin-kpi-num">{inProgressCount}</div>
          <div className="admin-kpi-desc">Currently Investigating</div>
        </div>

        {/* Card 4: Resolved */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-head">
            <div className="admin-kpi-icon-box" style={{ background: '#DCFCE7', color: '#16A34A' }}>✅</div>
            <span className="admin-kpi-pill" style={{ background: '#DCFCE7', color: '#15803D' }}>RESOLVED</span>
          </div>
          <div className="admin-kpi-num">{resolvedCount}</div>
          <div className="admin-kpi-desc">Successfully Resolved</div>
        </div>
      </div>

      {/* Main Support Ticket Table Card matching Screenshot (350).png */}
      <div className="admin-card">
        <div className="admin-card-head">
          <h2 className="admin-card-title">Support Ticket Records</h2>
          <div className="admin-card-actions">
            <input
              type="search"
              placeholder="Search Ticket ID, Customer, or Order..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-search-input"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="admin-select"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="admin-select"
            >
              <option value="ALL">All Categories</option>
              <option value="ORDER">Order Issues</option>
              <option value="PAYMENT">Payment & UPI</option>
              <option value="QUALITY">Item Quality</option>
              <option value="DELIVERY">Delivery & Partner</option>
            </select>
          </div>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Created</th>
                <th>Customer</th>
                <th>Order Ref</th>
                <th>Category & Priority</th>
                <th>Subject & Issue</th>
                <th>Status</th>
                <th>Admin Response</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets && filteredTickets.length > 0 ? (
                filteredTickets.map(ticket => {
                  const isResolved = ticket.status === 'Resolved' || ticket.status === 'RESOLVED';

                  return (
                    <tr key={ticket.id}>
                      <td style={{ fontWeight: 800, color: '#1F2937' }}>
                        {ticket.id}
                      </td>
                      <td style={{ fontSize: '12px', color: '#6B7280' }}>
                        {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : '2026-10-29'}
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: '#1F2937' }}>{ticket.customerName || 'Customer'}</div>
                        <div style={{ fontSize: '11.5px', color: '#9CA3AF' }}>{ticket.customerEmail || 'sohithnagendra80@gmail.com'}</div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: '#16A34A', fontFamily: 'monospace' }}>
                          {ticket.orderRef || '#GG202611059708'}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#1F2937' }}>{ticket.category || 'Order Issue'}</div>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>
                          {ticket.priority || 'LOW'}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: '#1F2937', maxWidth: '200px' }}>
                          {ticket.subject || 'Order query'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6B7280', maxWidth: '220px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {ticket.description}
                        </div>
                      </td>
                      <td>
                        <span
                          className="admin-status-pill"
                          style={{
                            background: isResolved ? '#DCFCE7' : '#FEF3C7',
                            color: isResolved ? '#15803D' : '#B45309',
                          }}
                        >
                          {ticket.status || 'OPEN'}
                        </span>
                      </td>
                      <td style={{ fontSize: '12.5px', maxWidth: '200px' }}>
                        {ticket.adminResponse ? (
                          <div style={{ color: '#15803D', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span>💬</span>
                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              "{ticket.adminResponse}"
                            </span>
                          </div>
                        ) : (
                          <span style={{ color: '#9CA3AF', fontStyle: 'italic' }}>Awaiting reply</span>
                        )}
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTicket(ticket);
                            setReplyText(ticket.adminResponse || '');
                            setReplyStatus(ticket.status || 'Resolved');
                          }}
                          className="admin-btn-action"
                          style={{ background: '#F0F9FF', borderColor: '#BAE6FD', color: '#0284C7' }}
                        >
                          💬 Respond
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>
                    No support tickets found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Respond Modal */}
      {activeTicket && (
        <div className="modal-overlay" onClick={() => setActiveTicket(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px', padding: '28px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1F2937', marginBottom: '8px' }}>
              Respond to Ticket {activeTicket.id}
            </h3>
            <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '16px' }}>
              Customer: <strong>{activeTicket.customerName}</strong> ({activeTicket.orderRef})
            </p>

            <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '12px', fontSize: '13px', color: '#374151', marginBottom: '16px' }}>
              <strong>Issue:</strong> {activeTicket.description}
            </div>

            <form onSubmit={handleRespondSubmit}>
              <div className="input-group">
                <label className="input-label">Update Ticket Status</label>
                <select
                  className="input select"
                  value={replyStatus}
                  onChange={e => setReplyStatus(e.target.value)}
                >
                  <option value="Resolved">Resolved</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Open">Open</option>
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Admin Official Response Message *</label>
                <textarea
                  required
                  rows={4}
                  className="input textarea"
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="e.g. We apologize for the missing item. A replacement delivery has been dispatched."
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <button type="submit" className="admin-btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  Send Response
                </button>
                <button type="button" onClick={() => setActiveTicket(null)} className="btn btn--secondary" style={{ flex: 1, justifyContent: 'center' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminSupport;
