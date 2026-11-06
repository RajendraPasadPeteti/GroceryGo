import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  initializeStore,
  getProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  getCart,
  getCartCount,
  addToCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
  getOrders,
  getOrderById,
  getOrdersByUserId,
  calculateTotals,
  createOrder,
  updateOrderStatus,
  assignRiderToOrder,
  cancelOrder,
  getRiders,
  addRider,
  updateRider,
  deleteRider,
  getCoupons,
  addCoupon,
  updateCoupon,
  deleteCoupon,
  getCouponByCode,
  getReviews,
  addReview,
  updateReview,
  deleteReview,
  getSupportTickets,
  createSupportTicket,
  updateSupportTicket,
  getSupportTicketsByUserId,
  getDeliveryLocation,
  setDeliveryLocation,
  getCustomerServiceAnalytics,
} from '../utils/store';

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [riders, setRiders] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [supportTickets, setSupportTickets] = useState([]);
  const [deliveryLocation, setDeliveryLocationState] = useState('');
  const [initialized, setInitialized] = useState(false);

  // Initialize store on mount
  useEffect(() => {
    initializeStore();
    refreshAllData();
    setInitialized(true);
  }, []);

  const refreshAllData = useCallback(() => {
    setProducts(getProducts());
    setCategories(getCategories());
    setCart(getCart());
    setOrders(getOrders());
    setRiders(getRiders());
    setCoupons(getCoupons());
    setReviews(getReviews());
    setSupportTickets(getSupportTickets());
    setDeliveryLocationState(getDeliveryLocation());
  }, []);

  // Products
  const refreshProducts = useCallback(() => setProducts(getProducts()), []);
  const getProductByIdFn = useCallback((id) => getProductById(id), []);
  const addProductFn = useCallback((product) => {
    const newProduct = addProduct(product);
    refreshProducts();
    return newProduct;
  }, [refreshProducts]);
  const updateProductFn = useCallback((id, updates) => {
    const updated = updateProduct(id, updates);
    refreshProducts();
    return updated;
  }, [refreshProducts]);
  const deleteProductFn = useCallback((id) => {
    const result = deleteProduct(id);
    refreshProducts();
    return result;
  }, [refreshProducts]);

  // Categories
  const refreshCategories = useCallback(() => setCategories(getCategories()), []);
  const addCategoryFn = useCallback((category) => {
    const newCategory = addCategory(category);
    refreshCategories();
    return newCategory;
  }, [refreshCategories]);
  const updateCategoryFn = useCallback((id, updates) => {
    const updated = updateCategory(id, updates);
    refreshCategories();
    return updated;
  }, [refreshCategories]);
  const deleteCategoryFn = useCallback((id) => {
    const result = deleteCategory(id);
    refreshCategories();
    refreshProducts(); // Products might be reassigned
    return result;
  }, [refreshCategories, refreshProducts]);

  // Cart
  const refreshCart = useCallback(() => setCart(getCart()), []);
  const getCartCountFn = useCallback(() => getCartCount(), []);
  const addToCartFn = useCallback((productId, quantity) => {
    const result = addToCart(productId, quantity);
    refreshCart();
    return result;
  }, [refreshCart]);
  const updateCartQuantityFn = useCallback((productId, delta) => {
    const result = updateCartQuantity(productId, delta);
    refreshCart();
    return result;
  }, [refreshCart]);
  const removeFromCartFn = useCallback((productId) => {
    const result = removeFromCart(productId);
    refreshCart();
    return result;
  }, [refreshCart]);
  const clearCartFn = useCallback(() => {
    clearCart();
    refreshCart();
  }, [refreshCart]);

  // Orders
  const refreshOrders = useCallback(() => setOrders(getOrders()), []);
  const getOrderByIdFn = useCallback((id) => getOrderById(id), []);
  const getOrdersByUserIdFn = useCallback((userId) => getOrdersByUserId(userId), []);
  const calculateTotalsFn = useCallback((cartItems, couponCode) => calculateTotals(cartItems, couponCode), []);
  const createOrderFn = useCallback((orderData) => {
    const order = createOrder(orderData);
    refreshOrders();
    refreshCart();
    refreshProducts(); // Stock changed
    return order;
  }, [refreshOrders, refreshCart, refreshProducts]);
  const updateOrderStatusFn = useCallback((orderId, newStatus) => {
    const updated = updateOrderStatus(orderId, newStatus);
    refreshOrders();
    return updated;
  }, [refreshOrders]);
  const assignRiderToOrderFn = useCallback((orderId, riderId) => {
    const updated = assignRiderToOrder(orderId, riderId);
    refreshOrders();
    refreshRiders();
    return updated;
  }, [refreshOrders]);
  const cancelOrderFn = useCallback((orderId) => {
    const result = cancelOrder(orderId);
    refreshOrders();
    refreshProducts(); // Stock restored
    refreshRiders();
    return result;
  }, [refreshOrders, refreshProducts]);

  // Riders
  const refreshRiders = useCallback(() => setRiders(getRiders()), []);
  const addRiderFn = useCallback((rider) => {
    const newRider = addRider(rider);
    refreshRiders();
    return newRider;
  }, [refreshRiders]);
  const updateRiderFn = useCallback((id, updates) => {
    const updated = updateRider(id, updates);
    refreshRiders();
    return updated;
  }, [refreshRiders]);
  const deleteRiderFn = useCallback((id) => {
    const result = deleteRider(id);
    refreshRiders();
    return result;
  }, [refreshRiders]);

  // Coupons
  const refreshCoupons = useCallback(() => setCoupons(getCoupons()), []);
  const getCouponByCodeFn = useCallback((code) => getCouponByCode(code), []);
  const addCouponFn = useCallback((coupon) => {
    const newCoupon = addCoupon(coupon);
    refreshCoupons();
    return newCoupon;
  }, [refreshCoupons]);
  const updateCouponFn = useCallback((code, updates) => {
    const updated = updateCoupon(code, updates);
    refreshCoupons();
    return updated;
  }, [refreshCoupons]);
  const deleteCouponFn = useCallback((code) => {
    const result = deleteCoupon(code);
    refreshCoupons();
    return result;
  }, [refreshCoupons]);

  // Reviews
  const refreshReviews = useCallback(() => setReviews(getReviews()), []);
  const addReviewFn = useCallback((reviewData) => {
    const newReview = addReview(reviewData);
    refreshReviews();
    return newReview;
  }, [refreshReviews]);
  const updateReviewFn = useCallback((reviewId, updates) => {
    const updated = updateReview(reviewId, updates);
    refreshReviews();
    return updated;
  }, [refreshReviews]);
  const deleteReviewFn = useCallback((reviewId) => {
    const result = deleteReview(reviewId);
    refreshReviews();
    return result;
  }, [refreshReviews]);

  // Support Tickets
  const refreshSupportTickets = useCallback(() => setSupportTickets(getSupportTickets()), []);
  const createSupportTicketFn = useCallback((ticketData) => {
    const newTicket = createSupportTicket(ticketData);
    refreshSupportTickets();
    return newTicket;
  }, [refreshSupportTickets]);
  const updateSupportTicketFn = useCallback((ticketId, updates) => {
    const updated = updateSupportTicket(ticketId, updates);
    refreshSupportTickets();
    return updated;
  }, [refreshSupportTickets]);
  const getSupportTicketsByUserIdFn = useCallback((userId) => getSupportTicketsByUserId(userId), []);

  // Delivery Location
  const updateDeliveryLocation = useCallback((location) => {
    setDeliveryLocation(location);
    setDeliveryLocationState(location);
  }, []);

  // Analytics
  const getAnalytics = useCallback(() => getCustomerServiceAnalytics(), []);

  const value = useMemo(() => ({
    // State
    products,
    categories,
    cart,
    orders,
    riders,
    coupons,
    reviews,
    supportTickets,
    deliveryLocation,
    initialized,

    // Products
    refreshProducts,
    getProductById: getProductByIdFn,
    addProduct: addProductFn,
    updateProduct: updateProductFn,
    deleteProduct: deleteProductFn,

    // Categories
    refreshCategories,
    addCategory: addCategoryFn,
    updateCategory: updateCategoryFn,
    deleteCategory: deleteCategoryFn,

    // Cart
    refreshCart,
    getCartCount: getCartCountFn,
    addToCart: addToCartFn,
    updateCartQuantity: updateCartQuantityFn,
    removeFromCart: removeFromCartFn,
    clearCart: clearCartFn,

    // Orders
    refreshOrders,
    getOrderById: getOrderByIdFn,
    getOrdersByUserId: getOrdersByUserIdFn,
    calculateTotals: calculateTotalsFn,
    createOrder: createOrderFn,
    updateOrderStatus: updateOrderStatusFn,
    assignRiderToOrder: assignRiderToOrderFn,
    cancelOrder: cancelOrderFn,

    // Riders
    refreshRiders,
    addRider: addRiderFn,
    updateRider: updateRiderFn,
    deleteRider: deleteRiderFn,

    // Coupons
    refreshCoupons,
    getCouponByCode: getCouponByCodeFn,
    addCoupon: addCouponFn,
    updateCoupon: updateCouponFn,
    deleteCoupon: deleteCouponFn,

    // Reviews
    refreshReviews,
    addReview: addReviewFn,
    updateReview: updateReviewFn,
    deleteReview: deleteReviewFn,

    // Support Tickets
    refreshSupportTickets,
    createSupportTicket: createSupportTicketFn,
    updateSupportTicket: updateSupportTicketFn,
    getSupportTicketsByUserId: getSupportTicketsByUserIdFn,

    // Delivery Location
    updateDeliveryLocation,

    // Analytics
    getAnalytics,
  }), [
    products, categories, cart, orders, riders, coupons, reviews, supportTickets, deliveryLocation, initialized,
    refreshProducts, getProductByIdFn, addProductFn, updateProductFn, deleteProductFn,
    refreshCategories, addCategoryFn, updateCategoryFn, deleteCategoryFn,
    refreshCart, getCartCountFn, addToCartFn, updateCartQuantityFn, removeFromCartFn, clearCartFn,
    refreshOrders, getOrderByIdFn, getOrdersByUserIdFn, calculateTotalsFn, createOrderFn, updateOrderStatusFn, assignRiderToOrderFn, cancelOrderFn,
    refreshRiders, addRiderFn, updateRiderFn, deleteRiderFn,
    refreshCoupons, getCouponByCodeFn, addCouponFn, updateCouponFn, deleteCouponFn,
    refreshReviews, addReviewFn, updateReviewFn, deleteReviewFn,
    refreshSupportTickets, createSupportTicketFn, updateSupportTicketFn, getSupportTicketsByUserIdFn,
    updateDeliveryLocation,
    getAnalytics,
  ]);

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}