"use client";

import ChatWindow from "@/components/ChatWindow";
import styles from "./page.module.css";

/**
 * Full Chat Page — Terminal-style extended conversation with HAC
 */
export default function ChatPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <span className={styles.titleIcon}>💬</span>
          Chat with HAC
        </h1>
        <p className={styles.subtitle}>
          <span className={styles.prompt}>&gt;_ </span>
          your sarcastic hackathon advisor • always online
        </p>
      </div>

      <div className={styles.chatContainer}>
        <ChatWindow apiEndpoint="/api/chat" />
      </div>
    </div>
  );
}
