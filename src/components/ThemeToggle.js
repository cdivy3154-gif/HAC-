"use client";

import { useState, useEffect } from "react";
import styles from "./ThemeToggle.module.css";

/**
 * ThemeToggle — Dark/Light mode toggle with smooth animation
 * Persists choice in localStorage, applies data-theme on <html>
 */
export default function ThemeToggle({ size = "default" }) {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const saved = localStorage.getItem("hac-theme") || "dark";
    setTheme(saved);
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("hac-theme", next);
    document.documentElement.setAttribute("data-theme", next);
  }

  return (
    <button
      className={`${styles.toggle} ${styles[size]} ${theme === "light" ? styles.light : ""}`}
      onClick={toggle}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      <span className={styles.track}>
        <span className={styles.thumb}>
          <span className={styles.icon}>
            {theme === "dark" ? "🌙" : "☀️"}
          </span>
        </span>
        <span className={styles.label}>
          {theme === "dark" ? "Dark" : "Light"}
        </span>
      </span>
    </button>
  );
}
