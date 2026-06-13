"use client";

import React, { useRef, useEffect } from "react";
import styles from "./TopBar.module.css";
import { INITIAL_TABLES, INITIAL_CUSTOMERS } from "@/data/mockData";

export default function TopBar({
  searchQuery,
  setSearchQuery,
  selectedTable,
  setSelectedTable,
  customerName,
  setCustomerName,
  activeModal,
  setActiveModal,
  currentView,
  setCurrentView
}) {
  const tableRef = useRef(null);
  const customerRef = useRef(null);

  // Close modals when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (activeModal === "table" && tableRef.current && !tableRef.current.contains(event.target)) {
        setActiveModal(null);
      }
      if (activeModal === "customer" && customerRef.current && !customerRef.current.contains(event.target)) {
        setActiveModal(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeModal, setActiveModal]);

  return (
    <header className={`${styles.header} glassmorphic`}>
      {/* Brand Logo & Tabs */}
      <div className={styles.leftSection}>
        <div className={styles.logo}>
          <span className={styles.neonTextCyan}>OAK &</span>
          <span className={styles.neonTextPink}>BEAN</span>
        </div>
        <nav className={styles.nav}>
          <button 
            className={`${styles.navBtn} ${currentView === "pos" ? styles.activeNav : ""}`}
            onClick={() => setCurrentView("pos")}
          >
            POS Order
          </button>
          <button 
            className={`${styles.navBtn} ${currentView === "orders" ? styles.activeNav : ""}`}
            onClick={() => setCurrentView("orders")}
          >
            Orders
          </button>
        </nav>
      </div>

      {/* Center Search Input */}
      <div className={styles.centerSection}>
        <div className={styles.searchContainer}>
          <svg className={styles.searchIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search diner menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className={styles.clearSearch} onClick={() => setSearchQuery("")}>
              &times;
            </button>
          )}
        </div>
      </div>

      {/* Right Controls (Table / Customer overlays) */}
      <div className={styles.rightSection}>
        {/* Customer Button & Dropdown */}
        <div className={styles.relativeContainer} ref={customerRef}>
          <button
            className={`${styles.overlayTrigger} ${activeModal === "customer" ? styles.activeTrigger : ""}`}
            onClick={() => setActiveModal(activeModal === "customer" ? null : "customer")}
          >
            <svg className={styles.btnIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <div className={styles.triggerLabel}>
              <span className={styles.subText}>Customer</span>
              <span className={styles.mainText}>{customerName}</span>
            </div>
          </button>

          {activeModal === "customer" && (
            <div className={`${styles.dropdownModal} glassmorphic`}>
              <h3 className={styles.modalTitle}>Assign Customer</h3>
              <div className={styles.inputGroup}>
                <input
                  type="text"
                  placeholder="Enter customer name..."
                  className={styles.customInput}
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value || "Walk-in Customer")}
                  autoFocus
                />
              </div>
              <div className={styles.divider} />
              <div className={styles.presetList}>
                {INITIAL_CUSTOMERS.map((name) => (
                  <button
                    key={name}
                    className={`${styles.presetItem} ${customerName === name ? styles.selectedPreset : ""}`}
                    onClick={() => {
                      setCustomerName(name);
                      setActiveModal(null);
                    }}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Table Indicator Button & Dropdown */}
        <div className={styles.relativeContainer} ref={tableRef}>
          <button
            className={`${styles.overlayTrigger} ${styles.tableTrigger} ${activeModal === "table" ? styles.activeTrigger : ""}`}
            onClick={() => setActiveModal(activeModal === "table" ? null : "table")}
          >
            <svg className={styles.btnIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
            <div className={styles.triggerLabel}>
              <span className={styles.subText}>Active Table</span>
              <span className={`${styles.mainText} ${styles.neonTextCyan}`}>{selectedTable}</span>
            </div>
          </button>

          {activeModal === "table" && (
            <div className={`${styles.dropdownModal} ${styles.tableModal} glassmorphic`}>
              <h3 className={styles.modalTitle}>Select Table</h3>
              <div className={styles.tableGrid}>
                {INITIAL_TABLES.map((table) => (
                  <button
                    key={table}
                    className={`${styles.tableBtn} ${selectedTable === table ? styles.selectedTableBtn : ""}`}
                    onClick={() => {
                      setSelectedTable(table);
                      setActiveModal(null);
                    }}
                  >
                    {table.replace("Table ", "")}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
