"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import FilterPanel from "@/components/FilterPanel";
import HackathonCard from "@/components/HackathonCard";
import { MOCK_HACKATHONS } from "@/lib/mockData";
import styles from "./page.module.css";

const DEFAULT_FILTERS = {
  source: "all",
  mode: "all",
  difficulty: "all",
  sort: "match",
  tags: [],
  hacPicksOnly: false,
};

function sortHackathons(list, sortKey) {
  const sorted = [...list];
  switch (sortKey) {
    case "match":
      return sorted.sort((a, b) => b.match_score - a.match_score);
    case "deadline":
      return sorted.sort(
        (a, b) =>
          new Date(a.registration_deadline) - new Date(b.registration_deadline)
      );
    case "date":
      return sorted.sort(
        (a, b) => new Date(a.start_date) - new Date(b.start_date)
      );
    case "name":
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case "prize":
      return sorted; // mock data doesn't have numeric prize
    default:
      return sorted;
  }
}

export default function HackathonsPage() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // grid or list

  const filtered = useMemo(() => {
    let result = [...MOCK_HACKATHONS];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (h) =>
          h.title.toLowerCase().includes(q) ||
          h.organizer.toLowerCase().includes(q) ||
          h.tags.some((t) => t.toLowerCase().includes(q)) ||
          h.location.toLowerCase().includes(q)
      );
    }

    // Source
    if (filters.source !== "all") {
      result = result.filter((h) => h.source === filters.source);
    }

    // Mode
    if (filters.mode === "online") {
      result = result.filter((h) => h.is_online);
    } else if (filters.mode === "offline") {
      result = result.filter((h) => !h.is_online);
    }

    // Difficulty
    if (filters.difficulty !== "all") {
      result = result.filter(
        (h) => h.difficulty === filters.difficulty || h.difficulty === "all"
      );
    }

    // HAC's Picks
    if (filters.hacPicksOnly) {
      result = result.filter((h) => h.is_hac_pick);
    }

    // Tags
    if (filters.tags.length > 0) {
      result = result.filter((h) =>
        filters.tags.some((tag) => h.tags.includes(tag))
      );
    }

    // Sort
    result = sortHackathons(result, filters.sort);

    return result;
  }, [search, filters]);

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>
            <span className={styles.titleIcon}>🔍</span>
            Hackathon Discovery
          </h1>
          <p className={styles.subtitle}>
            <span className={styles.prompt}>&gt;_ </span>
            Browse {MOCK_HACKATHONS.length} hackathons • find your next win
          </p>
        </div>
        <div className={styles.headerRight}>
          <Link href="/dashboard/calendar" className={styles.calendarLink}>
            📅 Calendar View
          </Link>
          <div className={styles.viewToggle}>
            <button
              className={`${styles.viewBtn} ${viewMode === "grid" ? styles.viewBtnActive : ""}`}
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
            >
              ▦
            </button>
            <button
              className={`${styles.viewBtn} ${viewMode === "list" ? styles.viewBtnActive : ""}`}
              onClick={() => setViewMode("list")}
              aria-label="List view"
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <SearchBar
        value={search}
        onChange={setSearch}
        resultCount={filtered.length}
      />

      {/* Content: Filters + Grid */}
      <div className={styles.content}>
        <FilterPanel
          filters={filters}
          onFilterChange={setFilters}
          collapsed={!filtersOpen}
          onToggle={() => setFiltersOpen(!filtersOpen)}
        />

        <div className={styles.mainContent}>
          {filtered.length === 0 ? (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>🐴</span>
              <h3 className={styles.emptyTitle}>No hackathons found</h3>
              <p className={styles.emptyText}>
                Try adjusting your filters or search query. HAC is always
                scouting for more!
              </p>
              <button
                className={styles.resetBtn}
                onClick={() => {
                  setSearch("");
                  setFilters(DEFAULT_FILTERS);
                }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div
              className={
                viewMode === "grid" ? styles.grid : styles.listView
              }
            >
              {filtered.map((h) => (
                <Link
                  key={h.id}
                  href={`/dashboard/hackathons/${h.id}`}
                  className={styles.cardLink}
                >
                  <HackathonCard hackathon={h} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
