import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';

const orderStatuses = ['Order Placed', 'Confirmed', 'Preparing', 'Rider Assigned', 'Out for Delivery', 'Delivered', 'Cancelled'];

const AdminOrders = () => {
  const { orders, products: _products, riders, updateOrderStatus, assignRiderToOrder, cancelOrder: _cancelOrder, refreshOrders: _refreshOrders, refreshRiders, refreshProducts } = useStore();
  const { isAuthenticated: _isAuthenticated, isAdmin: _isAdmin, protectPage } = useAuth();
  const { showToast, openModal, closeModal } = useUI();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingOrder, setViewingOrder] = useState(null);
  const [assigningOrder, setAssigningOrder] = useState(null);

  useEffect(() => { protectPage('admin'); }, [protectPage]);

  const filteredOrders = useMemo(() => {
    let result = [...orders].sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
    if (filter !== 'all') result = result.filter(o => o.status === filter);
    if (searchTerm) result = result.filter(o => o.id.toLowerCase().includes(searchTerm.toLowerCase()) || o.customerName.toLowerCase().includes(searchTerm.toLowerCase()));
    return result;
  }, [orders, filter, searchTerm]);

  const handleStatusChange = (orderId, newStatus) => {
    updateOrderStatus(orderId, newStatus);
    if (newStatus === 'Cancelled') { refreshProducts(); refreshRiders(); }
    showToast(`Order ${orderId} updated to ${newStatus}`, 'success');
    if (viewingOrder?.id === orderId) setViewingOrder({ ...viewingOrder, status: newStatus });
  };

  const handleAssignRider = (orderId, riderId) => {
    assignRiderToOrder(orderId, riderId);
    showToast('Rider assigned successfully', 'success');
    closeModal('assignRider');
    setAssigningOrder(null);
  };

  const openAssignModal = (order) => {
    setAssigningOrder(order);
    openModal('assignRider');
  };

  return (
    <AdminLayout>
      <div className="admin-orders">
        <PageHeader
          title="Order Management"
          subtitle="Process and fulfill customer orders"
          breadcrumb={[{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Orders' }]}
        />
        <div className="card" style={{ marginBottom: '20px' }}>
          <div className="card__body" style={{ padding: '20px' }}>
            <div className="grid-3" style={{ gap: '16px', alignItems: 'end' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label htmlFor="ord-search" className="input-label">Search Orders</label>
                <input id="ord-search" type="search" className="input" placeholder="Order ID or customer..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label htmlFor="ord-filter" className="input-label">Status Filter</label>
                <select id="ord-filter" className="input select" value={filter} onChange={e => setFilter(e.target.value)}>
                  <option value="all">All Statuses</option>
                  {orderStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="table-responsive">
            <table className="table" role="table">
              <thead>
                <tr>
                  <th scope="col">Order ID</th>
                  <th scope="col">Customer</th>
                  <th scope="col">Items</th>
                  <th scope="col">Total</th>
                  <th scope="col">Payment</th>
                  <th scope="col">Status</th>
                  <th scope="col">Rider</th>
                  <th scope="col">Date</th>
                  <th scope="col"><span className="visually-hidden">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => (
                  <tr key={order.id}>
                    <td><strong>{order.id}</strong></td>
                    <td>{order.customerName}<br /><small>{order.phone}</small></td>
                    <td>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</td>
                    <td>₹{order.total}</td>
                    <td><span className={`badge badge--${order.paymentStatus === 'Paid' ? 'success' : 'warning'}`}>{order.paymentMethod} ({order.paymentStatus})</span></td>
                    <td><span className={`badge badge--${getStatusBadge(order.status)}`}>{order.status}</span></td>
                    <td>{order.riderName ? (
                      <>
                        <div className="avatar avatar--sm">{order.riderName.charAt(0)}</div>
                        {order.riderName}<br /><small>{order.riderVehicle}</small>
                      </>
                    ) : '—'}</td>
                    <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn btn--ghost btn--sm" onClick={() => setViewingOrder(order)}>View</button>
                        {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                          !order.riderId ? (
                            <button className="btn btn--primary btn--sm" onClick={() => openAssignModal(order)}>Assign Rider</button>
                          ) : (
                            <select className="input select input--sm" value={order.status} onChange={e => handleStatusChange(order.id, e.target.value)}>
                              {orderStatuses.filter(s => orderStatuses.indexOf(s) > orderStatuses.indexOf(order.status) || s === order.status).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredOrders.length === 0 && (
            <div className="empty-state" style={{ padding: '60px' }}>
              <h3 className="empty-state__title">No orders found</h3>
            </div>
          )}
        </div>

        {viewingOrder && <OrderDetailModal order={viewingOrder} onClose={() => { closeModal('orderDetail'); setViewingOrder(null); }} />}
        {assigningOrder && <AssignRiderModal order={assigningOrder} riders={riders.filter(r => r.status === 'Available')} onAssign={handleAssignRider} onClose={() => { closeModal('assignRider'); setAssigningOrder(null); }} />}
      </div>
    </AdminLayout>
  );
};

const getStatusBadge = (s) => s === 'Delivered' ? 'success' : s === 'Cancelled' ? 'danger' : s === 'Out for Delivery' || s === 'Rider Assigned' ? 'primary' : s === 'Preparing' || s === 'Confirmed' ? 'info' : 'info';

const OrderDetailModal = ({ order, onClose }) => (
  <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="order-detail-title">
    <div className="modal modal--large" onClick={e => e.stopPropagation()}>
      <div className="modal__header">
        <h2 id="order-detail-title" className="modal__title">Order {order.id}</h2>
        <button className="modal__close" onClick={onClose} aria-label="Close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      <div className="modal__body">
        <div className="grid-2">
          <div>
            <h4>Customer</h4>
            <p>{order.customerName}<br />{order.phone}<br />{order.address}, {order.city} - {order.pincode}</p>
          </div>
          <div>
            <h4>Payment</h4>
            <p>{order.paymentMethod} - <span className={`badge badge--${order.paymentStatus === 'Paid' ? 'success' : 'warning'}`}>{order.paymentStatus}</span>{order.transactionId && <> <br /><small>TXN: {order.transactionId}</small></>}</p>
          </div>
        </div>
        <h4 style={{ marginTop: '20px' }}>Items</h4>
        <div style={{ marginTop: '12px' }}>
          <table className="table" role="table">
            <thead>
              <tr>
                <th scope="col">Product</th>
                <th scope="col">Qty</th>
                <th scope="col">Price</th>
                <th scope="col">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map(item => (
                <tr key={item.id}>
                  <td>{item.icon} {item.name}</td>
                  <td>{item.quantity}</td>
                  <td>₹{item.price}</td>
                  <td>₹{item.price * item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: '20px', textAlign: 'right' }}>
          <strong>Total: ₹{order.total}</strong>
        </div>
      </div>
      <div className="modal__footer">
        <button className="btn btn--secondary" onClick={onClose}>Close</button>
      </div>
    </div>
  </div>
);

const AssignRiderModal = ({ order, riders, onAssign, onClose }) => (
  <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="assign-rider-title">
    <div className="modal" onClick={e => e.stopPropagation()}>
      <div className="modal__header">
        <h2 id="assign-rider-title" className="modal__title">Assign Rider to {order.id}</h2>
        <button className="modal__close" onClick={onClose} aria-label="Close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      <div className="modal__body">
        {riders.length === 0 ? (
          <p>No available riders</p>
        ) : (
          riders.map(r => (
            <button key={r.id} className="btn btn--secondary btn--full" style={{ textAlign: 'left', marginBottom: '8px' }} onClick={() => onAssign(order.id, r.id)}>
              <div className="avatar avatar--sm">{r.name.charAt(0)}</div>
              <div><strong>{r.name}</strong><br /><small>{r.vehicleType} - {r.vehicleNumber} | ⭐ {r.rating}</small></div>
            </button>
          ))
        )}
      </div>
    </div>
  </div>
);

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

export default AdminOrders;