import { createBrowserClient } from "@supabase/ssr";

let supabase = null;

export function getSupabaseBrowserClient() {
  if (supabase) return supabase;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Return a mock client if Supabase is not configured yet
  if (!url || !key) {
    console.warn("[HAC] Supabase not configured — auth features disabled");
    return {
      auth: {
        signInWithOAuth: async () => ({ error: new Error("Supabase not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local") }),
        signInWithPassword: async () => ({ error: new Error("Supabase not configured") }),
        signUp: async () => ({ error: new Error("Supabase not configured") }),
        getUser: async () => ({ data: { user: null } }),
        getSession: async () => ({ data: { session: null } }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
      from: () => ({
        select: () => ({ eq: () => ({ single: async () => ({ data: null }) }) }),
      }),
    };
  }

  supabase = createBrowserClient(url, key);
  return supabase;
}
