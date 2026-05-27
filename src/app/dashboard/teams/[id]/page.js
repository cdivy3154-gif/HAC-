"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { MOCK_TEAMS } from "@/lib/mockData";
import styles from "./page.module.css";

export default function TeamDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [joinRequested, setJoinRequested] = useState(false);

  const team = MOCK_TEAMS.find((t) => t.id === id);

  if (!team) {
    return (
      <div className={styles.notFound}>
        <span className={styles.notFoundIcon}>👥</span>
        <h2>Team not found</h2>
        <p>This team may have been dissolved or the link is incorrect.</p>
        <Link href="/dashboard/teams" className={styles.backLink}>
          ← Back to Teams
        </Link>
      </div>
    );
  }

  const leader = team.members.find((m) => m.role === "leader");
  const spotsLeft = team.max_members - team.members.length;
  const isFull = spotsLeft <= 0;

  function handleJoin() {
    setJoinRequested(true);
  }

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
        <div className={styles.heroTop}>
          <div className={styles.heroLeft}>
            <span className={`${styles.statusBadge} ${team.is_open ? styles.open : styles.closed}`}>
              {team.is_open ? (isFull ? "Full" : "Open") : "Closed"}
            </span>
            <h1 className={styles.teamName}>{team.name}</h1>
            <Link href={`/dashboard/hackathons/${team.hackathon_id}`} className={styles.hackathonTag}>
              🏆 {team.hackathon_title}
            </Link>
          </div>
          <div className={styles.heroRight}>
            <div className={styles.memberCount}>
              <span className={styles.countValue}>{team.members.length}</span>
              <span className={styles.countSep}>/</span>
              <span className={styles.countMax}>{team.max_members}</span>
            </div>
            <span className={styles.countLabel}>members</span>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className={styles.contentGrid}>
        {/* Left Column */}
        <div className={styles.leftCol}>
          {/* Description */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>About</h2>
            <p className={styles.description}>{team.description}</p>
          </section>

          {/* Looking For */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Looking For</h2>
            <div className={styles.skillTags}>
              {team.looking_for.map((skill) => (
                <span key={skill} className={styles.skillTag}>{skill}</span>
              ))}
            </div>
            {spotsLeft > 0 && (
              <p className={styles.spotsText}>
                {spotsLeft} spot{spotsLeft !== 1 ? "s" : ""} remaining
              </p>
            )}
          </section>
        </div>

        {/* Right Column */}
        <aside className={styles.rightCol}>
          {/* Members Card */}
          <div className={styles.membersCard}>
            <h3 className={styles.cardTitle}>Team Members</h3>
            <div className={styles.membersList}>
              {team.members.map((member) => (
                <div key={member.id} className={styles.memberRow}>
                  <div className={styles.memberAvatar}>
                    {member.name[0].toUpperCase()}
                  </div>
                  <div className={styles.memberInfo}>
                    <span className={styles.memberName}>
                      {member.name}
                      {member.role === "leader" && (
                        <span className={styles.crownBadge}>👑 Leader</span>
                      )}
                    </span>
                  </div>
                </div>
              ))}
              {/* Empty spots */}
              {Array.from({ length: spotsLeft }).map((_, i) => (
                <div key={`empty-${i}`} className={`${styles.memberRow} ${styles.emptyRow}`}>
                  <div className={styles.emptyAvatar}>+</div>
                  <span className={styles.emptyLabel}>Open spot</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className={styles.actionsCard}>
            {team.is_open && !isFull && !joinRequested && (
              <button className={styles.joinBtn} onClick={handleJoin}>
                Request to Join →
              </button>
            )}
            {joinRequested && (
              <div className={styles.joinedMsg}>
                ✅ Request sent! The team leader will review your profile.
              </div>
            )}
            {isFull && (
              <div className={styles.fullMsg}>
                This team is full. Check back later or browse other teams.
              </div>
            )}
            {!team.is_open && (
              <div className={styles.closedMsg}>
                This team is no longer accepting members.
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
