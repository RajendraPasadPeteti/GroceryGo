import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';

const Login = () => {
  const { login, redirectByRole } = useAuth();
  const { showToast } = useUI();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '', rememberMe: false });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const result = await login(formData.email, formData.password, formData.rememberMe);
    setLoading(false);
    if (result.success) {
      showToast('Welcome back!', 'success');
      redirectByRole(navigate);
    } else {
      showToast(result.error || 'Invalid email or password', 'error');
    }
  };

  const handleDemoLogin = async (role) => {
    setLoading(true);
    const credentials = role === 'admin'
      ? { email: 'admin@grocerygo.com', password: 'admin123' }
      : { email: 'user@grocerygo.com', password: 'user123' };
    const result = await login(credentials.email, credentials.password, true);
    setLoading(false);
    if (result.success) {
      showToast(`Logged in as ${role === 'admin' ? 'Administrator' : 'Customer'}`, 'success');
      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/products');
      }
    }
  };

  return (
    <div className="auth-split-wrapper">
      <div className="auth-split-card">
        {/* Left Green Promotional Panel */}
        <div className="auth-split-left">
          <div>
            <div className="auth-split-brand">
              <span aria-hidden="true">🛒</span>
              <span>GroceryGo</span>
            </div>
            <h1 className="auth-split-heading">
              Fresh groceries, right at your doorstep.
            </h1>
            <p className="auth-split-desc">
              Shop fruits, vegetables, dairy, snacks and everyday essentials with GroceryGo.
            </p>
          </div>

          <div className="auth-split-features">
            <div className="auth-split-feature">
              <div className="auth-split-feature-icon">⚡</div>
              <div>
                <div className="auth-split-feature-title">Fast Delivery</div>
                <div className="auth-split-feature-subtitle">Get your groceries quickly</div>
              </div>
            </div>

            <div className="auth-split-feature">
              <div className="auth-split-feature-icon">🍃</div>
              <div>
                <div className="auth-split-feature-title">Fresh Products</div>
                <div className="auth-split-feature-subtitle">Quality products for your family</div>
              </div>
            </div>

            <div className="auth-split-feature">
              <div className="auth-split-feature-icon">💰</div>
              <div>
                <div className="auth-split-feature-title">Great Prices</div>
                <div className="auth-split-feature-subtitle">Affordable everyday essentials</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="auth-split-right">
          <Link
            to="/"
            style={{ color: '#16A34A', fontSize: '13.5px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '24px' }}
          >
            ← Back to GroceryGo
          </Link>

          <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#1F2937', marginBottom: '4px' }}>
            Welcome Back 👋
          </h2>
          <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '24px' }}>
            Login to continue shopping
          </p>

          {/* Quick Demo Logins for Pair Programming Convenience */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            <button
              type="button"
              onClick={() => handleDemoLogin('user')}
              className="admin-btn-action admin-btn-action--green"
              style={{ flex: 1, height: '32px', justifyContent: 'center' }}
            >
              👤 Demo Customer
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('admin')}
              className="admin-btn-action"
              style={{ flex: 1, height: '32px', justifyContent: 'center', background: '#F8FAF9' }}
            >
              🛡️ Demo Admin
            </button>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="input-group">
              <label htmlFor="email" className="input-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}>✉️</span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className={`input ${errors.email ? 'input--error' : ''}`}
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  autoComplete="email"
                  style={{ paddingLeft: '40px' }}
                  disabled={loading}
                />
              </div>
              {errors.email && <span className="input-error">{errors.email}</span>}
            </div>

            <div className="input-group">
              <label htmlFor="password" className="input-label">Password</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}>🔒</span>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className={`input ${errors.password ? 'input--error' : ''}`}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  style={{ paddingLeft: '40px' }}
                  disabled={loading}
                />
              </div>
              {errors.password && <span className="input-error">{errors.password}</span>}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="checkbox"
                />
                <span>Remember Me</span>
              </label>
              <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Demo password is user123 or admin123'); }} style={{ fontSize: '13px', color: '#16A34A', fontWeight: 500 }}>
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              className="btn btn--primary btn--full"
              style={{ height: '46px', fontSize: '15px' }}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login to GroceryGo'}
            </button>
          </form>

          <div style={{ marginTop: '28px', textAlign: 'center', position: 'relative' }}>
            <div style={{ borderTop: '1px solid #E5E7EB', position: 'absolute', left: 0, right: 0, top: '50%' }}></div>
            <span style={{ position: 'relative', background: '#FFFFFF', padding: '0 12px', fontSize: '11px', fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.05em' }}>
              NEW TO GROCERYGO?
            </span>
          </div>

          <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '13.5px', color: '#6B7280' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#16A34A', fontWeight: 700 }}>
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
