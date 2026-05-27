"use client";

import { useState } from "react";
import styles from "./SearchBar.module.css";

/**
 * SearchBar — Terminal-style search with green focus glow
 */
export default function SearchBar({ value, onChange, placeholder = "search hackathons...", resultCount }) {
  const [focused, setFocused] = useState(false);

  return (
    <div className={`${styles.wrapper} ${focused ? styles.focused : ""}`}>
      <span className={styles.prompt}>&gt;_</span>
      <input
        type="text"
        className={styles.input}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        aria-label="Search hackathons"
      />
      {value && (
        <button
          className={styles.clearBtn}
          onClick={() => onChange("")}
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
      {resultCount !== undefined && (
        <span className={styles.resultCount}>
          {resultCount} result{resultCount !== 1 ? "s" : ""}
        </span>
      )}
    </div>
  );
}
