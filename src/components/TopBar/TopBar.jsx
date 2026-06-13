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
  setCurrentView,
  role,
  setRole,
  currentUser,
  onLogout
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
          <svg className={styles.logoIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
            <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z" />
            <line x1="6" y1="2" x2="6" y2="4" />
            <line x1="10" y1="2" x2="10" y2="4" />
            <line x1="14" y1="2" x2="14" y2="4" />
          </svg>
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

      {/* Right Controls (Role switch, Table / Customer overlays) */}
      <div className={styles.rightSection}>
        {currentUser && (
          <div className={styles.userProfile}>
            <span className={styles.userName}>{currentUser.name}</span>
            <span className={styles.userRole}>{currentUser.role === "Admin" ? "Admin" : "Employee"}</span>
          </div>
        )}

        {/* Role Toggle Selector */}
        {currentUser && currentUser.role === "Admin" && (
          <div className={styles.roleSelector}>
            <button
              className={`${styles.roleBtn} ${role === "Employee" ? styles.activeRole : ""}`}
              onClick={() => {
                setRole("Employee");
                setCurrentView("pos");
              }}
              title="Switch to Employee POS View"
            >
              Employee
            </button>
            <button
              className={`${styles.roleBtn} ${role === "Admin" ? styles.activeRole : ""}`}
              onClick={() => {
                setRole("Admin");
                setCurrentView("orders");
              }}
              title="Switch to Admin Backend Dashboard"
            >
              Admin
            </button>
          </div>
        )}

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

        {/* Sign Out Button */}
        {currentUser && (
          <button
            className={styles.logoutBtn}
            onClick={onLogout}
            title="Sign Out of Session"
          >
            Sign Out
          </button>
        )}
      </div>
    </header>
  );
}
