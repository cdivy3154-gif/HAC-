import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

/**
 * OAuth Callback Handler
 *
 * After Supabase Auth redirects back with a code in the URL,
 * we exchange it for a session, then redirect the user:
 * - New users → /onboarding
 * - Returning users → /dashboard
 */
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/dashboard";

  if (code) {
    const supabase = await getSupabaseServerClient();

    // Exchange the auth code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Check if user has completed onboarding
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Check for existing profile with completed onboarding
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", user.id)
          .single();

        if (!profile || !profile.onboarding_completed) {
          // New user or hasn't completed onboarding → go to onboarding
          return NextResponse.redirect(new URL("/onboarding", origin));
        }
      }

      // Returning user with completed profile → go to dashboard
      return NextResponse.redirect(new URL(next, origin));
    }
  }

  // If something went wrong, redirect to login with error
  return NextResponse.redirect(
    new URL("/login?error=auth_callback_failed", origin)
  );
}
