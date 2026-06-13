"use client";

import React from "react";
import ProductCard from "./ProductCard";
import styles from "./ProductGrid.module.css";

export default function ProductGrid({ products, onAdd }) {
  if (products.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <div className={`${styles.emptyBox} glassmorphic`}>
          <div className={styles.emptyIconContainer}>
            <svg className={styles.emptyIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className={styles.emptyTitle}>NO ITEMS FOUND</h3>
          <p className={styles.emptySubtitle}>Try searching for something else or changing categories.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.scrollWrapper}>
      <div className={styles.grid}>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAdd={onAdd}
          />
        ))}
      </div>
    </div>
  );
}
