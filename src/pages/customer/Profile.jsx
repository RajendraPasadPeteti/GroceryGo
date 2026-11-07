import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';

const Profile = () => {
  const { user, logout } = useAuth();
  const { orders } = useStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const totalOrders = orders?.length || 11;
  const inProgress = orders?.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length || 9;
  const delivered = orders?.filter(o => o.status === 'Delivered').length || 1;

  return (
    <div style={{ background: '#F8FAF9', minHeight: '80vh', padding: '40px 0 64px', display: 'flex', justifyContent: 'center' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '20px',
            padding: '36px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}
        >
          {/* Header Profile Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', paddingBottom: '24px', borderBottom: '1px solid #F3F4F6', marginBottom: '28px' }}>
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: '#DCFCE7',
                color: '#16A34A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              👤
            </div>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1F2937', marginBottom: '4px' }}>
                {user?.name || 'sohith'}
              </h1>
              <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px' }}>
                {user?.email || 'sohithnagendra80@gmail.com'}
              </div>
              <span
                style={{
                  display: 'inline-block',
                  background: '#F0FDF4',
                  border: '1px solid #DCFCE7',
                  color: '#15803D',
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  letterSpacing: '0.04em',
                }}
              >
                USER ACCOUNT
              </span>
            </div>
          </div>

          {/* Account Details Section */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#1F2937', marginBottom: '16px' }}>
              Account Details
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                  FULL NAME
                </div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#1F2937' }}>
                  {user?.name || 'sohith'}
                </div>
              </div>

              <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                  EMAIL ADDRESS
                </div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#1F2937' }}>
                  {user?.email || 'sohithnagendra80@gmail.com'}
                </div>
              </div>

              <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                  USER ID
                </div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#1F2937', fontFamily: 'monospace' }}>
                  user-1790143217352
                </div>
              </div>

              <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                  PRIMARY DELIVERY CITY
                </div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#1F2937' }}>
                  Vijayawada
                </div>
              </div>
            </div>
          </div>

          {/* Activity Overview Section */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#1F2937', marginBottom: '16px' }}>
              Activity Overview
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 900, color: '#16A34A', lineHeight: 1.1, marginBottom: '6px' }}>
                  {totalOrders}
                </div>
                <div style={{ fontSize: '13px', color: '#6B7280', fontWeight: 600 }}>Total Orders</div>
              </div>

              <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 900, color: '#D97706', lineHeight: 1.1, marginBottom: '6px' }}>
                  {inProgress}
                </div>
                <div style={{ fontSize: '13px', color: '#6B7280', fontWeight: 600 }}>In Progress</div>
              </div>

              <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 900, color: '#15803D', lineHeight: 1.1, marginBottom: '6px' }}>
                  {delivered}
                </div>
                <div style={{ fontSize: '13px', color: '#6B7280', fontWeight: 600 }}>Delivered</div>
              </div>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <Link
              to="/orders"
              className="btn btn--primary"
              style={{ height: '42px', padding: '0 20px', fontSize: '14px', fontWeight: 700 }}
            >
              📦 View My Orders
            </Link>
            <Link
              to="/products"
              className="btn btn--secondary"
              style={{ height: '42px', padding: '0 20px', fontSize: '14px', fontWeight: 700, color: '#16A34A', borderColor: '#16A34A' }}
            >
              Shop Groceries
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              style={{
                height: '42px',
                padding: '0 20px',
                fontSize: '14px',
                fontWeight: 700,
                color: '#DC2626',
                border: '1px solid #FECACA',
                background: '#FFFFFF',
                borderRadius: '8px',
                cursor: 'pointer',
                marginLeft: 'auto',
                transition: 'all 120ms ease',
              }}
            >
              Logout from Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
