"use client";

import React, { useState, useEffect, useMemo } from "react";
import { INITIAL_CATEGORIES } from "@/data/mockData";
import styles from "./KdsDashboard.module.css";

export default function KdsDashboard() {
  const [pastOrders, setPastOrders] = useState([]);
  const [products, setProducts] = useState([]);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState("All");

  // Load state and subscribe to changes in localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const loadData = () => {
        // Load past orders
        const storedOrders = localStorage.getItem("pos_past_orders");
        if (storedOrders) {
          try {
            setPastOrders(JSON.parse(storedOrders));
          } catch (e) {
            console.error(e);
          }
        }

        // Load products to check KDS eligibility
        const storedProducts = localStorage.getItem("pos_products");
        if (storedProducts) {
          try {
            setProducts(JSON.parse(storedProducts));
          } catch (e) {
            console.error(e);
          }
        }
      };

      loadData();

      // Listen for updates from other tabs
      const handleStorageChange = (e) => {
        if (e.key === "pos_past_orders" || e.key === "pos_products") {
          loadData();
        }
      };

      window.addEventListener("storage", handleStorageChange);
      return () => {
        window.removeEventListener("storage", handleStorageChange);
      };
    }
  }, []);

  // Save changes to localStorage to sync other tabs
  const saveOrders = (updatedOrders) => {
    setPastOrders(updatedOrders);
    if (typeof window !== "undefined") {
      localStorage.setItem("pos_past_orders", JSON.stringify(updatedOrders));
    }
  };

  // Helper: check if a product is KDS eligible
  const isKdsProduct = (productId) => {
    const p = products.find(prod => prod.id === productId);
    return p ? p.kds !== false : true;
  };

  // Helper: get product details
  const getProduct = (productId) => {
    return products.find(prod => prod.id === productId);
  };

  // Derived: Active KDS tickets (exclude completed orders, and only show orders with KDS items)
  const activeKdsTickets = useMemo(() => {
    return pastOrders
      .map(order => {
        // Filter out non-KDS items
        const kdsItems = order.cart.filter(item => isKdsProduct(item.product_id));
        return {
          ...order,
          kdsItems,
          // Initialize KDS status/completed items if not present
          kdsStatus: order.kdsStatus || "To Cook",
          kdsCompletedItems: order.kdsCompletedItems || []
        };
      })
      // Only keep orders that have KDS items AND are not fully Completed/Cleared
      .filter(order => order.kdsItems.length > 0 && order.kdsStatus !== "Completed");
  }, [pastOrders, products]);

  // Derived: Filter tickets by search query, product, and category
  const filteredKdsTickets = useMemo(() => {
    return activeKdsTickets.filter(ticket => {
      // 1. Search filter
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query ||
        ticket.id.toLowerCase().includes(query) ||
        ticket.customer.toLowerCase().includes(query) ||
        ticket.table.toLowerCase().includes(query);

      // 2. Product filter
      const matchesProduct = selectedProduct === "All" ||
        ticket.kdsItems.some(item => item.product_id === selectedProduct);

      // 3. Category filter
      const matchesCategory = selectedCategory === "All" ||
        ticket.kdsItems.some(item => {
          const prod = getProduct(item.product_id);
          return prod && prod.category_id === selectedCategory;
        });

      return matchesSearch && matchesProduct && matchesCategory;
    });
  }, [activeKdsTickets, searchQuery, selectedProduct, selectedCategory]);

  // Derived: Unique list of products currently in the active kitchen queue (for filter dropdown)
  const activeQueueProducts = useMemo(() => {
    const productMap = new Map();
    activeKdsTickets.forEach(ticket => {
      ticket.kdsItems.forEach(item => {
        if (!productMap.has(item.product_id)) {
          productMap.set(item.product_id, item.name);
        }
      });
    });
    return Array.from(productMap.entries()).map(([id, name]) => ({ id, name }));
  }, [activeKdsTickets]);

  // Handler: Advance ticket status
  const handleAdvanceStage = (ticketId) => {
    const updated = pastOrders.map(order => {
      if (order.id === ticketId) {
        const currentStage = order.kdsStatus || "To Cook";
        let nextStage = "To Cook";
        if (currentStage === "To Cook") nextStage = "Preparing";
        else if (currentStage === "Preparing") nextStage = "Completed";
        
        return {
          ...order,
          kdsStatus: nextStage
        };
      }
      return order;
    });
    saveOrders(updated);
  };

  // Handler: Toggle individual item completion
  const handleToggleItem = (ticketId, productId, e) => {
    e.stopPropagation(); // Prevent card stage advance click
    const updated = pastOrders.map(order => {
      if (order.id === ticketId) {
        const completed = order.kdsCompletedItems || [];
        const nextCompleted = completed.includes(productId)
          ? completed.filter(id => id !== productId)
          : [...completed, productId];
        
        return {
          ...order,
          kdsCompletedItems: nextCompleted
        };
      }
      return order;
    });
    saveOrders(updated);
  };

  return (
    <div className={styles.kdsDashboard}>
      {/* Header Bar */}
      <header className={styles.kdsHeader}>
        <div className={styles.brandGroup}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.logoIcon}>
            <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
            <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z" />
            <line x1="6" y1="2" x2="6" y2="4" />
            <line x1="10" y1="2" x2="10" y2="4" />
            <line x1="14" y1="2" x2="14" y2="4" />
          </svg>
          <div>
            <h1 className={styles.kdsTitle}>KITCHEN DISPLAY SYSTEM</h1>
            <p className={styles.kdsSubtitle}>Oak & Bean Diner • Real-time Order Monitor</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className={styles.controlsGroup}>
          <input
            type="text"
            placeholder="Search Ticket, Table..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchBar}
          />
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="All">All Categories</option>
            {INITIAL_CATEGORIES.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="All">All Products</option>
            {activeQueueProducts.map(prod => (
              <option key={prod.id} value={prod.id}>{prod.name}</option>
            ))}
          </select>
        </div>
      </header>

      {/* Main KDS Grid divided by order stages */}
      <main className={styles.kdsGrid}>
        {/* TO COOK SECTION */}
        <section className={styles.kdsColumn}>
          <div className={`${styles.columnHeader} ${styles.toCookHeader}`}>
            <h2>TO COOK ({filteredKdsTickets.filter(t => t.kdsStatus === "To Cook").length})</h2>
          </div>
          <div className={styles.columnScroll}>
            {filteredKdsTickets.filter(t => t.kdsStatus === "To Cook").map(ticket => (
              <KdsTicketCard 
                key={ticket.id}
                ticket={ticket}
                onAdvance={handleAdvanceStage}
                onToggleItem={handleToggleItem}
              />
            ))}
          </div>
        </section>

        {/* PREPARING SECTION */}
        <section className={styles.kdsColumn}>
          <div className={`${styles.columnHeader} ${styles.preparingHeader}`}>
            <h2>PREPARING ({filteredKdsTickets.filter(t => t.kdsStatus === "Preparing").length})</h2>
          </div>
          <div className={styles.columnScroll}>
            {filteredKdsTickets.filter(t => t.kdsStatus === "Preparing").map(ticket => (
              <KdsTicketCard 
                key={ticket.id}
                ticket={ticket}
                onAdvance={handleAdvanceStage}
                onToggleItem={handleToggleItem}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

// Kitchen Ticket Card Component
function KdsTicketCard({ ticket, onAdvance, onToggleItem }) {
  const isPreparing = ticket.kdsStatus === "Preparing";
  
  return (
    <div 
      className={`${styles.ticketCard} ${isPreparing ? styles.preparingCard : styles.toCookCard}`}
      onClick={() => onAdvance(ticket.id)}
      title={`Click card to move to next stage (${ticket.kdsStatus === "To Cook" ? "Preparing" : "Complete"})`}
    >
      <div className={styles.cardHeader}>
        <div>
          <span className={styles.cardId}>{ticket.id}</span>
          <span className={styles.cardTable}>{ticket.table}</span>
        </div>
        <span className={styles.cardTime}>{ticket.timestamp}</span>
      </div>
      
      <div className={styles.cardCustomer}>
        <span>Cust: {ticket.customer}</span>
        <span className={`${styles.statusLabel} ${isPreparing ? styles.statusPreparing : styles.statusToCook}`}>
          {ticket.kdsStatus}
        </span>
      </div>
      
      <div className={styles.cardDivider} />
      
      <ul className={styles.cardItems}>
        {ticket.kdsItems.map((item, idx) => {
          const isDone = ticket.kdsCompletedItems.includes(item.product_id);
          return (
            <li 
              key={idx} 
              className={`${styles.cardItem} ${isDone ? styles.itemCompleted : ""}`}
              onClick={(e) => onToggleItem(ticket.id, item.product_id, e)}
              title="Click item to mark done/undone"
            >
              <span className={styles.itemQty}>{item.quantity}x</span>
              <span className={styles.itemName}>{item.name}</span>
              {isDone && <span className={styles.doneCheck}>✓</span>}
            </li>
          );
        })}
      </ul>
      
      <div className={styles.cardFooter}>
        <span>Tap Card to {isPreparing ? "Serve (Complete)" : "Start Cooking"} →</span>
      </div>
    </div>
  );
}
