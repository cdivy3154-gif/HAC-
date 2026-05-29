"use client";

import { useState } from "react";
import ProfileCard from "@/components/ProfileCard";
import SkillTags from "@/components/SkillTags";
import styles from "./page.module.css";

// Mock profile data
const MOCK_PROFILE = {
  display_name: "Divyansh Chauhan",
  username: "cdivy3154",
  bio: "Full-stack developer who lives for hackathons. I ship fast, break things, and drink too much coffee. Currently obsessed with AI and Web3.",
  avatar_url: null,
  experience_level: "intermediate",
  skills: ["React", "Next.js", "Node.js", "Python", "TypeScript", "Firebase"],
  interests: ["AI/ML", "Web3", "Open Source", "DevTools", "Hackathons"],
  email: "cdivy3154@example.com",
  github: "cdivy3154-gif",
  linkedin: "",
  portfolio: "",
  joined: "2025-08-15T00:00:00Z",
};

const MOCK_STATS = [
  { label: "Hackathons", value: "7" },
  { label: "Teams", value: "3" },
  { label: "Wins", value: "1" },
  { label: "Projects", value: "12" },
];

export default function ProfilePage() {
  const [profile, setProfile] = useState(MOCK_PROFILE);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(MOCK_PROFILE);
  const [saveToast, setSaveToast] = useState(false);

  function handleEdit() {
    setDraft({ ...profile });
    setEditing(true);
  }

  function handleCancel() {
    setEditing(false);
  }

  function handleSave() {
    setProfile({ ...draft });
    setEditing(false);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  }

  function updateDraft(key, value) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className={styles.page}>
      {/* Toast */}
      {saveToast && (
        <div className={styles.toast}>
          ✅ Profile updated successfully!
        </div>
      )}

      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            <span className={styles.titleIcon}>👤</span>
            Profile
          </h1>
          <p className={styles.subtitle}>
            <span className={styles.prompt}>&gt;_ </span>
            your hacker identity
          </p>
        </div>
        {!editing ? (
          <button className={styles.editBtn} onClick={handleEdit}>
            ✏️ Edit Profile
          </button>
        ) : (
          <div className={styles.editActions}>
            <button className={styles.cancelBtn} onClick={handleCancel}>Cancel</button>
            <button className={styles.saveBtn} onClick={handleSave}>Save Changes</button>
          </div>
        )}
      </div>

      <div className={styles.contentGrid}>
        {/* Left: Profile Card */}
        <div className={styles.leftCol}>
          <ProfileCard profile={profile} stats={MOCK_STATS} />
        </div>

        {/* Right: Edit / Details */}
        <div className={styles.rightCol}>
          {editing ? (
            /* ─── Edit Mode ──────────────────────── */
            <div className={styles.editForm}>
              <h3 className={styles.sectionTitle}>Edit Profile</h3>

              <div className={styles.field}>
                <label className={styles.label}>DISPLAY NAME</label>
                <input
                  type="text"
                  className={styles.input}
                  value={draft.display_name}
                  onChange={(e) => updateDraft("display_name", e.target.value)}
                  maxLength={40}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>USERNAME</label>
                <div className={styles.inputPrefix}>
                  <span className={styles.prefix}>@</span>
                  <input
                    type="text"
                    className={styles.inputWithPrefix}
                    value={draft.username}
                    onChange={(e) => updateDraft("username", e.target.value)}
                    maxLength={20}
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>BIO</label>
                <textarea
                  className={styles.textarea}
                  value={draft.bio}
                  onChange={(e) => updateDraft("bio", e.target.value)}
                  rows={3}
                  maxLength={200}
                />
                <span className={styles.charCount}>{draft.bio.length}/200</span>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>EXPERIENCE LEVEL</label>
                <div className={styles.levelSelector}>
                  {["beginner", "intermediate", "veteran"].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      className={`${styles.levelBtn} ${draft.experience_level === lvl ? styles.levelActive : ""}`}
                      onClick={() => updateDraft("experience_level", lvl)}
                    >
                      {lvl === "beginner" ? "🌱" : lvl === "intermediate" ? "⚡" : "🔥"} {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>SKILLS</label>
                <SkillTags
                  skills={draft.skills}
                  onChange={(skills) => updateDraft("skills", skills)}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>GITHUB</label>
                <input
                  type="text"
                  className={styles.input}
                  value={draft.github}
                  onChange={(e) => updateDraft("github", e.target.value)}
                  placeholder="github username"
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>LINKEDIN</label>
                <input
                  type="text"
                  className={styles.input}
                  value={draft.linkedin}
                  onChange={(e) => updateDraft("linkedin", e.target.value)}
                  placeholder="linkedin.com/in/..."
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>PORTFOLIO</label>
                <input
                  type="text"
                  className={styles.input}
                  value={draft.portfolio}
                  onChange={(e) => updateDraft("portfolio", e.target.value)}
                  placeholder="your-portfolio.dev"
                />
              </div>
            </div>
          ) : (
            /* ─── View Mode ──────────────────────── */
            <div className={styles.detailsCard}>
              <h3 className={styles.sectionTitle}>Details</h3>

              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Email</span>
                <span className={styles.detailValue}>{profile.email}</span>
              </div>

              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>GitHub</span>
                <span className={`${styles.detailValue} ${styles.linkValue}`}>
                  {profile.github || "—"}
                </span>
              </div>

              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>LinkedIn</span>
                <span className={styles.detailValue}>
                  {profile.linkedin || "—"}
                </span>
              </div>

              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Portfolio</span>
                <span className={styles.detailValue}>
                  {profile.portfolio || "—"}
                </span>
              </div>

              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Member Since</span>
                <span className={styles.detailValue}>
                  {new Date(profile.joined).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
