import { useState } from "react";

interface CheckoutOverlayProps {
  tableNumber: number;
  subtotal: number;
  onClose: () => void;
  onConfirm: () => void;
}

type PaymentTab = "cash" | "card" | "upi";

const TAX_RATE = 0.08;
const PROMO_LABEL = "Happy Hour –10%";
const PROMO_RATE = 0.1;

function QRCodeSVG() {
  const size = 200;
  const modules = 25;
  const cellSize = size / modules;

  // deterministic pattern for a realistic-looking QR
  const pattern: boolean[][] = Array.from({ length: modules }, (_, r) =>
    Array.from({ length: modules }, (_, c) => {
      // finder patterns corners
      const inFinder =
        (r < 7 && c < 7) || (r < 7 && c >= modules - 7) || (r >= modules - 7 && c < 7);
      if (inFinder) {
        const dr = r < 7 ? r : r - (modules - 7);
        const dc = c < 7 ? c : c >= modules - 7 ? c - (modules - 7) : c;
        const inOuter = dr === 0 || dr === 6 || dc === 0 || dc === 6;
        const inInner = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;
        return inOuter || inInner;
      }
      // timing patterns
      if (r === 6 || c === 6) return (r + c) % 2 === 0;
      // data area pseudo-random
      return ((r * 17 + c * 13 + r * c * 7) % 3) !== 0;
    })
  );

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block" }}>
      <rect width={size} height={size} fill="white" />
      {pattern.map((row, r) =>
        row.map((on, c) =>
          on ? (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize}
              height={cellSize}
              fill="#1a1a1a"
            />
          ) : null
        )
      )}
    </svg>
  );
}

