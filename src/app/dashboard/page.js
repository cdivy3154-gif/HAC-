"use client";

import { useState, useEffect } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import StatsWidget from "@/components/StatsWidget";
import HackathonCard from "@/components/HackathonCard";
import DeadlineWidget from "@/components/DeadlineWidget";
import HacTip from "@/components/HacTip";
import {
  MOCK_HACKATHONS,
  MOCK_STATS,
  MOCK_ACTIVITY,
  ACTIVITY_ICONS,
} from "@/lib/mockData";
import styles from "./page.module.css";

function timeAgo(timestamp) {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function DashboardPage() {
  const [profile, setProfile] = useState(null);
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("display_name, skills, interests")
        .eq("id", user.id)
        .single();

      setProfile(
        data || {
          display_name:
            user.user_metadata?.display_name ||
            user.email?.split("@")[0] ||
            "Hacker",
        }
      );
    }
    loadProfile();
  }, []);

  const displayName = profile?.display_name || "Hacker";

  // Get top recommended (sorted by match score)
  const recommended = [...MOCK_HACKATHONS].sort(
    (a, b) => b.match_score - a.match_score
  );

  return (
    <div className={styles.dashboard}>
      {/* ─── Welcome Banner ─── */}
      <section className={styles.welcomeSection}>
        <div className={styles.welcomeContent}>
          <h2 className={styles.welcomeTitle}>
            Yo, <span className={styles.nameHighlight}>{displayName}</span>!{" "}
            <span className={styles.welcomeEmoji}>🐴</span>
          </h2>
          <p className={styles.welcomeSubtitle}>
            <span className={styles.promptChar}>&gt;_ </span>
            HAC found{" "}
            <strong className={styles.countHighlight}>
              {MOCK_STATS.activeHackathons}
            </strong>{" "}
            hackathons matching your profile. Let&apos;s get hacking.
          </p>
        </div>
      </section>

      {/* ─── Quick Stats ─── */}
      <section className={styles.statsGrid}>
        <StatsWidget
          icon="🏆"
          label="Active Hackathons"
          value={MOCK_STATS.activeHackathons}
        />
        <StatsWidget
          icon="📌"
          label="Bookmarked"
          value={MOCK_STATS.bookmarked}
        />
        <StatsWidget
          icon="⏰"
          label="Deadlines Soon"
          value={MOCK_STATS.upcomingDeadlines}
        />
        <StatsWidget
          icon="🎯"
          label="Avg Match"
          value={`${MOCK_STATS.avgMatchScore}%`}
        />
      </section>

      {/* ─── Recommended Hackathons ─── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>🔥</span>
            Recommended for You
          </h3>
          <span className={styles.viewAll}>View All →</span>
        </div>
        <div className={styles.hackathonScroll}>
          {recommended.map((h) => (
            <HackathonCard key={h.id} hackathon={h} />
          ))}
        </div>
      </section>

      {/* ─── Deadlines + HAC Tip (Two Column) ─── */}
      <section className={styles.twoColSection}>
        <div className={styles.twoColLeft}>
          <DeadlineWidget hackathons={MOCK_HACKATHONS} />
        </div>
        <div className={styles.twoColRight}>
          <HacTip />
        </div>
      </section>

      {/* ─── Recent Activity ─── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>📋</span>
            Recent Activity
          </h3>
        </div>
        <div className={styles.activityList}>
          {MOCK_ACTIVITY.map((activity) => (
            <div key={activity.id} className={styles.activityItem}>
              <div className={styles.activityDot}>
                <span className={styles.activityIcon}>
                  {ACTIVITY_ICONS[activity.type] || "📋"}
                </span>
              </div>
              <div className={styles.activityContent}>
                <span className={styles.activityTitle}>{activity.title}</span>
                <span className={styles.activityDesc}>
                  {activity.description}
                </span>
              </div>
              <span className={styles.activityTime}>
                {timeAgo(activity.timestamp)}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
