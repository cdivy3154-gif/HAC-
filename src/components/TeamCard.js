"use client";

import styles from "./TeamCard.module.css";

/**
 * TeamCard — Glass card for team browsing
 * Shows team name, hackathon, members, looking_for skills, join button
 */
export default function TeamCard({ team, onJoinClick }) {
  const leader = team.members.find((m) => m.role === "leader");
  const spotsLeft = team.max_members - team.members.length;
  const isFull = spotsLeft <= 0;

  return (
    <div className={`${styles.card} ${!team.is_open ? styles.closed : ""}`}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h3 className={styles.teamName}>{team.name}</h3>
          <span className={styles.hackathonLink}>{team.hackathon_title}</span>
        </div>
        <span className={`${styles.statusBadge} ${team.is_open ? styles.open : styles.full}`}>
          {team.is_open ? (isFull ? "Full" : "Open") : "Closed"}
        </span>
      </div>

      {/* Description */}
      <p className={styles.description}>{team.description}</p>

      {/* Members Row */}
      <div className={styles.membersSection}>
        <span className={styles.sectionLabel}>MEMBERS ({team.members.length}/{team.max_members})</span>
        <div className={styles.membersRow}>
          {team.members.map((member) => (
            <div key={member.id} className={styles.memberChip} title={member.name}>
              <span className={styles.memberAvatar}>
                {member.avatar ? (
                  <img src={member.avatar} alt="" width={24} height={24} />
                ) : (
                  member.name[0].toUpperCase()
                )}
              </span>
              {member.role === "leader" && <span className={styles.crownIcon}>👑</span>}
              <span className={styles.memberName}>{member.name.split(" ")[0]}</span>
            </div>
          ))}
          {/* Empty spots */}
          {Array.from({ length: spotsLeft }).map((_, i) => (
            <div key={`empty-${i}`} className={styles.emptySpot}>
              <span className={styles.emptyDot}>+</span>
            </div>
          ))}
        </div>
      </div>

      {/* Looking For */}
      <div className={styles.lookingFor}>
        <span className={styles.sectionLabel}>LOOKING FOR</span>
        <div className={styles.skillTags}>
          {team.looking_for.map((skill) => (
            <span key={skill} className={styles.skillTag}>{skill}</span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <span className={styles.createdBy}>
          Created by {leader?.name || "Unknown"}
        </span>
        {team.is_open && !isFull && (
          <button
            className={styles.joinBtn}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onJoinClick?.(team);
            }}
          >
            Request to Join →
          </button>
        )}
        {isFull && team.is_open && (
          <span className={styles.fullLabel}>Team Full</span>
        )}
      </div>
    </div>
  );
}
