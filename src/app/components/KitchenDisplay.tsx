import { useState, useEffect } from "react";

interface OrderItem {
  id: number;
  name: string;
  qty: number;
  done: boolean;
  notes?: string;
}

interface KDSOrder {
  id: string;
  table: number;
  startedAt: number; // ms timestamp
  items: OrderItem[];
  status: "to-cook" | "preparing" | "completed";
}

const INITIAL_ORDERS: KDSOrder[] = [
  {
    id: "ORD-041",
    table: 4,
    startedAt: Date.now() - 3 * 60 * 1000,
    status: "to-cook",
    items: [
      { id: 1, name: "Flat White", qty: 2, done: true },
      { id: 2, name: "Avocado Toast", qty: 1, done: false },
      { id: 3, name: "Granola Bowl", qty: 1, done: false },
    ],
  },
  {
    id: "ORD-038",
    table: 7,
    startedAt: Date.now() - 7 * 60 * 1000,
    status: "to-cook",
    items: [
      { id: 4, name: "Oat Latte", qty: 1, done: false },
      { id: 5, name: "Croissant", qty: 2, done: false },
      { id: 6, name: "Earl Grey", qty: 1, done: false },
    ],
  },
  {
    id: "ORD-036",
    table: 2,
    startedAt: Date.now() - 11 * 60 * 1000,
    status: "preparing",
    items: [
      { id: 7, name: "Cortado", qty: 2, done: false },
      { id: 8, name: "Almond Croissant", qty: 1, done: false },
    ],
  },
  {
    id: "ORD-033",
    table: 9,
    startedAt: Date.now() - 14 * 60 * 1000,
    status: "preparing",
    items: [
      { id: 9, name: "Cold Brew", qty: 3, done: false },
      { id: 10, name: "Matcha Latte", qty: 1, done: false },
      { id: 11, name: "Granola Bowl", qty: 2, done: false },
    ],
  },
  {
    id: "ORD-029",
    table: 1,
    startedAt: Date.now() - 22 * 60 * 1000,
    status: "completed",
    items: [
      { id: 12, name: "Espresso", qty: 2, done: true },
      { id: 13, name: "Croissant", qty: 1, done: true },
    ],
  },
  {
    id: "ORD-025",
    table: 6,
    startedAt: Date.now() - 35 * 60 * 1000,
    status: "completed",
    items: [
      { id: 14, name: "Flat White", qty: 1, done: true },
      { id: 15, name: "Avocado Toast", qty: 2, done: true },
    ],
  },
];

const CATEGORIES = ["All", "Coffee", "Food", "Cold Drinks"];

function useNow() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

function formatClock(ts: number) {
  return new Date(ts).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
}

function elapsed(startedAt: number, now: number) {
  const s = Math.floor((now - startedAt) / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

function timerColor(startedAt: number, now: number) {
  const mins = (now - startedAt) / 60000;
  if (mins < 5) return { bg: "#1A3D2B", text: "#4ADE80" };
  if (mins < 10) return { bg: "#3D2E0A", text: "#FBB03B" };
  return { bg: "#3D1010", text: "#F87171" };
}

interface TicketProps {
  order: KDSOrder;
  now: number;
  onToggleItem: (orderId: string, itemId: number) => void;
  onAdvance?: (orderId: string) => void;
}

function Ticket({ order, now, onToggleItem, onAdvance }: TicketProps) {
  const tc = timerColor(order.startedAt, now);
  const allDone = order.items.every((i) => i.done);

  return (
    <div
      className="rounded-2xl overflow-hidden mb-4"
      style={{
        background: "#1E2530",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Ticket header */}
      <div className="flex items-center justify-between px-4 py-3" style={{ background: "#161C26", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-3">
          <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: "20px", color: "#F5EFE6", lineHeight: 1 }}>
            #{order.id}
          </span>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "#8A9BB0", background: "#252E3C", padding: "3px 8px", borderRadius: "6px" }}>
            TBL {order.table}
          </span>
        </div>
        <div
          className="flex items-center gap-1.5 px-3 py-1 rounded-full"
          style={{ background: tc.bg }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <circle cx="5" cy="5" r="4" stroke={tc.text} strokeWidth="1.5" />
            <path d="M5 2.5V5L6.5 6.5" stroke={tc.text} strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "12px", color: tc.text, fontWeight: 600 }}>
            {elapsed(order.startedAt, now)}
          </span>
        </div>
      </div>

      {/* Items */}
      <div className="px-4 py-3 flex flex-col gap-2">
        {order.items.map((item) => (
          <button
            key={item.id}
            onClick={() => order.status !== "completed" && onToggleItem(order.id, item.id)}
            className="flex items-center gap-3 text-left w-full rounded-xl px-3 py-2.5 transition-all"
            style={{
              background: item.done ? "rgba(74,222,128,0.06)" : "rgba(255,255,255,0.03)",
              border: item.done ? "1px solid rgba(74,222,128,0.15)" : "1px solid rgba(255,255,255,0.04)",
              cursor: order.status !== "completed" ? "pointer" : "default",
            }}
          >
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: item.done ? "#4ADE80" : "rgba(255,255,255,0.08)", border: item.done ? "none" : "1.5px solid rgba(255,255,255,0.15)" }}
            >
              {item.done && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
            </div>
            <span
              style={{
                flex: 1,
                fontSize: "14px",
                color: item.done ? "#4B5A6A" : "#D4E0EC",
                textDecoration: item.done ? "line-through" : "none",
                fontWeight: 500,
              }}
            >
              {item.name}
            </span>
            <span
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: "13px",
                color: item.done ? "#4B5A6A" : "#8A9BB0",
                background: "rgba(255,255,255,0.05)",
                padding: "2px 8px",
                borderRadius: "6px",
              }}
            >
              ×{item.qty}
            </span>
          </button>
        ))}
      </div>

      {/* Advance button */}
      {onAdvance && order.status !== "completed" && (
        <div className="px-4 pb-4">
          <button
            onClick={() => onAdvance(order.id)}
            className="w-full py-2 rounded-xl transition-all"
            style={{
              background: allDone ? "#C4622D" : "rgba(255,255,255,0.04)",
              color: allDone ? "#fff" : "#4B5A6A",
              border: "none",
              cursor: allDone ? "pointer" : "default",
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              fontFamily: "'DM Mono', monospace",
            }}
          >
            {order.status === "to-cook" ? "→ Move to Preparing" : "→ Mark Completed"}
          </button>
        </div>
      )}
    </div>
  );
}

