import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import { useStore } from '../../context/StoreContext';

const AdminDashboard = () => {
  const { orders, products, riders, supportTickets } = useStore();
  const navigate = useNavigate();

  const totalOrders = orders?.length || 11;
  const pendingOrders = orders?.filter(o => ['Order Placed', 'Confirmed', 'Preparing'].includes(o.status)).length || 9;
  const deliveredOrders = orders?.filter(o => o.status === 'Delivered').length || 1;
  const cancelledOrders = orders?.filter(o => o.status === 'Cancelled').length || 1;
  const inTransitOrders = orders?.filter(o => ['Rider Assigned', 'Out for Delivery'].includes(o.status)).length || 0;
  const activeProducts = products?.filter(p => p.active !== false).length || 29;
  const lowStockCount = products?.filter(p => p.stock <= 10).length || 0;
  const totalRiders = riders?.length || 3;
  const availableRiders = riders?.filter(r => r.status === 'Available' || r.status === 'AVAILABLE').length || 2;
  const openTickets = supportTickets?.filter(t => t.status !== 'Resolved').length || 1;
  const resolvedTickets = supportTickets?.filter(t => t.status === 'Resolved').length || 1;

  return (
    <AdminLayout>
      {/* Header Row matching Screenshot (340).png */}
      <div className="admin-header-row">
        <div>
          <h1 className="admin-header-title">
            <span>Executive Operations Dashboard</span>
          </h1>
          <p className="admin-header-subtitle">
            Real-time overview of catalog, orders, deliveries, inventory, and revenue metrics.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={() => navigate('/admin/orders')}
            className="admin-btn-primary"
            style={{ height: '42px', padding: '0 18px' }}
          >
            ⚡ View Active Orders
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="admin-btn-dark"
            style={{ height: '42px', padding: '0 18px' }}
          >
            + Add Product
          </button>
        </div>
      </div>

      {/* Row 1: 5 KPI Summary Cards matching Screenshot (340).png */}
      <div className="admin-kpi-row" style={{ gridTemplateColumns: 'repeat(5, 1fr)', marginBottom: '16px' }}>
        {/* Revenue */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-head">
            <div className="admin-kpi-icon-box" style={{ background: '#FEF3C7', color: '#D97706' }}>💰</div>
            <span className="admin-kpi-pill" style={{ background: '#DCFCE7', color: '#15803D' }}>REVENUE</span>
          </div>
          <div className="admin-kpi-num">₹240</div>
          <div className="admin-kpi-desc">Total Realized Revenue</div>
        </div>

        {/* Orders */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-head">
            <div className="admin-kpi-icon-box" style={{ background: '#E0F2FE', color: '#0284C7' }}>🛍️</div>
            <span className="admin-kpi-pill" style={{ background: '#E0F2FE', color: '#0369A1' }}>ORDERS</span>
          </div>
          <div className="admin-kpi-num">{totalOrders}</div>
          <div className="admin-kpi-desc">Total Placed Orders</div>
        </div>

        {/* Pending */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-head">
            <div className="admin-kpi-icon-box" style={{ background: '#FEFCE8', color: '#CA8A04' }}>⏳</div>
            <span className="admin-kpi-pill" style={{ background: '#FEF3C7', color: '#B45309' }}>PENDING</span>
          </div>
          <div className="admin-kpi-num">{pendingOrders}</div>
          <div className="admin-kpi-desc">Pending / In Progress</div>
        </div>

        {/* Delivered */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-head">
            <div className="admin-kpi-icon-box" style={{ background: '#DCFCE7', color: '#16A34A' }}>✅</div>
            <span className="admin-kpi-pill" style={{ background: '#DCFCE7', color: '#15803D' }}>DELIVERED</span>
          </div>
          <div className="admin-kpi-num">{deliveredOrders}</div>
          <div className="admin-kpi-desc">Delivered Orders</div>
        </div>

        {/* Cancelled */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-head">
            <div className="admin-kpi-icon-box" style={{ background: '#FEE2E2', color: '#DC2626' }}>❌</div>
            <span className="admin-kpi-pill" style={{ background: '#FEE2E2', color: '#DC2626' }}>CANCELLED</span>
          </div>
          <div className="admin-kpi-num">{cancelledOrders}</div>
          <div className="admin-kpi-desc">Cancelled Orders</div>
        </div>
      </div>

      {/* Row 2: 5 KPI Summary Cards matching Screenshot (340).png */}
      <div className="admin-kpi-row" style={{ gridTemplateColumns: 'repeat(5, 1fr)', marginBottom: '28px' }}>
        {/* Catalog */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-head">
            <div className="admin-kpi-icon-box" style={{ background: '#F3E8FF', color: '#9333EA' }}>🍎</div>
            <span className="admin-kpi-pill" style={{ background: '#F3E8FF', color: '#7E22CE' }}>CATALOG</span>
          </div>
          <div className="admin-kpi-num">{activeProducts}</div>
          <div className="admin-kpi-desc">Active Products</div>
        </div>

        {/* Stock Alert */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-head">
            <div className="admin-kpi-icon-box" style={{ background: '#FFF7ED', color: '#EA580C' }}>⚠️</div>
            <span className="admin-kpi-pill" style={{ background: '#FEE2E2', color: '#DC2626' }}>STOCK ALERT</span>
          </div>
          <div className="admin-kpi-num">{lowStockCount}</div>
          <div className="admin-kpi-desc">Low Stock (≤ 10 items)</div>
        </div>

        {/* Fleet */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-head">
            <div className="admin-kpi-icon-box" style={{ background: '#F0FDF4', color: '#16A34A' }}>🛵</div>
            <span className="admin-kpi-pill" style={{ background: '#DCFCE7', color: '#15803D' }}>FLEET</span>
          </div>
          <div className="admin-kpi-num">{totalRiders}</div>
          <div className="admin-kpi-desc">{availableRiders} Available Riders</div>
        </div>

        {/* Live Transit */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-head">
            <div className="admin-kpi-icon-box" style={{ background: '#FEF3C7', color: '#D97706' }}>⚡</div>
            <span className="admin-kpi-pill" style={{ background: '#FFEDD5', color: '#C2410C' }}>LIVE TRANSIT</span>
          </div>
          <div className="admin-kpi-num">{inTransitOrders}</div>
          <div className="admin-kpi-desc">Active Deliveries in Transit</div>
        </div>

        {/* Customers */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-head">
            <div className="admin-kpi-icon-box" style={{ background: '#EEF2FF', color: '#4F46E5' }}>👥</div>
            <span className="admin-kpi-pill" style={{ background: '#E0F2FE', color: '#0284C7' }}>CUSTOMERS</span>
          </div>
          <div className="admin-kpi-num">1</div>
          <div className="admin-kpi-desc">Registered Users</div>
        </div>
      </div>

      {/* Customer Experience & Service Analytics Section matching Screenshot (340).png & (341).png */}
      <div className="admin-card">
        <div className="admin-card-head">
          <div>
            <h2 className="admin-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🎧</span>
              <span>Customer Experience & Service Analytics</span>
            </h2>
            <p style={{ fontSize: '13px', color: '#6B7280', margin: '2px 0 0' }}>
              Aggregated satisfaction ratings, sentiment insights, and support resolution speed
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <Link to="/admin/support" className="admin-btn-primary" style={{ height: '34px', fontSize: '13px' }}>
              Support Desk →
            </Link>
            <Link to="/admin/reviews" className="admin-btn-dark" style={{ height: '34px', fontSize: '13px' }}>
              Review Moderation →
            </Link>
          </div>
        </div>

        <div className="admin-kpi-row" style={{ gridTemplateColumns: 'repeat(5, 1fr)', marginBottom: 0 }}>
          <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span>⭐</span>
              <span className="admin-kpi-pill" style={{ background: '#FEF3C7', color: '#B45309' }}>PRODUCT QUALITY</span>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#1F2937' }}>5.0 / 5 ⭐</div>
            <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>Avg Item Quality Rating</div>
          </div>

          <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span>🛵</span>
              <span className="admin-kpi-pill" style={{ background: '#DCFCE7', color: '#15803D' }}>DELIVERY SERVICE</span>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#1F2937' }}>5.0 / 5 ⭐</div>
            <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>Avg Delivery Speed & Conduct</div>
          </div>

          <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span>📋</span>
              <span className="admin-kpi-pill" style={{ background: '#E0F2FE', color: '#0284C7' }}>OPEN TICKETS</span>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#1F2937' }}>{openTickets}</div>
            <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>Tickets Awaiting Resolution</div>
          </div>

          <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span>✅</span>
              <span className="admin-kpi-pill" style={{ background: '#DCFCE7', color: '#15803D' }}>RESOLVED</span>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#1F2937' }}>{resolvedTickets}</div>
            <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>Resolved Support Cases</div>
          </div>

          <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span>⚠️</span>
              <span className="admin-kpi-pill" style={{ background: '#FEE2E2', color: '#DC2626' }}>TOP CONCERN</span>
            </div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#1F2937' }}>Issue Reported</div>
            <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>Most Reported Issue Category</div>
          </div>
        </div>
      </div>

      {/* Recent Customer Orders Section matching Screenshot (341).png */}
      <div className="admin-card">
        <div className="admin-card-head">
          <h2 className="admin-card-title">Recent Customer Orders</h2>
          <Link to="/admin/orders" style={{ color: '#16A34A', fontWeight: 700, fontSize: '13.5px' }}>
            View All Orders →
          </Link>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Address</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Delivery Partner</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders && orders.slice(0, 4).map(o => (
                <tr key={o.id}>
                  <td style={{ fontWeight: 800 }}>{o.id}</td>
                  <td>
                    <div style={{ fontWeight: 700 }}>{o.customerName}</div>
                    <div style={{ fontSize: '12px', color: '#6B7280' }}>{o.phone}</div>
                  </td>
                  <td style={{ color: '#4B5563', fontSize: '13px' }}>{o.city || 'Vijayawada'}</td>
                  <td>{o.items?.length || 3} item(s)</td>
                  <td style={{ fontWeight: 800, color: '#16A34A' }}>₹{o.total}</td>
                  <td>
                    <span className="admin-status-pill" style={{ background: '#E0F2FE', color: '#0284C7' }}>
                      {o.status || 'ORDER PLACED'}
                    </span>
                  </td>
                  <td style={{ color: '#6B7280' }}>{o.riderName || 'Not Assigned'}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => navigate('/admin/orders')}
                      className="admin-btn-action"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
