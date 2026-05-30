/**
 * Notification Service — Core notification logic
 *
 * Handles creating, reading, and managing notifications.
 * Currently uses in-memory mock data. Will integrate with Supabase later.
 */

// Notification types
export const NOTIF_TYPES = {
  HACKATHON_MATCH: "hackathon_match",
  TEAM_INVITE: "team_invite",
  JOIN_REQUEST: "join_request",
  DEADLINE: "deadline",
  CHAT_MESSAGE: "chat_message",
  SYSTEM: "system",
};

// Priority levels
export const PRIORITY = {
  LOW: "low",
  NORMAL: "normal",
  HIGH: "high",
  URGENT: "urgent",
};

/**
 * Create a notification object
 */
export function createNotification({
  type,
  title,
  message,
  priority = PRIORITY.NORMAL,
  actionUrl = null,
  metadata = {},
}) {
  return {
    id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    type,
    title,
    message,
    priority,
    action_url: actionUrl,
    metadata,
    read: false,
    created_at: new Date().toISOString(),
  };
}

/**
 * Get icon + color for notification type
 */
export function getNotifStyle(type) {
  const styles = {
    [NOTIF_TYPES.HACKATHON_MATCH]: { icon: "🏆", color: "green", label: "Hackathon Match" },
    [NOTIF_TYPES.TEAM_INVITE]: { icon: "👥", color: "blue", label: "Team Invite" },
    [NOTIF_TYPES.JOIN_REQUEST]: { icon: "🙋", color: "gold", label: "Join Request" },
    [NOTIF_TYPES.DEADLINE]: { icon: "⏰", color: "red", label: "Deadline" },
    [NOTIF_TYPES.CHAT_MESSAGE]: { icon: "💬", color: "green", label: "Chat" },
    [NOTIF_TYPES.SYSTEM]: { icon: "🔔", color: "gray", label: "System" },
  };
  return styles[type] || styles[NOTIF_TYPES.SYSTEM];
}

/**
 * Format time ago string
 */
export function timeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/**
 * Mock notifications for development
 */
export function getMockNotifications() {
  const now = new Date();
  const h = (hours) => new Date(now - hours * 60 * 60 * 1000).toISOString();

  return [
    {
      id: "n1",
      type: NOTIF_TYPES.HACKATHON_MATCH,
      title: "New hackathon match: ETHGlobal New York",
      message: "95% match with your skills! Web3 + React. Registration closes in 5 days.",
      priority: PRIORITY.HIGH,
      action_url: "/dashboard/hackathons/h2",
      read: false,
      created_at: h(0.5),
    },
    {
      id: "n2",
      type: NOTIF_TYPES.JOIN_REQUEST,
      title: "Leo Martinez wants to join CodeColt Crew",
      message: "UI/UX designer with React + Figma skills. Check their profile and respond.",
      priority: PRIORITY.URGENT,
      action_url: "/dashboard/teams",
      read: false,
      created_at: h(2),
    },
    {
      id: "n3",
      type: NOTIF_TYPES.TEAM_INVITE,
      title: "Invited to join Quantum Coders",
      message: "Priya Sharma invited you to join for HackTheBox CTF. 3/5 members.",
      priority: PRIORITY.NORMAL,
      action_url: "/dashboard/teams/t3",
      read: false,
      created_at: h(6),
    },
    {
      id: "n4",
      type: NOTIF_TYPES.DEADLINE,
      title: "Registration closing: AI Builders Hackathon",
      message: "Only 2 days left to register! Don't miss out.",
      priority: PRIORITY.URGENT,
      action_url: "/dashboard/hackathons/h1",
      read: false,
      created_at: h(12),
    },
    {
      id: "n5",
      type: NOTIF_TYPES.CHAT_MESSAGE,
      title: "New message from HAC",
      message: "Hey! I found 3 new hackathons matching your profile. Wanna check them out? 🐴",
      priority: PRIORITY.NORMAL,
      action_url: "/dashboard/chat",
      read: true,
      created_at: h(24),
    },
    {
      id: "n6",
      type: NOTIF_TYPES.HACKATHON_MATCH,
      title: "Smart India Hackathon 2025 is open!",
      message: "India's biggest hackathon. Team size: 6. Themes match your AI/ML interest.",
      priority: PRIORITY.HIGH,
      action_url: "/dashboard/hackathons/h4",
      read: true,
      created_at: h(48),
    },
    {
      id: "n7",
      type: NOTIF_TYPES.SYSTEM,
      title: "Profile updated successfully",
      message: "Your skills and bio have been saved.",
      priority: PRIORITY.LOW,
      action_url: "/dashboard/profile",
      read: true,
      created_at: h(72),
    },
    {
      id: "n8",
      type: NOTIF_TYPES.JOIN_REQUEST,
      title: "Ananya Rao wants to join CodeColt Crew",
      message: "Backend engineer (Python, FastAPI). First-time hackathon participant.",
      priority: PRIORITY.NORMAL,
      action_url: "/dashboard/teams",
      read: true,
      created_at: h(96),
    },
  ];
}
