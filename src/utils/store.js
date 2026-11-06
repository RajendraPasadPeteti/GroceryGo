import {
  initialCategories,
  initialProducts,
  initialRiders,
  initialCoupons,
  initialUsers,
  initialDeliveryLocation,
  initialOrders,
  initialSupportTickets,
} from '../data/initialData.js';

// Storage keys
const STORAGE_KEYS = {
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  CART: 'cart',
  ORDERS: 'orders',
  RIDERS: 'riders',
  COUPONS: 'coupons',
  REVIEWS: 'reviews',
  SUPPORT_TICKETS: 'supportTickets',
  DELIVERY_LOCATION: 'deliveryLocation',
  USERS: 'users',
  CURRENT_USER: 'currentUser',
  SESSION_USER: 'sessionUser',
};

/**
 * Initialize localStorage with default data if not already present
 */
export function initializeStore() {
  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(initialProducts));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(initialCategories));
  }
  if (!localStorage.getItem(STORAGE_KEYS.RIDERS)) {
    localStorage.setItem(STORAGE_KEYS.RIDERS, JSON.stringify(initialRiders));
  }
  if (!localStorage.getItem(STORAGE_KEYS.COUPONS)) {
    localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(initialCoupons));
  }
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(initialUsers));
  }
  if (!localStorage.getItem(STORAGE_KEYS.DELIVERY_LOCATION)) {
    localStorage.setItem(STORAGE_KEYS.DELIVERY_LOCATION, initialDeliveryLocation);
  }
  if (!localStorage.getItem(STORAGE_KEYS.CART)) {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(initialOrders));
  }
  if (!localStorage.getItem(STORAGE_KEYS.REVIEWS)) {
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SUPPORT_TICKETS)) {
    localStorage.setItem(STORAGE_KEYS.SUPPORT_TICKETS, JSON.stringify(initialSupportTickets));
  }
}

// ============ Generic Helpers ============
function getFromStorage(key, defaultValue = []) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function saveToStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ============ Products ============
export function getProducts() {
  return getFromStorage(STORAGE_KEYS.PRODUCTS);
}

export function saveProducts(products) {
  saveToStorage(STORAGE_KEYS.PRODUCTS, products);
}

export function getProductById(id) {
  const products = getProducts();
  return products.find(p => p.id === Number(id));
}

export function addProduct(product) {
  const products = getProducts();
  const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
  const newProduct = { ...product, id: newId };
  products.push(newProduct);
  saveProducts(products);
  return newProduct;
}

export function updateProduct(id, updates) {
  const products = getProducts();
  const index = products.findIndex(p => p.id === Number(id));
  if (index !== -1) {
    products[index] = { ...products[index], ...updates };
    saveProducts(products);
    return products[index];
  }
  return null;
}

export function deleteProduct(id) {
  const products = getProducts();
  const filtered = products.filter(p => p.id !== Number(id));
  saveProducts(filtered);
  return filtered.length !== products.length;
}

// ============ Categories ============
export function getCategories() {
  return getFromStorage(STORAGE_KEYS.CATEGORIES);
}

export function saveCategories(categories) {
  saveToStorage(STORAGE_KEYS.CATEGORIES, categories);
}

export function getCategoryById(id) {
  const categories = getCategories();
  return categories.find(c => c.id === id);
}

export function addCategory(category) {
  const categories = getCategories();
  const newId = `cat-${categories.length + 1}`;
  const newCategory = { ...category, id: newId };
  categories.push(newCategory);
  saveCategories(categories);
  return newCategory;
}

export function updateCategory(id, updates) {
  const categories = getCategories();
  const index = categories.findIndex(c => c.id === id);
  if (index !== -1) {
    categories[index] = { ...categories[index], ...updates };
    saveCategories(categories);
    return categories[index];
  }
  return null;
}

export function deleteCategory(id) {
  const categories = getCategories();
  const category = categories.find(c => c.id === id);
  if (!category) return false;

  // Check if any products use this category
  const products = getProducts();
  const linkedProducts = products.filter(p => p.category === category.name);

  if (linkedProducts.length > 0) {
    // Reassign to "Other" category or first available category
    const otherCategory = categories.find(c => c.name === 'Other') || categories[0];
    if (otherCategory) {
      linkedProducts.forEach(p => {
        p.category = otherCategory.name;
      });
      saveProducts(products);
    }
  }

  const filtered = categories.filter(c => c.id !== id);
  saveCategories(filtered);
  return true;
}

