"use client";

import React, { useState, useMemo, useEffect } from "react";
import styles from "./page.module.css";
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_TABLES, INITIAL_CUSTOMERS } from "@/data/mockData";
import TopBar from "@/components/TopBar/TopBar";
import CategoryTabs from "@/components/CategoryTabs/CategoryTabs";
import ProductGrid from "@/components/ProductGrid/ProductGrid";
import CartPanel from "@/components/CartPanel/CartPanel";

export default function Home() {
  // Mock prompt/alert for non-blocking test automation (only when ?test=true is active)
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search.includes("test=true")) {
      window.prompt = (msg, defaultText) => {
        console.log("Mock Prompt:", msg);
        return defaultText || "customer@example.com";
      };
      window.alert = (msg) => {
        console.log("Mock Alert:", msg);
      };
    }
  }, []);

  // Users list in local state for registration and login
  const [users, setUsers] = useState([
    { email: "admin@oakandbean.com", password: "admin123", role: "Admin", name: "Admin User" },
    { email: "employee@oakandbean.com", password: "employee123", role: "Employee", name: "John Cashier" }
  ]);
  const [currentUser, setCurrentUser] = useState(null); // null when not authenticated

  // Auth Portal input states
  const [authMode, setAuthMode] = useState("login"); // "login" | "signup"
  const [authRole, setAuthRole] = useState("Employee"); // "Employee" | "Admin"
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");

  // Core POS State Variables
  const [role, setRole] = useState("Employee"); // "Employee" | "Admin"
  const [products, setProducts] = useState(INITIAL_PRODUCTS); // Stateful catalog
  const [cart, setCart] = useState([]);
  const [activeCategoryId, setActiveCategoryId] = useState("cat_1"); // Default: Beverages
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTable, setSelectedTable] = useState("Table 5");
  const [customerName, setCustomerName] = useState("Walk-in Customer");
  const [activeModal, setActiveModal] = useState(null); // Modals in topnav

  // Orders Search & Filter States
  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("All"); // "All" | "Paid" | "Draft"

  // Orders View & Completed tickets states
  const [currentView, setCurrentView] = useState("pos"); // "pos" | "orders"
  const [pastOrders, setPastOrders] = useState([]);
  const [selectedPastOrderId, setSelectedPastOrderId] = useState(null);

  // New product form states (Admin view)
  const [newProdName, setNewProdName] = useState("");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdCategory, setNewProdCategory] = useState("cat_1");

  // Derived: Filter past orders based on search and status (Memoized)
  const filteredPastOrders = useMemo(() => {
    return pastOrders.filter((order) => {
      const query = orderSearchQuery.toLowerCase().trim();
      const matchesSearch = !query || 
        order.id.toLowerCase().includes(query) ||
        order.customer.toLowerCase().includes(query) ||
        order.table.toLowerCase().includes(query);
      
      const matchesStatus = orderStatusFilter === "All" || order.status === orderStatusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [pastOrders, orderSearchQuery, orderStatusFilter]);

  // Derived: Selected past order details (Memoized)
  const selectedPastOrder = useMemo(() => {
    if (filteredPastOrders.length === 0) return null;
    return filteredPastOrders.find((o) => o.id === selectedPastOrderId) || filteredPastOrders[0];
  }, [filteredPastOrders, selectedPastOrderId]);

  // Mobile navigation state ("menu" or "cart")
  const [mobileTab, setMobileTab] = useState("menu");

  // Handler: Add item to shopping cart
  const handleAddToCart = (product) => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex((item) => item.product.id === product.id);
      
      if (existingItemIndex > -1) {
        // Increment quantity if already exists
        return prevCart.map((item, index) =>
          index === existingItemIndex ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        // Add new item with quantity = 1
        return [...prevCart, { product, quantity: 1 }];
      }
    });
  };

  // Handler: Update quantity (+1 / -1)
  const handleUpdateQuantity = (productId, delta) => {
    setCart((prevCart) =>
      prevCart
          .map((item) => {
            if (item.product.id === productId) {
              const nextQuantity = item.quantity + delta;
              return { ...item, quantity: nextQuantity };
            }
            return item;
          })
          // Remove item if quantity falls to 0 or below
          .filter((item) => item.quantity > 0)
    );
  };

  // Handler: Clear entire cart
  const handleClearCart = () => {
    setCart([]);
  };

  // Derivation: Filter products by search query OR active category (Memoized)
  const filteredProducts = useMemo(() => {
    if (searchQuery.trim() !== "") {
      // Global search across all categories (case-insensitive)
      return products.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    // Filter by selected category tab
    return products.filter((product) => product.category_id === activeCategoryId);
  }, [searchQuery, activeCategoryId, products]);

  // Derivation: Calculate financial receipts (Memoized)
  const totals = useMemo(() => {
    const subtotal = cart.reduce((acc, item) => acc + item.quantity * item.product.price, 0);
    const tax = subtotal * 0.05; // 5.0% Tax rate
    const grandTotal = subtotal + tax;

    return {
      subtotal,
      tax,
      grandTotal,
    };
  }, [cart]);

  // Derived: Count total items in cart for mobile badge
  const totalCartItemsCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  }, [cart]);

  // Draft / Paid Action Handlers
  const handleEditDraft = (draft) => {
    const restoredCart = draft.cart.map(item => {
      const product = products.find(p => p.id === item.product_id);
      return {
        product: product || { id: item.product_id, name: item.name, price: item.price },
        quantity: item.quantity
      };
    });
    setCart(restoredCart);
    setSelectedTable(draft.table);
    setCustomerName(draft.customer);
    setPastOrders(prev => prev.filter(o => o.id !== draft.id));
    setCurrentView("pos");
    setMobileTab("menu");
  };

  const handleDeleteDraft = (draftId) => {
    if (confirm("Are you sure you want to delete this draft ticket?")) {
      setPastOrders(prev => prev.filter(o => o.id !== draftId));
      if (selectedPastOrderId === draftId) {
        setSelectedPastOrderId(null);
      }
    }
  };

  const handlePayDraft = (draftId) => {
    const email = prompt("Enter customer email to send the receipt:");
    if (email === null) return; // cancelled
    
    setPastOrders(prev => prev.map(o => {
      if (o.id === draftId) {
        return {
          ...o,
          status: "Paid",
          customerEmail: email,
          paymentMethod: "UPI" // default pay on draft
        };
      }
      return o;
    }));
    
    alert(`Receipt successfully paid and emailed to: ${email || "(no email entered)"}`);
  };

  const handleSendEmail = (order, email) => {
    if (!email || !email.includes("@")) {
      alert("Please enter a valid email address.");
      return;
    }
    setPastOrders(prev => prev.map(o => {
      if (o.id === order.id) {
        return { ...o, customerEmail: email };
      }
      return o;
    }));
    alert(`Receipt sent to ${email} successfully!`);
  };

  // Staff Authentication Handlers
  const handleAuthSubmit = (e) => {
    e.preventDefault();
    if (authMode === "login") {
      const found = users.find(u => u.email.toLowerCase() === authEmail.toLowerCase().trim() && u.password === authPassword);
      if (found) {
        setCurrentUser(found);
        setRole(found.role);
        if (found.role === "Admin") {
          setCurrentView("orders");
        } else {
          setCurrentView("pos");
        }
        alert(`Logged in successfully as ${found.name} (${found.role})`);
        setAuthEmail("");
        setAuthPassword("");
      } else {
        alert("Invalid email or password!");
      }
    } else {
      // Sign Up
      if (!authName.trim()) {
        alert("Please enter your name.");
        return;
      }
      const exists = users.find(u => u.email.toLowerCase() === authEmail.toLowerCase().trim());
      if (exists) {
        alert("Email already registered!");
        return;
      }
      const newUser = {
        name: authName.trim(),
        email: authEmail.toLowerCase().trim(),
        password: authPassword,
        role: authRole
      };
      setUsers(prev => [...prev, newUser]);
      setCurrentUser(newUser);
      setRole(newUser.role);
      if (newUser.role === "Admin") {
        setCurrentView("orders");
      } else {
        setCurrentView("pos");
      }
      alert(`Registered and logged in as ${newUser.name} (${newUser.role})`);
      setAuthName("");
      setAuthEmail("");
      setAuthPassword("");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setRole("Employee");
    setCurrentView("pos");
    alert("Logged out successfully.");
  };

  // Product Management (Admin dashboard) Handlers
  const handleAddProductSubmit = (e) => {
    e.preventDefault();
    if (!newProdName.trim() || !newProdPrice) return;
    
    const newProduct = {
      id: `prod_${Date.now()}`,
      category_id: newProdCategory,
      name: newProdName.trim(),
      price: parseFloat(newProdPrice) || 0
    };

    setProducts(prev => [...prev, newProduct]);
    setNewProdName("");
    setNewProdPrice("");
    alert(`Successfully added "${newProduct.name}" to the menu catalog!`);
  };

  const handleUpdateProductPrice = (productId, newPrice) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        return { ...p, price: Math.max(0, newPrice) };
      }
      return p;
    }));
  };

  const handleDeleteProduct = (productId) => {
    if (confirm("Are you sure you want to delete this product from the menu catalog?")) {
      setProducts(prev => prev.filter(p => p.id !== productId));
      // Evict from cart if present
      setCart(prev => prev.filter(item => item.product.id !== productId));
    }
  };

  // Derived: Admin Analytics Dashboard Calculations (Memoized)
  const analytics = useMemo(() => {
    let totalRevenue = 0;
    let draftRevenue = 0;
    let upiRevenue = 0;
    let cardRevenue = 0;
    let cashRevenue = 0;

    pastOrders.forEach(o => {
      if (o.status === "Paid") {
        totalRevenue += o.summary.grandTotal;
        if (o.paymentMethod === "UPI") upiRevenue += o.summary.grandTotal;
        else if (o.paymentMethod === "Card") cardRevenue += o.summary.grandTotal;
        else if (o.paymentMethod === "Cash") cashRevenue += o.summary.grandTotal;
      } else {
        draftRevenue += o.summary.grandTotal;
      }
    });

    const grandPaid = totalRevenue || 1; // avoid division by zero
    return {
      totalRevenue,
      draftRevenue,
      upiRevenue,
      cardRevenue,
      cashRevenue,
      upiPct: (upiRevenue / grandPaid) * 100,
      cardPct: (cardRevenue / grandPaid) * 100,
      cashPct: (cashRevenue / grandPaid) * 100
    };
  }, [pastOrders]);

  const { totalRevenue, draftRevenue, upiRevenue, cardRevenue, cashRevenue, upiPct, cardPct, cashPct } = analytics;

  if (!currentUser) {
    return (
      <div className={styles.authContainer}>
        <div className={`${styles.authCard} glassmorphic`}>
          <div className={styles.authLogo}>
            <svg className={styles.authLogoIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
              <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z" />
              <line x1="6" y1="2" x2="6" y2="4" />
              <line x1="10" y1="2" x2="10" y2="4" />
              <line x1="14" y1="2" x2="14" y2="4" />
            </svg>
            <div className={styles.authLogoText}>
              <span className={styles.neonTextCyan}>OAK &</span>
              <span className={styles.neonTextPink}>BEAN</span>
            </div>
          </div>
          
          <h2 className={styles.authTitle}>STAFF PORTAL</h2>
          
          <div className={styles.authTabs}>
            <button
              type="button"
              className={`${styles.authTabBtn} ${authMode === "login" ? styles.activeAuthTab : ""}`}
              onClick={() => setAuthMode("login")}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`${styles.authTabBtn} ${authMode === "signup" ? styles.activeAuthTab : ""}`}
              onClick={() => setAuthMode("signup")}
            >
              Sign Up
            </button>
          </div>
          
          <form className={styles.authForm} onSubmit={handleAuthSubmit}>
            {authMode === "signup" && (
              <div className={styles.authField}>
                <label className={styles.authLabel}>Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  className={styles.authInput}
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                />
              </div>
            )}
            
            <div className={styles.authField}>
              <label className={styles.authLabel}>Email Address</label>
              <input
                type="email"
                required
                placeholder="staff@oakandbean.com"
                className={styles.authInput}
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
              />
            </div>
            
            <div className={styles.authField}>
              <label className={styles.authLabel}>Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                className={styles.authInput}
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
              />
            </div>
            
            {authMode === "signup" && (
              <div className={styles.authField}>
                <label className={styles.authLabel}>Assign Role</label>
                <div className={styles.authRoleSelect}>
                  <button
                    type="button"
                    className={`${styles.roleOption} ${authRole === "Employee" ? styles.selectedRoleOption : ""}`}
                    onClick={() => setAuthRole("Employee")}
                  >
                    Employee (Cashier)
                  </button>
                  <button
                    type="button"
                    className={`${styles.roleOption} ${authRole === "Admin" ? styles.selectedRoleOption : ""}`}
                    onClick={() => setAuthRole("Admin")}
                  >
                    Admin (User Manager)
                  </button>
                </div>
              </div>
            )}
            
            <button type="submit" className={styles.authSubmitBtn}>
              {authMode === "login" ? "Sign In" : "Register Staff"}
            </button>
          </form>
          
          <div className={styles.quickLoginSection}>
            <div className={styles.quickLoginTitle}>Quick Access demo accounts:</div>
            <div className={styles.quickButtons}>
              <button
                type="button"
                className={styles.quickBtn}
                onClick={() => {
                  setAuthEmail("admin@oakandbean.com");
                  setAuthPassword("admin123");
                  setAuthMode("login");
                }}
              >
                🔐 Admin demo
              </button>
              <button
                type="button"
                className={styles.quickBtn}
                onClick={() => {
                  setAuthEmail("employee@oakandbean.com");
                  setAuthPassword("employee123");
                  setAuthMode("login");
                }}
              >
                🔑 Employee demo
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.posContainer}>
      {/* Top Header Bar */}
      <TopBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedTable={selectedTable}
        setSelectedTable={setSelectedTable}
        customerName={customerName}
        setCustomerName={setCustomerName}
        activeModal={activeModal}
        setActiveModal={setActiveModal}
        currentView={currentView}
        setCurrentView={setCurrentView}
        role={role}
        setRole={setRole}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Column Splitter */}
      <main className={styles.mainLayout}>
        {currentView === "pos" ? (
          <>
            {/* Left Column - Categories & Catalog grid */}
            <section
              className={`${styles.leftColumn} ${
                mobileTab === "menu" ? styles.activeColumn : ""
              }`}
            >
              {/* Category Tabs */}
              <CategoryTabs
                activeCategoryId={activeCategoryId}
                setActiveCategoryId={setActiveCategoryId}
                onClearSearch={() => setSearchQuery("")}
              />

              {/* Product Grid listing */}
              <ProductGrid products={filteredProducts} onAdd={handleAddToCart} />
            </section>

            {/* Right Column - Cart receipt ledger */}
            <section
              className={`${styles.rightColumn} ${
                mobileTab === "cart" ? styles.activeColumn : ""
              }`}
            >
              <CartPanel
                cart={cart}
                onUpdateQuantity={handleUpdateQuantity}
                onClearCart={handleClearCart}
                selectedTable={selectedTable}
                customerName={customerName}
                totals={totals}
                onSendToKitchen={(order) => {
                  setPastOrders((prev) => [order, ...prev]);
                  setCart([]);
                }}
              />
            </section>
          </>
        ) : (
          <>
            {/* Left Column - Dynamic role-based order display */}
            <section
              className={`${styles.leftColumn} ${
                mobileTab === "menu" ? styles.activeColumn : ""
              }`}
            >
              {role === "Admin" ? (
                /* Admin split Dashboard View (Tickets Sidebar + Reports + Product Editor) */
                <div className={styles.adminDashboard}>
                  {/* Left part - Tickets list Database */}
                  <div className={styles.adminSidebar}>
                    <div className={styles.ordersHeader}>
                      <h2 className={styles.ordersTitle}>TICKETS DATABASE</h2>
                    </div>
                    <div className={styles.orderSearchContainer}>
                      <input
                        type="text"
                        placeholder="Search ID, customer, table..."
                        value={orderSearchQuery}
                        onChange={(e) => setOrderSearchQuery(e.target.value)}
                        className={styles.orderSearchInput}
                      />
                    </div>
                    <div className={styles.orderStatusTabs}>
                      {["All", "Paid", "Draft"].map((status) => (
                        <button
                          key={status}
                          type="button"
                          className={`${styles.orderStatusTabBtn} ${orderStatusFilter === status ? styles.activeStatusTab : ""}`}
                          onClick={() => setOrderStatusFilter(status)}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                    <div className={styles.ordersScrollArea}>
                      {filteredPastOrders.length === 0 ? (
                        <div className={styles.emptyContainer} style={{ padding: "40px 0" }}>
                          <div className={`${styles.emptyBox} glassmorphic`} style={{ borderStyle: "dashed" }}>
                            <h3 className={styles.emptyTitle}>NO TICKETS FOUND</h3>
                            <p className={styles.emptySubtitle}>Try adjusting your search or filters.</p>
                          </div>
                        </div>
                      ) : (
                        <div className={styles.ordersListGrid}>
                          {filteredPastOrders.map((order) => {
                            const isSelected = order.id === selectedPastOrder?.id;
                            return (
                              <button
                                key={order.id}
                                className={`${styles.orderHistoryCard} ${isSelected ? styles.activeOrderHistoryCard : ""}`}
                                onClick={() => setSelectedPastOrderId(order.id)}
                              >
                                <div className={styles.orderHistoryMeta}>
                                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                    <span className={styles.orderHistoryId}>{order.id}</span>
                                    <span className={order.status === "Paid" ? styles.statusPaidBadge : styles.statusDraftBadge}>
                                      {order.status}
                                    </span>
                                  </div>
                                  <span className={styles.orderHistoryTime}>{order.timestamp}</span>
                                </div>
                                <div className={styles.orderHistoryBody}>
                                  <div className={styles.orderHistoryCustTable}>
                                    <span className={styles.orderHistoryCust}>{order.customer}</span>
                                    <span className={styles.orderHistoryTable}>{order.table}</span>
                                  </div>
                                  <span className={styles.orderHistoryTotal}>${order.summary.grandTotal.toFixed(2)}</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right part - Analytics Reports and Catalog manager */}
                  <div className={styles.adminMainPanel}>
                    {/* Analytics Dashboard */}
                    <div className={styles.adminCard}>
                      <h3 className={styles.panelTitle}>📊 Revenue Analytics Dashboard</h3>
                      <div className={styles.analyticsGrid}>
                        <div className={styles.analyticsBlock}>
                          <span className={styles.analyticsLabel}>Total Revenue (Paid)</span>
                          <span className={styles.analyticsValue}>${totalRevenue.toFixed(2)}</span>
                        </div>
                        <div className={styles.analyticsBlock}>
                          <span className={styles.analyticsLabel}>Draft Value (Unpaid)</span>
                          <span className={styles.analyticsValue} style={{ color: "var(--neon-pink)" }}>
                            ${draftRevenue.toFixed(2)}
                          </span>
                        </div>
                        <div className={styles.analyticsBlock}>
                          <span className={styles.analyticsLabel}>Active Tickets Count</span>
                          <span className={styles.analyticsValue} style={{ color: "var(--text-secondary)" }}>
                            {pastOrders.length}
                          </span>
                        </div>
                      </div>
                      <div className={styles.paymentBreakdown}>
                        <h4 className={styles.breakdownTitle}>Revenue by Payment Method</h4>
                        <div className={styles.paymentBarContainer}>
                          <div className={styles.paymentBarItem}>
                            <span className={styles.barLabel}>📱 UPI: ${upiRevenue.toFixed(2)}</span>
                            <div className={styles.barOuter}>
                              <div className={styles.barInnerUPI} style={{ width: `${upiPct}%` }} />
                            </div>
                          </div>
                          <div className={styles.paymentBarItem}>
                            <span className={styles.barLabel}>💳 Card: ${cardRevenue.toFixed(2)}</span>
                            <div className={styles.barOuter}>
                              <div className={styles.barInnerCard} style={{ width: `${cardPct}%` }} />
                            </div>
                          </div>
                          <div className={styles.paymentBarItem}>
                            <span className={styles.barLabel}>💵 Cash: ${cashRevenue.toFixed(2)}</span>
                            <div className={styles.barOuter}>
                              <div className={styles.barInnerCash} style={{ width: `${cashPct}%` }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Catalog Configuration Manager */}
                    <div className={styles.adminCard}>
                      <h3 className={styles.panelTitle}>⚙️ Product Catalog Configurator</h3>
                      
                      {/* Product Addition Form */}
                      <form className={styles.addProductForm} onSubmit={handleAddProductSubmit}>
                        <h4 className={styles.subFormTitle}>Add New Menu Item</h4>
                        <div className={styles.formGrid}>
                          <div className={styles.formField}>
                            <label className={styles.formLabel}>Product Name</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Warm Brownie"
                              value={newProdName}
                              onChange={(e) => setNewProdName(e.target.value)}
                              className={styles.formInput}
                            />
                          </div>
                          <div className={styles.formField}>
                            <label className={styles.formLabel}>Price ($)</label>
                            <input
                              type="number"
                              step="0.01"
                              required
                              min="0"
                              placeholder="4.50"
                              value={newProdPrice}
                              onChange={(e) => setNewProdPrice(e.target.value)}
                              className={styles.formInput}
                            />
                          </div>
                          <div className={styles.formField}>
                            <label className={styles.formLabel}>Category</label>
                            <select
                              value={newProdCategory}
                              onChange={(e) => setNewProdCategory(e.target.value)}
                              className={styles.formInput}
                            >
                              <option value="cat_1">Beverages</option>
                              <option value="cat_2">Pastries</option>
                              <option value="cat_3">Milkshakes</option>
                              <option value="cat_4">Burgers</option>
                              <option value="cat_5">Sides</option>
                            </select>
                          </div>
                          <button type="submit" className={styles.addProductBtn}>
                            Add Item
                          </button>
                        </div>
                      </form>

                      {/* Active Products List */}
                      <div className={styles.productListContainer}>
                        <h4 className={styles.subFormTitle}>Active Catalog List ({products.length} items)</h4>
                        <div className={styles.productListScroll}>
                          {products.map((p) => {
                            const cat = INITIAL_CATEGORIES.find(c => c.id === p.category_id);
                            return (
                              <div key={p.id} className={styles.productRowItem}>
                                <div className={styles.productInfoCol}>
                                  <span className={styles.productNameText}>{p.name}</span>
                                  <span className={styles.productCatText} style={{ color: cat?.color }}>
                                    {cat?.name}
                                  </span>
                                </div>
                                <div className={styles.productActionCol}>
                                  <div className={styles.priceEditGroup}>
                                    <span className={styles.dollarSign}>$</span>
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={p.price}
                                      onChange={(e) => handleUpdateProductPrice(p.id, parseFloat(e.target.value) || 0)}
                                      className={styles.priceInputSmall}
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteProduct(p.id)}
                                    className={styles.deleteProdBtn}
                                    title="Delete product from catalog"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Cashier Standard Order View */
                <>
                  <div className={styles.ordersHeader}>
                    <h2 className={styles.ordersTitle}>TICKETS</h2>
                  </div>
                  <div className={styles.orderSearchContainer}>
                    <input
                      type="text"
                      placeholder="Search ID, customer, table..."
                      value={orderSearchQuery}
                      onChange={(e) => setOrderSearchQuery(e.target.value)}
                      className={styles.orderSearchInput}
                    />
                  </div>
                  <div className={styles.orderStatusTabs}>
                    {["All", "Paid", "Draft"].map((status) => (
                      <button
                        key={status}
                        type="button"
                        className={`${styles.orderStatusTabBtn} ${orderStatusFilter === status ? styles.activeStatusTab : ""}`}
                        onClick={() => setOrderStatusFilter(status)}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                  <div className={styles.ordersScrollArea}>
                    {filteredPastOrders.length === 0 ? (
                      <div className={styles.emptyContainer} style={{ padding: "40px 0" }}>
                        <div className={`${styles.emptyBox} glassmorphic`} style={{ borderStyle: "dashed" }}>
                          <h3 className={styles.emptyTitle}>NO TICKETS FOUND</h3>
                          <p className={styles.emptySubtitle}>Try adjusting your search or filters.</p>
                        </div>
                      </div>
                    ) : (
                      <div className={styles.ordersListGrid}>
                        {filteredPastOrders.map((order) => {
                          const isSelected = order.id === selectedPastOrder?.id;
                          return (
                            <button
                              key={order.id}
                              className={`${styles.orderHistoryCard} ${isSelected ? styles.activeOrderHistoryCard : ""}`}
                              onClick={() => setSelectedPastOrderId(order.id)}
                            >
                              <div className={styles.orderHistoryMeta}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                  <span className={styles.orderHistoryId}>{order.id}</span>
                                  <span className={order.status === "Paid" ? styles.statusPaidBadge : styles.statusDraftBadge}>
                                    {order.status}
                                  </span>
                                </div>
                                <span className={styles.orderHistoryTime}>{order.timestamp}</span>
                              </div>
                              <div className={styles.orderHistoryBody}>
                                <div className={styles.orderHistoryCustTable}>
                                  <span className={styles.orderHistoryCust}>{order.customer}</span>
                                  <span className={styles.orderHistoryTable}>{order.table}</span>
                                </div>
                                <span className={styles.orderHistoryTotal}>${order.summary.grandTotal.toFixed(2)}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}
            </section>

            {/* Right Column - Selected Ticket detailed receipt */}
            <section
              className={`${styles.rightColumn} ${
                mobileTab === "cart" ? styles.activeColumn : ""
              }`}
            >
              {selectedPastOrder ? (
                <div className={styles.receiptContainer}>
                  <div className={styles.receiptHeader}>
                    <div className={styles.receiptTitleRow}>
                      <h2 className={styles.receiptTitle}>TICKET RECEIPT</h2>
                      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                        <span className={selectedPastOrder.status === "Paid" ? styles.statusPaidBadge : styles.statusDraftBadge}>
                          {selectedPastOrder.status}
                        </span>
                        <span className={styles.receiptIdBadge}>{selectedPastOrder.id}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--text-muted)", marginTop: "5px" }}>
                      <span>{selectedPastOrder.table} • {selectedPastOrder.customer}</span>
                      <span>{selectedPastOrder.timestamp}</span>
                    </div>
                    {selectedPastOrder.paymentMethod && (
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                        Payment Method: <strong>{selectedPastOrder.paymentMethod}</strong>
                      </div>
                    )}
                    {selectedPastOrder.customerEmail && (
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                        Email: {selectedPastOrder.customerEmail}
                      </div>
                    )}
                  </div>
                  
                  <div className={styles.receiptItemsList}>
                    {selectedPastOrder.cart.map((item) => (
                      <div key={item.product_id} className={styles.receiptItemRow}>
                        <span className={styles.receiptItemName}>{item.name}</span>
                        <div className={styles.receiptItemMeta}>
                          <span className={styles.receiptItemQty}>x{item.quantity}</span>
                          <span className={styles.receiptItemVal}>${item.line_total.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className={styles.receiptSummary}>
                    <div className={styles.receiptSummaryRow}>
                      <span>Subtotal</span>
                      <span className={styles.numericValue}>${selectedPastOrder.summary.subtotal.toFixed(2)}</span>
                    </div>
                    <div className={styles.receiptSummaryRow}>
                      <span>Tax (5.0%)</span>
                      <span className={styles.numericValue}>${selectedPastOrder.summary.tax.toFixed(2)}</span>
                    </div>
                    <div className={styles.divider} />
                    <div className={`${styles.receiptSummaryRow} ${styles.receiptGrandTotalRow}`}>
                      <span>TOTAL PAID</span>
                      <span className={`${styles.numericValue} ${styles.neonTextCyan}`}>
                        ${selectedPastOrder.summary.grandTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {selectedPastOrder.status === "Draft" ? (
                    <div className={styles.receiptActions}>
                      <button 
                        className={styles.editBtn}
                        onClick={() => handleEditDraft(selectedPastOrder)}
                      >
                        <svg style={{ width: "14px", height: "14px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit Draft
                      </button>
                      <button 
                        className={styles.deleteBtn}
                        onClick={() => handleDeleteDraft(selectedPastOrder.id)}
                      >
                        <svg style={{ width: "14px", height: "14px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete Draft
                      </button>
                      <button 
                        className={styles.payBtn}
                        onClick={() => handlePayDraft(selectedPastOrder.id)}
                      >
                        <svg style={{ width: "14px", height: "14px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Pay & Email
                      </button>
                    </div>
                  ) : (
                    <div className={styles.receiptActionsPaid}>
                      <div className={styles.emailInputGroup}>
                        <input
                          type="email"
                          placeholder="customer@email.com"
                          className={styles.emailInput}
                          id={`email-input-${selectedPastOrder.id}`}
                          defaultValue={selectedPastOrder.customerEmail || ""}
                        />
                        <button 
                          className={styles.sendEmailBtn}
                          onClick={() => {
                            const inputEl = document.getElementById(`email-input-${selectedPastOrder.id}`);
                            const email = inputEl ? inputEl.value : "";
                            handleSendEmail(selectedPastOrder, email);
                          }}
                        >
                          Send Email
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className={styles.receiptContainer} style={{ justifyContent: "center", alignItems: "center" }}>
                  <span style={{ color: "var(--text-muted)", fontSize: "14px" }}>No Ticket Selected</span>
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {/* Mobile view bottom tabs toggler bar */}
      <nav className={styles.mobileTabs}>
        <button
          className={`${styles.mobileTabBtn} ${
            mobileTab === "menu" ? styles.mobileActiveTab : ""
          }`}
          onClick={() => setMobileTab("menu")}
        >
          <svg
            style={{ width: "20px", height: "20px" }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
          {currentView === "pos" ? "Menu" : "Tickets"}
        </button>
        <button
          className={`${styles.mobileTabBtn} ${
            mobileTab === "cart" ? styles.mobileActiveTab : ""
          }`}
          onClick={() => setMobileTab("cart")}
        >
          <svg
            style={{ width: "20px", height: "20px" }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          {currentView === "pos" ? "Cart" : "Receipt"}
          {currentView === "pos" && totalCartItemsCount > 0 && (
            <span className={styles.cartBadge}>{totalCartItemsCount}</span>
          )}
        </button>
      </nav>
    </div>
  );
}
