import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';

const Register = () => {
  const { register } = useAuth();
  const { showToast } = useUI();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email address';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Minimum 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const result = await register({
      name: formData.name,
      email: formData.email,
      phone: formData.phone || '9848483113',
      password: formData.password,
    });
    setLoading(false);
    if (result.success) {
      showToast('Account created successfully!', 'success');
      navigate('/products');
    } else {
      showToast(result.error || 'Registration failed', 'error');
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
              Your groceries, one click away.
            </h1>
            <p className="auth-split-desc">
              Create your GroceryGo account and start shopping for everything you need from one place.
            </p>
          </div>

          <div className="auth-split-features">
            <div className="auth-split-feature">
              <div className="auth-split-feature-icon">📦</div>
              <div>
                <div className="auth-split-feature-title">Easy Shopping</div>
                <div className="auth-split-feature-subtitle">Browse products in seconds</div>
              </div>
            </div>

            <div className="auth-split-feature">
              <div className="auth-split-feature-icon">🚚</div>
              <div>
                <div className="auth-split-feature-title">Track Orders</div>
                <div className="auth-split-feature-subtitle">Keep track of your purchases</div>
              </div>
            </div>

            <div className="auth-split-feature">
              <div className="auth-split-feature-icon">🔒</div>
              <div>
                <div className="auth-split-feature-title">Simple Account</div>
                <div className="auth-split-feature-subtitle">Your details stay with your account</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="auth-split-right">
          <Link
            to="/"
            style={{ color: '#16A34A', fontSize: '13.5px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '20px' }}
          >
            ← Back to GroceryGo
          </Link>

          <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#1F2937', marginBottom: '4px' }}>
            Create Account
          </h2>
          <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '20px' }}>
            Join GroceryGo and start shopping
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="input-group">
              <label htmlFor="reg-name" className="input-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}>👤</span>
                <input
                  id="reg-name"
                  name="name"
                  type="text"
                  className={`input ${errors.name ? 'input--error' : ''}`}
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  style={{ paddingLeft: '40px' }}
                  disabled={loading}
                />
              </div>
              {errors.name && <span className="input-error">{errors.name}</span>}
            </div>

            <div className="input-group">
              <label htmlFor="reg-email" className="input-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}>✉️</span>
                <input
                  id="reg-email"
                  name="email"
                  type="email"
                  className={`input ${errors.email ? 'input--error' : ''}`}
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  style={{ paddingLeft: '40px' }}
                  disabled={loading}
                />
              </div>
              {errors.email && <span className="input-error">{errors.email}</span>}
            </div>

            <div className="input-group">
              <label htmlFor="reg-pwd" className="input-label">Password</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}>🔒</span>
                <input
                  id="reg-pwd"
                  name="password"
                  type="password"
                  className={`input ${errors.password ? 'input--error' : ''}`}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  style={{ paddingLeft: '40px' }}
                  disabled={loading}
                />
              </div>
              <span className="input-helper">Minimum 6 characters</span>
              {errors.password && <span className="input-error">{errors.password}</span>}
            </div>

            <div className="input-group">
              <label htmlFor="reg-confirm" className="input-label">Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}>🔒</span>
                <input
                  id="reg-confirm"
                  name="confirmPassword"
                  type="password"
                  className={`input ${errors.confirmPassword ? 'input--error' : ''}`}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  style={{ paddingLeft: '40px' }}
                  disabled={loading}
                />
              </div>
              {errors.confirmPassword && <span className="input-error">{errors.confirmPassword}</span>}
            </div>

            <button
              type="submit"
              className="btn btn--primary btn--full"
              style={{ height: '46px', fontSize: '15px', marginTop: '12px' }}
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create My Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13.5px', color: '#6B7280' }}>
            ALREADY A MEMBER?{' '}
            <Link to="/login" style={{ color: '#16A34A', fontWeight: 700 }}>
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