interface KitchenDisplayProps {
  onBack: () => void;
}

export function KitchenDisplay({ onBack }: KitchenDisplayProps) {
  const now = useNow();
  const [orders, setOrders] = useState<KDSOrder[]>(INITIAL_ORDERS);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const toggleItem = (orderId: string, itemId: number) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, items: o.items.map((i) => (i.id === itemId ? { ...i, done: !i.done } : i)) }
          : o
      )
    );
  };

  const advanceOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status: o.status === "to-cook" ? "preparing" : "completed" }
          : o
      )
    );
  };

  const filter = (o: KDSOrder) => {
    if (search && !o.id.toLowerCase().includes(search.toLowerCase()) && !o.items.some((i) => i.name.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  };

  const toCook = orders.filter((o) => o.status === "to-cook" && filter(o));
  const preparing = orders.filter((o) => o.status === "preparing" && filter(o));
  const completed = orders.filter((o) => o.status === "completed" && filter(o));

  const cols = [
    { key: "to-cook", label: "To Cook", orders: toCook, accent: "#F87171", count: toCook.length },
    { key: "preparing", label: "Preparing", orders: preparing, accent: "#FBB03B", count: preparing.length },
    { key: "completed", label: "Completed", orders: completed, accent: "#4ADE80", count: completed.length },
  ] as const;

  return (
    <div
      className="flex flex-col h-screen w-full overflow-hidden"
      style={{ background: "#111722", fontFamily: "'DM Sans', sans-serif", color: "#D4E0EC" }}
    >
      {/* Top bar */}
      <div
        className="flex items-center gap-4 px-8 py-4"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "#161C26", flexShrink: 0 }}
      >
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl transition-all"
          style={{ background: "rgba(255,255,255,0.06)", border: "none", cursor: "pointer", color: "#8A9BB0", fontSize: "13px" }}
        >
          ← POS
        </button>

        {/* Clock */}
        <div
          className="px-5 py-2 rounded-xl"
          style={{ background: "#1E2530", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "22px", color: "#F5EFE6", letterSpacing: "0.05em" }}>
            {formatClock(now)}
          </span>
        </div>

        <div
          className="flex items-center gap-2 px-4 py-2 rounded-xl flex-1"
          style={{ background: "#1E2530", border: "1px solid rgba(255,255,255,0.06)", maxWidth: "320px" }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4B5A6A" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search orders or items…"
            className="flex-1 outline-none bg-transparent"
            style={{ fontSize: "13px", color: "#D4E0EC" }}
          />
        </div>

        {/* Category filter */}
        <div className="flex gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className="px-4 py-2 rounded-full transition-all"
              style={{
                background: category === cat ? "#C4622D" : "rgba(255,255,255,0.05)",
                color: category === cat ? "#fff" : "#8A9BB0",
                border: "none",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: 500,
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: "#4ADE80" }} />
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "#4ADE80" }}>LIVE</span>
        </div>
      </div>

      {/* Kanban columns */}
      <div className="flex flex-1 gap-0 overflow-hidden">
        {cols.map((col, idx) => (
          <div
            key={col.key}
            className="flex flex-col h-full overflow-hidden"
            style={{
              flex: 1,
              borderRight: idx < 2 ? "1px solid rgba(255,255,255,0.05)" : "none",
            }}
          >
            {/* Column header */}
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: "#161C26" }}
            >
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: col.accent }} />
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#D4E0EC", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace" }}>
                  {col.label}
                </span>
              </div>
              <span
                className="px-2.5 py-0.5 rounded-full"
                style={{ background: "rgba(255,255,255,0.06)", fontFamily: "'DM Mono', monospace", fontSize: "12px", color: col.accent }}
              >
                {col.count}
              </span>
            </div>

            {/* Orders */}
            <div className="flex-1 overflow-y-auto px-4 pt-4" style={{ scrollbarWidth: "none" }}>
              {col.orders.length === 0 && (
                <p style={{ textAlign: "center", color: "#2E3A4A", fontSize: "13px", marginTop: "32px", fontFamily: "'DM Mono', monospace" }}>
                  No orders
                </p>
              )}
              {col.orders.map((order) => (
                <Ticket
                  key={order.id}
                  order={order}
                  now={now}
                  onToggleItem={toggleItem}
                  onAdvance={col.key !== "completed" ? advanceOrder : undefined}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
