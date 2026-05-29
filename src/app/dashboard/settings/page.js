"use client";

import { useState, useEffect } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import styles from "./page.module.css";

const NOTIFICATION_PREFS = [
  { key: "new_hackathon", label: "New hackathon matches", description: "Get notified when a hackathon matches your skills and interests" },
  { key: "team_invite", label: "Team invitations", description: "Someone invites you to join their team" },
  { key: "join_request", label: "Join requests", description: "Someone requests to join your team" },
  { key: "deadline_reminder", label: "Deadline reminders", description: "Upcoming registration and submission deadlines" },
  { key: "chat_message", label: "Chat messages", description: "New messages from HAC or team members" },
  { key: "weekly_digest", label: "Weekly digest", description: "Weekly summary of new hackathons and activity" },
];

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    new_hackathon: true,
    team_invite: true,
    join_request: true,
    deadline_reminder: true,
    chat_message: false,
    weekly_digest: true,
  });
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [saveToast, setSaveToast] = useState(false);

  function toggleNotif(key) {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleSave() {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  }

  return (
    <div className={styles.page}>
      {/* Toast */}
      {saveToast && (
        <div className={styles.toast}>✅ Settings saved successfully!</div>
      )}

      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            <span className={styles.titleIcon}>⚙️</span>
            Settings
          </h1>
          <p className={styles.subtitle}>
            <span className={styles.prompt}>&gt;_ </span>
            customize your HAC experience
          </p>
        </div>
      </div>

      <div className={styles.sections}>
        {/* ─── Appearance ──────────────────────── */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Appearance</h2>
            <p className={styles.sectionDesc}>Choose your preferred theme</p>
          </div>
          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>Theme</span>
              <span className={styles.settingHint}>Toggle between dark and light mode</span>
            </div>
            <ThemeToggle />
          </div>
        </section>

        {/* ─── Notifications ───────────────────── */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Notifications</h2>
            <p className={styles.sectionDesc}>Control what alerts you receive</p>
          </div>

          {/* Master email toggle */}
          <div className={`${styles.settingRow} ${styles.masterToggle}`}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>📧 Email Notifications</span>
              <span className={styles.settingHint}>Receive notifications via email</span>
            </div>
            <button
              className={`${styles.toggle} ${emailNotifs ? styles.toggleOn : ""}`}
              onClick={() => setEmailNotifs(!emailNotifs)}
            >
              <span className={styles.toggleThumb} />
            </button>
          </div>

          <div className={styles.notifList}>
            {NOTIFICATION_PREFS.map((pref) => (
              <div key={pref.key} className={styles.settingRow}>
                <div className={styles.settingInfo}>
                  <span className={styles.settingLabel}>{pref.label}</span>
                  <span className={styles.settingHint}>{pref.description}</span>
                </div>
                <button
                  className={`${styles.toggle} ${notifications[pref.key] ? styles.toggleOn : ""}`}
                  onClick={() => toggleNotif(pref.key)}
                >
                  <span className={styles.toggleThumb} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Account ─────────────────────────── */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Account</h2>
            <p className={styles.sectionDesc}>Manage your account settings</p>
          </div>

          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>Email</span>
              <span className={styles.settingHint}>cdivy3154@example.com</span>
            </div>
            <button className={styles.actionBtn}>Change</button>
          </div>

          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>Password</span>
              <span className={styles.settingHint}>Last changed 30 days ago</span>
            </div>
            <button className={styles.actionBtn}>Update</button>
          </div>

          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>Connected Accounts</span>
              <span className={styles.settingHint}>GitHub, Google</span>
            </div>
            <button className={styles.actionBtn}>Manage</button>
          </div>

          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>Export Data</span>
              <span className={styles.settingHint}>Download all your HAC data as JSON</span>
            </div>
            <button className={styles.actionBtn}>Export</button>
          </div>
        </section>

        {/* ─── Danger Zone ─────────────────────── */}
        <section className={`${styles.section} ${styles.dangerSection}`}>
          <div className={styles.sectionHeader}>
            <h2 className={`${styles.sectionTitle} ${styles.dangerTitle}`}>Danger Zone</h2>
            <p className={styles.sectionDesc}>Irreversible actions. Proceed with caution.</p>
          </div>

          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <span className={styles.settingLabel}>Delete Account</span>
              <span className={styles.settingHint}>Permanently remove your account and all data</span>
            </div>
            <button className={styles.dangerBtn}>Delete Account</button>
          </div>
        </section>

        {/* Save Button */}
        <div className={styles.saveRow}>
          <button className={styles.saveBtn} onClick={handleSave}>
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
