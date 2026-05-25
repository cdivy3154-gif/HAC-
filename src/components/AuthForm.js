"use client";

import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import styles from "./AuthForm.module.css";
import Link from "next/link";

/**
 * AuthForm — Reusable auth component for login/signup
 * Split layout: left = HAC mascot with glasses glow, right = glass-card form
 *
 * @param {Object} props
 * @param {'login' | 'signup'} props.mode — which auth flow to render
 */
export default function AuthForm({ mode = "login" }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const supabase = getSupabaseBrowserClient();

  const isLogin = mode === "login";
  const title = isLogin ? "Welcome back" : "Join the herd";
  const subtitle = isLogin
    ? "HAC missed you. Probably."
    : "Let's get you set up, champ.";
  const submitText = isLogin ? "Log In" : "Sign Up";
  const footerText = isLogin
    ? "Don't have an account?"
    : "Already have an account?";
  const footerLink = isLogin ? "/signup" : "/login";
  const footerLinkText = isLogin ? "Sign up" : "Log in";

  // ─── OAuth Handler ────────────────────────────────────────
  async function handleOAuth(provider) {
    setError(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  // ─── Email/Password Handler ───────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        // Redirect handled by middleware/callback
        window.location.href = "/auth/callback";
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: displayName || email.split("@")[0],
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        setSuccess(
          "Check your email for a confirmation link! 📧 HAC will be waiting."
        );
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.authPage}>
      {/* Back to Home */}
      <Link href="/" className={styles.backLink}>
        ← back to home
      </Link>

      {/* ─── Left Panel: HAC Mascot ────────────────────────── */}
      <div className={styles.mascotPanel}>
        {/* Floating code snippets */}
        <span className={styles.floatingCode}>
          {"const hacker = await HAC.find(you);"}
        </span>
        <span className={styles.floatingCode}>
          {'hackathon.register({ team: "🔥" });'}
        </span>
        <span className={styles.floatingCode}>
          {"// TODO: win $10K prize pool"}
        </span>

        <div className={styles.mascotContent}>
          {/* Logo with glasses glow */}
          <div className={styles.mascotLogo}>
            <img
              src="/hac-logo.png"
              alt="HAC — AI Hackathon Finder mascot"
              width={180}
              height={180}
            />
            <div className={styles.glassesGlow} aria-hidden="true" />
          </div>

          <h2 className={styles.mascotTitle}>HAC 🐴</h2>
          <p className={styles.mascotTagline}>
            <span className={styles.prompt}>&gt;_ </span>
            {isLogin
              ? "Yo, welcome back! Let's find your next hackathon. The code misses you."
              : "New face? Nice. Let me find you some hackathons to crush. 😏"}
          </p>
        </div>
      </div>

      {/* ─── Right Panel: Auth Form ────────────────────────── */}
      <div className={styles.formPanel}>
        <div className={styles.formContainer}>
          {/* Mobile-only header */}
          <div className={styles.mobileHeader}>
            <div className={styles.mobileLogoRow}>
              <img
                src="/hac-logo.png"
                alt="HAC"
                className={styles.mobileLogo}
                width={48}
                height={48}
              />
              <span className={styles.mobileTitle}>HAC 🐴</span>
            </div>
          </div>

          <div className={styles.formCard}>
            {/* Header */}
            <div className={styles.formHeader}>
              <h1 className={styles.formTitle}>{title}</h1>
              <p className={styles.formSubtitle}>
                <span className={styles.highlight}>&gt;_ </span>
                {subtitle}
              </p>
            </div>

            {/* Error/Success Messages */}
            {error && <p className={styles.errorMessage}>{error}</p>}
            {success && <p className={styles.successMessage}>{success}</p>}

            {/* OAuth Buttons */}
            <div className={styles.oauthSection}>
              <button
                type="button"
                className={styles.oauthBtn}
                onClick={() => handleOAuth("google")}
                disabled={loading}
                id="auth-google-btn"
              >
                <span className={styles.oauthIcon}>
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                </span>
                Continue with Google
              </button>

              <button
                type="button"
                className={styles.oauthBtn}
                onClick={() => handleOAuth("github")}
                disabled={loading}
                id="auth-github-btn"
              >
                <span className={styles.oauthIcon}>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                </span>
                Continue with GitHub
              </button>
            </div>

            {/* Divider */}
            <div className={styles.divider}>
              <span className={styles.dividerText}>or use email</span>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit}>
              <div className={styles.formFields}>
                {/* Display name (signup only) */}
                {!isLogin && (
                  <div className={styles.fieldGroup}>
                    <label htmlFor="displayName" className={styles.fieldLabel}>
                      display_name
                    </label>
                    <input
                      id="displayName"
                      type="text"
                      className={styles.fieldInput}
                      placeholder="what should HAC call you?"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      autoComplete="name"
                    />
                    <div className={styles.fieldGlowLine} />
                  </div>
                )}

                <div className={styles.fieldGroup}>
                  <label htmlFor="email" className={styles.fieldLabel}>
                    email
                  </label>
                  <input
                    id="email"
                    type="email"
                    className={styles.fieldInput}
                    placeholder="hacker@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                  <div className={styles.fieldGlowLine} />
                </div>

                <div className={styles.fieldGroup}>
                  <label htmlFor="password" className={styles.fieldLabel}>
                    password
                  </label>
                  <input
                    id="password"
                    type="password"
                    className={styles.fieldInput}
                    placeholder={
                      isLogin ? "••••••••" : "min 6 chars, make it strong 💪"
                    }
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete={isLogin ? "current-password" : "new-password"}
                  />
                  <div className={styles.fieldGlowLine} />
                </div>
              </div>

              <button
                type="submit"
                className={styles.submitBtn}
                disabled={loading}
                id="auth-submit-btn"
              >
                {loading ? (
                  <span className={styles.spinner} />
                ) : (
                  submitText
                )}
              </button>
            </form>

            {/* Footer */}
            <p className={styles.formFooter}>
              {footerText}{" "}
              <Link href={footerLink}>{footerLinkText}</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