// ============ Cart ============
export function getCart() {
  return getFromStorage(STORAGE_KEYS.CART);
}

export function saveCart(cart) {
  saveToStorage(STORAGE_KEYS.CART, cart);
}

export function getCartCount() {
  const cart = getCart();
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

export function addToCart(productId, quantity = 1) {
  const product = getProductById(productId);
  if (!product || product.stock <= 0) return false;

  const cart = getCart();
  const existingItem = cart.find(item => item.productId === Number(productId));

  if (existingItem) {
    if (existingItem.quantity + quantity > product.stock) {
      existingItem.quantity = product.stock;
    } else {
      existingItem.quantity += quantity;
    }
  } else {
    cart.push({
      id: Date.now(),
      productId: product.id,
      name: product.name,
      icon: product.icon,
      price: product.price,
      unit: product.unit,
      quantity: Math.min(quantity, product.stock),
    });
  }

  saveCart(cart);
  return true;
}

export function updateCartQuantity(productId, delta) {
  const cart = getCart();
  const item = cart.find(item => item.productId === Number(productId));
  if (!item) return false;

  const product = getProductById(productId);
  const newQuantity = item.quantity + delta;

  if (newQuantity <= 0) {
    return removeFromCart(productId);
  }

  if (product && newQuantity > product.stock) {
    item.quantity = product.stock;
  } else {
    item.quantity = newQuantity;
  }

  saveCart(cart);
  return true;
}

export function removeFromCart(productId) {
  const cart = getCart();
  const filtered = cart.filter(item => item.productId !== Number(productId));
  saveCart(filtered);
  return true;
}

export function clearCart() {
  saveCart([]);
}

// ============ Orders ============
export function getOrders() {
  return getFromStorage(STORAGE_KEYS.ORDERS);
}

export function saveOrders(orders) {
  saveToStorage(STORAGE_KEYS.ORDERS, orders);
}

export function getOrderById(id) {
  const orders = getOrders();
  return orders.find(o => o.id === id);
}

export function getOrdersByUserId(userId) {
  const orders = getOrders();
  return orders.filter(o => o.userId === Number(userId)).sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
}

export function calculateTotals(cartItems, couponCode = null) {
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = subtotal >= 300 ? 0 : 30;

  let discount = 0;
  let appliedCoupon = null;

  if (couponCode) {
    const coupons = getCoupons();
    const coupon = coupons.find(c => c.code === couponCode && c.active);
    if (coupon && subtotal >= coupon.minOrder) {
      appliedCoupon = coupon;
      if (coupon.type === 'flat') {
        discount = coupon.discount;
      } else if (coupon.type === 'percent') {
        discount = Math.min((subtotal * coupon.discountPercent) / 100, coupon.maxDiscount);
      }
    }
  }

  const total = subtotal + deliveryFee - discount;
  return { subtotal, deliveryFee, discount, appliedCoupon, total: Math.max(0, total) };
}

export function createOrder(orderData) {
  const { userId, customerName, phone, address, city, pincode, paymentMethod, couponCode, items } = orderData;

  // Validate stock
  for (const item of items) {
    const product = getProductById(item.productId);
    if (!product || product.stock < item.quantity) {
      throw new Error(`Insufficient stock for ${item.name}`);
    }
  }

  // Decrement stock
  const products = getProducts();
  items.forEach(item => {
    const product = products.find(p => p.id === item.productId);
    if (product) {
      product.stock -= item.quantity;
    }
  });
  saveProducts(products);

  // Calculate totals
  const { subtotal, deliveryFee, discount, appliedCoupon, total } = calculateTotals(items, couponCode);

  // Create order
  const orders = getOrders();
  const orderId = 'ORD' + Date.now();
  const order = {
    id: orderId,
    userId: Number(userId),
    customerName,
    phone,
    address,
    city,
    pincode,
    paymentMethod,
    paymentStatus: paymentMethod === 'UPI' ? 'Paid' : 'Pending',
    transactionId: paymentMethod === 'UPI' ? 'TXN' + Date.now() : null,
    items,
    subtotal,
    deliveryFee,
    discount,
    couponCode: appliedCoupon ? appliedCoupon.code : null,
    total,
    status: 'Order Placed',
    orderDate: new Date().toISOString(),
    riderId: null,
    riderName: null,
    riderPhone: null,
    riderVehicle: null,
  };

  orders.push(order);
  saveOrders(orders);

  // Clear cart
  clearCart();

  return order;
}

export function updateOrderStatus(orderId, newStatus) {
  const orders = getOrders();
  const order = orders.find(o => o.id === orderId);
  if (order) {
    order.status = newStatus;
    saveOrders(orders);
    return order;
  }
  return null;
}

export function assignRiderToOrder(orderId, riderId) {
  const orders = getOrders();
  const riders = getRiders();
  const order = orders.find(o => o.id === orderId);
  const rider = riders.find(r => r.id === Number(riderId));

  if (order && rider) {
    order.riderId = rider.id;
    order.riderName = rider.name;
    order.riderPhone = rider.phone;
    order.riderVehicle = `${rider.vehicleType} - ${rider.vehicleNumber}`;
    order.status = 'Rider Assigned';
    saveOrders(orders);

    // Update rider
    rider.status = 'Busy';
    if (!rider.assignedOrders) rider.assignedOrders = [];
    rider.assignedOrders.push(orderId);
    saveRiders(riders);

    return order;
  }
  return null;
}

export function cancelOrder(orderId) {
  const orders = getOrders();
  const order = orders.find(o => o.id === orderId);
  if (!order || order.status === 'Delivered' || order.status === 'Cancelled') {
    return false;
  }

  // Restore stock
  const products = getProducts();
  order.items.forEach(item => {
    const product = products.find(p => p.id === item.productId);
    if (product) {
      product.stock += item.quantity;
    }
  });
  saveProducts(products);

  // Update order status
  order.status = 'Cancelled';
  saveOrders(orders);

  // Free up rider if assigned
  if (order.riderId) {
    const riders = getRiders();
    const rider = riders.find(r => r.id === order.riderId);
    if (rider) {
      rider.assignedOrders = rider.assignedOrders.filter(id => id !== orderId);
      if (rider.assignedOrders.length === 0) {
        rider.status = 'Available';
      }
      saveRiders(riders);
    }
  }

  return true;
}

// ============ Riders ============
export function getRiders() {
  return getFromStorage(STORAGE_KEYS.RIDERS);
}

export function saveRiders(riders) {
  saveToStorage(STORAGE_KEYS.RIDERS, riders);
}

export function getRiderById(id) {
  const riders = getRiders();
  return riders.find(r => r.id === Number(id));
}

export function addRider(rider) {
  const riders = getRiders();
  const newId = riders.length > 0 ? Math.max(...riders.map(r => r.id)) + 1 : 101;
  const newRider = { ...rider, id: newId, assignedOrders: [], rating: 5.0 };
  riders.push(newRider);
  saveRiders(riders);
  return newRider;
}

export function updateRider(id, updates) {
  const riders = getRiders();
  const index = riders.findIndex(r => r.id === Number(id));
  if (index !== -1) {
    riders[index] = { ...riders[index], ...updates };
    saveRiders(riders);
    return riders[index];
  }
  return null;
}

export function deleteRider(id) {
  const riders = getRiders();
  const filtered = riders.filter(r => r.id !== Number(id));
  saveRiders(filtered);
  return filtered.length !== riders.length;
}

// ============ Coupons ============
export function getCoupons() {
  return getFromStorage(STORAGE_KEYS.COUPONS);
}

export function saveCoupons(coupons) {
  saveToStorage(STORAGE_KEYS.COUPONS, coupons);
}

export function getCouponByCode(code) {
  const coupons = getCoupons();
  return coupons.find(c => c.code === code);
}

export function addCoupon(coupon) {
  const coupons = getCoupons();
  coupons.push(coupon);
  saveCoupons(coupons);
  return coupon;
}

export function updateCoupon(code, updates) {
  const coupons = getCoupons();
  const index = coupons.findIndex(c => c.code === code);
  if (index !== -1) {
    coupons[index] = { ...coupons[index], ...updates };
    saveCoupons(coupons);
    return coupons[index];
  }
  return null;
}

export function deleteCoupon(code) {
  const coupons = getCoupons();
  const filtered = coupons.filter(c => c.code !== code);
  saveCoupons(filtered);
  return filtered.length !== coupons.length;
}

// ============ Reviews ============
export function getReviews() {
  return getFromStorage(STORAGE_KEYS.REVIEWS);
}

export function saveReviews(reviews) {
  saveToStorage(STORAGE_KEYS.REVIEWS, reviews);
}

export function addReview(reviewData) {
  const reviews = getReviews();
  const newReview = {
    ...reviewData,
    id: 'REV' + Date.now(),
    createdAt: new Date().toISOString(),
  };
  reviews.push(newReview);
  saveReviews(reviews);
  return newReview;
}

export function getReviewsByOrderId(orderId) {
  const reviews = getReviews();
  return reviews.filter(r => r.orderId === orderId);
}

export function updateReview(reviewId, updates) {
  const reviews = getReviews();
  const index = reviews.findIndex(r => r.id === reviewId);
  if (index !== -1) {
    reviews[index] = { ...reviews[index], ...updates };
    saveReviews(reviews);
    return reviews[index];
  }
  return null;
}

export function deleteReview(reviewId) {
  const reviews = getReviews();
  const filtered = reviews.filter(r => r.id !== reviewId);
  saveReviews(filtered);
  return filtered.length !== reviews.length;
}

// ============ Support Tickets ============
export function getSupportTickets() {
  return getFromStorage(STORAGE_KEYS.SUPPORT_TICKETS);
}

export function saveSupportTickets(tickets) {
  saveToStorage(STORAGE_KEYS.SUPPORT_TICKETS, tickets);
}

export function createSupportTicket(ticketData) {
  const tickets = getSupportTickets();
  const newTicket = {
    ...ticketData,
    id: 'SUP' + Date.now(),
    status: 'Open',
    adminResponse: null,
    createdAt: new Date().toISOString(),
    resolvedAt: null,
  };
  tickets.push(newTicket);
  saveSupportTickets(tickets);
  return newTicket;
}

export function updateSupportTicket(ticketId, updates) {
  const tickets = getSupportTickets();
  const index = tickets.findIndex(t => t.id === ticketId);
  if (index !== -1) {
    tickets[index] = { ...tickets[index], ...updates };
    if (updates.status === 'Resolved' && !tickets[index].resolvedAt) {
      tickets[index].resolvedAt = new Date().toISOString();
    }
    saveSupportTickets(tickets);
    return tickets[index];
  }
  return null;
}

export function getSupportTicketsByUserId(userId) {
  const tickets = getSupportTickets();
  return tickets.filter(t => t.userId === Number(userId)).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

// ============ Users ============
export function getUsers() {
  return getFromStorage(STORAGE_KEYS.USERS);
}

export function saveUsers(users) {
  saveToStorage(STORAGE_KEYS.USERS, users);
}

export function getUserByEmail(email) {
  const users = getUsers();
  return users.find(u => u.email === email);
}

export function getUserById(id) {
  const users = getUsers();
  return users.find(u => u.id === Number(id));
}

export function addUser(user) {
  const users = getUsers();
  const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
  const newUser = { ...user, id: newId, role: 'user' };
  users.push(newUser);
  saveUsers(users);
  return newUser;
}

export function updateUser(id, updates) {
  const users = getUsers();
  const index = users.findIndex(u => u.id === Number(id));
  if (index !== -1) {
    users[index] = { ...users[index], ...updates };
    saveUsers(users);
    return users[index];
  }
  return null;
}

// ============ Delivery Location ============
export function getDeliveryLocation() {
  return localStorage.getItem(STORAGE_KEYS.DELIVERY_LOCATION) || initialDeliveryLocation;
}

export function setDeliveryLocation(location) {
  localStorage.setItem(STORAGE_KEYS.DELIVERY_LOCATION, location);
}

// ============ Customer Service Analytics ============
export function getCustomerServiceAnalytics() {
  const reviews = getReviews();
  const tickets = getSupportTickets();
  const products = getProducts();
  const orders = getOrders();

  // Item reviews
  const itemReviews = reviews.filter(r => r.type === 'item');
  const deliveryReviews = reviews.filter(r => r.type === 'delivery');

  const avgItemRating = itemReviews.length > 0
    ? (itemReviews.reduce((sum, r) => sum + r.rating, 0) / itemReviews.length).toFixed(1)
    : '0.0';

  const avgDeliveryRating = deliveryReviews.length > 0
    ? (deliveryReviews.reduce((sum, r) => sum + r.speedRating + r.riderRating, 0) / (deliveryReviews.length * 2)).toFixed(1)
    : '0.0';

  const openTickets = tickets.filter(t => t.status === 'Open').length;
  const resolvedTickets = tickets.filter(t => t.status === 'Resolved').length;

  // Most reported issue category
  const issueCounts = {};
  itemReviews.forEach(r => {
    if (r.issues) {
      r.issues.forEach(issue => {
        issueCounts[issue] = (issueCounts[issue] || 0) + 1;
      });
    }
  });
  const mostReportedIssue = Object.entries(issueCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';

  // Most reviewed product
  const productReviewCounts = {};
  itemReviews.forEach(r => {
    productReviewCounts[r.productName] = (productReviewCounts[r.productName] || 0) + 1;
  });
  const mostReviewedProduct = Object.entries(productReviewCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';

  // Low stock count
  const lowStockCount = products.filter(p => p.active && p.stock <= 10).length;

  // Orders stats
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => ['Order Placed', 'Confirmed', 'Preparing', 'Rider Assigned', 'Out for Delivery'].includes(o.status)).length;
  const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;
  const cancelledOrders = orders.filter(o => o.status === 'Cancelled').length;

  // Revenue
  const totalRevenue = orders
    .filter(o => o.status === 'Delivered')
    .reduce((sum, o) => sum + o.total, 0);

  // Riders
  const riders = getRiders();
  const totalRiders = riders.length;
  const availableRiders = riders.filter(r => r.status === 'Available').length;
  const inTransit = orders.filter(o => o.status === 'Out for Delivery').length;

  // Users
  const users = getUsers();
  const registeredUsers = users.filter(u => u.role === 'user').length;

  // Top selling products
  const productSales = {};
  orders.filter(o => o.status === 'Delivered').forEach(o => {
    o.items.forEach(item => {
      if (!productSales[item.productId]) {
        productSales[item.productId] = { units: 0, revenue: 0, name: item.name };
      }
      productSales[item.productId].units += item.quantity;
      productSales[item.productId].revenue += item.price * item.quantity;
    });
  });
  const topProducts = Object.values(productSales)
    .sort((a, b) => b.units - a.units)
    .slice(0, 10);

  // Category revenue breakdown
  const categoryRevenue = {};
  orders.filter(o => o.status === 'Delivered').forEach(o => {
    o.items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      const cat = product?.category || 'Unknown';
      if (!categoryRevenue[cat]) {
        categoryRevenue[cat] = { skuCount: 0, itemsSold: 0, grossSales: 0 };
      }
      categoryRevenue[cat].itemsSold += item.quantity;
      categoryRevenue[cat].grossSales += item.price * item.quantity;
    });
  });
  products.forEach(p => {
    if (p.active && categoryRevenue[p.category]) {
      categoryRevenue[p.category].skuCount++;
    }
  });

  // Rider leaderboard
  const riderStats = {};
  orders.filter(o => o.status === 'Delivered' && o.riderName).forEach(o => {
    if (!riderStats[o.riderId]) {
      riderStats[o.riderId] = { name: o.riderName, completed: 0 };
    }
    riderStats[o.riderId].completed++;
  });
  const riderLeaderboard = Object.values(riderStats).sort((a, b) => b.completed - a.completed);

  return {
    avgItemRating,
    avgDeliveryRating,
    openTickets,
    resolvedTickets,
    mostReportedIssue,
    mostReviewedProduct,
    lowStockCount,
    totalOrders,
    pendingOrders,
    deliveredOrders,
    cancelledOrders,
    totalRevenue,
    totalRiders,
    availableRiders,
    inTransit,
    registeredUsers,
    topProducts,
    categoryRevenue: Object.entries(categoryRevenue).map(([category, data]) => ({ category, ...data })),
    riderLeaderboard,
  };
}