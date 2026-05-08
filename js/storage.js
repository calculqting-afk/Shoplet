const Shoplet = (() => {
  const keys = {
    products: "shoplet_products",
    users: "shoplet_users",
    session: "shoplet_session",
    cart: "shoplet_cart",
    orders: "shoplet_orders",
    authMigration: "shoplet_auth_no_demo_migrated"
  };

  const statusFlow = [
    "Pending",
    "Processing",
    "Packed",
    "Shipped",
    "Out for Delivery",
    "Delivered"
  ];

// local storage functions
// local storage functions
// local storage functions
// local storage functions
// local storage functions
  const defaultProducts = [
    {
      id: "p-1001",
      name: "AeroFlex Running Shoes",
      price: 1899,
      category: "Shoes",
      rating: 4.8,
      popularity: 96,
      newest: 12,
      stock: 28,
      badge: "Top Rated",
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
      description: "Lightweight street-ready sneakers with cushioned soles."
    },
    {
      id: "p-1002",
      name: "Urban Layer Hoodie",
      price: 1199,
      category: "Clothes",
      rating: 4.7,
      popularity: 88,
      newest: 15,
      stock: 44,
      badge: "New",
      image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=80",
      description: "Soft cotton-blend hoodie for everyday city wear."
    },
    {
      id: "p-1003",
      name: "CloudStep Slippers",
      price: 459,
      category: "Slippers",
      rating: 4.5,
      popularity: 79,
      newest: 7,
      stock: 55,
      badge: "Sale",
      image: "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=900&q=80",
      description: "Comfortable indoor and outdoor slides with flexible grip."
    },
    {
      id: "p-1004",
      name: "Metro Carry Backpack",
      price: 1499,
      category: "Bags",
      rating: 4.9,
      popularity: 93,
      newest: 9,
      stock: 31,
      badge: "Best Seller",
      image: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=900&q=80",
      description: "Durable backpack with laptop storage and travel pockets."
    },
    {
      id: "p-1005",
      name: "Minimal Watch Set",
      price: 899,
      category: "Accessories",
      rating: 4.6,
      popularity: 81,
      newest: 3,
      stock: 23,
      badge: "Limited",
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
      description: "Clean stainless-style watch for work and casual outfits."
    },
    {
      id: "p-1006",
      name: "Pulse Wireless Earbuds",
      price: 1599,
      category: "Electronics",
      rating: 4.8,
      popularity: 91,
      newest: 14,
      stock: 37,
      badge: "Hot",
      image: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=900&q=80",
      description: "Compact earbuds with crisp audio and charging case."
    },
    {
      id: "p-1007",
      name: "Canvas Tote Daily",
      price: 549,
      category: "Bags",
      rating: 4.4,
      popularity: 70,
      newest: 10,
      stock: 60,
      badge: "Eco Pick",
      image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=80",
      description: "Reusable tote bag with a clean shape and roomy interior."
    },
    {
      id: "p-1008",
      name: "Classic Denim Jacket",
      price: 1350,
      category: "Clothes",
      rating: 4.7,
      popularity: 84,
      newest: 11,
      stock: 19,
      badge: "Trending",
      image: "https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=900&q=80",
      description: "Structured denim jacket with a relaxed modern fit."
    },
    {
      id: "p-1009",
      name: "Stride Court Sneakers",
      price: 2299,
      category: "Shoes",
      rating: 4.9,
      popularity: 98,
      newest: 16,
      stock: 21,
      badge: "Premium",
      image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=900&q=80",
      description: "Low-profile sneakers with a clean court-inspired look."
    },
    {
      id: "p-1010",
      name: "SmartFit Fitness Band",
      price: 1299,
      category: "Electronics",
      rating: 4.6,
      popularity: 86,
      newest: 13,
      stock: 33,
      badge: "New",
      image: "https://images.unsplash.com/photo-1576243345690-4e4b79b63288?auto=format&fit=crop&w=900&q=80",
      description: "Daily activity tracker with a bright display and long battery life."
    },
    {
      id: "p-1011",
      name: "Everyday Cap",
      price: 299,
      category: "Accessories",
      rating: 4.3,
      popularity: 66,
      newest: 5,
      stock: 72,
      badge: "Value",
      image: "https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=900&q=80",
      description: "Adjustable cap with a clean profile and breathable finish."
    },
    {
      id: "p-1012",
      name: "BeachEase Sandals",
      price: 699,
      category: "Slippers",
      rating: 4.5,
      popularity: 74,
      newest: 8,
      stock: 40,
      badge: "Summer",
      image: "https://images.unsplash.com/photo-1562273138-f46be4ebdf33?auto=format&fit=crop&w=900&q=80",
      description: "Light sandals built for warm days, errands, and travel."
    }
  ];

  const defaultUsers = [];

  function read(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      console.warn("LocalStorage read failed", error);
      return fallback;
    }
  }

  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function seed() {
    // Keep existing LocalStorage records so user activity is not reset on refresh.
    if (!localStorage.getItem(keys.products)) {
      write(keys.products, defaultProducts);
    }

    if (!localStorage.getItem(keys.users)) {
      write(keys.users, defaultUsers);
    }

    if (!localStorage.getItem(keys.authMigration)) {
      removeDemoUsers();
      localStorage.setItem(keys.authMigration, "true");
    }

    if (!localStorage.getItem(keys.orders)) {
      write(keys.orders, []);
    }

    if (!localStorage.getItem(keys.cart)) {
      write(keys.cart, []);
    }
  }

  function money(value) {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      maximumFractionDigits: 0
    }).format(value || 0);
  }

  function formatDate(value) {
    if (!value) return "Not available";
    return new Intl.DateTimeFormat("en-PH", {
      dateStyle: "medium",
      timeStyle: "short"
    }).format(new Date(value));
  }

  function uid(prefix) {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  }

  function getProducts() {
    return read(keys.products, []);
  }

  function setProducts(products) {
    write(keys.products, products);
  }

  function getProduct(productId) {
    return getProducts().find((product) => product.id === productId);
  }

  function getUsers() {
    return read(keys.users, []);
  }

  function setUsers(users) {
    write(keys.users, users);
  }

  function removeDemoUsers() {
    const demoEmails = ["admin@shoplet.local", "customer@shoplet.local"];
    const users = getUsers();
    const filteredUsers = users.filter((user) => !demoEmails.includes(user.email?.toLowerCase()));
    const session = getSession();

    if (filteredUsers.length !== users.length) {
      setUsers(filteredUsers);
    }

    if (session && demoEmails.includes(session.email?.toLowerCase())) {
      localStorage.removeItem(keys.session);
    }
  }

  function getSession() {
    return read(keys.session, null);
  }

  function setSession(user) {
    const session = {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      loggedInAt: new Date().toISOString()
    };
    write(keys.session, session);
    return session;
  }

  function logout() {
    localStorage.removeItem(keys.session);
  }

  function registerUser({ name, email, password, role = "customer" }) {
    const users = getUsers();
    const normalizedEmail = email.trim().toLowerCase();

    if (users.some((user) => user.email.toLowerCase() === normalizedEmail)) {
      return { ok: false, message: "An account with this email already exists." };
    }

    const user = {
      id: uid("u"),
      name: name.trim(),
      email: normalizedEmail,
      password,
      role,
      joinedAt: new Date().toISOString()
    };

    users.push(user);
    setUsers(users);
    return { ok: true, user };
  }

  function login(email, password, role) {
    const user = getUsers().find((item) => {
      return item.email.toLowerCase() === email.trim().toLowerCase()
        && item.password === password
        && item.role === role;
    });

    if (!user) {
      return { ok: false, message: "Invalid email, password, or account type." };
    }

    return { ok: true, session: setSession(user), user };
  }

  function requireRole(allowedRoles, loginPath = "login.html") {
    const session = getSession();

    if (!session || !allowedRoles.includes(session.role)) {
      window.location.href = loginPath;
      return null;
    }

    return session;
  }

  function getOrders() {
    return read(keys.orders, []);
  }

  function setOrders(orders) {
    write(keys.orders, orders);
  }

  function getOrder(orderId) {
    return getOrders().find((order) => order.id === orderId);
  }

  function updateOrderStatus(orderId, status) {
    const orders = getOrders();
    const order = orders.find((item) => item.id === orderId);

    if (!order) return null;

    order.status = status;
    order.history = order.history || [];
    order.history.push({
      status,
      date: new Date().toISOString()
    });

    setOrders(orders);
    return order;
  }

  seed();

  return {
    keys,
    statusFlow,
    money,
    formatDate,
    uid,
    read,
    write,
    getProducts,
    setProducts,
    getProduct,
    getUsers,
    setUsers,
    getSession,
    setSession,
    logout,
    registerUser,
    login,
    requireRole,
    getOrders,
    setOrders,
    getOrder,
    updateOrderStatus
  };
})();
