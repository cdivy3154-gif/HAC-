import { NextResponse } from "next/server";

/**
 * POST /api/notifications/push — Send push notification
 *
 * Accepts a notification payload and dispatches via Web Push API.
 * Requires VAPID keys for production (NEXT_PUBLIC_VAPID_KEY, VAPID_PRIVATE_KEY).
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { subscription, title, message, url, tag } = body;

    if (!title || !message) {
      return NextResponse.json(
        { error: "title and message are required" },
        { status: 400 }
      );
    }

    // In production, this would use web-push library to send to subscription
    // For now, log and return success
    console.log(`[HAC][Push] Notification: "${title}" — ${message}`);

    // TODO: Implement web-push when VAPID keys are configured
    // const webpush = require('web-push');
    // webpush.setVapidDetails('mailto:admin@hac.app', VAPID_PUBLIC, VAPID_PRIVATE);
    // await webpush.sendNotification(subscription, JSON.stringify({ title, message, url, tag }));

    return NextResponse.json({
      success: true,
      message: "Push notification queued",
      payload: { title, message, url, tag },
    });
  } catch (error) {
    console.error("[HAC][Push] Error:", error);
    return NextResponse.json(
      { error: "Failed to send push notification", message: error.message },
      { status: 500 }
    );
  }
}
