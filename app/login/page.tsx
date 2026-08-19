"use client";

import { useEffect, useState } from "react";

const isDev = process.env.NODE_ENV === "development";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [config, setConfig] = useState({ google: true, linkedin: true });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("error")) setError(params.get("error") || "");
    void fetch("/api/auth/config")
      .then((r) => r.json())
      .then((j) => setConfig({ google: Boolean(j.google), linkedin: Boolean(j.linkedin) }));
  }, []);

  const googleDown = !config.google;
  const linkedinDown = !config.linkedin;

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="card w-full max-w-md p-8 shadow-sm">
        <p className="text-sm font-medium text-[var(--blue)]">UniSin</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Continue with Google or LinkedIn. We never see your password.
        </p>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        <form action="/api/auth/google" method="post" className="mt-6 space-y-3">
          <label className="block text-sm font-medium">Email</label>
          <input
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@gmail.com"
            className="w-full rounded-xl border border-[var(--line)] bg-[var(--card)] px-4 py-3 outline-none"
          />
          <button
            type="submit"
            disabled={googleDown}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-white px-4 py-3 text-sm font-medium text-[#1f1f1f] disabled:opacity-50"
          >
            <GoogleMark />
            Continue with Google
          </button>
          {googleDown ? (
            <p className="text-xs text-[var(--muted)]">
              {isDev
                ? "Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env to enable Google sign-in."
                : "Sign-in is temporarily unavailable."}
            </p>
          ) : null}
        </form>

        <div className="my-6 flex items-center gap-3 text-xs text-[var(--muted)]">
          <span className="h-px flex-1 bg-[var(--line)]" />
          or
          <span className="h-px flex-1 bg-[var(--line)]" />
        </div>

        <a
          href="/api/auth/linkedin"
          className={`flex w-full items-center justify-center rounded-full bg-[#0a66c2] px-4 py-3 text-sm font-medium text-white ${
            linkedinDown ? "pointer-events-none opacity-50" : ""
          }`}
        >
          Continue with LinkedIn
        </a>
        {linkedinDown ? (
          <p className="mt-2 text-xs text-[var(--muted)]">
            {isDev
              ? "Add LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET to .env once (never shown to customers)."
              : "Sign-in is temporarily unavailable."}
          </p>
        ) : null}
      </div>
    </main>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.6 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.5-5.2l-6.2-5.2C29.2 35.3 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.2-3.5 5.7-6.5 7.1l6.2 5.2C38.2 37.3 44 31.5 44 24c0-1.2-.1-2.3-.4-3.5z" />
    </svg>
  );
}
