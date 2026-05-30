import { NextResponse } from "next/server";

/**
 * POST /api/notifications/subscribe — Store push subscription
 *
 * Receives a PushSubscription object from the browser and stores it.
 * In production, this would save to Supabase.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { subscription, user_id } = body;

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { error: "Valid PushSubscription object required" },
        { status: 400 }
      );
    }

    // TODO: Save to Supabase push_subscriptions table
    // await supabase.from('push_subscriptions').upsert({
    //   user_id,
    //   endpoint: subscription.endpoint,
    //   p256dh: subscription.keys.p256dh,
    //   auth: subscription.keys.auth,
    //   created_at: new Date().toISOString(),
    // });

    console.log(`[HAC][Subscribe] Push subscription stored for user: ${user_id || "anonymous"}`);

    return NextResponse.json({
      success: true,
      message: "Push subscription saved",
    });
  } catch (error) {
    console.error("[HAC][Subscribe] Error:", error);
    return NextResponse.json(
      { error: "Failed to save subscription", message: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notifications/subscribe — Remove push subscription
 */
export async function DELETE(request) {
  try {
    const body = await request.json();
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json(
        { error: "endpoint is required" },
        { status: 400 }
      );
    }

    // TODO: Remove from Supabase
    console.log(`[HAC][Subscribe] Subscription removed: ${endpoint.slice(0, 50)}...`);

    return NextResponse.json({
      success: true,
      message: "Subscription removed",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to remove subscription", message: error.message },
      { status: 500 }
    );
  }
}
