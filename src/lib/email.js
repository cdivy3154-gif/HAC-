/**
 * Email Service — Templates & sending logic
 *
 * Generates HTML email templates for HAC notifications.
 * Uses Resend API for delivery (configure RESEND_API_KEY in .env.local).
 *
 * For now, templates are generated but actual sending is stubbed
 * until Resend is configured in production.
 */

const RESEND_API = "https://api.resend.com/emails";
const FROM_EMAIL = "HAC <noreply@hac.app>";

/**
 * Send an email via Resend
 * @returns {Promise<{success: boolean, id?: string, error?: string}>}
 */
export async function sendEmail({ to, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log(`[HAC][Email] Skipped (no RESEND_API_KEY): "${subject}" → ${to}`);
    return { success: true, id: "mock_" + Date.now(), skipped: true };
  }

  try {
    const res = await fetch(RESEND_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [to],
        subject,
        html,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error(`[HAC][Email] Failed:`, data);
      return { success: false, error: data.message || "Send failed" };
    }

    console.log(`[HAC][Email] Sent: "${subject}" → ${to} (ID: ${data.id})`);
    return { success: true, id: data.id };
  } catch (err) {
    console.error(`[HAC][Email] Error:`, err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Generate hackathon match email HTML
 */
export function hackathonMatchEmail({ userName, hackathons }) {
  const hackathonCards = hackathons
    .map(
      (h) => `
    <div style="background:#1A1F26;border:1px solid rgba(59,234,126,0.15);border-radius:12px;padding:20px;margin-bottom:12px;">
      <h3 style="color:#F0F6FC;margin:0 0 6px;font-size:16px;">${h.title}</h3>
      <p style="color:#8B949E;font-size:13px;margin:0 0 10px;">${h.description || ""}</p>
      <div style="display:flex;gap:12px;flex-wrap:wrap;">
        <span style="font-family:monospace;font-size:11px;color:#3BEA7E;">📍 ${h.location || "Online"}</span>
        <span style="font-family:monospace;font-size:11px;color:#C9943A;">🏆 ${h.prize_pool || "TBD"}</span>
        ${h.score ? `<span style="font-family:monospace;font-size:11px;color:#3BEA7E;background:rgba(59,234,126,0.1);padding:2px 8px;border-radius:99px;">${h.score}% match</span>` : ""}
      </div>
    </div>
  `
    )
    .join("");

  return {
    subject: `🏆 ${hackathons.length} new hackathon${hackathons.length > 1 ? "s" : ""} match your profile!`,
    html: emailWrapper(`
      <h1 style="color:#F0F6FC;font-size:22px;margin:0 0 8px;">Hey ${userName}! 🐴</h1>
      <p style="color:#8B949E;font-size:14px;margin:0 0 24px;">
        We found ${hackathons.length} hackathon${hackathons.length > 1 ? "s" : ""} that match your skills and interests.
      </p>
      ${hackathonCards}
      <a href="https://hac.app/dashboard/hackathons" style="display:inline-block;margin-top:16px;padding:10px 24px;background:#3BEA7E;color:#0D1117;font-weight:700;border-radius:8px;text-decoration:none;font-family:monospace;">
        View All Matches →
      </a>
    `),
  };
}

/**
 * Generate team invite email HTML
 */
export function teamInviteEmail({ userName, teamName, inviterName, hackathonTitle }) {
  return {
    subject: `👥 ${inviterName} invited you to join ${teamName}`,
    html: emailWrapper(`
      <h1 style="color:#F0F6FC;font-size:22px;margin:0 0 8px;">Team Invite! 🎉</h1>
      <p style="color:#8B949E;font-size:14px;margin:0 0 24px;">
        Hey ${userName}, <strong style="color:#F0F6FC;">${inviterName}</strong> wants you on their team.
      </p>
      <div style="background:#1A1F26;border:1px solid rgba(74,109,140,0.3);border-radius:12px;padding:20px;">
        <h3 style="color:#F0F6FC;margin:0 0 6px;">${teamName}</h3>
        <p style="color:#8B949E;font-size:13px;margin:0;">
          For: <strong style="color:#C9943A;">${hackathonTitle}</strong>
        </p>
      </div>
      <div style="margin-top:20px;display:flex;gap:10px;">
        <a href="https://hac.app/dashboard/teams" style="display:inline-block;padding:10px 24px;background:#3BEA7E;color:#0D1117;font-weight:700;border-radius:8px;text-decoration:none;font-family:monospace;">
          View Invite →
        </a>
      </div>
    `),
  };
}

/**
 * Generate deadline reminder email HTML
 */
export function deadlineEmail({ userName, hackathonTitle, deadline }) {
  const daysLeft = Math.ceil(
    (new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24)
  );

  return {
    subject: `⏰ ${daysLeft} day${daysLeft !== 1 ? "s" : ""} left: ${hackathonTitle}`,
    html: emailWrapper(`
      <h1 style="color:#F0F6FC;font-size:22px;margin:0 0 8px;">Deadline Alert! ⏰</h1>
      <p style="color:#8B949E;font-size:14px;margin:0 0 24px;">
        Hey ${userName}, registration for <strong style="color:#C9943A;">${hackathonTitle}</strong>
        closes in <strong style="color:#3BEA7E;">${daysLeft} day${daysLeft !== 1 ? "s" : ""}</strong>.
      </p>
      <a href="https://hac.app/dashboard/hackathons" style="display:inline-block;padding:10px 24px;background:#C9943A;color:#0D1117;font-weight:700;border-radius:8px;text-decoration:none;font-family:monospace;">
        Register Now →
      </a>
    `),
  };
}

/**
 * Shared email wrapper with HAC branding
 */
function emailWrapper(body) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#0D1117;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">
    <!-- Logo -->
    <div style="text-align:center;margin-bottom:32px;">
      <span style="font-family:monospace;font-size:24px;font-weight:800;color:#3BEA7E;letter-spacing:0.1em;">HAC</span>
      <span style="font-family:monospace;font-size:11px;color:#8B949E;display:block;margin-top:2px;">Hackathon Aggregator + Companion</span>
    </div>

    <!-- Content -->
    <div style="background:#161B22;border:1px solid rgba(59,234,126,0.1);border-radius:16px;padding:32px;">
      ${body}
    </div>

    <!-- Footer -->
    <div style="text-align:center;margin-top:24px;">
      <p style="color:#484F58;font-size:11px;font-family:monospace;">
        You're receiving this because you enabled notifications in HAC settings.
        <br><a href="https://hac.app/dashboard/settings" style="color:#4A6D8C;">Manage preferences</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}
