"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import ChatWindow from "./ChatWindow";
import styles from "./ChatWidget.module.css";

/**
 * ChatWidget — Floating chat bubble with green pulse dot
 * Appears on all dashboard pages. Opens a compact chat popup
 * or links to the full chat page.
 */
export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const widgetRef = useRef(null);

  // Close popup when navigating
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Close popup on Escape key
  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") setIsOpen(false);
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKey);
      return () => window.removeEventListener("keydown", handleKey);
    }
  }, [isOpen]);

  // Close popup on outside click
  useEffect(() => {
    function handleClick(e) {
      if (widgetRef.current && !widgetRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [isOpen]);

  // Don't render on the full chat page
  if (pathname === "/dashboard/chat") return null;

  return (
    <div className={styles.widget} ref={widgetRef}>
      {/* Chat Popup */}
      {isOpen && (
        <div className={styles.popup}>
          <div className={styles.popupHeader}>
            <span className={styles.popupTitle}>💬 Quick Chat</span>
            <div className={styles.popupActions}>
              <Link href="/dashboard/chat" className={styles.expandBtn} title="Open full chat">
                ↗
              </Link>
              <button
                className={styles.closeBtn}
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
              >
                ✕
              </button>
            </div>
          </div>
          <ChatWindow apiEndpoint="/api/chat" compact />
        </div>
      )}

      {/* Floating Button */}
      <button
        className={`${styles.fab} ${isOpen ? styles.fabActive : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close chat" : "Open chat with HAC"}
      >
        <span className={styles.fabIcon}>{isOpen ? "✕" : "🐴"}</span>
        <span className={styles.pulseDot} />
      </button>
    </div>
  );
}
