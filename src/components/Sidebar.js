"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import styles from "./Sidebar.module.css";

const NAV_ITEMS = [
  { icon: "🏠", label: "Dashboard", href: "/dashboard", enabled: true },
  { icon: "🔍", label: "Hackathons", href: "/dashboard/hackathons", enabled: false },
  { icon: "👥", label: "Teams", href: "/dashboard/teams", enabled: false },
  { icon: "💬", label: "Chat", href: "/dashboard/chat", enabled: false },
  { icon: "📅", label: "Calendar", href: "/dashboard/calendar", enabled: false },
];

const SECONDARY_ITEMS = [
  { icon: "👤", label: "Profile", href: "/dashboard/profile", enabled: false },
  { icon: "⚙️", label: "Settings", href: "/dashboard/settings", enabled: false },
  { icon: "🔔", label: "Notifications", href: "/dashboard/notifications", enabled: false },
];

export default function Sidebar({ user }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    const saved = localStorage.getItem("hac-sidebar-collapsed");
    if (saved === "true") setCollapsed(true);
  }, []);

  function toggleCollapse() {
    setCollapsed((prev) => {
      localStorage.setItem("hac-sidebar-collapsed", String(!prev));
      return !prev;
    });
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  function isActive(href) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  function renderNavItem(item) {
    const active = isActive(item.href);

    if (!item.enabled) {
      return (
        <div
          key={item.href}
          className={`${styles.navItem} ${styles.navItemDisabled}`}
          title={collapsed ? `${item.label} (Coming Soon)` : undefined}
        >
          <span className={styles.navIcon}>{item.icon}</span>
          {!collapsed && (
            <>
              <span className={styles.navLabel}>{item.label}</span>
              <span className={styles.lockIcon}>🔒</span>
            </>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.href}
        href={item.href}
        className={`${styles.navItem} ${active ? styles.navItemActive : ""}`}
        title={collapsed ? item.label : undefined}
      >
        <span className={styles.navIcon}>{item.icon}</span>
        {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
        {active && <span className={styles.activeIndicator} />}
      </Link>
    );
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}>
        {/* Logo */}
        <div className={styles.logoSection}>
          <div className={styles.logoWrapper}>
            <img
              src="/hac-logo.png"
              alt="HAC"
              className={styles.logoImg}
              width={collapsed ? 36 : 42}
              height={collapsed ? 36 : 42}
            />
            {!collapsed && <span className={styles.logoText}>HAC</span>}
          </div>
          <button
            className={styles.collapseBtn}
            onClick={toggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={collapsed ? styles.collapseIconRotated : ""}
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        </div>

        {/* Primary Nav */}
        <nav className={styles.navSection}>
          <div className={styles.navGroup}>
            {!collapsed && <span className={styles.navGroupLabel}>MAIN</span>}
            {NAV_ITEMS.map(renderNavItem)}
          </div>

          <div className={styles.divider} />

          <div className={styles.navGroup}>
            {!collapsed && <span className={styles.navGroupLabel}>ACCOUNT</span>}
            {SECONDARY_ITEMS.map(renderNavItem)}
          </div>
        </nav>

        {/* User Section */}
        <div className={styles.userSection}>
          <div className={styles.divider} />
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="" width={36} height={36} />
              ) : (
                <span className={styles.avatarFallback}>
                  {(user?.display_name || "H")[0].toUpperCase()}
                </span>
              )}
              <span className={styles.onlineDot} />
            </div>
            {!collapsed && (
              <div className={styles.userMeta}>
                <span className={styles.userName}>
                  {user?.display_name || "Hacker"}
                </span>
                <button className={styles.logoutBtn} onClick={handleLogout}>
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className={styles.bottomNav}>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          if (!item.enabled) {
            return (
              <div
                key={item.href}
                className={`${styles.bottomNavItem} ${styles.bottomNavDisabled}`}
              >
                <span className={styles.bottomNavIcon}>{item.icon}</span>
                <span className={styles.bottomNavLabel}>{item.label}</span>
              </div>
            );
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.bottomNavItem} ${active ? styles.bottomNavActive : ""}`}
            >
              <span className={styles.bottomNavIcon}>{item.icon}</span>
              <span className={styles.bottomNavLabel}>{item.label}</span>
              {active && <span className={styles.bottomNavDot} />}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
