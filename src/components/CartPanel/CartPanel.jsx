"use client";

import React from "react";
import styles from "./CartPanel.module.css";

export default function CartPanel({
  cart,
  onUpdateQuantity,
  onClearCart,
  selectedTable,
  customerName,
  totals,
  onSendToKitchen
}) {
  const { subtotal, tax, grandTotal } = totals;
  const isEmpty = cart.length === 0;

  const handleCheckout = (status) => {
    if (isEmpty) return;

    let email = "";
    if (status === "Paid") {
      email = prompt("Enter customer email to send the receipt:");
      if (email === null) return; // user cancelled payment
    }
    
    // Format cart details for a professional alert layout
    const cartSummary = cart.map(item => ({
      product_id: item.product.id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      line_total: Number((item.quantity * item.product.price).toFixed(2))
    }));

    const receiptPayload = {
      id: `#${Math.floor(1000 + Math.random() * 9000)}`, // Generate visual ticket number
      table: selectedTable,
      customer: customerName,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      cart: cartSummary,
      status: status, // "Draft" or "Paid"
      customerEmail: email,
      summary: {
        subtotal: Number(subtotal.toFixed(2)),
        tax: Number(tax.toFixed(2)),
        grandTotal: Number(grandTotal.toFixed(2))
      }
    };

    // Prompt specifies: alert(JSON.stringify(currentCart, null, 2))
    alert(JSON.stringify(receiptPayload, null, 2));
    
    if (status === "Paid" && email) {
      alert(`Receipt successfully sent to customer's email: ${email}`);
    }
    
    // Track order in history & reset active cart
    if (onSendToKitchen) {
      onSendToKitchen(receiptPayload);
    }
  };

  return (
    <div className={`${styles.cartContainer} glassmorphic`}>
      {/* Cart Header */}
      <div className={styles.cartHeader}>
        <div className={styles.headerTitle}>
          <h2 className={styles.neonTextPink}>CURRENT ORDER</h2>
          <span className={styles.orderBadge}>Active</span>
        </div>
        {!isEmpty && (
          <button className={styles.clearBtn} onClick={onClearCart} title="Clear all items">
            <svg className={styles.clearIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      {/* Ticket Details Info */}
      <div className={styles.ticketDetails}>
        <div className={styles.ticketRow}>
          <span className={styles.ticketLabel}>Table:</span>
          <span className={styles.ticketValue}>{selectedTable}</span>
        </div>
        <div className={styles.ticketRow}>
          <span className={styles.ticketLabel}>Customer:</span>
          <span className={styles.ticketValue}>{customerName}</span>
        </div>
      </div>

      {/* Cart Items List */}
      <div className={styles.itemsContainer}>
        {isEmpty ? (
          <div className={styles.emptyCart}>
            <div className={styles.emptyGlowCircle}>
              <svg className={styles.emptyCartIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className={styles.emptyText}>YOUR TICKET IS EMPTY</h3>
            <p className={styles.emptySubtext}>Tap menu items to add them here.</p>
          </div>
        ) : (
          <div className={styles.itemsList}>
            {cart.map((item) => (
              <div key={item.product.id} className={styles.cartItem}>
                <div className={styles.itemMeta}>
                  <span className={styles.itemName}>{item.product.name}</span>
                  <span className={styles.itemUnitPrice}>${item.product.price.toFixed(2)} ea</span>
                </div>
                
                {/* Quantity Controls & Line Total */}
                <div className={styles.itemActions}>
                  <div className={styles.quantityControls}>
                    <button
                      className={styles.qtyBtn}
                      onClick={() => onUpdateQuantity(item.product.id, -1)}
                      title="Decrease Quantity"
                    >
                      &minus;
                    </button>
                    <span className={styles.qtyValue}>{item.quantity}</span>
                    <button
                      className={styles.qtyBtn}
                      onClick={() => onUpdateQuantity(item.product.id, 1)}
                      title="Increase Quantity"
                    >
                      +
                    </button>
                  </div>
                  <div className={styles.lineTotal}>
                    ${(item.quantity * item.product.price).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Summary Calculations */}
      <div className={styles.summaryContainer}>
        <div className={styles.summaryRow}>
          <span>Subtotal</span>
          <span className={styles.numericValue}>${subtotal.toFixed(2)}</span>
        </div>
        <div className={styles.summaryRow}>
          <span>Tax (5.0%)</span>
          <span className={styles.numericValue}>${tax.toFixed(2)}</span>
        </div>
        <div className={styles.divider} />
        <div className={`${styles.summaryRow} ${styles.grandTotalRow}`}>
          <span>GRAND TOTAL</span>
          <span className={`${styles.numericValue} ${styles.neonTextCyan}`}>
            ${grandTotal.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className={styles.actionContainer}>
        <button
          className={`${styles.draftBtn} ${isEmpty ? styles.disabledBtn : ""}`}
          onClick={() => handleCheckout("Draft")}
          disabled={isEmpty}
        >
          SAVE DRAFT
        </button>
        <button
          className={`${styles.kitchenBtn} ${isEmpty ? styles.disabledBtn : ""}`}
          onClick={() => handleCheckout("Paid")}
          disabled={isEmpty}
        >
          <span className={styles.btnText}>PAY & EMAIL</span>
          <svg className={styles.btnArrow} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </div>
  );
}
