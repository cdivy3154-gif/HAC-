"use client";

import { useState } from "react";
import styles from "./HackathonCard.module.css";

const SOURCE_STYLES = {
  mlh: { className: "sourceMlh" },
  devpost: { className: "sourceDevpost" },
  unstop: { className: "sourceUnstop" },
  hackerearth: { className: "sourceHackerearth" },
};

function formatDateRange(start, end) {
  const s = new Date(start);
  const e = new Date(end);
  const opts = { month: "short", day: "numeric" };
  const startStr = s.toLocaleDateString("en-US", opts);
  const endStr = e.toLocaleDateString("en-US", { ...opts, year: "numeric" });
  return `${startStr} – ${endStr}`;
}

function getMatchColor(score) {
  if (score >= 80) return "matchHigh";
  if (score >= 60) return "matchMed";
  return "matchLow";
}

/**
 * HackathonCard — Glass card for a hackathon listing
 */
export default function HackathonCard({ hackathon }) {
  const [bookmarked, setBookmarked] = useState(false);

  const {
    title,
    organizer,
    source,
    location,
    is_online,
    start_date,
    end_date,
    prize_pool,
    tags = [],
    match_score,
    is_hac_pick,
  } = hackathon;

  const sourceStyle = SOURCE_STYLES[source] || SOURCE_STYLES.devpost;
  const displayTags = tags.slice(0, 3);
  const extraTags = tags.length - 3;

  return (
    <div className={styles.card}>
      {/* HAC's Pick Badge */}
      {is_hac_pick && (
        <div className={styles.hacPickBadge}>
          <span>🐴</span> HAC&apos;s Pick
        </div>
      )}

      {/* Header — Source + Mode */}
      <div className={styles.headerRow}>
        <span className={`${styles.sourceBadge} ${styles[sourceStyle.className]}`}>
          {source?.toUpperCase()}
        </span>
        <span className={`${styles.modeBadge} ${is_online ? styles.modeOnline : styles.modeOffline}`}>
          {is_online ? "🌐 Online" : "📍 In-Person"}
        </span>
      </div>

      {/* Title & Organizer */}
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.organizer}>by {organizer}</p>

      {/* Date */}
      <div className={styles.dateRow}>
        <span className={styles.dateIcon}>📅</span>
        <span className={styles.dateText}>
          {formatDateRange(start_date, end_date)}
        </span>
      </div>

      {/* Location */}
      {!is_online && (
        <div className={styles.locationRow}>
          <span className={styles.locationIcon}>📍</span>
          <span className={styles.locationText}>{location}</span>
        </div>
      )}

      {/* Tags */}
      <div className={styles.tagsRow}>
        {displayTags.map((tag) => (
          <span key={tag} className={styles.tag}>
            {tag}
          </span>
        ))}
        {extraTags > 0 && (
          <span className={styles.tagMore}>+{extraTags}</span>
        )}
      </div>

      {/* Footer — Prize + Match + Bookmark */}
      <div className={styles.footer}>
        <div className={styles.prizeSection}>
          <span className={styles.prizeLabel}>Prize</span>
          <span className={styles.prizeValue}>{prize_pool}</span>
        </div>

        <div className={styles.footerRight}>
          {/* Match Score */}
          <span className={`${styles.matchBadge} ${styles[getMatchColor(match_score)]}`}>
            {match_score}%
          </span>

          {/* Bookmark */}
          <button
            className={`${styles.bookmarkBtn} ${bookmarked ? styles.bookmarked : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              setBookmarked(!bookmarked);
            }}
            aria-label={bookmarked ? "Remove bookmark" : "Bookmark this hackathon"}
          >
            {bookmarked ? "★" : "☆"}
          </button>
        </div>
      </div>
    </div>
  );
}
