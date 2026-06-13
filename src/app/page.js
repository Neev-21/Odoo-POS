"use client";

import React, { useState, useMemo } from "react";
import styles from "./page.module.css";
import { INITIAL_PRODUCTS } from "@/data/mockData";
import TopBar from "@/components/TopBar/TopBar";
import CategoryTabs from "@/components/CategoryTabs/CategoryTabs";
import ProductGrid from "@/components/ProductGrid/ProductGrid";
import CartPanel from "@/components/CartPanel/CartPanel";

export default function Home() {
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
                            <span className={styles.orderHistoryId}>{order.id}</span>
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
                      <span className={styles.receiptIdBadge}>{selectedPastOrder.id}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--text-muted)", marginTop: "5px" }}>
                      <span>{selectedPastOrder.table} • {selectedPastOrder.customer}</span>
                      <span>{selectedPastOrder.timestamp}</span>
                    </div>
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

                  <button 
                    className={styles.reprintBtn}
                    onClick={() => alert(JSON.stringify(selectedPastOrder, null, 2))}
                  >
                    <svg style={{ width: "16px", height: "16px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Alert Payload JSON
                  </button>
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
