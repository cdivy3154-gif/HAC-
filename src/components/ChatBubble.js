import HacAvatar from "./HacAvatar";
import styles from "./ChatBubble.module.css";

/**
 * ChatBubble — Renders chat messages in glass cards with a terminal vibe
 *
 * @param {Object} props
 * @param {string} props.role — 'user' | 'assistant'
 * @param {string} props.content — Message content text
 */
export default function ChatBubble({ role, content }) {
  const isAssistant = role === "assistant";

  // Helper to format message content for the terminal look
  // It replaces newlines with line breaks and handles basic formatting
  function formatContent(text) {
    if (!text) return "";
    return text.split("\n").map((line, i) => {
      // Bold highlights like **text**
      let formattedLine = line;
      
      // Parse markdown bold: **text**
      const boldRegex = /\*\*(.*?)\*\*/g;
      formattedLine = formattedLine.replace(boldRegex, "<strong>$1</strong>");

      // Parse inline code blocks: `code`
      const codeRegex = /`(.*?)`/g;
      formattedLine = formattedLine.replace(codeRegex, "<code>$1</code>");

      return (
        <span key={i} style={{ display: "block", minHeight: "1.2em" }} dangerouslySetInnerHTML={{ __html: formattedLine }} />
      );
    });
  }

  return (
    <div className={`${styles.bubbleWrapper} ${isAssistant ? styles.assistant : styles.user}`}>
      {isAssistant && (
        <div className={styles.avatarCol}>
          <HacAvatar size={40} pulse={true} />
        </div>
      )}
      
      <div className={styles.messageCol}>
        <div className={styles.bubbleCard}>
          <div className={styles.bubbleHeader}>
            <span className={styles.senderName}>
              {isAssistant ? "HAC 🐴" : "YOU"}
            </span>
            <span className={styles.promptChar}>
              {isAssistant ? "@terminal" : ">_"}
            </span>
          </div>
          <div className={styles.bubbleContent}>
            {formatContent(content)}
          </div>
        </div>
      </div>
    </div>
  );
}
