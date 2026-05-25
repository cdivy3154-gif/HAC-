"use client";

import { useState, useEffect } from "react";
import styles from "./DeadlineWidget.module.css";

function getCountdown(deadline) {
  const now = Date.now();
  const target = new Date(deadline).getTime();
  const diff = target - now;

  if (diff <= 0) return { text: "Ended", urgency: "ended" };

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  let urgency = "safe";    // green
  if (days < 1) urgency = "critical";  // red
  else if (days < 3) urgency = "warning";  // gold

  return {
    text: `${days}d ${hours}h ${minutes}m`,
    urgency,
    days,
  };
}

/**
 * DeadlineWidget — Upcoming hackathon deadlines with live countdown
 */
export default function DeadlineWidget({ hackathons = [] }) {
  const [, setTick] = useState(0);

  // Tick every 60s to update countdowns
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  // Filter hackathons with future deadlines, sort by nearest
  const deadlines = hackathons
    .filter((h) => h.registration_deadline && new Date(h.registration_deadline) > new Date())
    .sort((a, b) => new Date(a.registration_deadline) - new Date(b.registration_deadline))
    .slice(0, 5);

  return (
    <div className={styles.widget}>
      <div className={styles.header}>
        <span className={styles.headerIcon}>⏰</span>
        <h3 className={styles.headerTitle}>Upcoming Deadlines</h3>
      </div>

      {deadlines.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>🐴</span>
          <p className={styles.emptyText}>
            No upcoming deadlines. HAC is scouting for more!
          </p>
        </div>
      ) : (
        <ul className={styles.list}>
          {deadlines.map((h) => {
            const countdown = getCountdown(h.registration_deadline);
            return (
              <li key={h.id} className={styles.item}>
                <div className={styles.itemLeft}>
                  <span className={`${styles.urgencyDot} ${styles[countdown.urgency]}`} />
                  <div className={styles.itemInfo}>
                    <span className={styles.itemTitle}>{h.title}</span>
                    <span className={styles.itemDeadline}>
                      Reg. closes: {new Date(h.registration_deadline).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
                <div className={`${styles.countdown} ${styles[countdown.urgency]}`}>
                  {countdown.text}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
