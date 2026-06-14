"use client";

import React, { useState, useEffect } from "react";
import styles from "./bill.module.css";

export default function BillPage() {
  const [cart, setCart] = useState([]);
  const [pastOrders, setPastOrders] = useState([]);
  const [customerName, setCustomerName] = useState("Walk-in Customer");
  const [selectedTable, setSelectedTable] = useState("Table 5");
  const [params, setParams] = useState({ cart: false, orderId: null });

  // Read URL search params client-side safely
  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      setParams({
        cart: searchParams.get("cart") === "true",
        orderId: searchParams.get("orderId")
      });
    }
  }, []);

  // Load state and subscribe to changes in localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const loadData = () => {
        // Load active cart & metadata
        const storedCart = localStorage.getItem("pos_active_cart");
        if (storedCart) {
          try {
            setCart(JSON.parse(storedCart));
          } catch (e) {
            console.error(e);
          }
        }

        // Load past orders
        const storedOrders = localStorage.getItem("pos_past_orders");
        if (storedOrders) {
          try {
            setPastOrders(JSON.parse(storedOrders));
          } catch (e) {
            console.error(e);
          }
        }
      };

      loadData();

      // Listen for updates from other tabs
      const handleStorageChange = (e) => {
        if (e.key === "pos_active_cart" || e.key === "pos_past_orders") {
          loadData();
        }
      };

      window.addEventListener("storage", handleStorageChange);
      return () => {
        window.removeEventListener("storage", handleStorageChange);
      };
    }
  }, []);

  // Helper calculations
  const calculateTotals = (items) => {
    const subtotal = items.reduce((acc, item) => acc + item.quantity * (item.product?.price || item.price || 0), 0);
    const tax = subtotal * 0.05;
    const grandTotal = subtotal + tax;
    return { subtotal, tax, grandTotal };
  };

  // Resolve receipt display info
  let displayTitle = "BILL RECEIPT";
  let receiptId = "ACTIVE DRAFT";
  let items = [];
  let subtotal = 0;
  let tax = 0;
  let grandTotal = 0;
  let timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  let table = selectedTable;
  const dateStr = new Date().toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
  let customer = customerName;
  let status = "Draft";
  let paymentMethod = "";
  let customerEmail = "";

  if (params.cart) {
    items = cart.map(item => ({
      name: item.product?.name || "Item",
      price: item.product?.price || 0,
      quantity: item.quantity,
      line_total: item.quantity * (item.product?.price || 0)
    }));
    const t = calculateTotals(cart);
    subtotal = t.subtotal;
    tax = t.tax;
    grandTotal = t.grandTotal;
  } else if (params.orderId) {
    const foundOrder = pastOrders.find(o => o.id === params.orderId);
    if (foundOrder) {
      displayTitle = foundOrder.status === "Paid" ? "PAID RECEIPT" : "DRAFT RECEIPT";
      receiptId = foundOrder.id;
      items = foundOrder.cart;
      subtotal = foundOrder.summary.subtotal;
      tax = foundOrder.summary.tax;
      grandTotal = foundOrder.summary.grandTotal;
      timestamp = foundOrder.timestamp;
      table = foundOrder.table;
      customer = foundOrder.customer;
      status = foundOrder.status;
      paymentMethod = foundOrder.paymentMethod;
      customerEmail = foundOrder.customerEmail;
    }
  }

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className={styles.billPageWrapper}>
      <div className={`${styles.receiptContainer} glassmorphic`}>
        {/* Receipt Header */}
        <div className={styles.receiptHeader}>
          <div className={styles.mugLogo}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.mugIcon}>
              <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
              <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z" />
              <line x1="6" y1="2" x2="6" y2="4" />
              <line x1="10" y1="2" x2="10" y2="4" />
              <line x1="14" y1="2" x2="14" y2="4" />
            </svg>
          </div>
          <h1 className={styles.brandName}>OAK & BEAN</h1>
          <p className={styles.brandSub}>EST. 2026 • RETRO DINER</p>
          <div className={styles.receiptDivider} />
          
          <h2 className={styles.receiptType}>{displayTitle}</h2>
          <div className={styles.statusBadgeRow}>
            <span className={status === "Paid" ? styles.paidBadge : styles.draftBadge}>
              {status.toUpperCase()}
            </span>
            <span className={styles.ticketNumber}>{receiptId}</span>
          </div>
        </div>

        {/* Receipt Meta */}
        <div className={styles.metaSection}>
          <div className={styles.metaRow}>
            <span>Date:</span>
            <span>{dateStr}</span>
          </div>
          <div className={styles.metaRow}>
            <span>Time:</span>
            <span>{timestamp}</span>
          </div>
          <div className={styles.metaRow}>
            <span>Table:</span>
            <span>{table}</span>
          </div>
          <div className={styles.metaRow}>
            <span>Customer:</span>
            <span>{customer}</span>
          </div>
          {paymentMethod && (
            <div className={styles.metaRow}>
              <span>Method:</span>
              <span>{paymentMethod}</span>
            </div>
          )}
          {customerEmail && (
            <div className={styles.metaRow}>
              <span>Email:</span>
              <span className={styles.customerEmail}>{customerEmail}</span>
            </div>
          )}
        </div>

        <div className={styles.receiptDivider} />

        {/* Receipt Items */}
        <div className={styles.itemsSection}>
          <div className={styles.itemHeaderRow}>
            <span className={styles.hdrName}>ITEM</span>
            <span className={styles.hdrQty}>QTY</span>
            <span className={styles.hdrPrice}>PRICE</span>
            <span className={styles.hdrTotal}>TOTAL</span>
          </div>
          
          <div className={styles.itemsList}>
            {items.length === 0 ? (
              <div className={styles.emptyItems}>No items on this ticket</div>
            ) : (
              items.map((item, idx) => (
                <div key={idx} className={styles.itemRow}>
                  <span className={styles.itemName}>{item.name}</span>
                  <span className={styles.itemQty}>x{item.quantity}</span>
                  <span className={styles.itemPrice}>${(item.price || 0).toFixed(2)}</span>
                  <span className={styles.itemTotal}>${(item.line_total || 0).toFixed(2)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={styles.receiptDivider} />

        {/* Receipt Summary */}
        <div className={styles.summarySection}>
          <div className={styles.summaryRow}>
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Tax (5.0%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className={styles.receiptDivider} style={{ margin: '8px 0' }} />
          <div className={`${styles.summaryRow} ${styles.grandTotalRow}`}>
            <span>GRAND TOTAL</span>
            <span>${grandTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Receipt Footer Message */}
        <div className={styles.receiptFooter}>
          <p>Thank you for dining with us!</p>
          <p className={styles.footerGlow}>★ OAK & BEAN COFFEE CO ★</p>
        </div>
      </div>

      {/* Control Buttons (Hidden on Print) */}
      <div className={styles.controlPanel}>
        <button className={styles.printBtn} onClick={handlePrint}>
          🖨️ Print Receipt
        </button>
        <button className={styles.closeBtn} onClick={() => { if (typeof window !== "undefined") window.close(); }}>
          ✕ Close Window
        </button>
      </div>
    </div>
  );
}
