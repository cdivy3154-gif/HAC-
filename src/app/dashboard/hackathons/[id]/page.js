"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { MOCK_HACKATHONS } from "@/lib/mockData";
import styles from "./page.module.css";

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateRange(start, end) {
  return `${formatDate(start)} — ${formatDate(end)}`;
}

function getMatchColor(score) {
  if (score >= 80) return styles.matchHigh;
  if (score >= 60) return styles.matchMed;
  return styles.matchLow;
}

function getDifficultyLabel(d) {
  const map = { beginner: "🟢 Beginner", intermediate: "🟡 Intermediate", advanced: "🔴 Advanced", all: "🔵 All Levels" };
  return map[d] || d;
}

const SOURCE_LABELS = { mlh: "Major League Hacking", devpost: "Devpost", unstop: "Unstop", hackerearth: "HackerEarth" };

export default function HackathonDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [bookmarked, setBookmarked] = useState(false);

  const hackathon = MOCK_HACKATHONS.find((h) => h.id === id);

  if (!hackathon) {
    return (
      <div className={styles.notFound}>
        <span className={styles.notFoundIcon}>🐴</span>
        <h2>Hackathon not found</h2>
        <p>This hackathon may have been removed or the link is incorrect.</p>
        <Link href="/dashboard/hackathons" className={styles.backLink}>
          ← Back to Hackathons
        </Link>
      </div>
    );
  }

  const {
    title, organizer, source, description, location, is_online,
    start_date, end_date, registration_deadline, prize_pool,
    tags, difficulty, team_size_min, team_size_max, match_score,
    is_hac_pick, registration_url, source_url,
  } = hackathon;

  return (
    <div className={styles.page}>
      {/* Back Button */}
      <button className={styles.backBtn} onClick={() => router.back()}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back
      </button>

      {/* Hero */}
      <div className={styles.hero}>
        {is_hac_pick && (
          <div className={styles.hacPickBanner}>🐴 HAC&apos;s Pick — Top match for your profile!</div>
        )}
        <div className={styles.heroContent}>
          <div className={styles.heroLeft}>
            <div className={styles.badges}>
              <span className={`${styles.sourceBadge} ${styles[`source_${source}`]}`}>
                {source?.toUpperCase()}
              </span>
              <span className={`${styles.modeBadge} ${is_online ? styles.online : styles.offline}`}>
                {is_online ? "🌐 Online" : "📍 In-Person"}
              </span>
              <span className={styles.diffBadge}>{getDifficultyLabel(difficulty)}</span>
            </div>
            <h1 className={styles.title}>{title}</h1>
            <p className={styles.organizer}>by {organizer} • via {SOURCE_LABELS[source] || source}</p>
          </div>
          <div className={styles.heroRight}>
            <div className={`${styles.matchCircle} ${getMatchColor(match_score)}`}>
              <span className={styles.matchValue}>{match_score}%</span>
              <span className={styles.matchLabel}>match</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.contentGrid}>
        {/* Left Column */}
        <div className={styles.leftCol}>
          {/* Description */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>About</h2>
            <p className={styles.description}>{description}</p>
          </section>

          {/* Tags */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Skills & Topics</h2>
            <div className={styles.tags}>
              {tags.map((tag) => (
                <span key={tag} className={styles.tag}>{tag}</span>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column — Details Card */}
        <aside className={styles.rightCol}>
          <div className={styles.detailCard}>
            <h3 className={styles.detailTitle}>Details</h3>

            <div className={styles.detailRow}>
              <span className={styles.detailIcon}>📅</span>
              <div className={styles.detailContent}>
                <span className={styles.detailLabel}>Event Dates</span>
                <span className={styles.detailValue}>{formatDateRange(start_date, end_date)}</span>
              </div>
            </div>

            <div className={styles.detailRow}>
              <span className={styles.detailIcon}>⏰</span>
              <div className={styles.detailContent}>
                <span className={styles.detailLabel}>Registration Deadline</span>
                <span className={styles.detailValue}>{formatDate(registration_deadline)}</span>
              </div>
            </div>

            {!is_online && (
              <div className={styles.detailRow}>
                <span className={styles.detailIcon}>📍</span>
                <div className={styles.detailContent}>
                  <span className={styles.detailLabel}>Location</span>
                  <span className={styles.detailValue}>{location}</span>
                </div>
              </div>
            )}

            <div className={styles.detailRow}>
              <span className={styles.detailIcon}>💰</span>
              <div className={styles.detailContent}>
                <span className={styles.detailLabel}>Prize Pool</span>
                <span className={`${styles.detailValue} ${styles.prizeValue}`}>{prize_pool}</span>
              </div>
            </div>

            <div className={styles.detailRow}>
              <span className={styles.detailIcon}>👥</span>
              <div className={styles.detailContent}>
                <span className={styles.detailLabel}>Team Size</span>
                <span className={styles.detailValue}>
                  {team_size_min === team_size_max ? `${team_size_min} members` : `${team_size_min}–${team_size_max} members`}
                </span>
              </div>
            </div>

            <div className={styles.detailDivider} />

            {/* Actions */}
            <a
              href={registration_url || source_url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.registerBtn}
            >
              Register Now →
            </a>

            <button
              className={`${styles.bookmarkBtn} ${bookmarked ? styles.bookmarked : ""}`}
              onClick={() => setBookmarked(!bookmarked)}
            >
              {bookmarked ? "★ Bookmarked" : "☆ Bookmark"}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
