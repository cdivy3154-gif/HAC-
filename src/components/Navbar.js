"use client";

import { useState, useEffect } from "react";
import styles from "./Navbar.module.css";

export default function Navbar({ user }) {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const saved = localStorage.getItem("hac-theme");
    const current = document.documentElement.getAttribute("data-theme") || "dark";
    setTheme(saved || current);
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("hac-theme", next);
  }

  return (
    <header className={styles.navbar}>
      {/* Left — Title */}
      <div className={styles.titleSection}>
        <h1 className={styles.pageTitle}>Dashboard</h1>
        <span className={styles.pageSubtitle}>&gt;_ command center</span>
      </div>

      {/* Center — Search */}
      <div className={styles.searchSection}>
        <div className={styles.searchWrapper}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="search hackathons..."
            aria-label="Search hackathons"
            readOnly
          />
          <kbd className={styles.searchKbd}>⌘K</kbd>
        </div>
      </div>

      {/* Right — Actions */}
      <div className={styles.actionsSection}>
        {/* Theme Toggle */}
        <button
          className={styles.actionBtn}
          onClick={toggleTheme}
          aria-label="Toggle theme"
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          <span className={styles.themeIcon}>
            {theme === "dark" ? "🌙" : "☀️"}
          </span>
        </button>

        {/* Notifications */}
        <button className={styles.actionBtn} aria-label="Notifications" title="Notifications">
          <span className={styles.bellIcon}>🔔</span>
          <span className={styles.notifDot} />
        </button>

        {/* User Greeting */}
        <div className={styles.userGreeting}>
          <span className={styles.greetingText}>
            Yo, <strong>{user?.display_name || "Hacker"}</strong>!
          </span>
        </div>
      </div>
    </header>
  );
}
