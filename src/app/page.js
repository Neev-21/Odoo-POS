"use client";

import React, { useState, useMemo, useEffect } from "react";
import styles from "./page.module.css";
import { INITIAL_PRODUCTS } from "@/data/mockData";
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

  // Core POS State Variables
  const [cart, setCart] = useState([]);
  const [activeCategoryId, setActiveCategoryId] = useState("cat_1"); // Default: Beverages
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTable, setSelectedTable] = useState("Table 5");
  const [customerName, setCustomerName] = useState("Walk-in Customer");
  const [activeModal, setActiveModal] = useState(null); // Modals in topnav

  // Orders View & Completed tickets states
  const [currentView, setCurrentView] = useState("pos"); // "pos" | "orders"
  const [pastOrders, setPastOrders] = useState([]);
  const [selectedPastOrderId, setSelectedPastOrderId] = useState(null);

  // Derived: Selected past order details (Memoized)
  const selectedPastOrder = useMemo(() => {
    if (pastOrders.length === 0) return null;
    return pastOrders.find((o) => o.id === selectedPastOrderId) || pastOrders[0];
  }, [pastOrders, selectedPastOrderId]);

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
      return INITIAL_PRODUCTS.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    // Filter by selected category tab
    return INITIAL_PRODUCTS.filter((product) => product.category_id === activeCategoryId);
  }, [searchQuery, activeCategoryId]);

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
      const product = INITIAL_PRODUCTS.find(p => p.id === item.product_id);
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
          customerEmail: email
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
            {/* Left Column - Past Orders history */}
            <section
              className={`${styles.leftColumn} ${
                mobileTab === "menu" ? styles.activeColumn : ""
              }`}
            >
              <div className={styles.ordersHeader}>
                <h2 className={styles.ordersTitle}>COMPLETED TICKETS</h2>
              </div>
              <div className={styles.ordersScrollArea}>
                {pastOrders.length === 0 ? (
                  <div className={styles.emptyContainer} style={{ padding: "40px 0" }}>
                    <div className={`${styles.emptyBox} glassmorphic`} style={{ borderStyle: "dashed", borderColor: "var(--border-color)" }}>
                      <h3 className={styles.emptyTitle}>NO COMPLETED TICKETS</h3>
                      <p className={styles.emptySubtitle}>Submit active tickets to the kitchen to see them here.</p>
                    </div>
                  </div>
                ) : (
                  <div className={styles.ordersListGrid}>
                    {pastOrders.map((order) => {
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
