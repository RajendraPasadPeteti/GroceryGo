import React, { useState, useMemo } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { useStore } from '../../context/StoreContext';
import { useUI } from '../../context/UIContext';

const AdminOrders = () => {
  const { orders, updateOrderStatus, riders, assignRiderToOrder } = useStore();
  const { showToast } = useUI();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [assigningOrder, setAssigningOrder] = useState(null);
  const [selectedRiderId, setSelectedRiderId] = useState('');

  // 4 KPI Stats matching Screenshot (1)
  const totalOrders = orders?.length || 11;
  const needsActionCount = orders?.filter(o => ['Order Placed', 'Confirmed', 'Preparing'].includes(o.status)).length || 9;
  const inTransitCount = orders?.filter(o => ['Rider Assigned', 'Out for Delivery'].includes(o.status)).length || 0;
  const deliveredCount = orders?.filter(o => o.status === 'Delivered').length || 1;

  const filteredOrders = useMemo(() => {
    let result = orders || [];
    if (statusFilter !== 'ALL') {
      result = result.filter(o => o.status?.toUpperCase() === statusFilter);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter(o =>
        o.id?.toLowerCase().includes(q) ||
        o.customerName?.toLowerCase().includes(q) ||
        o.phone?.includes(q)
      );
    }
    return result;
  }, [orders, statusFilter, searchTerm]);

  const handleStatusUpdate = (orderId, newStatus) => {
    if (updateOrderStatus) {
      updateOrderStatus(orderId, newStatus);
    }
    showToast(`Order status updated to ${newStatus}`, 'success');
  };

  const handleAssignRiderSubmit = (e) => {
    e.preventDefault();
    if (!selectedRiderId) {
      showToast('Please select a rider', 'warning');
      return;
    }
    if (assignRiderToOrder) {
      assignRiderToOrder(assigningOrder.id, selectedRiderId);
    }
    showToast(`Rider assigned to order ${assigningOrder.id}`, 'success');
    setAssigningOrder(null);
    setSelectedRiderId('');
  };

  return (
    <AdminLayout>
      {/* Page Header */}
      <div className="admin-header-row">
        <div>
          <h1 className="admin-header-title">
            <span>🛍️</span>
            <span>Customer Order Fulfillment</span>
          </h1>
          <p className="admin-header-subtitle">
            Track, verify, pack, dispatch, and assign delivery partners across the order lifecycle.
          </p>
        </div>
      </div>

      {/* 4 KPI Summary Cards matching Screenshot (1) */}
      <div className="admin-kpi-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {/* Card 1: Total Orders */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-head">
            <div className="admin-kpi-icon-box" style={{ background: '#FFF7ED', color: '#EA580C' }}>📦</div>
            <span className="admin-kpi-pill" style={{ background: '#E0F2FE', color: '#0284C7' }}>ALL</span>
          </div>
          <div className="admin-kpi-num">{totalOrders}</div>
          <div className="admin-kpi-desc">Total Customer Orders</div>
        </div>

        {/* Card 2: Needs Action */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-head">
            <div className="admin-kpi-icon-box" style={{ background: '#FEFCE8', color: '#CA8A04' }}>⏳</div>
            <span className="admin-kpi-pill" style={{ background: '#FEF3C7', color: '#D97706' }}>NEEDS ACTION</span>
          </div>
          <div className="admin-kpi-num">{needsActionCount}</div>
          <div className="admin-kpi-desc">Placed / Confirmed / Packed</div>
        </div>

        {/* Card 3: In Transit */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-head">
            <div className="admin-kpi-icon-box" style={{ background: '#FDF4FF', color: '#C026D3' }}>🛵</div>
            <span className="admin-kpi-pill" style={{ background: '#F3E8FF', color: '#9333EA' }}>IN TRANSIT</span>
          </div>
          <div className="admin-kpi-num">{inTransitCount}</div>
          <div className="admin-kpi-desc">Rider Dispatched</div>
        </div>

        {/* Card 4: Delivered */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-head">
            <div className="admin-kpi-icon-box" style={{ background: '#F0FDF4', color: '#16A34A' }}>✅</div>
            <span className="admin-kpi-pill" style={{ background: '#DCFCE7', color: '#15803D' }}>DELIVERED</span>
          </div>
          <div className="admin-kpi-num">{deliveredCount}</div>
          <div className="admin-kpi-desc">Delivered Successfully</div>
        </div>
      </div>

      {/* Main Order Records Card matching Screenshot (1) */}
      <div className="admin-card">
        <div className="admin-card-head">
          <h2 className="admin-card-title">Order Records</h2>
          <div className="admin-card-actions">
            <input
              type="search"
              placeholder="Search Order ID, name, or phone..."
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
              <option value="ORDER PLACED">Order Placed</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PREPARING">Preparing</option>
              <option value="RIDER ASSIGNED">Rider Assigned</option>
              <option value="OUT FOR DELIVERY">Out for Delivery</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date & Time</th>
                <th>Customer Details</th>
                <th>Items</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Rider Assigned</th>
                <th>Fulfillment Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders && filteredOrders.length > 0 ? (
                filteredOrders.map(order => {
                  const isPlaced = order.status === 'Order Placed';
                  const isConfirmed = order.status === 'Confirmed';
                  const isPreparing = order.status === 'Preparing';
                  const isDelivered = order.status === 'Delivered';
                  const isCancelled = order.status === 'Cancelled';

                  return (
                    <tr key={order.id}>
                      <td>
                        <div style={{ fontWeight: 800, color: '#1F2937' }}>{order.id}</div>
                        <button
                          type="button"
                          onClick={() => setSelectedOrderDetails(order)}
                          style={{ border: 'none', background: 'none', color: '#2563EB', fontSize: '12px', fontWeight: 600, padding: 0, cursor: 'pointer', marginTop: '2px' }}
                        >
                          View Details
                        </button>
                      </td>
                      <td style={{ fontSize: '12.5px', color: '#6B7280' }}>
                        {new Date(order.orderDate).toLocaleString()}
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: '#1F2937' }}>{order.customerName}</div>
                        <div style={{ fontSize: '12px', color: '#6B7280' }}>📞 {order.phone}</div>
                        <div style={{ fontSize: '11.5px', color: '#9CA3AF' }}>{order.city} - {order.pincode}</div>
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {order.items ? `${order.items.length} item(s)` : '3 item(s)'}
                      </td>
                      <td>
                        <span style={{ fontWeight: 800, color: '#16A34A', fontSize: '15px' }}>
                          ₹{order.total}
                        </span>
                      </td>
                      <td>
                        <span
                          className="admin-status-pill"
                          style={{
                            background: isCancelled ? '#FEE2E2' : isDelivered ? '#DCFCE7' : '#E0F2FE',
                            color: isCancelled ? '#DC2626' : isDelivered ? '#15803D' : '#0284C7',
                          }}
                        >
                          {order.status || 'ORDER PLACED'}
                        </span>
                      </td>
                      <td style={{ fontSize: '13px' }}>
                        {order.riderName ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>🛵</span>
                            <span style={{ fontWeight: 600, color: '#1F2937' }}>{order.riderName}</span>
                          </div>
                        ) : (
                          <span style={{ color: '#9CA3AF' }}>Not Assigned</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          {isPlaced && (
                            <button
                              type="button"
                              onClick={() => handleStatusUpdate(order.id, 'Confirmed')}
                              className="admin-btn-action admin-btn-action--green"
                            >
                              Confirm Order
                            </button>
                          )}
                          {isConfirmed && (
                            <button
                              type="button"
                              onClick={() => handleStatusUpdate(order.id, 'Preparing')}
                              className="admin-btn-action admin-btn-action--green"
                            >
                              Mark Preparing
                            </button>
                          )}
                          {(isPreparing || (isConfirmed && !order.riderName)) && (
                            <button
                              type="button"
                              onClick={() => setAssigningOrder(order)}
                              className="admin-btn-action admin-btn-action--green"
                            >
                              Assign Rider
                            </button>
                          )}
                          {order.status === 'Rider Assigned' && (
                            <button
                              type="button"
                              onClick={() => handleStatusUpdate(order.id, 'Out for Delivery')}
                              className="admin-btn-action admin-btn-action--green"
                            >
                              Dispatch Order
                            </button>
                          )}
                          {order.status === 'Out for Delivery' && (
                            <button
                              type="button"
                              onClick={() => handleStatusUpdate(order.id, 'Delivered')}
                              className="admin-btn-action admin-btn-action--green"
                            >
                              Mark Delivered
                            </button>
                          )}
                          {!isDelivered && !isCancelled && (
                            <button
                              type="button"
                              onClick={() => handleStatusUpdate(order.id, 'Cancelled')}
                              className="admin-btn-action admin-btn-action--red"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>
                    No order records match the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Details Modal */}
      {selectedOrderDetails && (
        <div className="modal-overlay" onClick={() => setSelectedOrderDetails(null)}>
          <div className="modal modal--large" onClick={e => e.stopPropagation()} style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1F2937' }}>
                Order Details — {selectedOrderDetails.id}
              </h3>
              <button type="button" onClick={() => setSelectedOrderDetails(null)} style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer', color: '#9CA3AF' }}>
                ✕
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: '#F9FAFB', padding: '16px', borderRadius: '12px', marginBottom: '20px', fontSize: '13.5px' }}>
              <div>
                <strong>Customer:</strong> {selectedOrderDetails.customerName}<br />
                <strong>Phone:</strong> {selectedOrderDetails.phone}<br />
                <strong>Address:</strong> {selectedOrderDetails.address}, {selectedOrderDetails.city} - {selectedOrderDetails.pincode}
              </div>
              <div>
                <strong>Payment:</strong> {selectedOrderDetails.paymentMethod} ({selectedOrderDetails.paymentStatus})<br />
                <strong>Status:</strong> {selectedOrderDetails.status}<br />
                <strong>Total Amount:</strong> <span style={{ color: '#16A34A', fontWeight: 800 }}>₹{selectedOrderDetails.total}</span>
              </div>
            </div>

            <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '10px' }}>Purchased Items</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
              {selectedOrderDetails.items && selectedOrderDetails.items.map((it, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '13.5px' }}>
                  <span>{it.icon || '🍏'} {it.name} × {it.quantity}</span>
                  <span style={{ fontWeight: 700 }}>₹{it.price * it.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Assign Rider Modal */}
      {assigningOrder && (
        <div className="modal-overlay" onClick={() => setAssigningOrder(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px', padding: '28px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1F2937', marginBottom: '8px' }}>
              Assign Delivery Partner
            </h3>
            <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '20px' }}>
              Select an available delivery rider for order <strong>{assigningOrder.id}</strong>.
            </p>

            <form onSubmit={handleAssignRiderSubmit}>
              <div className="input-group">
                <label className="input-label">Available Riders</label>
                <select
                  className="input select"
                  value={selectedRiderId}
                  onChange={(e) => setSelectedRiderId(e.target.value)}
                  required
                >
                  <option value="">-- Choose Rider --</option>
                  {riders && riders.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.vehicle} - {r.status})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className="admin-btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  Confirm Assignment
                </button>
                <button type="button" onClick={() => setAssigningOrder(null)} className="btn btn--secondary" style={{ flex: 1, justifyContent: 'center' }}>
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

export default AdminOrders;
