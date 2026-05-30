"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { getMockNotifications, getNotifStyle, timeAgo, NOTIF_TYPES, PRIORITY } from "@/lib/notifications";
import styles from "./page.module.css";

const FILTER_TABS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: NOTIF_TYPES.HACKATHON_MATCH, label: "🏆 Hackathons" },
  { key: NOTIF_TYPES.TEAM_INVITE, label: "👥 Teams" },
  { key: NOTIF_TYPES.JOIN_REQUEST, label: "🙋 Requests" },
  { key: NOTIF_TYPES.DEADLINE, label: "⏰ Deadlines" },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(getMockNotifications());
  const [activeFilter, setActiveFilter] = useState("all");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered = useMemo(() => {
    if (activeFilter === "all") return notifications;
    if (activeFilter === "unread") return notifications.filter((n) => !n.read);
    return notifications.filter((n) => n.type === activeFilter);
  }, [notifications, activeFilter]);

  function markAsRead(id) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function deleteNotif(id) {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  function clearAll() {
    setNotifications([]);
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>
            <span className={styles.titleIcon}>🔔</span>
            Notifications
            {unreadCount > 0 && (
              <span className={styles.unreadBadge}>{unreadCount}</span>
            )}
          </h1>
          <p className={styles.subtitle}>
            <span className={styles.prompt}>&gt;_ </span>
            stay in the loop
          </p>
        </div>
        <div className={styles.headerActions}>
          {unreadCount > 0 && (
            <button className={styles.markAllBtn} onClick={markAllRead}>
              ✓ Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button className={styles.clearBtn} onClick={clearAll}>
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className={styles.filterBar}>
        {FILTER_TABS.map((tab) => {
          const count =
            tab.key === "all"
              ? notifications.length
              : tab.key === "unread"
              ? unreadCount
              : notifications.filter((n) => n.type === tab.key).length;

          return (
            <button
              key={tab.key}
              className={`${styles.filterTab} ${activeFilter === tab.key ? styles.filterActive : ""}`}
              onClick={() => setActiveFilter(tab.key)}
            >
              {tab.label}
              {count > 0 && <span className={styles.filterCount}>{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Notification List */}
      {filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>🔕</span>
          <h3 className={styles.emptyTitle}>
            {activeFilter === "all" ? "No notifications" : "Nothing here"}
          </h3>
          <p className={styles.emptyText}>
            {activeFilter === "unread"
              ? "You're all caught up! 🎉"
              : "Check back later for updates."}
          </p>
        </div>
      ) : (
        <div className={styles.notifList}>
          {filtered.map((notif) => {
            const style = getNotifStyle(notif.type);
            const isUrgent = notif.priority === PRIORITY.URGENT;

            return (
              <div
                key={notif.id}
                className={`${styles.notifCard} ${!notif.read ? styles.unread : ""} ${isUrgent ? styles.urgent : ""}`}
              >
                {/* Unread indicator */}
                {!notif.read && <span className={styles.unreadDot} />}

                {/* Icon */}
                <div className={`${styles.notifIcon} ${styles[`icon_${style.color}`]}`}>
                  {style.icon}
                </div>

                {/* Content */}
                <div className={styles.notifContent}>
                  <div className={styles.notifHeader}>
                    <span className={styles.notifType}>{style.label}</span>
                    {isUrgent && <span className={styles.urgentBadge}>URGENT</span>}
                    <span className={styles.notifTime}>{timeAgo(notif.created_at)}</span>
                  </div>
                  <h4 className={styles.notifTitle}>{notif.title}</h4>
                  <p className={styles.notifMessage}>{notif.message}</p>
                  <div className={styles.notifActions}>
                    {notif.action_url && (
                      <Link href={notif.action_url} className={styles.viewBtn}>
                        View →
                      </Link>
                    )}
                    {!notif.read && (
                      <button
                        className={styles.readBtn}
                        onClick={() => markAsRead(notif.id)}
                      >
                        Mark read
                      </button>
                    )}
                    <button
                      className={styles.deleteBtn}
                      onClick={() => deleteNotif(notif.id)}
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
