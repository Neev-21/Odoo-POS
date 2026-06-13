"use client";

import React from "react";
import styles from "./ProductGrid.module.css";
import { INITIAL_CATEGORIES } from "@/data/mockData";

export default function ProductCard({ product, onAdd }) {
  // Find the category color to style visual indicators (borders, icons, or dots)
  const category = INITIAL_CATEGORIES.find((cat) => cat.id === product.category_id);
  const themeColor = category ? category.color : "var(--neon-cyan)";

  return (
    <button
      className={`${styles.card} glassmorphic`}
      style={{
        "--hover-glow": `${themeColor}44`,
        "--active-border": themeColor,
      }}
      onClick={() => onAdd(product)}
    >
      <div className={styles.cardHeader}>
        {/* Category specific colored badge */}
        <span 
          className={styles.categoryBadge} 
          style={{ borderColor: themeColor, color: themeColor }}
        >
          {category ? category.name : "Diner"}
        </span>
      </div>

      <div className={styles.cardBody}>
        <h3 className={styles.productName}>{product.name}</h3>
      </div>

      <div className={styles.cardFooter}>
        <span className={styles.currency}>$</span>
        <span className={styles.price}>{product.price.toFixed(2)}</span>
        
        {/* Animated Tap Indicator */}
        <div className={styles.tapIndicator} style={{ backgroundColor: themeColor }}>
          <svg className={styles.tapIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
        </div>
      </div>
    </button>
  );
}
