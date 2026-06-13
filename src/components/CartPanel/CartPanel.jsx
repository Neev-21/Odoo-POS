"use client";

import React, { useState } from "react";
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

  // Checkout Payment Dialog State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [email, setEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI"); // UPI | Card | Cash
  const [checkoutStep, setCheckoutStep] = useState("method"); // "method" | "upi_qr" | "success_review"
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");

  const handleCheckout = (status) => {
    if (isEmpty) return;

    if (status === "Paid") {
      setCheckoutStep("method");
      setRating(5);
      setReviewText("");
      setShowPaymentModal(true);
      return;
    }

    // Save as Draft directly
    const cartSummary = cart.map(item => ({
      product_id: item.product.id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      line_total: Number((item.quantity * item.product.price).toFixed(2))
    }));

    const ticketId = `#${Math.floor(1000 + Math.random() * 9000)}`;
    const receiptPayload = {
      id: ticketId,
      table: selectedTable,
      customer: customerName,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      cart: cartSummary,
      status: "Draft",
      paymentMethod: "",
      customerEmail: "",
      rating: 0,
      reviewText: "",
      summary: {
        subtotal: Number(subtotal.toFixed(2)),
        tax: Number(tax.toFixed(2)),
        grandTotal: Number(grandTotal.toFixed(2))
      }
    };

    // Track order in history & reset active cart
    if (onSendToKitchen) {
      onSendToKitchen(receiptPayload);
    }
    alert(`✅ Draft ticket ${ticketId} saved successfully!`);
  };

  const handlePaymentComplete = () => {
    // Email is optional for Cash; required for UPI/Card to send receipt
    if (email && !email.includes("@")) {
      alert("Please enter a valid email address or leave it blank.");
      return;
    }

    const cartSummary = cart.map(item => ({
      product_id: item.product.id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      line_total: Number((item.quantity * item.product.price).toFixed(2))
    }));

    const ticketId = `#${Math.floor(1000 + Math.random() * 9000)}`;
    const receiptPayload = {
      id: ticketId,
      table: selectedTable,
      customer: customerName,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      cart: cartSummary,
      status: "Paid",
      paymentMethod: paymentMethod, // "UPI" | "Card" | "Cash"
      customerEmail: email || "",
      rating: rating,
      reviewText: reviewText,
      summary: {
        subtotal: Number(subtotal.toFixed(2)),
        tax: Number(tax.toFixed(2)),
        grandTotal: Number(grandTotal.toFixed(2))
      }
    };

    // Track order in history & reset active cart
    if (onSendToKitchen) {
      onSendToKitchen(receiptPayload);
    }

    // Reset checkout states
    setShowPaymentModal(false);
    setEmail("");
    setPaymentMethod("UPI");
    setRating(5);
    setReviewText("");

    const emailMsg = email ? ` Receipt emailed to ${email}.` : "";
    alert(`✅ Payment of $${receiptPayload.summary.grandTotal.toFixed(2)} confirmed via ${paymentMethod}. Ticket ${ticketId} saved.${emailMsg}`);
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
          className={`${styles.openBillBtn} ${isEmpty ? styles.disabledBtn : ""}`}
          onClick={() => {
            if (!isEmpty) {
              window.open('/bill?cart=true', '_blank');
            }
          }}
          disabled={isEmpty}
          title="Open bill in another window"
        >
          📂 OPEN BILL
        </button>
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

      {/* Beautiful in-app Payment Overlay */}
      {showPaymentModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.paymentModal}>
            {checkoutStep === "method" && (
              <>
                <h3 className={styles.modalTitle}>Checkout Payment</h3>
                
                <div className={styles.modalSection}>
                  <label className={styles.inputLabel}>Customer Email <span style={{opacity:0.6, fontSize:'0.8em'}}>(optional — for receipt)</span></label>
                  <input
                    type="email"
                    placeholder="customer@email.com (leave blank for no receipt)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={styles.modalInput}
                    autoFocus
                  />
                </div>
                
                <div className={styles.modalSection}>
                  <label className={styles.inputLabel}>Select Method</label>
                  <div className={styles.paymentGrid}>
                    {["UPI", "Card", "Cash"].map((method) => (
                      <button
                        key={method}
                        type="button"
                        className={`${styles.paymentBtn} ${paymentMethod === method ? styles.activePaymentBtn : ""}`}
                        onClick={() => setPaymentMethod(method)}
                      >
                        <span className={styles.paymentIcon}>
                          {method === "UPI" && "📱"}
                          {method === "Card" && "💳"}
                          {method === "Cash" && "💵"}
                        </span>
                        {method}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.totalsSummary}>
                  <div className={styles.totalRow}>
                    <span>Amount Due:</span>
                    <span className={styles.totalVal}>${grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className={styles.modalActions}>
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={() => {
                      setShowPaymentModal(false);
                      setEmail("");
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className={styles.confirmBtn}
                    onClick={() => {
                      if (paymentMethod === "UPI") {
                        setCheckoutStep("upi_qr");
                      } else {
                        setCheckoutStep("success_review");
                      }
                    }}
                  >
                    Proceed to Pay →
                  </button>
                </div>
              </>
            )}

            {checkoutStep === "upi_qr" && (
              <>
                <h3 className={styles.modalTitle}>📱 Scan UPI QR Code</h3>
                <div className={styles.qrCodeSection}>
                  <div className={styles.qrWrapper}>
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=upi://pay?pa=oakandbean@okaxis%26pn=Oak%2520and%2520Bean%26am=${grandTotal.toFixed(2)}%26cu=USD`} 
                      alt="UPI Payment QR Code" 
                      className={styles.qrImage}
                    />
                    <div className={styles.scannerLine}></div>
                  </div>
                  <p className={styles.qrText}>Scan using any UPI App (GPay, PhonePe, Paytm)</p>
                </div>

                <div className={styles.totalsSummary}>
                  <div className={styles.totalRow}>
                    <span>UPI Total:</span>
                    <span className={styles.totalVal}>${grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className={styles.modalActions}>
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={() => setCheckoutStep("method")}
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    className={styles.confirmBtn}
                    onClick={() => setCheckoutStep("success_review")}
                  >
                    Confirm Payment
                  </button>
                </div>
              </>
            )}

            {checkoutStep === "success_review" && (
              <>
                <div className={styles.successHeader}>
                  <div className={styles.successCheckmark}>
                    <svg viewBox="0 0 52 52" className={styles.checkmarkSvg}>
                      <circle cx="26" cy="26" r="25" fill="none" className={styles.checkmarkCircle}/>
                      <path d="M14.1 27.2l7.1 7.2 16.7-16.8" fill="none" className={styles.checkmarkCheck}/>
                    </svg>
                  </div>
                  <h3 className={styles.successTitle}>Payment Done!</h3>
                  <p className={styles.successSub}>Thank you, ticket will be sent to the kitchen.</p>
                </div>

                <div className={styles.reviewSection}>
                  <h4 className={styles.reviewTitle}>Rate your diner experience:</h4>
                  <div className={styles.starsRow}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`${styles.starBtn} ${rating >= star ? styles.starFilled : styles.starEmpty}`}
                        onClick={() => setRating(star)}
                      >
                        ★
                      </button>
                    ))}
                  </div>

                  <textarea
                    placeholder="Write a review (optional)..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className={styles.reviewInput}
                    rows="3"
                  />
                </div>

                <div className={styles.modalActions}>
                  <button
                    type="button"
                    className={styles.confirmBtn}
                    style={{ width: "100%" }}
                    onClick={handlePaymentComplete}
                  >
                    Submit Review & Save
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
