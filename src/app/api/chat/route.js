import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getHacChatResponse } from "@/lib/openrouter";

const HAC_CHAT_GREETING = `Yo! HAC here 🐴 What's on your mind, champion?

I can help with hackathon prep, tech advice, team strategies, or just vibe. Think of me as your sarcastic but actually-useful hackathon sherpa. What can I do for you?`;

/**
 * GET /api/chat
 * Retrieves persistent chat history for the logged-in user.
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

    // Get chat messages (only general chat, not onboarding)
    // We use a metadata flag to distinguish. Messages without metadata.type = 'onboarding'
    // are general chat messages. For simplicity, we'll use a separate approach:
    // general chat messages have metadata = { type: 'chat' }
    const { data: messages, error: dbError } = await supabase
      .from("chat_messages")
      .select("role, content, created_at, metadata")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (dbError) throw dbError;

    // Filter to only general chat messages (metadata.type === 'chat')
    const chatMessages = messages.filter(
      (m) => m.metadata?.type === "chat"
    );

    // If no chat history, return the greeting
    if (chatMessages.length === 0) {
      return NextResponse.json({
        messages: [{ role: "assistant", content: HAC_CHAT_GREETING }],
      });
    }

    return NextResponse.json({
      messages: chatMessages.map((m) => ({ role: m.role, content: m.content })),
    });
  } catch (error) {
    console.error("[HAC] GET /api/chat error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/chat
 * Handles new user messages, saves to DB, calls NVIDIA NIM, saves reply.
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

    // Ensure profile exists
    await supabase
      .from("profiles")
      .upsert({ id: user.id }, { onConflict: "id", ignoreDuplicates: true });

    // Get user profile for context
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, skills, interests, experience_level, team_preference")
      .eq("id", user.id)
      .single();

    // Save user message
    const { error: insertUserError } = await supabase
      .from("chat_messages")
      .insert({
        user_id: user.id,
        role: "user",
        content: message.trim(),
        metadata: { type: "chat" },
      });

    if (insertUserError) throw insertUserError;

    // Get chat history (only general chat messages)
    const { data: dbMessages, error: historyError } = await supabase
      .from("chat_messages")
      .select("role, content, metadata")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (historyError) throw historyError;

    const chatHistory = dbMessages
      .filter((m) => m.metadata?.type === "chat")
      .map((m) => ({ role: m.role, content: m.content }));

    // Get HAC's reply
    const { reply } = await getHacChatResponse(chatHistory, profile);

    // Save HAC's reply
    const { error: insertAssistantError } = await supabase
      .from("chat_messages")
      .insert({
        user_id: user.id,
        role: "assistant",
        content: reply,
        metadata: { type: "chat" },
      });

    if (insertAssistantError) throw insertAssistantError;

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("[HAC] POST /api/chat error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
