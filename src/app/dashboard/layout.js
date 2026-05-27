"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import ChatWidget from "@/components/ChatWidget";
import styles from "./layout.module.css";

/**
 * Dashboard Layout — Shared shell for all authenticated dashboard pages.
 * Renders the Sidebar + Navbar around {children}.
 */
export default function DashboardLayout({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    async function loadUser() {
      try {
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();

        if (!currentUser) {
          router.replace("/login");
          return;
        }

        setUser(currentUser);

        // Fetch profile data
        const { data: profileData } = await supabase
          .from("profiles")
          .select("display_name, avatar_url, username, experience_level, skills, interests")
          .eq("id", currentUser.id)
          .single();

        if (profileData) {
          setProfile(profileData);
        } else {
          // Use fallback from auth metadata
          setProfile({
            display_name:
              currentUser.user_metadata?.display_name ||
              currentUser.email?.split("@")[0] ||
              "Hacker",
          });
        }
      } catch (err) {
        console.error("[HAC] Dashboard layout error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loadingContent}>
          <div className={styles.loaderIcon}>🐴</div>
          <p className={styles.loadingText}>
            Loading HAC Dashboard...{" "}
            <span className={styles.blinkCursor}>█</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboardWrapper}>
      <Sidebar user={profile} />
      <div className={styles.mainArea}>
        <Navbar user={profile} />
        <main className={styles.content}>{children}</main>
      </div>
      <ChatWidget />
    </div>
  );
}
