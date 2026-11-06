import {
  getUsers,
  getUserByEmail,
  addUser,
  updateUser,
} from './store.js';

const SESSION_KEY = 'sessionUser';
const REMEMBER_KEY = 'currentUser';

/**
 * Login user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {boolean} rememberMe - Whether to persist login in localStorage
 * @returns {Object|null} User object or null if invalid credentials
 */
export function login(email, password, rememberMe = false) {
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);

  if (user) {
    // Don't store password in session
    const userSession = { ...user };
    delete userSession.password;

    if (rememberMe) {
      localStorage.setItem(REMEMBER_KEY, JSON.stringify(userSession));
    } else {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(userSession));
    }

    return userSession;
  }

  return null;
}

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Object|null} Created user or null if email exists
 */
export function register(userData) {
  const { name, email, password, phone, address } = userData;

  // Check if email already exists
  if (getUserByEmail(email)) {
    throw new Error('Email already registered');
  }

  const newUser = addUser({
    name,
    email,
    password,
    phone,
    address,
    role: 'user',
  });

  // Don't return password
  const { password: _, ...userSession } = newUser;
  return userSession;
}

/**
 * Get current logged in user
 * @returns {Object|null} Current user or null
 */
export function getCurrentUser() {
  // Check sessionStorage first (temporary session)
  const sessionUser = sessionStorage.getItem(SESSION_KEY);
  if (sessionUser) {
    try {
      return JSON.parse(sessionUser);
    } catch {
      sessionStorage.removeItem(SESSION_KEY);
    }
  }

  // Check localStorage (remember me)
  const rememberUser = localStorage.getItem(REMEMBER_KEY);
  if (rememberUser) {
    try {
      return JSON.parse(rememberUser);
    } catch {
      localStorage.removeItem(REMEMBER_KEY);
    }
  }

  return null;
}

/**
 * Logout current user
 */
export function logout() {
  sessionStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(REMEMBER_KEY);
}

/**
 * Update current user profile
 * @param {Object} updates - Fields to update
 * @returns {Object|null} Updated user or null
 */
export function updateCurrentUser(updates) {
  const user = getCurrentUser();
  if (!user) return null;

  const updatedUser = updateUser(user.id, updates);
  if (updatedUser) {
    const { password: _, ...userSession } = updatedUser;

    // Update both storages
    if (localStorage.getItem(REMEMBER_KEY)) {
      localStorage.setItem(REMEMBER_KEY, JSON.stringify(userSession));
    }
    if (sessionStorage.getItem(SESSION_KEY)) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(userSession));
    }

    return userSession;
  }
  return null;
}

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export function isAuthenticated() {
  return getCurrentUser() !== null;
}

/**
 * Check if user has specific role
 * @param {string} role - Role to check
 * @returns {boolean}
 */
export function hasRole(role) {
  const user = getCurrentUser();
  return user?.role === role;
}

/**
 * Protect page - redirect if not authenticated or wrong role
 * @param {string} requiredRole - Required role ('user' or 'admin')
 * @param {Function} navigate - React router navigate function
 * @returns {boolean} True if access granted
 */
export function protectPage(requiredRole, navigate) {
  const user = getCurrentUser();

  if (!user) {
    navigate('/login');
    return false;
  }

  if (user.role !== requiredRole) {
    navigate(user.role === 'admin' ? '/admin/dashboard' : '/dashboard');
    return false;
  }

  return true;
}

/**
 * Redirect user based on role
 * @param {Function} navigate - React router navigate function
 */
export function redirectByRole(navigate) {
  const user = getCurrentUser();
  if (user) {
    navigate(user.role === 'admin' ? '/admin/dashboard' : '/dashboard');
  } else {
    navigate('/login');
  }
}

/**
 * Get current user ID
 * @returns {number|null}
 */
export function getCurrentUserId() {
  const user = getCurrentUser();
  return user?.id || null;
}

/**
 * Check if user is admin
 * @returns {boolean}
 */
export function isAdmin() {
  return hasRole('admin');
}

/**
 * Check if user is customer
 * @returns {boolean}
 */
export function isCustomer() {
  return hasRole('user');
}