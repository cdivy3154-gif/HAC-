"use client";

import SkillTags from "./SkillTags";
import styles from "./ProfileCard.module.css";

/**
 * ProfileCard — Shield-framed avatar with user info display
 */
export default function ProfileCard({ profile, stats }) {
  const initials = (profile?.display_name || "H")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={styles.card}>
      {/* Shield Avatar */}
      <div className={styles.avatarSection}>
        <div className={styles.shieldFrame}>
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.display_name}
              className={styles.avatarImg}
            />
          ) : (
            <span className={styles.avatarFallback}>{initials}</span>
          )}
        </div>
        <div className={styles.statusDot} />
      </div>

      {/* Info */}
      <div className={styles.info}>
        <h2 className={styles.name}>{profile?.display_name || "Hacker"}</h2>
        {profile?.username && (
          <span className={styles.username}>@{profile.username}</span>
        )}
        {profile?.bio && (
          <p className={styles.bio}>{profile.bio}</p>
        )}
        <span className={styles.level}>
          {profile?.experience_level || "beginner"}
        </span>
      </div>

      {/* Stats */}
      {stats && (
        <div className={styles.statsGrid}>
          {stats.map((stat) => (
            <div key={stat.label} className={styles.statItem}>
              <span className={styles.statValue}>{stat.value}</span>
              <span className={styles.statLabel}>{stat.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      <div className={styles.skillsSection}>
        <span className={styles.sectionLabel}>SKILLS</span>
        <SkillTags skills={profile?.skills || []} readOnly />
      </div>

      {/* Interests */}
      {profile?.interests?.length > 0 && (
        <div className={styles.interestsSection}>
          <span className={styles.sectionLabel}>INTERESTS</span>
          <div className={styles.interestTags}>
            {profile.interests.map((i) => (
              <span key={i} className={styles.interestTag}>{i}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