export function CheckoutOverlay({ tableNumber, subtotal, onClose, onConfirm }: CheckoutOverlayProps) {
  const [activeTab, setActiveTab] = useState<PaymentTab>("upi");
  const [txRef, setTxRef] = useState("");
  const [cashGiven, setCashGiven] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const promo = subtotal * PROMO_RATE;
  const afterPromo = subtotal - promo;
  const tax = afterPromo * TAX_RATE;
  const total = afterPromo + tax;
  const cashChange = parseFloat(cashGiven) - total;

  const handleConfirm = () => {
    setConfirmed(true);
    setTimeout(() => {
      onConfirm();
    }, 1400);
  };

  const tabs: { id: PaymentTab; label: string }[] = [
    { id: "cash", label: "Cash" },
    { id: "card", label: "Card" },
    { id: "upi", label: "UPI QR" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex"
      style={{ background: "rgba(44,26,17,0.45)", backdropFilter: "blur(3px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Slide-over panel */}
      <div
        className="ml-auto flex h-full"
        style={{
          width: "820px",
          background: "#FDFBF7",
          boxShadow: "-24px 0 80px rgba(44,26,17,0.18)",
          fontFamily: "'DM Sans', sans-serif",
          animation: "slideIn 0.28s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <style>{`@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>

        {/* Left: order summary */}
        <div
          className="flex flex-col h-full"
          style={{ width: "340px", borderRight: "1px solid rgba(44,26,17,0.1)", padding: "40px 32px" }}
        >
          <div className="mb-8">
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#C4622D", marginBottom: "6px" }}>
              Table {tableNumber}
            </p>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "28px", color: "#2C1A11", lineHeight: 1.15 }}>
              Order Summary
            </h2>
          </div>

          <div className="flex flex-col gap-4 flex-1">
            <Row label="Subtotal" value={`$${subtotal.toFixed(2)}`} />

            <div className="flex items-center justify-between py-2 px-3 rounded-xl" style={{ background: "#F0F7E8", border: "1px solid rgba(122,140,92,0.25)" }}>
              <div>
                <p style={{ fontSize: "12px", color: "#7A8C5C", fontWeight: 600 }}>🎉 {PROMO_LABEL}</p>
                <p style={{ fontSize: "11px", color: "#7A8C5C", fontFamily: "'DM Mono', monospace" }}>Auto-applied</p>
              </div>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "14px", color: "#7A8C5C", fontWeight: 600 }}>
                −${promo.toFixed(2)}
              </span>
            </div>

            <Row label="After Promo" value={`$${afterPromo.toFixed(2)}`} muted />
            <Row label="Tax (8%)" value={`$${tax.toFixed(2)}`} muted />

            <div style={{ borderTop: "1.5px solid rgba(44,26,17,0.12)", paddingTop: "20px", marginTop: "8px" }}>
              <p style={{ fontSize: "12px", color: "#7A5C48", marginBottom: "4px", fontFamily: "'DM Mono', monospace", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                Total Due
              </p>
              <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: "52px", color: "#2C1A11", lineHeight: 1, letterSpacing: "-0.01em" }}>
                ${total.toFixed(2)}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="mt-6 py-3 rounded-2xl transition-all"
            style={{ background: "#EDE5DB", border: "none", cursor: "pointer", color: "#7A5C48", fontSize: "14px", fontWeight: 500 }}
          >
            ← Back to Order
          </button>
        </div>

        {/* Right: payment */}
        <div className="flex flex-col h-full flex-1" style={{ padding: "40px 32px" }}>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "28px", color: "#2C1A11", marginBottom: "28px", lineHeight: 1.15 }}>
            Payment Method
          </h2>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 p-1 rounded-2xl" style={{ background: "#EDE5DB" }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex-1 py-2.5 rounded-xl transition-all duration-150"
                style={{
                  background: activeTab === tab.id ? "#2C1A11" : "transparent",
                  color: activeTab === tab.id ? "#FDFBF7" : "#7A5C48",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: 600,
                  letterSpacing: "0.02em",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* UPI QR tab */}
          {activeTab === "upi" && (
            <div className="flex flex-col items-center flex-1">
              <p style={{ fontSize: "13px", color: "#7A5C48", marginBottom: "20px", textAlign: "center" }}>
                Scan with any UPI app to pay
              </p>
              <div
                className="rounded-2xl p-4 mb-6"
                style={{ background: "#fff", boxShadow: "0 4px 24px rgba(44,26,17,0.12)", border: "1px solid rgba(44,26,17,0.08)" }}
              >
                <QRCodeSVG />
                <p style={{ textAlign: "center", fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "#7A5C48", marginTop: "10px" }}>
                  cafe@groundsandgrace
                </p>
              </div>

              <div className="w-full mb-4">
                <label style={{ fontSize: "11px", color: "#7A5C48", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace", display: "block", marginBottom: "8px" }}>
                  Transaction Reference
                </label>
                <input
                  type="text"
                  value={txRef}
                  onChange={(e) => setTxRef(e.target.value)}
                  placeholder="UPI Ref / UTR number"
                  className="w-full outline-none rounded-xl px-4 py-3"
                  style={{ background: "#EDE5DB", border: "none", fontSize: "14px", color: "#2C1A11", fontFamily: "'DM Mono', monospace" }}
                />
              </div>
            </div>
          )}

          {/* Cash tab */}
          {activeTab === "cash" && (
            <div className="flex flex-col flex-1 gap-4">
              <div>
                <label style={{ fontSize: "11px", color: "#7A5C48", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace", display: "block", marginBottom: "8px" }}>
                  Amount Given
                </label>
                <input
                  type="number"
                  value={cashGiven}
                  onChange={(e) => setCashGiven(e.target.value)}
                  placeholder="0.00"
                  className="w-full outline-none rounded-xl px-4 py-3"
                  style={{ background: "#EDE5DB", border: "none", fontSize: "22px", color: "#2C1A11", fontFamily: "'DM Mono', monospace" }}
                />
              </div>
              {cashGiven && parseFloat(cashGiven) >= total && (
                <div className="rounded-xl p-4" style={{ background: "#F0F7E8" }}>
                  <p style={{ fontSize: "12px", color: "#7A8C5C", fontFamily: "'DM Mono', monospace" }}>Change Due</p>
                  <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: "36px", color: "#4A7C3F" }}>${cashChange.toFixed(2)}</p>
                </div>
              )}
            </div>
          )}

          {/* Card tab */}
          {activeTab === "card" && (
            <div className="flex flex-col flex-1 items-center justify-center gap-4">
              <div
                className="w-full rounded-2xl flex flex-col items-center justify-center gap-3 py-12"
                style={{ background: "#EDE5DB", border: "2px dashed rgba(44,26,17,0.15)" }}
              >
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <rect x="4" y="10" width="40" height="28" rx="4" stroke="#2C1A11" strokeWidth="2" fill="none" />
                  <rect x="4" y="18" width="40" height="6" fill="#2C1A11" opacity="0.15" />
                  <rect x="10" y="28" width="10" height="4" rx="1" fill="#C4622D" />
                </svg>
                <p style={{ fontSize: "14px", color: "#7A5C48", fontWeight: 500 }}>Present card to terminal</p>
                <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "12px", color: "#C4A08A" }}>Tap · Chip · Swipe</p>
              </div>
            </div>
          )}

          {/* Confirm button */}
          <button
            onClick={handleConfirm}
            className="w-full py-4 rounded-2xl mt-auto transition-all duration-200"
            style={{
              background: confirmed ? "#4A7C3F" : "#3D7A4A",
              color: "#FDFBF7",
              fontSize: "15px",
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              letterSpacing: "0.04em",
              boxShadow: "0 4px 20px rgba(61,122,74,0.3)",
            }}
          >
            {confirmed ? "✓ Payment Confirmed!" : "Confirm Payment"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span style={{ fontSize: "14px", color: muted ? "#C4A08A" : "#7A5C48" }}>{label}</span>
      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "14px", color: muted ? "#C4A08A" : "#2C1A11" }}>{value}</span>
    </div>
  );
}
