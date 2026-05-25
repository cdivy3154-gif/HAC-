import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Middleware — Route Protection
 *
 * Protects authenticated routes (/dashboard, /onboarding, /profile, etc.)
 * and refreshes the Supabase session on every request.
 *
 * Public routes: /, /login, /signup, /auth/callback
 */

// Routes that require authentication
const PROTECTED_ROUTES = [
  "/dashboard",
  "/onboarding",
  "/profile",
  "/settings",
  "/chat",
  "/teams",
  "/hackathons",
  "/notifications",
];

// Routes that should redirect to dashboard if already authenticated
const AUTH_ROUTES = ["/login", "/signup"];

export async function middleware(request) {
  try {
    // Skip auth check if Supabase is not configured yet
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.next();
    }

    let supabaseResponse = NextResponse.next();

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next();
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    });

    // IMPORTANT: Do NOT use supabase.auth.getSession() inside middleware.
    // Use getUser() which validates the token against the Supabase Auth server.
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { pathname } = request.nextUrl;

    // Check if the current path matches a protected route
    const isProtectedRoute = PROTECTED_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(route + "/")
    );

    // Check if the current path is an auth route (login/signup)
    const isAuthRoute = AUTH_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(route + "/")
    );

    // If accessing a protected route without auth → redirect to login
    if (isProtectedRoute && !user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // If accessing auth routes while already authenticated → redirect to dashboard
    if (isAuthRoute && user) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return supabaseResponse;
  } catch (error) {
    // If middleware crashes for any reason (network, Supabase down, etc.),
    // let the request through instead of returning a 404
    console.error("[HAC] Middleware error (allowing request through):", error.message);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon)
     * - public files (images, icons, manifest, sw.js)
     * - API routes that handle their own auth
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$|manifest.json|sw.js|icons).*)",
  ],
};

