import { useState } from "react";

const CATEGORIES = [
  { id: "all", label: "All", color: "#C4622D" },
  { id: "coffee", label: "Coffee", color: "#6B3D2A" },
  { id: "tea", label: "Tea", color: "#7A8C5C" },
  { id: "pastries", label: "Pastries", color: "#C4862D" },
  { id: "brunch", label: "Brunch", color: "#7A5C7A" },
  { id: "cold", label: "Cold Drinks", color: "#3D6B7A" },
];

const PRODUCTS = [
  { id: 1, name: "Flat White", price: 5.5, category: "coffee", img: "https://images.unsplash.com/photo-1622185560353-0368158b915e?w=200&h=120&fit=crop&auto=format" },
  { id: 2, name: "Espresso", price: 3.5, category: "coffee", img: "https://images.unsplash.com/photo-1595832158657-e11177f44eeb?w=200&h=120&fit=crop&auto=format" },
  { id: 3, name: "Oat Latte", price: 6.0, category: "coffee", img: "https://images.unsplash.com/photo-1775050704009-94e3a9cd223d?w=200&h=120&fit=crop&auto=format" },
  { id: 4, name: "Cold Brew", price: 6.5, category: "cold", img: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=200&h=120&fit=crop&auto=format" },
  { id: 5, name: "Matcha Latte", price: 6.0, category: "tea", img: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=200&h=120&fit=crop&auto=format" },
  { id: 6, name: "Croissant", price: 4.0, category: "pastries", img: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=200&h=120&fit=crop&auto=format" },
  { id: 7, name: "Avocado Toast", price: 12.0, category: "brunch", img: "https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?w=200&h=120&fit=crop&auto=format" },
  { id: 8, name: "Cortado", price: 4.5, category: "coffee", img: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200&h=120&fit=crop&auto=format" },
  { id: 9, name: "Almond Croissant", price: 5.0, category: "pastries", img: "https://images.unsplash.com/photo-1572633994880-d1bec03c66c6?w=200&h=120&fit=crop&auto=format" },
  { id: 10, name: "Lemonade", price: 5.0, category: "cold", img: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=200&h=120&fit=crop&auto=format" },
  { id: 11, name: "Earl Grey", price: 4.0, category: "tea", img: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=200&h=120&fit=crop&auto=format" },
  { id: 12, name: "Granola Bowl", price: 9.5, category: "brunch", img: "https://images.unsplash.com/photo-1493770348161-369560ae357d?w=200&h=120&fit=crop&auto=format" },
];

interface CartItem {
  productId: number;
  qty: number;
}

interface Props {
  tableNumber: number;
  onBack: () => void;
  onCheckout?: (subtotal: number) => void;
  onOpenKDS?: () => void;
  onOpenLedger?: () => void;
}

export function OrderScreen({ tableNumber, onBack, onCheckout, onOpenKDS, onOpenLedger }: Props) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const filtered = PRODUCTS.filter((p) => {
    const matchesCat = activeCategory === "all" || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const addToCart = (productId: number) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === productId);
      if (existing) return prev.map((i) => i.productId === productId ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { productId, qty: 1 }];
    });
  };

  const adjustQty = (productId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => i.productId === productId ? { ...i, qty: i.qty + delta } : i)
        .filter((i) => i.qty > 0)
    );
  };

  const subtotal = cart.reduce((sum, item) => {
    const product = PRODUCTS.find((p) => p.id === item.productId);
    return sum + (product?.price ?? 0) * item.qty;
  }, 0);

  const discount = discountCode.toLowerCase() === "cafe10" ? subtotal * 0.1 : 0;
  const total = subtotal - discount;

  const handleSendToKitchen = () => {
    if (cart.length === 0) return;
    if (onCheckout) {
      onCheckout(subtotal);
    } else {
      setShowSuccess(true);
      setTimeout(() => { setShowSuccess(false); setCart([]); }, 2000);
    }
  };

  return (
    <div
      className="flex flex-col h-screen w-full overflow-hidden"
      style={{ fontFamily: "'DM Sans', sans-serif", background: "#FDFBF7", color: "#2C1A11" }}
    >
      {/* Top Bar */}
      <div
        className="flex items-center gap-4 px-6 py-3.5"
        style={{ borderBottom: "1px solid rgba(44,26,17,0.1)", background: "#FDFBF7", zIndex: 10 }}
      >
        {/* Hamburger menu with dropdown */}
        <div className="relative group">
          <button
            className="w-10 h-10 flex flex-col items-center justify-center gap-1.5 rounded-xl"
            style={{ background: "#EDE5DB", border: "none", cursor: "pointer" }}
          >
            <span className="block w-5 h-px" style={{ background: "#2C1A11" }} />
            <span className="block w-5 h-px" style={{ background: "#2C1A11" }} />
            <span className="block w-5 h-px" style={{ background: "#2C1A11" }} />
          </button>
          <div
            className="absolute left-0 top-12 rounded-2xl overflow-hidden opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-150"
            style={{ background: "#FAF7F2", boxShadow: "0 8px 32px rgba(44,26,17,0.15)", border: "1px solid rgba(44,26,17,0.1)", zIndex: 50, minWidth: "180px" }}
          >
            <button onClick={onBack} className="w-full px-4 py-3 text-left transition-colors hover:bg-[#EDE5DB]" style={{ border: "none", cursor: "pointer", background: "none", fontSize: "13px", color: "#2C1A11", fontFamily: "'DM Sans', sans-serif", borderBottom: "1px solid rgba(44,26,17,0.06)" }}>
              🪑 Change Table
            </button>
            <button onClick={onOpenKDS} className="w-full px-4 py-3 text-left transition-colors hover:bg-[#EDE5DB]" style={{ border: "none", cursor: "pointer", background: "none", fontSize: "13px", color: "#2C1A11", fontFamily: "'DM Sans', sans-serif", borderBottom: "1px solid rgba(44,26,17,0.06)" }}>
              🍳 Kitchen Display
            </button>
            <button onClick={onOpenLedger} className="w-full px-4 py-3 text-left transition-colors hover:bg-[#EDE5DB]" style={{ border: "none", cursor: "pointer", background: "none", fontSize: "13px", color: "#2C1A11", fontFamily: "'DM Sans', sans-serif" }}>
              📋 Orders Ledger
            </button>
          </div>
        </div>

        <div
          className="flex items-center gap-2 px-4 py-2 rounded-xl"
          style={{ background: "#C4622D", color: "#FDFBF7" }}
        >
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "12px", letterSpacing: "0.05em" }}>
            TABLE
          </span>
          <span style={{ fontSize: "20px", fontFamily: "'DM Serif Display', serif", lineHeight: 1 }}>
            {tableNumber}
          </span>
        </div>

        {/* Search */}
        <div
          className="flex-1 flex items-center gap-3 px-4 py-2.5 rounded-xl"
          style={{ background: "#EDE5DB", maxWidth: "340px" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7A5C48" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search menu…"
            className="flex-1 outline-none bg-transparent"
            style={{ fontSize: "14px", color: "#2C1A11" }}
          />
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "#2C1A11", color: "#FDFBF7", fontFamily: "'DM Serif Display', serif", fontSize: "14px" }}
          >
            AR
          </div>
          <div>
            <p style={{ fontSize: "13px", fontWeight: 600, lineHeight: 1.2 }}>Alex Rivera</p>
            <p style={{ fontSize: "11px", color: "#7A5C48", fontFamily: "'DM Mono', monospace" }}>Barista</p>
          </div>
        </div>
      </div>

      {/* Body: 3 panes */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: category rail */}
        <div
          className="flex flex-col gap-2 py-6 px-3 overflow-y-auto"
          style={{ width: "110px", borderRight: "1px solid rgba(44,26,17,0.08)", background: "#FDFBF7" }}
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className="py-2.5 px-2 rounded-full transition-all duration-150 text-center"
              style={{
                background: activeCategory === cat.id ? cat.color : "transparent",
                color: activeCategory === cat.id ? "#FDFBF7" : "#7A5C48",
                fontSize: "12px",
                fontWeight: 500,
                border: activeCategory === cat.id ? "none" : "1px solid rgba(44,26,17,0.12)",
                cursor: "pointer",
                lineHeight: 1.3,
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Center: product grid */}
        <div className="flex-1 overflow-y-auto p-5">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "12px",
            }}
          >
            {filtered.map((product) => (
              <button
                key={product.id}
                onClick={() => addToCart(product.id)}
                className="flex flex-col rounded-2xl overflow-hidden text-left transition-all duration-150"
                style={{
                  background: "#FAF7F2",
                  border: "1px solid rgba(44,26,17,0.1)",
                  cursor: "pointer",
                  boxShadow: "0 1px 4px rgba(44,26,17,0.05)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(196,98,45,0.15)";
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(196,98,45,0.3)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 4px rgba(44,26,17,0.05)";
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(44,26,17,0.1)";
                }}
              >
                <div className="overflow-hidden" style={{ height: "90px" }}>
                  <img
                    src={product.img}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    style={{ transition: "transform 0.2s" }}
                  />
                </div>
                <div className="px-3 py-3 flex items-end justify-between">
                  <p style={{ fontSize: "13px", fontWeight: 500, color: "#2C1A11", lineHeight: 1.3 }}>
                    {product.name}
                  </p>
                  <p
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: "13px",
                      color: "#C4622D",
                      fontWeight: 500,
                      whiteSpace: "nowrap",
                    }}
                  >
                    ${product.price.toFixed(2)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: cart */}
        <div
          className="flex flex-col"
          style={{
            width: "300px",
            borderLeft: "1px solid rgba(44,26,17,0.08)",
            background: "#FAF7F2",
          }}
        >
          {/* Cart header */}
          <div className="px-5 pt-5 pb-3" style={{ borderBottom: "1px solid rgba(44,26,17,0.08)" }}>
            <p
              style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: "20px",
                color: "#2C1A11",
                lineHeight: 1.2,
              }}
            >
              Order Summary
            </p>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "#7A5C48", marginTop: "2px" }}>
              {cart.length === 0 ? "No items yet" : `${cart.reduce((s, i) => s + i.qty, 0)} items`}
            </p>
          </div>

          {/* Line items */}
          <div className="flex-1 overflow-y-auto px-5 py-4" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {cart.length === 0 && (
              <p style={{ fontSize: "13px", color: "#C4A08A", textAlign: "center", marginTop: "32px" }}>
                Tap items to add them
              </p>
            )}
            {cart.map((item) => {
              const product = PRODUCTS.find((p) => p.id === item.productId)!;
              return (
                <div key={item.productId} className="flex items-center gap-2">
                  <div className="flex-1">
                    <p style={{ fontSize: "13px", fontWeight: 500, lineHeight: 1.3 }}>{product.name}</p>
                    <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "12px", color: "#C4622D" }}>
                      ${(product.price * item.qty).toFixed(2)}
                    </p>
                  </div>
                  <div
                    className="flex items-center gap-1 rounded-full"
                    style={{ background: "#EDE5DB", padding: "2px 4px" }}
                  >
                    <button
                      onClick={() => adjustQty(item.productId, -1)}
                      className="w-6 h-6 rounded-full flex items-center justify-center transition-colors"
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#2C1A11", fontSize: "16px", lineHeight: 1 }}
                    >
                      −
                    </button>
                    <span style={{ fontSize: "13px", fontWeight: 600, minWidth: "18px", textAlign: "center" }}>
                      {item.qty}
                    </span>
                    <button
                      onClick={() => adjustQty(item.productId, 1)}
                      className="w-6 h-6 rounded-full flex items-center justify-center transition-colors"
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#C4622D", fontSize: "16px", lineHeight: 1 }}
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom: totals + actions */}
          <div className="px-5 pb-5 pt-3" style={{ borderTop: "1px solid rgba(44,26,17,0.08)" }}>
            <div className="flex justify-between mb-1">
              <span style={{ fontSize: "13px", color: "#7A5C48" }}>Subtotal</span>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "13px" }}>${subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between mb-1">
                <span style={{ fontSize: "13px", color: "#7A8C5C" }}>Discount (10%)</span>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "13px", color: "#7A8C5C" }}>
                  −${discount.toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex justify-between mb-4 pt-2" style={{ borderTop: "1px solid rgba(44,26,17,0.1)" }}>
              <span style={{ fontSize: "15px", fontWeight: 600 }}>Total</span>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "15px", fontWeight: 600, color: "#C4622D" }}>
                ${total.toFixed(2)}
              </span>
            </div>

            {/* Discount code */}
            <input
              type="text"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
              placeholder="Discount code (try CAFE10)"
              className="w-full outline-none rounded-xl px-3 py-2 mb-3"
              style={{
                background: "#EDE5DB",
                border: "none",
                fontSize: "12px",
                color: "#2C1A11",
                fontFamily: "'DM Mono', monospace",
              }}
            />

            {/* Add customer */}
            <button
              className="w-full py-2.5 rounded-xl mb-2 transition-all"
              style={{
                background: "transparent",
                border: "1.5px solid rgba(44,26,17,0.2)",
                color: "#2C1A11",
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "#C4622D")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "rgba(44,26,17,0.2)")}
            >
              + Add Customer
            </button>

            {/* Send to kitchen */}
            <button
              onClick={handleSendToKitchen}
              disabled={cart.length === 0}
              className="w-full py-3.5 rounded-2xl transition-all duration-150"
              style={{
                background: cart.length === 0 ? "#EDE5DB" : showSuccess ? "#7A8C5C" : "#C4622D",
                color: cart.length === 0 ? "#C4A08A" : "#FDFBF7",
                fontSize: "13px",
                fontWeight: 600,
                border: "none",
                cursor: cart.length === 0 ? "not-allowed" : "pointer",
                letterSpacing: "0.03em",
              }}
            >
              {showSuccess ? "✓ Sent to Kitchen!" : cart.length > 0 ? "Send to Kitchen & Pay" : "Send to Kitchen & Pay"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
