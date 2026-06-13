import { useState } from "react";

type OrderStatus = "Draft" | "Paid" | "Cancelled";

interface LedgerItem {
  name: string;
  qty: number;
  price: number;
}

interface LedgerOrder {
  id: string;
  customer: string;
  date: string;
  amount: number;
  status: OrderStatus;
  table: number;
  items: LedgerItem[];
  paymentMethod?: string;
}

const ORDERS: LedgerOrder[] = [
  {
    id: "ORD-041",
    customer: "Maya Patel",
    date: "Today, 11:42 AM",
    amount: 34.5,
    status: "Draft",
    table: 4,
    items: [
      { name: "Flat White", qty: 2, price: 5.5 },
      { name: "Avocado Toast", qty: 1, price: 12.0 },
      { name: "Granola Bowl", qty: 1, price: 9.5 },
    ],
  },
  {
    id: "ORD-038",
    customer: "James Okafor",
    date: "Today, 11:15 AM",
    amount: 18.0,
    status: "Draft",
    table: 7,
    items: [
      { name: "Oat Latte", qty: 1, price: 6.0 },
      { name: "Croissant", qty: 2, price: 4.0 },
      { name: "Earl Grey", qty: 1, price: 4.0 },
    ],
  },
  {
    id: "ORD-036",
    customer: "Sara Kim",
    date: "Today, 10:58 AM",
    amount: 22.0,
    status: "Paid",
    table: 2,
    paymentMethod: "UPI QR",
    items: [
      { name: "Cortado", qty: 2, price: 4.5 },
      { name: "Almond Croissant", qty: 1, price: 5.0 },
      { name: "Cold Brew", qty: 1, price: 6.5 },
    ],
  },
  {
    id: "ORD-033",
    customer: "Luca Ferrari",
    date: "Today, 10:30 AM",
    amount: 42.5,
    status: "Paid",
    table: 9,
    paymentMethod: "Card",
    items: [
      { name: "Cold Brew", qty: 3, price: 6.5 },
      { name: "Matcha Latte", qty: 1, price: 6.0 },
      { name: "Granola Bowl", qty: 2, price: 9.5 },
    ],
  },
  {
    id: "ORD-029",
    customer: "Nina Torres",
    date: "Today, 09:55 AM",
    amount: 15.0,
    status: "Paid",
    table: 1,
    paymentMethod: "Cash",
    items: [
      { name: "Espresso", qty: 2, price: 3.5 },
      { name: "Croissant", qty: 1, price: 4.0 },
      { name: "Flat White", qty: 1, price: 5.5 },
    ],
  },
  {
    id: "ORD-025",
    customer: "Tom Nguyen",
    date: "Today, 09:20 AM",
    amount: 8.5,
    status: "Cancelled",
    table: 6,
    items: [
      { name: "Oat Latte", qty: 1, price: 6.0 },
      { name: "Croissant", qty: 1, price: 4.0 },
    ],
  },
  {
    id: "ORD-021",
    customer: "Priya Shah",
    date: "Today, 09:01 AM",
    amount: 27.0,
    status: "Paid",
    table: 3,
    paymentMethod: "Card",
    items: [
      { name: "Matcha Latte", qty: 2, price: 6.0 },
      { name: "Avocado Toast", qty: 1, price: 12.0 },
      { name: "Earl Grey", qty: 1, price: 4.0 },
    ],
  },
];

const STATUS_STYLES: Record<OrderStatus, { bg: string; color: string }> = {
  Draft: { bg: "#F0E8DF", color: "#C4622D" },
  Paid: { bg: "#F0F7E8", color: "#4A7C3F" },
  Cancelled: { bg: "#F5F5F5", color: "#9A9A9A" },
};

interface OrdersLedgerProps {
  onBack: () => void;
}

