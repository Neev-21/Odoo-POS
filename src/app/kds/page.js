"use client";

import React from "react";
import KdsDashboard from "@/components/KdsDashboard/KdsDashboard";
import styles from "./kds.module.css";

export default function KDSPage() {
  return (
    <div className={styles.kdsPageWrapper}>
      <KdsDashboard />
    </div>
  );
}
