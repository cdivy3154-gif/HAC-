"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import TeamCard from "@/components/TeamCard";
import TeamForm from "@/components/TeamForm";
import MyTeamCard from "@/components/MyTeamCard";
import { MOCK_TEAMS, MY_TEAMS } from "@/lib/mockData";
import styles from "./page.module.css";

export default function TeamsPage() {
  const [activeTab, setActiveTab] = useState("browse"); // browse | myteams
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState("all"); // all, open, closed
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [joinToast, setJoinToast] = useState(null);

  const filtered = useMemo(() => {
    let result = [...MOCK_TEAMS];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.hackathon_title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.looking_for.some((s) => s.toLowerCase().includes(q)) ||
          t.members.some((m) => m.name.toLowerCase().includes(q))
      );
    }

    // Status filter
    if (filterOpen === "open") {
      result = result.filter((t) => t.is_open);
    } else if (filterOpen === "closed") {
      result = result.filter((t) => !t.is_open);
    }

    return result;
  }, [search, filterOpen]);

  const totalPending = MY_TEAMS.reduce(
    (sum, t) => sum + (t.join_requests?.filter((r) => r.status === "pending").length || 0),
    0
  );

  function handleJoinClick(team) {
    setJoinToast(`Request sent to join "${team.name}"! 🐴 The leader will review your profile.`);
    setTimeout(() => setJoinToast(null), 4000);
  }

  function handleCreateSubmit(formData) {
    setShowCreateForm(false);
    setJoinToast(`Team "${formData.name}" created! 🎉 You're the leader. Share the link to invite others.`);
    setTimeout(() => setJoinToast(null), 4000);
  }

  return (
    <div className={styles.page}>
      {/* Toast */}
      {joinToast && (
        <div className={styles.toast}>
          <span>{joinToast}</span>
          <button className={styles.toastClose} onClick={() => setJoinToast(null)}>✕</button>
        </div>
      )}

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>
            <span className={styles.titleIcon}>👥</span>
            Team Matchmaking
          </h1>
          <p className={styles.subtitle}>
            <span className={styles.prompt}>&gt;_ </span>
            find your squad • {MOCK_TEAMS.filter((t) => t.is_open).length} teams looking for members
          </p>
        </div>
        <button
          className={styles.createBtn}
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? "✕ Close" : "+ Create Team"}
        </button>
      </div>

      {/* Tab Switcher */}
      <div className={styles.tabBar}>
        <button
          className={`${styles.tab} ${activeTab === "browse" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("browse")}
        >
          🔍 Browse Teams
        </button>
        <button
          className={`${styles.tab} ${activeTab === "myteams" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("myteams")}
        >
          👑 My Teams
          {totalPending > 0 && (
            <span className={styles.tabBadge}>{totalPending}</span>
          )}
        </button>
      </div>

      {/* Create Team Form (expandable) */}
      {showCreateForm && (
        <div className={styles.createFormWrapper}>
          <TeamForm
            onSubmit={handleCreateSubmit}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      )}

      {/* ─── Browse Tab ─────────────────────────────────────── */}
      {activeTab === "browse" && (
        <>
          {/* Search + Filters */}
          <div className={styles.controls}>
            <div className={styles.searchWrapper}>
              <SearchBar
                value={search}
                onChange={setSearch}
                placeholder="search teams, skills, hackathons..."
                resultCount={filtered.length}
              />
            </div>
            <div className={styles.statusFilter}>
              {["all", "open", "closed"].map((s) => (
                <button
                  key={s}
                  className={`${styles.filterChip} ${filterOpen === s ? styles.filterActive : ""}`}
                  onClick={() => setFilterOpen(s)}
                >
                  {s === "all" ? "All" : s === "open" ? "🟢 Open" : "🔴 Closed"}
                </button>
              ))}
            </div>
          </div>

          {/* Teams Grid */}
          {filtered.length === 0 ? (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>👥</span>
              <h3 className={styles.emptyTitle}>No teams found</h3>
              <p className={styles.emptyText}>
                Try different search terms, or create your own team!
              </p>
              <button className={styles.createBtnAlt} onClick={() => setShowCreateForm(true)}>
                + Create a Team
              </button>
            </div>
          ) : (
            <div className={styles.grid}>
              {filtered.map((team) => (
                <Link
                  key={team.id}
                  href={`/dashboard/teams/${team.id}`}
                  className={styles.cardLink}
                >
                  <TeamCard team={team} onJoinClick={handleJoinClick} />
                </Link>
              ))}
            </div>
          )}
        </>
      )}

      {/* ─── My Teams Tab ───────────────────────────────────── */}
      {activeTab === "myteams" && (
        <>
          {MY_TEAMS.length === 0 ? (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>👑</span>
              <h3 className={styles.emptyTitle}>No teams yet</h3>
              <p className={styles.emptyText}>
                Create your first team and start recruiting!
              </p>
              <button className={styles.createBtnAlt} onClick={() => setShowCreateForm(true)}>
                + Create a Team
              </button>
            </div>
          ) : (
            <div className={styles.myTeamsList}>
              {MY_TEAMS.map((team) => (
                <MyTeamCard key={team.id} team={team} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