export function OrdersLedger({ onBack }: OrdersLedgerProps) {
  const [orders, setOrders] = useState<LedgerOrder[]>(ORDERS);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<LedgerOrder>(ORDERS[0]);
  const [emailSent, setEmailSent] = useState(false);

  const filtered = orders.filter(
    (o) =>
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: string) => {
    const next = orders.filter((o) => o.id !== id);
    setOrders(next);
    setSelected(next[0]);
  };

  const handleEmailReceipt = () => {
    setEmailSent(true);
    setTimeout(() => setEmailSent(false), 2500);
  };

  const subtotal = selected.items.reduce((s, i) => s + i.price * i.qty, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  return (
    <div
      className="flex flex-col h-screen w-full overflow-hidden"
      style={{ background: "#FDFBF7", fontFamily: "'DM Sans', sans-serif", color: "#2C1A11" }}
    >
      {/* Top bar */}
      <div
        className="flex items-center gap-4 px-6 py-4"
        style={{ borderBottom: "1px solid rgba(44,26,17,0.1)", background: "#FDFBF7" }}
      >
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl transition-all"
          style={{ background: "#EDE5DB", border: "none", cursor: "pointer", color: "#7A5C48", fontSize: "13px", fontWeight: 500 }}
        >
          ← POS
        </button>
        <div>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#C4622D" }}>
            Session Ledger
          </p>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "22px", color: "#2C1A11", lineHeight: 1.2 }}>
            Orders & Customers
          </h1>
        </div>
        <div className="ml-auto flex gap-4" style={{ fontFamily: "'DM Mono', monospace", fontSize: "12px", color: "#7A5C48" }}>
          <span><b style={{ color: "#C4622D" }}>{orders.filter((o) => o.status === "Draft").length}</b> Draft</span>
          <span><b style={{ color: "#4A7C3F" }}>{orders.filter((o) => o.status === "Paid").length}</b> Paid</span>
          <span><b style={{ color: "#9A9A9A" }}>{orders.filter((o) => o.status === "Cancelled").length}</b> Cancelled</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left pane: order list */}
        <div
          className="flex flex-col h-full overflow-hidden"
          style={{ width: "380px", borderRight: "1px solid rgba(44,26,17,0.08)", background: "#FAF7F2" }}
        >
          {/* Search */}
          <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(44,26,17,0.08)" }}>
            <div
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
              style={{ background: "#EDE5DB" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7A5C48" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search orders or customers…"
                className="flex-1 outline-none bg-transparent"
                style={{ fontSize: "13px", color: "#2C1A11" }}
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
            {filtered.map((order) => {
              const isActive = order.id === selected.id;
              return (
                <button
                  key={order.id}
                  onClick={() => { setSelected(order); setEmailSent(false); }}
                  className="w-full text-left px-4 py-4 transition-all"
                  style={{
                    background: isActive ? "#EDE5DB" : "transparent",
                    borderBottom: "1px solid rgba(44,26,17,0.06)",
                    borderLeft: isActive ? "3px solid #C4622D" : "3px solid transparent",
                    cursor: "pointer",
                    border: "none",
                    borderBottom: "1px solid rgba(44,26,17,0.06)",
                    borderLeft: isActive ? "3px solid #C4622D" : "3px solid transparent",
                  }}
                >
                  <div className="flex items-start justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "13px", fontWeight: 600, color: "#2C1A11" }}>
                        {order.id}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded-full"
                        style={{ ...STATUS_STYLES[order.status], fontSize: "10px", fontWeight: 600, fontFamily: "'DM Mono', monospace" }}
                      >
                        {order.status}
                      </span>
                    </div>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "13px", color: "#2C1A11", fontWeight: 600 }}>
                      ${order.amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ fontSize: "13px", color: "#2C1A11", fontWeight: 500 }}>{order.customer}</span>
                    <span style={{ fontSize: "11px", color: "#C4A08A", fontFamily: "'DM Mono', monospace" }}>{order.date}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right pane: order detail */}
        <div className="flex flex-col flex-1 h-full overflow-hidden">
          {/* Detail header */}
          <div className="px-8 py-5" style={{ borderBottom: "1px solid rgba(44,26,17,0.08)" }}>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "26px", color: "#2C1A11", lineHeight: 1 }}>
                    {selected.id}
                  </h2>
                  <span
                    className="px-3 py-1 rounded-full"
                    style={{ ...STATUS_STYLES[selected.status], fontSize: "11px", fontWeight: 700, fontFamily: "'DM Mono', monospace" }}
                  >
                    {selected.status}
                  </span>
                </div>
                <p style={{ fontSize: "14px", color: "#7A5C48" }}>
                  {selected.customer} · Table {selected.table} · {selected.date}
                </p>
              </div>
              {selected.paymentMethod && (
                <div className="text-right">
                  <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", color: "#C4A08A", textTransform: "uppercase", letterSpacing: "0.1em" }}>Paid via</p>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: "#2C1A11" }}>{selected.paymentMethod}</p>
                </div>
              )}
            </div>
          </div>

          {/* Itemized receipt */}
          <div className="flex-1 overflow-y-auto px-8 py-6">
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", color: "#C4A08A", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "16px" }}>
              Itemized Receipt
            </p>

            {/* Header row */}
            <div className="flex items-center px-3 mb-2" style={{ paddingBottom: "8px", borderBottom: "1px solid rgba(44,26,17,0.08)" }}>
              <span className="flex-1" style={{ fontSize: "11px", color: "#C4A08A", fontFamily: "'DM Mono', monospace", textTransform: "uppercase" }}>Item</span>
              <span style={{ fontSize: "11px", color: "#C4A08A", fontFamily: "'DM Mono', monospace", textTransform: "uppercase", width: "48px", textAlign: "center" }}>Qty</span>
              <span style={{ fontSize: "11px", color: "#C4A08A", fontFamily: "'DM Mono', monospace", textTransform: "uppercase", width: "72px", textAlign: "right" }}>Total</span>
            </div>

            {selected.items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center px-3 py-3 rounded-xl mb-1"
                style={{ background: idx % 2 === 0 ? "transparent" : "rgba(44,26,17,0.02)" }}
              >
                <span className="flex-1" style={{ fontSize: "14px", color: "#2C1A11", fontWeight: 500 }}>{item.name}</span>
                <span style={{ width: "48px", textAlign: "center", fontFamily: "'DM Mono', monospace", fontSize: "13px", color: "#7A5C48" }}>×{item.qty}</span>
                <span style={{ width: "72px", textAlign: "right", fontFamily: "'DM Mono', monospace", fontSize: "13px", color: "#2C1A11" }}>
                  ${(item.price * item.qty).toFixed(2)}
                </span>
              </div>
            ))}

            {/* Totals */}
            <div className="mt-4 pt-4" style={{ borderTop: "1px solid rgba(44,26,17,0.1)" }}>
              <div className="flex justify-between px-3 mb-1.5">
                <span style={{ fontSize: "13px", color: "#7A5C48" }}>Subtotal</span>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "13px", color: "#2C1A11" }}>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between px-3 mb-3">
                <span style={{ fontSize: "13px", color: "#7A5C48" }}>Tax (8%)</span>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "13px", color: "#2C1A11" }}>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between px-3 py-3 rounded-2xl" style={{ background: "#EDE5DB" }}>
                <span style={{ fontSize: "16px", fontWeight: 700, color: "#2C1A11" }}>Total</span>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "16px", fontWeight: 700, color: "#C4622D" }}>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="px-8 py-5" style={{ borderTop: "1px solid rgba(44,26,17,0.08)" }}>
            {selected.status === "Draft" && (
              <div className="flex gap-3">
                <button
                  className="flex-1 py-3.5 rounded-2xl transition-all"
                  style={{ background: "#2C1A11", color: "#FDFBF7", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: 600 }}
                >
                  Edit Order
                </button>
                <button
                  onClick={() => handleDelete(selected.id)}
                  className="px-6 py-3.5 rounded-2xl transition-all"
                  style={{ background: "#F5E8E8", color: "#C0392B", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: 600 }}
                >
                  Delete
                </button>
              </div>
            )}
            {selected.status === "Paid" && (
              <button
                onClick={handleEmailReceipt}
                className="w-full py-3.5 rounded-2xl transition-all"
                style={{
                  background: emailSent ? "#4A7C3F" : "#EDE5DB",
                  color: emailSent ? "#fff" : "#2C1A11",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                {emailSent ? "✓ Receipt Sent!" : `✉ Email Receipt to ${selected.customer}`}
              </button>
            )}
            {selected.status === "Cancelled" && (
              <p style={{ textAlign: "center", color: "#C4A08A", fontSize: "13px", fontFamily: "'DM Mono', monospace" }}>
                This order was cancelled
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
