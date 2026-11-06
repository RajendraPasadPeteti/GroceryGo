import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  login,
  register,
  getCurrentUser,
  logout,
  updateCurrentUser,
  isAuthenticated,
  hasRole,
  protectPage,
  redirectByRole,
  getCurrentUserId,
  isAdmin,
  isCustomer,
} from '../utils/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children, navigate }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const loginFn = useCallback(async (email, password, rememberMe) => {
    const userData = login(email, password, rememberMe);
    if (userData) {
      setUser(userData);
      return { success: true, user: userData };
    }
    return { success: false, error: 'Invalid email or password' };
  }, []);

  const registerFn = useCallback(async (userData) => {
    try {
      const newUser = register(userData);
      return { success: true, user: newUser };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  const logoutFn = useCallback(() => {
    logout();
    setUser(null);
    if (navigate) {
      navigate('/login');
    }
  }, [navigate]);

  const updateProfileFn = useCallback((updates) => {
    const updatedUser = updateCurrentUser(updates);
    if (updatedUser) {
      setUser(updatedUser);
      return { success: true, user: updatedUser };
    }
    return { success: false, error: 'Failed to update profile' };
  }, []);

  const checkAuth = useCallback(() => isAuthenticated(), []);
  const checkRole = useCallback((role) => hasRole(role), []);
  const protect = useCallback((requiredRole) => protectPage(requiredRole, navigate), [navigate]);
  const redirect = useCallback(() => redirectByRole(navigate), [navigate]);
  const getUserId = useCallback(() => getCurrentUserId(), []);
  const checkAdmin = useCallback(() => isAdmin(), []);
  const checkCustomer = useCallback(() => isCustomer(), []);

  const value = useMemo(() => ({
    user,
    loading,
    login: loginFn,
    register: registerFn,
    logout: logoutFn,
    updateProfile: updateProfileFn,
    isAuthenticated: checkAuth,
    hasRole: checkRole,
    protectPage: protect,
    redirectByRole: redirect,
    getCurrentUserId: getUserId,
    isAdmin: checkAdmin,
    isCustomer: checkCustomer,
  }), [
    user, loading, loginFn, registerFn, logoutFn, updateProfileFn,
    checkAuth, checkRole, protect, redirect, getUserId, checkAdmin, checkCustomer,
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}