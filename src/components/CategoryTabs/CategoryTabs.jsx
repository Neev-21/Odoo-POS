"use client";

import React from "react";
import styles from "./CategoryTabs.module.css";
import { INITIAL_CATEGORIES } from "@/data/mockData";

export default function CategoryTabs({ activeCategoryId, setActiveCategoryId, onClearSearch }) {
  return (
    <div className={styles.container}>
      <div className={styles.label}>CATEGORIES</div>
      <div className={styles.tabsList}>
        {INITIAL_CATEGORIES.map((cat) => {
          const isActive = cat.id === activeCategoryId;
          
          // Generate inline styles to apply category colors for active tabs
          const inlineStyle = isActive
            ? {
                backgroundColor: cat.color,
                borderColor: cat.color,
                boxShadow: `0 0 15px ${cat.color}66, inset 0 0 5px rgba(255, 255, 255, 0.2)`,
                color: "#fff",
              }
            : {
                borderColor: `${cat.color}44`,
                color: cat.color,
              };

          return (
            <button
              key={cat.id}
              className={`${styles.tabBtn} ${isActive ? styles.activeTab : ""}`}
              style={inlineStyle}
              onClick={() => {
                setActiveCategoryId(cat.id);
                // Clear any active search query to allow clear visual filtering of categories
                if (onClearSearch) onClearSearch();
              }}
            >
              <span className={styles.dot} style={{ backgroundColor: cat.color }} />
              {cat.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
