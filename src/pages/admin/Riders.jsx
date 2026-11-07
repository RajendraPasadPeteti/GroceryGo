import React, { useState, useMemo } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { useStore } from '../../context/StoreContext';
import { useUI } from '../../context/UIContext';

const AdminRiders = () => {
  const { riders, addRider, updateRider, deleteRider } = useStore();
  const { showToast } = useUI();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [vehicleFilter, setVehicleFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRider, setEditingRider] = useState(null);

  const [riderForm, setRiderForm] = useState({
    name: '',
    phone: '',
    email: '',
    vehicle: 'Bike',
    license: '',
    plate: '',
  });

  // Calculate 5 KPIs matching Screenshot (2)
  const totalFleet = riders?.length || 3;
  const readyCount = riders?.filter(r => r.status === 'Available' || r.status === 'AVAILABLE').length || 2;
  const inTransitCount = riders?.filter(r => r.status === 'Busy' || r.status === 'BUSY (ON DELIVERY)').length || 1;
  const offlineCount = riders?.filter(r => r.status === 'Offline' || r.status === 'OFFLINE').length || 0;
  const suspendedCount = riders?.filter(r => r.status === 'Suspended' || r.status === 'SUSPENDED').length || 0;

  const filteredRiders = useMemo(() => {
    let result = riders || [];
    if (statusFilter !== 'ALL') {
      result = result.filter(r => r.status?.toUpperCase().includes(statusFilter));
    }
    if (vehicleFilter !== 'ALL') {
      result = result.filter(r => r.vehicle?.toUpperCase().includes(vehicleFilter));
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter(r =>
        r.name?.toLowerCase().includes(q) ||
        r.id?.toLowerCase().includes(q) ||
        r.phone?.includes(q) ||
        r.license?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [riders, statusFilter, vehicleFilter, searchTerm]);

  const handleToggleStatus = (rider) => {
    const nextStatus = rider.status === 'Available' ? 'Busy' : rider.status === 'Busy' ? 'Offline' : 'Available';
    if (updateRider) {
      updateRider(rider.id, { ...rider, status: nextStatus });
    }
    showToast(`Rider ${rider.name} marked as ${nextStatus}`, 'success');
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Delete rider record for ${name}?`)) {
      if (deleteRider) deleteRider(id);
      showToast(`Rider ${name} removed`, 'info');
    }
  };

  const handleSaveRider = (e) => {
    e.preventDefault();
    if (editingRider) {
      updateRider(editingRider.id, {
        ...editingRider,
        name: riderForm.name,
        phone: riderForm.phone,
        email: riderForm.email,
        vehicle: `${riderForm.vehicle} (${riderForm.plate})`,
        license: riderForm.license,
      });
      showToast('Rider profile updated', 'success');
    } else {
      const newId = '#R' + String(Date.now()).slice(-3);
      addRider({
        id: newId,
        name: riderForm.name,
        phone: riderForm.phone,
        email: riderForm.email,
        vehicle: `${riderForm.vehicle} (${riderForm.plate || 'AP16EF9012'})`,
        license: riderForm.license || 'DL. DL456789123',
        status: 'Available',
        deliveriesCompleted: 0,
        joinedDate: '2026-03-10',
      });
      showToast('New delivery partner registered!', 'success');
    }
    setShowAddModal(false);
    setEditingRider(null);
    setRiderForm({ name: '', phone: '', email: '', vehicle: 'Bike', license: '', plate: '' });
  };

  return (
    <AdminLayout>
      {/* Page Header matching Screenshot (2) */}
      <div className="admin-header-row">
        <div>
          <h1 className="admin-header-title">
            <span>🛵</span>
            <span>Delivery Fleet & Rider Management</span>
          </h1>
          <p className="admin-header-subtitle">
            Register new delivery partners, manage vehicle compliance, monitor real-time availability, and dispatch orders.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingRider(null);
            setRiderForm({ name: '', phone: '', email: '', vehicle: 'Bike', license: '', plate: '' });
            setShowAddModal(true);
          }}
          className="admin-btn-primary"
          style={{ height: '42px', padding: '0 20px', fontSize: '14px' }}
        >
          + Register New Rider
        </button>
      </div>

      {/* 5 KPI Summary Cards matching Screenshot (2) */}
      <div className="admin-kpi-row" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        {/* Card 1: Total Fleet */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-head">
            <div className="admin-kpi-icon-box" style={{ background: '#FFF1F2', color: '#E11D48' }}>🛵</div>
            <span className="admin-kpi-pill" style={{ background: '#E0F2FE', color: '#0284C7' }}>FLEET</span>
          </div>
          <div className="admin-kpi-num">{totalFleet}</div>
          <div className="admin-kpi-desc">Total Registered Fleet</div>
        </div>

        {/* Card 2: Ready */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-head">
            <div className="admin-kpi-icon-box" style={{ background: '#DCFCE7', color: '#16A34A' }}>🟢</div>
            <span className="admin-kpi-pill" style={{ background: '#DCFCE7', color: '#15803D' }}>READY</span>
          </div>
          <div className="admin-kpi-num">{readyCount}</div>
          <div className="admin-kpi-desc">Available for Dispatch</div>
        </div>

        {/* Card 3: In Transit */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-head">
            <div className="admin-kpi-icon-box" style={{ background: '#FEF3C7', color: '#D97706' }}>⚡</div>
            <span className="admin-kpi-pill" style={{ background: '#FFEDD5', color: '#EA580C' }}>IN TRANSIT</span>
          </div>
          <div className="admin-kpi-num">{inTransitCount}</div>
          <div className="admin-kpi-desc">Busy with Active Delivery</div>
        </div>

        {/* Card 4: Offline */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-head">
            <div className="admin-kpi-icon-box" style={{ background: '#F1F5F9', color: '#64748B' }}>💤</div>
            <span className="admin-kpi-pill" style={{ background: '#F1F5F9', color: '#475569' }}>OFFLINE</span>
          </div>
          <div className="admin-kpi-num">{offlineCount}</div>
          <div className="admin-kpi-desc">Off-Duty / Offline</div>
        </div>

        {/* Card 5: Suspended */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-head">
            <div className="admin-kpi-icon-box" style={{ background: '#FEE2E2', color: '#DC2626' }}>⛔</div>
            <span className="admin-kpi-pill" style={{ background: '#FEE2E2', color: '#DC2626' }}>SUSPENDED</span>
          </div>
          <div className="admin-kpi-num">{suspendedCount}</div>
          <div className="admin-kpi-desc">Suspended Accounts</div>
        </div>
      </div>

      {/* Main Rider Table Card matching Screenshot (2) */}
      <div className="admin-card">
        <div className="admin-card-head">
          <h2 className="admin-card-title">Delivery Fleet Roster</h2>
          <div className="admin-card-actions">
            <input
              type="search"
              placeholder="Search by name, ID, phone, or vehic..."
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
              <option value="AVAILABLE">Available</option>
              <option value="BUSY">Busy</option>
              <option value="OFFLINE">Offline</option>
            </select>
            <select
              value={vehicleFilter}
              onChange={(e) => setVehicleFilter(e.target.value)}
              className="admin-select"
            >
              <option value="ALL">All Vehicle Types</option>
              <option value="BIKE">Bike</option>
              <option value="SCOOTER">Scooter</option>
              <option value="VAN">Van</option>
            </select>
          </div>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Rider ID</th>
                <th>Delivery Partner</th>
                <th>Phone & Email</th>
                <th>Vehicle & License</th>
                <th>Status</th>
                <th>Deliveries</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRiders && filteredRiders.length > 0 ? (
                filteredRiders.map(r => {
                  const isAvailable = r.status === 'Available' || r.status === 'AVAILABLE';
                  const isBusy = r.status === 'Busy' || r.status === 'BUSY (ON DELIVERY)';

                  return (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 800, color: '#1F2937' }}>
                        {r.id || '#R001'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '20px' }}>🛵</span>
                          <div>
                            <div style={{ fontWeight: 700, color: '#1F2937' }}>{r.name}</div>
                            <div style={{ fontSize: '11.5px', color: '#9CA3AF' }}>Joined: {r.joinedDate || '2026-01-15'}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '13px', color: '#1F2937' }}>📞 {r.phone}</div>
                        <div style={{ fontSize: '12px', color: '#6B7280' }}>{r.email || `${r.name.toLowerCase().replace(' ', '')}@grocerygo.com`}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '13px' }}>{r.vehicle || 'Bike (AP00AB1234)'}</div>
                        <div style={{ fontSize: '11.5px', color: '#9CA3AF' }}>{r.license || 'DL. DL123456789'}</div>
                      </td>
                      <td>
                        <span
                          className="admin-status-pill"
                          style={{
                            background: isAvailable ? '#DCFCE7' : isBusy ? '#FEF3C7' : '#F1F5F9',
                            color: isAvailable ? '#15803D' : isBusy ? '#D97706' : '#64748B',
                          }}
                        >
                          {isAvailable ? 'AVAILABLE' : isBusy ? 'BUSY (ON DELIVERY)' : (r.status || 'OFFLINE')}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700 }}>{r.deliveriesCompleted || 0} completed</div>
                        <div style={{ fontSize: '11.5px', color: '#9CA3AF' }}>{isBusy ? '1 active' : 'Idle'}</div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => alert(`Rider: ${r.name}\nPhone: ${r.phone}\nVehicle: ${r.vehicle}\nLicense: ${r.license}`)}
                            className="admin-btn-action"
                          >
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingRider(r);
                              setRiderForm({
                                name: r.name,
                                phone: r.phone,
                                email: r.email || '',
                                vehicle: 'Bike',
                                license: r.license || '',
                                plate: '',
                              });
                              setShowAddModal(true);
                            }}
                            className="admin-btn-action"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(r)}
                            className="admin-btn-action admin-btn-action--green"
                          >
                            Status
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(r.id, r.name)}
                            className="admin-btn-action admin-btn-action--red"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>
                    No delivery riders match the search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Rider Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px', padding: '28px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1F2937', marginBottom: '16px' }}>
              {editingRider ? 'Edit Delivery Partner' : 'Register New Delivery Partner'}
            </h3>

            <form onSubmit={handleSaveRider}>
              <div className="input-group">
                <label className="input-label">Full Name *</label>
                <input
                  type="text"
                  required
                  value={riderForm.name}
                  onChange={e => setRiderForm({ ...riderForm, name: e.target.value })}
                  className="input"
                  placeholder="e.g. Rahul Kumar"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label className="input-label">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={riderForm.phone}
                    onChange={e => setRiderForm({ ...riderForm, phone: e.target.value })}
                    className="input"
                    placeholder="9876543210"
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Email *</label>
                  <input
                    type="email"
                    required
                    value={riderForm.email}
                    onChange={e => setRiderForm({ ...riderForm, email: e.target.value })}
                    className="input"
                    placeholder="rahul@grocerygo.com"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label className="input-label">Vehicle Type</label>
                  <select
                    className="input select"
                    value={riderForm.vehicle}
                    onChange={e => setRiderForm({ ...riderForm, vehicle: e.target.value })}
                  >
                    <option value="Bike">Bike</option>
                    <option value="Scooter">Scooter</option>
                    <option value="Van">Delivery Van</option>
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">License Plate</label>
                  <input
                    type="text"
                    value={riderForm.plate}
                    onChange={e => setRiderForm({ ...riderForm, plate: e.target.value })}
                    className="input"
                    placeholder="AP00AB1234"
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Driving License Number</label>
                <input
                  type="text"
                  value={riderForm.license}
                  onChange={e => setRiderForm({ ...riderForm, license: e.target.value })}
                  className="input"
                  placeholder="DL. DL123456789"
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className="admin-btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  {editingRider ? 'Save Changes' : 'Register Partner'}
                </button>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn--secondary" style={{ flex: 1, justifyContent: 'center' }}>
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

export default AdminRiders;
