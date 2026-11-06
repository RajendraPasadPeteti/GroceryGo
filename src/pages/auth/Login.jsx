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
      showToast(result.error, 'error');
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
      showToast(`Logged in as ${role}`, 'success');
      redirectByRole(navigate);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card card">
          <div className="auth-header">
            <div className="auth-logo">
              <span aria-hidden="true">🛒</span>
              <span>GroceryGo</span>
            </div>
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="input-group">
              <label htmlFor="email" className="input-label">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                className={`input ${errors.email ? 'input--error' : ''}`}
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                autoComplete="email"
                disabled={loading}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {errors.email && <span id="email-error" className="input-error" role="alert">{errors.email}</span>}
            </div>

            <div className="input-group">
              <label htmlFor="password" className="input-label">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                className={`input ${errors.password ? 'input--error' : ''}`}
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={loading}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'password-error' : undefined}
              />
              {errors.password && <span id="password-error" className="input-error" role="alert">{errors.password}</span>}
            </div>

            <div className="input-group">
              <label className="input-label checkbox-label">
                <input
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="checkbox"
                />
                <span className="checkbox-custom"></span>
                Remember me
              </label>
            </div>

            <button type="submit" className="btn btn--primary btn--full btn--lg" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="auth-divider">
            <span>Or try demo accounts</span>
          </div>

          <div className="auth-demo-buttons">
            <button
              type="button"
              className="btn btn--secondary btn--full"
              onClick={() => handleDemoLogin('admin')}
              disabled={loading}
            >
              👑 Admin Demo
            </button>
            <button
              type="button"
              className="btn btn--secondary btn--full"
              onClick={() => handleDemoLogin('user')}
              disabled={loading}
            >
              🛒 Customer Demo
            </button>
          </div>

          <p className="auth-footer">
            Don't have an account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;