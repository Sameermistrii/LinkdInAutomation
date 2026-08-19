"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";

const STEPS = [
  "Analyzing your profile",
  "Saving your interests",
  "Saving thought leaders",
  "Preparing your Home feed",
  "AI voice model (coming soon)",
];

export function AnalyzeOnboarding() {
  const router = useRouter();
  const [profile, setProfile] = useState({ name: "", headline: "", photoUrl: "" });
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    void fetch("/api/onboarding")
      .then((r) => r.json())
      .then((j) => setProfile(j.profile ?? { name: "", headline: "", photoUrl: "" }));
  }, []);

  useEffect(() => {
    if (step < 4) {
      const t = window.setTimeout(() => setStep((s) => s + 1), 2200);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => {
      void fetch("/api/onboarding", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "complete" }),
      })
        .then(async (res) => {
          if (!res.ok) {
            await fetch("/api/onboarding", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "skip" }),
            });
          }
          router.push("/home");
          router.refresh();
        })
        .catch((err: Error) => setError(err.message));
    }, 1600);
    return () => window.clearTimeout(t);
  }, [step, router]);

  const name = profile.name || "You";
  const headline = profile.headline || "LinkedIn member";
  const pct = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#f6fafe] text-[var(--ink)] dark:bg-[var(--bg)]">
      <header className="fixed top-0 z-50 w-full bg-[#f6fafe]/80 shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-xl dark:bg-[var(--bg)]/80">
        <div className="flex h-16 w-full items-center justify-between px-6 md:px-10">
          <Link href="/home" className="text-2xl font-semibold tracking-tight text-[#004e99]">
            UniSin
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="relative flex min-h-screen items-center justify-center pt-16">
        <div className="relative flex min-h-[calc(100vh-64px)] w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#d6e3ff] to-[#c4e7ff] px-4 py-10 dark:from-[var(--bg)] dark:to-[var(--card)]">
          <div className="pointer-events-none absolute top-[-10%] left-[-10%] h-[40vw] w-[40vw] animate-pulse rounded-full bg-[#005eb5] opacity-20 blur-[80px]" />
          <div className="pointer-events-none absolute right-[-10%] bottom-[-10%] h-[50vw] w-[50vw] rounded-full bg-[#00594f] opacity-20 blur-[100px]" />

          <div className="relative z-10 flex w-full max-w-[700px] flex-col items-center rounded-[32px] bg-white/60 p-8 text-center shadow-xl shadow-[#0a66c2]/10 backdrop-blur-2xl md:p-12 dark:bg-[var(--card)]/70">
            <div className="mb-6 flex h-16 w-16 -rotate-12 items-center justify-center rounded-full bg-[#0a66c2] text-white shadow-md shadow-[#0a66c2]/20">
              <SparkleIcon />
            </div>
            <h1 className="mb-2 text-4xl font-bold tracking-tight md:text-5xl md:leading-[56px]">
              Building your unique persona
            </h1>
            <p className="mx-auto mb-8 max-w-[480px] text-lg leading-relaxed text-[var(--muted)]">
              We are preparing Home from your profile and the topics you chose. A real AI voice model will
              come later.
            </p>

            <div className="mb-8 flex w-full max-w-[400px] items-center gap-4 rounded-xl bg-[#f0f4f8]/50 p-4 dark:bg-[var(--bg)]/50">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#40c2fd] text-lg font-semibold text-[#004d6a]">
                {profile.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.photoUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  initials(name)
                )}
              </div>
              <div className="min-w-0 flex-1 text-left">
                <p className="truncate text-sm font-semibold">{name}</p>
                <p className="truncate text-sm text-[var(--muted)]">{headline}</p>
              </div>
            </div>

            <div className="relative mb-8 h-1 w-full overflow-hidden rounded-full bg-[#e4e9ed] dark:bg-[var(--line)]">
              <div
                className="absolute top-0 left-0 h-full rounded-full bg-[#004e99] transition-all duration-1000 ease-out"
                style={{ width: `${pct}%` }}
              >
                <div className="hero-shimmer absolute inset-0" />
              </div>
            </div>

            <div className="flex w-full flex-col gap-4 text-left">
              {STEPS.map((label, i) => {
                const done = i < step;
                const active = i === step;
                return (
                  <div
                    key={label}
                    className={`relative flex items-center gap-4 ${i === STEPS.length - 1 && !done && !active ? "opacity-40" : ""}`}
                  >
                    {active ? (
                      <div className="pointer-events-none absolute -inset-2 -z-10 rounded-lg bg-gradient-to-r from-[#40c2fd]/20 to-transparent" />
                    ) : null}
                    <div className="flex h-6 w-6 items-center justify-center">
                      {done ? (
                        <CheckCircleIcon />
                      ) : active ? (
                        <span className="text-[#00668a]">
                          <SpinnerIcon />
                        </span>
                      ) : (
                        <div className="h-6 w-6 rounded-full bg-[#dfe3e7] dark:bg-[var(--line)]" />
                      )}
                    </div>
                    <span className={active ? "text-base font-semibold" : "text-base"}>{label}</span>
                  </div>
                );
              })}
            </div>

            {error ? (
              <p className="mt-6 text-sm text-red-600">
                {error}{" "}
                <button type="button" className="text-[var(--blue)]" onClick={() => router.push("/onboarding/leaders")}>
                  Go back
                </button>
              </p>
            ) : null}
          </div>

          <div className="absolute bottom-10 left-6 right-6 z-10 flex flex-col items-center md:left-10 md:right-10">
            <div className="mb-2 flex gap-2">
              <div className="h-1 w-8 rounded-full bg-[#004e99] opacity-30" />
              <div className="h-1 w-8 rounded-full bg-[#004e99] opacity-30" />
              <div className="h-1 w-8 rounded-full bg-[#004e99]" />
            </div>
            <span className="text-xs font-bold tracking-widest text-[#004e99] uppercase">Step 3 of 3</span>
          </div>
        </div>
      </main>
    </div>
  );
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function SparkleIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2l1.8 5.4L19 9.2l-5.2 1.8L12 16.4l-1.8-5.4L5 9.2l5.2-1.8L12 2Zm7 9 1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3Z" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="#004e99" aria-hidden>
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-1.2 14-3.5-3.5 1.4-1.4 2.1 2.1 4.5-4.5 1.4 1.4-5.9 5.9Z" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg className="h-6 w-6 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
