import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { StoreProvider } from './context/StoreContext';
import { UIProvider } from './context/UIContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import './styles/main.css';

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));

// Customer pages
const CustomerDashboard = lazy(() => import('./pages/customer/Dashboard'));
const Products = lazy(() => import('./pages/customer/Products'));
const ProductDetail = lazy(() => import('./pages/customer/ProductDetail'));
const Cart = lazy(() => import('./pages/customer/Cart'));
const Checkout = lazy(() => import('./pages/customer/Checkout'));
const TrackOrder = lazy(() => import('./pages/customer/TrackOrder'));
const Orders = lazy(() => import('./pages/customer/Orders'));
const Profile = lazy(() => import('./pages/customer/Profile'));
const Wallet = lazy(() => import('./pages/customer/Wallet'));
const Support = lazy(() => import('./pages/customer/Support'));
const Help = lazy(() => import('./pages/customer/Help'));

// Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminProducts = lazy(() => import('./pages/admin/Products'));
const AdminCategories = lazy(() => import('./pages/admin/Categories'));
const AdminInventory = lazy(() => import('./pages/admin/Inventory'));
const AdminOrders = lazy(() => import('./pages/admin/Orders'));
const AdminRiders = lazy(() => import('./pages/admin/Riders'));
const AdminUsers = lazy(() => import('./pages/admin/Users'));
const AdminOffers = lazy(() => import('./pages/admin/Offers'));
const AdminReports = lazy(() => import('./pages/admin/Reports'));
const AdminSupport = lazy(() => import('./pages/admin/Support'));
const AdminReviews = lazy(() => import('./pages/admin/Reviews'));

// Loading fallback
const PageLoading = () => (
  <div className="page-loading" role="status" aria-label="Loading page" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
    <div className="spinner"></div>
    <p style={{ marginTop: '16px', color: '#6B7280', fontSize: '14px', fontWeight: 500 }}>Loading GroceryGo...</p>
  </div>
);

// Inner App Content with selective shell layout
function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/register';
  const showCustomerShell = !isAdminRoute && !isAuthRoute;

  return (
    <div className="app" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {showCustomerShell && <Navbar />}
      
      <main className="app-main" role="main" style={{ flex: 1 }}>
        <Suspense fallback={<PageLoading />}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Customer routes */}
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/track-order" element={<TrackOrder />} />
            <Route path="/track-order/:orderId" element={<TrackOrder />} />
            <Route path="/support" element={<Support />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/help" element={<Help />} />
            <Route path="/dashboard" element={<CustomerDashboard />} />

            {/* Admin routes */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
            <Route path="/admin/inventory" element={<AdminInventory />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/riders" element={<AdminRiders />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/offers" element={<AdminOffers />} />
            <Route path="/admin/reports" element={<AdminReports />} />
            <Route path="/admin/support" element={<AdminSupport />} />
            <Route path="/admin/reviews" element={<AdminReviews />} />

            {/* Redirects */}
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/*" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>

      {showCustomerShell && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <UIProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </UIProvider>
      </StoreProvider>
    </AuthProvider>
  );
}

export default App;
