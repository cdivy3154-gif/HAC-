"use client";

import styles from "./FilterPanel.module.css";

const SOURCES = [
  { value: "all", label: "All Sources" },
  { value: "mlh", label: "MLH" },
  { value: "devpost", label: "Devpost" },
  { value: "unstop", label: "Unstop" },
  { value: "hackerearth", label: "HackerEarth" },
];

const MODES = [
  { value: "all", label: "All Modes" },
  { value: "online", label: "🌐 Online" },
  { value: "offline", label: "📍 In-Person" },
];

const DIFFICULTIES = [
  { value: "all", label: "All Levels" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const SORT_OPTIONS = [
  { value: "match", label: "Match Score ↓" },
  { value: "deadline", label: "Deadline (Soonest)" },
  { value: "prize", label: "Prize Pool" },
  { value: "date", label: "Start Date" },
  { value: "name", label: "Name A–Z" },
];

const ALL_TAGS = [
  "AI/ML", "Web Dev", "Mobile", "Web3", "Blockchain", "DeFi",
  "Social Good", "Cloud", "Data Science", "Python", "IoT",
  "Space", "Hardware", "Health", "Sustainability", "Fintech",
  "Cybersecurity", "CTF", "Networking", "Civic Tech", "Startup", "Product",
];

/**
 * FilterPanel — Filter sidebar with green toggles
 */
export default function FilterPanel({ filters, onFilterChange, collapsed, onToggle }) {
  function updateFilter(key, value) {
    onFilterChange({ ...filters, [key]: value });
  }

  function toggleTag(tag) {
    const current = filters.tags || [];
    const next = current.includes(tag)
      ? current.filter((t) => t !== tag)
      : [...current, tag];
    updateFilter("tags", next);
  }

  function clearAll() {
    onFilterChange({
      source: "all",
      mode: "all",
      difficulty: "all",
      sort: "match",
      tags: [],
      hacPicksOnly: false,
    });
  }

  const activeCount =
    (filters.source !== "all" ? 1 : 0) +
    (filters.mode !== "all" ? 1 : 0) +
    (filters.difficulty !== "all" ? 1 : 0) +
    (filters.tags?.length || 0) +
    (filters.hacPicksOnly ? 1 : 0);

  return (
    <>
      {/* Mobile toggle button */}
      <button className={styles.mobileToggle} onClick={onToggle}>
        <span>⚙️ Filters</span>
        {activeCount > 0 && (
          <span className={styles.filterBadge}>{activeCount}</span>
        )}
      </button>

      {/* Panel */}
      <aside className={`${styles.panel} ${collapsed ? styles.panelHidden : ""}`}>
        <div className={styles.panelHeader}>
          <h3 className={styles.panelTitle}>⚙️ Filters</h3>
          {activeCount > 0 && (
            <button className={styles.clearBtn} onClick={clearAll}>
              Clear all
            </button>
          )}
        </div>

        {/* Sort */}
        <div className={styles.filterGroup}>
          <span className={styles.groupLabel}>SORT BY</span>
          <select
            className={styles.selectInput}
            value={filters.sort}
            onChange={(e) => updateFilter("sort", e.target.value)}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Source */}
        <div className={styles.filterGroup}>
          <span className={styles.groupLabel}>SOURCE</span>
          <div className={styles.chipGroup}>
            {SOURCES.map((s) => (
              <button
                key={s.value}
                className={`${styles.chip} ${filters.source === s.value ? styles.chipActive : ""}`}
                onClick={() => updateFilter("source", s.value)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mode */}
        <div className={styles.filterGroup}>
          <span className={styles.groupLabel}>MODE</span>
          <div className={styles.chipGroup}>
            {MODES.map((m) => (
              <button
                key={m.value}
                className={`${styles.chip} ${filters.mode === m.value ? styles.chipActive : ""}`}
                onClick={() => updateFilter("mode", m.value)}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div className={styles.filterGroup}>
          <span className={styles.groupLabel}>DIFFICULTY</span>
          <div className={styles.chipGroup}>
            {DIFFICULTIES.map((d) => (
              <button
                key={d.value}
                className={`${styles.chip} ${filters.difficulty === d.value ? styles.chipActive : ""}`}
                onClick={() => updateFilter("difficulty", d.value)}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* HAC's Picks Only */}
        <div className={styles.filterGroup}>
          <label className={styles.toggleRow}>
            <span className={styles.toggleLabel}>🐴 HAC&apos;s Picks Only</span>
            <button
              className={`${styles.toggle} ${filters.hacPicksOnly ? styles.toggleOn : ""}`}
              onClick={() => updateFilter("hacPicksOnly", !filters.hacPicksOnly)}
              role="switch"
              aria-checked={filters.hacPicksOnly}
            >
              <span className={styles.toggleThumb} />
            </button>
          </label>
        </div>

        {/* Tags */}
        <div className={styles.filterGroup}>
          <span className={styles.groupLabel}>TAGS</span>
          <div className={styles.tagCloud}>
            {ALL_TAGS.map((tag) => (
              <button
                key={tag}
                className={`${styles.tagChip} ${(filters.tags || []).includes(tag) ? styles.tagActive : ""}`}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}
