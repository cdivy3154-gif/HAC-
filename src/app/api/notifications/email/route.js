import { NextResponse } from "next/server";
import { sendEmail, hackathonMatchEmail, teamInviteEmail, deadlineEmail } from "@/lib/email";

/**
 * POST /api/notifications/email — Send email notification
 *
 * Accepts a notification type and dispatches the appropriate email template.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { type, to, data } = body;

    if (!type || !to) {
      return NextResponse.json(
        { error: "type and to (email) are required" },
        { status: 400 }
      );
    }

    let email;

    switch (type) {
      case "hackathon_match":
        email = hackathonMatchEmail({
          userName: data.userName || "Hacker",
          hackathons: data.hackathons || [],
        });
        break;

      case "team_invite":
        email = teamInviteEmail({
          userName: data.userName || "Hacker",
          teamName: data.teamName || "A Team",
          inviterName: data.inviterName || "Someone",
          hackathonTitle: data.hackathonTitle || "A Hackathon",
        });
        break;

      case "deadline":
        email = deadlineEmail({
          userName: data.userName || "Hacker",
          hackathonTitle: data.hackathonTitle || "A Hackathon",
          deadline: data.deadline || new Date().toISOString(),
        });
        break;

      default:
        return NextResponse.json(
          { error: `Unknown email type: ${type}. Valid: hackathon_match, team_invite, deadline` },
          { status: 400 }
        );
    }

    const result = await sendEmail({ to, ...email });

    return NextResponse.json({
      success: result.success,
      email_id: result.id,
      skipped: result.skipped || false,
    });
  } catch (error) {
    console.error("[HAC][Email API] Error:", error);
    return NextResponse.json(
      { error: "Failed to send email", message: error.message },
      { status: 500 }
    );
  }
}
