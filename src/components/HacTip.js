"use client";

import { useState, useMemo } from "react";
import { HAC_TIPS } from "@/lib/mockData";
import styles from "./HacTip.module.css";

function getDayOfYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * HacTip — HAC's daily witty tip in a gold-bordered glass card
 */
export default function HacTip({ tips = HAC_TIPS }) {
  const dailyIndex = useMemo(() => getDayOfYear() % tips.length, [tips.length]);
  const [currentIndex, setCurrentIndex] = useState(dailyIndex);
  const [fading, setFading] = useState(false);

  function refreshTip() {
    setFading(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % tips.length);
      setFading(false);
    }, 250);
  }

  return (
    <div className={styles.widget}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.avatarWrapper}>
          <img
            src="/hac-logo.png"
            alt="HAC"
            className={styles.avatar}
            width={44}
            height={44}
          />
          <span className={styles.glassesGlow} />
        </div>
        <div className={styles.headerText}>
          <h3 className={styles.headerTitle}>HAC&apos;s Daily Tip</h3>
          <span className={styles.headerSub}>wisdom from the stables</span>
        </div>
      </div>

      {/* Tip Content */}
      <div className={`${styles.tipContent} ${fading ? styles.tipFading : ""}`}>
        <span className={styles.quoteOpen}>&ldquo;</span>
        <p className={styles.tipText}>{tips[currentIndex]}</p>
      </div>

      {/* Refresh Button */}
      <button className={styles.refreshBtn} onClick={refreshTip}>
        <span className={styles.refreshIcon}>🔄</span>
        Another tip
      </button>
    </div>
  );
}
