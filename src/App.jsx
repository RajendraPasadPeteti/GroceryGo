import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { StoreProvider } from './context/StoreContext';
import { UIProvider } from './context/UIContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import './styles/main.css';

// Lazy load pages for code splitting
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

// Layouts
const CustomerLayout = lazy(() => import('./components/layout/CustomerLayout'));
const AdminLayout = lazy(() => import('./components/layout/AdminLayout'));

// Loading fallback
const PageLoading = () => (
  <div className="page-loading" role="status" aria-label="Loading page">
    <div className="spinner"></div>
    <p style={{ marginTop: '16px', color: 'var(--text-muted)' }}>Loading...</p>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <UIProvider>
          <BrowserRouter>
            <div className="app">
              <Navbar />
              <main className="app-main" role="main">
                <Suspense fallback={<PageLoading />}>
                  <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/support" element={<Support />} />

                    {/* Public customer routes */}
                    <Route path="/products" element={<Products />} />
                    <Route path="/products/:id" element={<ProductDetail />} />
                    <Route path="/track-order" element={<TrackOrder />} />
                    <Route path="/track-order/:orderId" element={<TrackOrder />} />
                    <Route path="/help" element={<Help />} />

                    {/* Customer protected routes */}
                    <Route
                      path="/dashboard"
                      element={
                        <CustomerLayout>
                          <CustomerDashboard />
                        </CustomerLayout>
                      }
                    />
                    <Route
                      path="/cart"
                      element={
                        <CustomerLayout>
                          <Cart />
                        </CustomerLayout>
                      }
                    />
                    <Route
                      path="/checkout"
                      element={
                        <CustomerLayout>
                          <Checkout />
                        </CustomerLayout>
                      }
                    />
                    <Route
                      path="/orders"
                      element={
                        <CustomerLayout>
                          <Orders />
                        </CustomerLayout>
                      }
                    />
                    <Route
                      path="/profile"
                      element={
                        <CustomerLayout>
                          <Profile />
                        </CustomerLayout>
                      }
                    />
                    <Route
                      path="/wallet"
                      element={
                        <CustomerLayout>
                          <Wallet />
                        </CustomerLayout>
                      }
                    />
                    <Route
                      path="/support"
                      element={
                        <CustomerLayout>
                          <Support />
                        </CustomerLayout>
                      }
                    />

                    {/* Admin protected routes */}
                    <Route
                      path="/admin/dashboard"
                      element={
                        <AdminLayout>
                          <AdminDashboard />
                        </AdminLayout>
                      }
                    />
                    <Route
                      path="/admin/products"
                      element={
                        <AdminLayout>
                          <AdminProducts />
                        </AdminLayout>
                      }
                    />
                    <Route
                      path="/admin/categories"
                      element={
                        <AdminLayout>
                          <AdminCategories />
                        </AdminLayout>
                      }
                    />
                    <Route
                      path="/admin/inventory"
                      element={
                        <AdminLayout>
                          <AdminInventory />
                        </AdminLayout>
                      }
                    />
                    <Route
                      path="/admin/orders"
                      element={
                        <AdminLayout>
                          <AdminOrders />
                        </AdminLayout>
                      }
                    />
                    <Route
                      path="/admin/riders"
                      element={
                        <AdminLayout>
                          <AdminRiders />
                        </AdminLayout>
                      }
                    />
                    <Route
                      path="/admin/users"
                      element={
                        <AdminLayout>
                          <AdminUsers />
                        </AdminLayout>
                      }
                    />
                    <Route
                      path="/admin/offers"
                      element={
                        <AdminLayout>
                          <AdminOffers />
                        </AdminLayout>
                      }
                    />
                    <Route
                      path="/admin/reports"
                      element={
                        <AdminLayout>
                          <AdminReports />
                        </AdminLayout>
                      }
                    />
                    <Route
                      path="/admin/support"
                      element={
                        <AdminLayout>
                          <AdminSupport />
                        </AdminLayout>
                      }
                    />
                    <Route
                      path="/admin/reviews"
                      element={
                        <AdminLayout>
                          <AdminReviews />
                        </AdminLayout>
                      }
                    />

                    {/* Redirects */}
                    <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                    <Route path="/admin/*" element={<Navigate to="/admin/dashboard" replace />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Suspense>
              </main>
              <Footer />
            </div>
          </BrowserRouter>
        </UIProvider>
      </StoreProvider>
    </AuthProvider>
  );
}

export default App;