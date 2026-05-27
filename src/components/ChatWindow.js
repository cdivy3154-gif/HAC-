"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import ChatBubble from "./ChatBubble";
import ChatInput from "./ChatInput";
import styles from "./ChatWindow.module.css";

/**
 * ChatWindow — Reusable terminal-style chat interface
 *
 * @param {Object} props
 * @param {string} props.apiEndpoint — API route for chat ('/api/chat' or '/api/onboarding/chat')
 * @param {boolean} [props.compact] — Compact mode for widget popup
 * @param {string} [props.className] — Additional CSS class
 */
export default function ChatWindow({ apiEndpoint = "/api/chat", compact = false, className = "" }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);

  // Load chat history
  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch(apiEndpoint);
        if (!res.ok) throw new Error("Failed to load chat");
        const data = await res.json();
        setMessages(data.messages || []);
      } catch (err) {
        // If API fails (not logged in, etc.), show a default greeting
        setMessages([
          {
            role: "assistant",
            content:
              "Yo! HAC here 🐴 I'd love to chat but it looks like you need to log in first. Can't dish out hackathon wisdom to strangers, y'know? 😏",
          },
        ]);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, [apiEndpoint]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sending]);

  // Send message
  const handleSend = useCallback(
    async (text) => {
      if (!text.trim() || sending) return;

      setError(null);
      const userMessage = { role: "user", content: text.trim() };
      setMessages((prev) => [...prev, userMessage]);
      setSending(true);

      try {
        const res = await fetch(apiEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text.trim() }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to send message");
        }

        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply },
        ]);
      } catch (err) {
        setError(err.message);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Neigh! Something went wrong: "${err.message}". Try again? 🐴`,
          },
        ]);
      } finally {
        setSending(false);
      }
    },
    [apiEndpoint, sending]
  );

  return (
    <div className={`${styles.chatWindow} ${compact ? styles.compact : ""} ${className}`}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <span className={styles.statusDot} />
          <span className={styles.headerTitle}>HAC Terminal</span>
        </div>
        <span className={styles.headerMeta}>
          {messages.length} msg{messages.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Messages */}
      <div className={styles.messagesArea} ref={scrollRef}>
        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.loadingDots}>
              <span>.</span><span>.</span><span>.</span>
            </div>
            <span>Connecting to HAC...</span>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <ChatBubble key={i} role={msg.role} content={msg.content} />
            ))}
            {sending && (
              <div className={styles.typingIndicator}>
                <span className={styles.typingDot} />
                <span className={styles.typingDot} />
                <span className={styles.typingDot} />
                <span className={styles.typingLabel}>HAC is typing...</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Input */}
      <div className={styles.inputArea}>
        {error && (
          <div className={styles.errorBar}>⚠ {error}</div>
        )}
        <ChatInput onSend={handleSend} disabled={loading || sending} />
      </div>
    </div>
  );
}
