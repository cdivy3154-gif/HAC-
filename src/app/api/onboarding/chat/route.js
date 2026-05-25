import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getHacOnboardingResponse } from "@/lib/openrouter";

// Initial greeting from HAC
const HAC_GREETING = `Yo! I'm HAC 🐴 — basically Tinder but for hackathons. Swipe right on code, not regrets.

Before I go scouring the internet to find you some cash-winning competitions, let's get acquainted. First off: what should I call you? (your display name or nickname)`;

/**
 * GET /api/onboarding/chat
 *
 * Retrieves the chat history for onboarding. If empty, seeds the initial greeting.
 */
export async function GET() {
  try {
    const supabase = await getSupabaseServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure profile exists to satisfy foreign key constraints
    await supabase.from("profiles").upsert({ id: user.id }, { onConflict: "id", ignoreDuplicates: true });

    // Get chat messages in chronological order
    const { data: messages, error: dbError } = await supabase
      .from("chat_messages")
      .select("role, content, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (dbError) {
      throw dbError;
    }

    // If chat history is empty, seed the initial welcome message from HAC
    if (messages.length === 0) {
      const { error: seedError } = await supabase
        .from("chat_messages")
        .insert({
          user_id: user.id,
          role: "assistant",
          content: HAC_GREETING,
        });

      if (seedError) throw seedError;

      return NextResponse.json({
        messages: [{ role: "assistant", content: HAC_GREETING }],
        onboarding_completed: false,
      });
    }

    // Check if onboarding is already completed in profiles table
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("id", user.id)
      .single();

    return NextResponse.json({
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      onboarding_completed: !!profile?.onboarding_completed,
    });
  } catch (error) {
    console.error("[HAC] GET chat error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/onboarding/chat
 *
 * Handles new user messages during onboarding, saves to history, calls OpenRouter,
 * and upserts profile data if onboarding completes.
 */
export async function POST(request) {
  try {
    const supabase = await getSupabaseServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message } = await request.json();

    if (!message || typeof message !== "string" || message.trim() === "") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Ensure profile exists to satisfy foreign key constraints
    await supabase.from("profiles").upsert({ id: user.id }, { onConflict: "id", ignoreDuplicates: true });

    // 1. Insert user message into database
    const { error: insertUserError } = await supabase
      .from("chat_messages")
      .insert({
        user_id: user.id,
        role: "user",
        content: message.trim(),
      });

    if (insertUserError) throw insertUserError;

    // 2. Fetch full chronological history to send to OpenRouter
    const { data: dbMessages, error: historyError } = await supabase
      .from("chat_messages")
      .select("role, content")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (historyError) throw historyError;

    // Map database history format to OpenRouter message format
    const history = dbMessages.map(m => ({
      role: m.role,
      content: m.content,
    }));

    // 3. Get reply and profile extraction from OpenRouter
    const response = await getHacOnboardingResponse(history);
    const { reply, extracted_profile, onboarding_completed } = response;

    // 4. Save HAC's assistant reply into the database
    const { error: insertAssistantError } = await supabase
      .from("chat_messages")
      .insert({
        user_id: user.id,
        role: "assistant",
        content: reply,
        metadata: extracted_profile, // Store the intermediate extracted details
      });

    if (insertAssistantError) throw insertAssistantError;

    // 5. If onboarding is complete, save the final profile info
    if (onboarding_completed && extracted_profile) {
      const display_name = extracted_profile.display_name || user.email?.split("@")[0] || "Hacker";
      const experience_level = extracted_profile.experience_level || "beginner";
      const skills = Array.isArray(extracted_profile.skills) ? extracted_profile.skills : [];
      const interests = Array.isArray(extracted_profile.interests) ? extracted_profile.interests : [];
      const travel_willingness = extracted_profile.travel_willingness || "online_only";
      const team_preference = extracted_profile.team_preference || "looking_for_team";

      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          display_name,
          username: display_name.toLowerCase().replace(/[^a-z0-9_]/g, "") + "_" + Math.floor(Math.random() * 1000),
          experience_level,
          skills,
          interests,
          travel_willingness,
          team_preference,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        });

      if (profileError) {
        console.error("[HAC] Profile save error during onboarding completion:", profileError);
        // We won't block the chat return, but we log the error
      }
    }

    return NextResponse.json({
      reply,
      onboarding_completed,
      extracted_profile,
    });
  } catch (error) {
    console.error("[HAC] POST chat error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
