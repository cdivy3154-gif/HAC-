"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import ChatBubble from "@/components/ChatBubble";
import ChatInput from "@/components/ChatInput";
import HacAvatar from "@/components/HacAvatar";
import styles from "./page.module.css";

// Code rain decorative chars for the onboarding background
const ONBOARDING_CHARS = [
  "🐴", "HAC", "const", "let", "process", "resolve", "[]", "{}", "()",
  "React", "Supabase", "OpenRouter", "AI_Match", "hacker", "status", "execute"
];

function generateRainCols(count) {
  const columns = [];
  for (let i = 0; i < count; i++) {
    columns.push({
      id: i,
      left: `${(i / count) * 100 + Math.random() * 2}%`,
      duration: `${10 + Math.random() * 15}s`,
      delay: `${-Math.random() * 10}s`,
      chars: Array.from(
        { length: 5 + Math.floor(Math.random() * 5) },
        () => ONBOARDING_CHARS[Math.floor(Math.random() * ONBOARDING_CHARS.length)]
      ).join(" "),
    });
  }
  return columns;
}

export default function OnboardingPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [profile, setProfile] = useState({});
  const [progress, setProgress] = useState(0);
  const [codeRain, setCodeRain] = useState([]);
  const [user, setUser] = useState(null);

  const chatEndRef = useRef(null);
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  // Generate rain columns once on mount
  useEffect(() => {
    setCodeRain(generateRainCols(12));
  }, []);

  // 1. Authenticate user & Redirect if already onboarded
  useEffect(() => {
    async function checkAuth() {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) {
        // Not authed -> go to login
        router.replace("/login");
        return;
      }
      setUser(currentUser);

      // Check if user has already completed onboarding
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", currentUser.id)
        .single();

      if (profile?.onboarding_completed) {
        // Already completed onboarding -> go to dashboard
        router.replace("/dashboard");
        return;
      }

      // Load initial chat history
      await loadHistory();
    }
    checkAuth();
  }, []);

  // Load chat messages from backend
  async function loadHistory() {
    try {
      const response = await fetch("/api/onboarding/chat");
      const data = await response.json();
      
      if (response.ok) {
        setMessages(data.messages || []);
        // Compute initial progress from last stored metadata if available
        const lastAssistantMsg = [...(data.messages || [])]
          .reverse()
          .find(m => m.role === "assistant");
        
        // Check if metadata exists on assistant message
        if (lastAssistantMsg?.metadata) {
          updateProgress(lastAssistantMsg.metadata);
        }
      }
    } catch (err) {
      console.error("[HAC] Failed to load chat history:", err);
    } finally {
      setLoading(false);
    }
  }

  // Calculate profile onboarding completion percentage
  function updateProgress(extractedProfile) {
    if (!extractedProfile) return;
    setProfile(extractedProfile);

    let filledCount = 0;
    const fields = [
      "display_name",
      "experience_level",
      "skills",
      "interests",
      "travel_willingness",
      "team_preference"
    ];

    fields.forEach(field => {
      const val = extractedProfile[field];
      if (val !== undefined && val !== null) {
        if (Array.isArray(val)) {
          if (val.length > 0) filledCount++;
        } else {
          filledCount++;
        }
      }
    });

    const percent = Math.round((filledCount / fields.length) * 100);
    setProgress(percent);
  }

  // Scroll to bottom when message log updates or sending status changes
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  // Send message handler
  async function handleSendMessage(messageText) {
    if (sending) return;

    // Append user message locally
    const newUserMessage = { role: "user", content: messageText };
    setMessages(prev => [...prev, newUserMessage]);
    setSending(true);

    try {
      const response = await fetch("/api/onboarding/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageText }),
      });

      const data = await response.json();

      if (response.ok) {
        // Append HAC's reply
        setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
        
        // Update profile extraction progress
        if (data.extracted_profile) {
          updateProgress(data.extracted_profile);
        }

        // If onboarding is finished, route to dashboard after a delay
        if (data.onboarding_completed) {
          setTimeout(() => {
            router.push("/dashboard");
          }, 3500); // Give user time to read HAC's final success prompt
        }
      } else {
        setMessages(prev => [
          ...prev,
          { 
            role: "assistant", 
            content: `Neigh! Something went wrong on the server: ${data.error || "Unknown Error"}` 
          }
        ]);
      }
    } catch (err) {
      console.error("[HAC] Send message error:", err);
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "Neigh! Connection timed out. Try sending that again." }
      ]);
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loaderIcon}>🐴</div>
        <p className={styles.loadingText}>Initializing HAC connection... █</p>
      </div>
    );
  }

  return (
    <main className={styles.onboardingPage}>
      {/* Code Rain Background */}
      <div className={styles.codeRain} aria-hidden="true">
        {codeRain.map((col) => (
          <span
            key={col.id}
            className={styles.codeRainCol}
            style={{
              left: col.left,
              animationDuration: col.duration,
              animationDelay: col.delay,
            }}
          >
            {col.chars}
          </span>
        ))}
      </div>

      {/* ─── Onboarding Header ─── */}
      <header className={styles.header}>
        <div className={styles.headerMascot}>
          <HacAvatar size={44} pulse={true} />
          <span className={styles.headerTitle}>HAC Onboarding</span>
        </div>

        {/* Shield and Progress bar */}
        <div className={styles.progressContainer}>
          <div className={styles.progressLabel}>
            <span className={styles.shieldIcon}>🛡️</span>
            <span className={styles.progressText}>PROFILE MATCH: {progress}%</span>
          </div>
          <div className={styles.progressBarWrapper}>
            <div 
              className={styles.progressBar} 
              style={{ width: `${progress}%` }} 
            />
          </div>
        </div>
      </header>

      {/* ─── Chat Log Container ─── */}
      <section className={styles.chatLogSection}>
        <div className={styles.messagesContainer}>
          {messages.map((msg, idx) => (
            <ChatBubble 
              key={idx} 
              role={msg.role} 
              content={msg.content} 
            />
          ))}

          {/* Typing Indicator */}
          {sending && (
            <div className={styles.typingIndicator}>
              <HacAvatar size={30} pulse={true} />
              <div className={styles.typingText}>
                HAC is analyzing... <span className={styles.blinkingCursor}>█</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </section>

      {/* ─── Footer Chat Input ─── */}
      <footer className={styles.footerInputSection}>
        <div className={styles.inputConstraint}>
          <ChatInput 
            onSend={handleSendMessage} 
            disabled={sending || progress >= 100} 
          />
        </div>
      </footer>
    </main>
  );
}
