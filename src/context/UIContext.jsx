import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const UIContext = createContext(null);

export function UIProvider({ children }) {
  const [modals, setModals] = useState({});
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal management
  const openModal = useCallback((modalName, props = {}) => {
    setModals(prev => ({ ...prev, [modalName]: { open: true, props } }));
  }, []);

  const closeModal = useCallback((modalName) => {
    setModals(prev => {
      const next = { ...prev };
      if (next[modalName]) {
        next[modalName] = { ...next[modalName], open: false };
      }
      return next;
    });
  }, []);

  const closeAllModals = useCallback(() => {
    setModals({});
  }, []);

  // Toast management
  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Loading management
  const setLoadingState = useCallback((key, isLoading) => {
    setLoading(prev => ({ ...prev, [key]: isLoading }));
  }, []);

  const isLoading = useCallback((key) => loading[key] || false, [loading]);

  // Sidebar
  const toggleSidebar = useCallback(() => setSidebarOpen(prev => !prev), []);
  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  // Search
  const updateSearchQuery = useCallback((query) => setSearchQuery(query), []);

  const value = useMemo(() => ({
    // Modals
    modals,
    openModal,
    closeModal,
    closeAllModals,

    // Toasts
    toasts,
    showToast,
    removeToast,

    // Loading
    loading,
    setLoading: setLoadingState,
    isLoading,

    // Sidebar
    sidebarOpen,
    toggleSidebar,
    openSidebar,
    closeSidebar,

    // Search
    searchQuery,
    setSearchQuery: updateSearchQuery,
  }), [
    modals, openModal, closeModal, closeAllModals,
    toasts, showToast, removeToast,
    loading, setLoadingState, isLoading,
    sidebarOpen, toggleSidebar, openSidebar, closeSidebar,
    searchQuery, updateSearchQuery,
  ]);

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
}