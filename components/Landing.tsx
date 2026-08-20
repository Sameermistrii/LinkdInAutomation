import Link from "next/link";
import { LandingHeader } from "./LandingHeader";
import { BrandMark, BrandWord } from "./BrandMark";

export function Landing() {
  return (
    <div className="bg-[#f0f7fd] dark:bg-[var(--bg)]">
      <LandingHeader />

      <main>
        <section className="relative flex min-h-screen items-center overflow-hidden px-4 pt-16 sm:px-6 sm:pt-20 md:px-10">
          <div className="hero-blob pointer-events-none absolute top-[-10%] right-[-5%] -z-10 h-[600px] w-[600px] bg-gradient-to-br from-[var(--blue)]/10 to-transparent blur-[60px]" />
          <div
            className="hero-blob pointer-events-none absolute bottom-[-20%] left-[-10%] -z-10 h-[700px] w-[800px] bg-gradient-to-tr from-sky-200/40 to-[var(--blue-soft)] blur-[80px] dark:from-[var(--blue)]/10"
            style={{ animationDelay: "-4s" }}
          />
          <div className="pointer-events-none absolute top-[20%] left-[40%] -z-10 h-[400px] w-[400px] rounded-full bg-white/40 blur-[100px] dark:bg-[var(--blue)]/5" />
          <div className="pointer-events-none absolute top-[20%] right-[8%] hidden rotate-12 opacity-20 lg:block">
            <PostCardArt />
          </div>
          <div className="pointer-events-none absolute bottom-[8%] left-[8%] hidden -rotate-12 opacity-20 lg:block">
            <FeedCardArt />
          </div>
          <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col items-start text-left">
            <div className="relative mb-8 inline-flex items-center overflow-hidden rounded-full border border-white/80 bg-white/60 px-4 py-2 text-sm font-medium text-[var(--blue)] shadow-sm backdrop-blur-md dark:border-[var(--line)] dark:bg-[var(--card)]/70">
              <div className="hero-shimmer absolute inset-0" />
              <span className="relative z-10">
                <BrandWord size="sm" />
              </span>
            </div>
            <h1 className="max-w-4xl text-3xl font-bold tracking-tight text-[var(--ink)] sm:text-5xl md:text-[56px] md:leading-[64px]">
              Schedule <span className="text-[var(--blue)]">LinkedIn posts</span> without the hassle.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--muted)] md:text-xl">
              Drop ideas into a queue. We publish at your times. Sign in with Google or LinkedIn — nothing
              else to set up.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link
                href="/login"
                className="inline-flex rounded-full bg-[var(--blue)] px-8 py-3 text-sm font-semibold text-white shadow-xl shadow-[var(--blue)]/30 transition hover:scale-[1.02]"
              >
                Sign in
              </Link>
              <a
                href="#how"
                className="inline-flex rounded-full border border-white/60 bg-white/40 px-8 py-3 text-sm font-semibold text-[var(--blue)] shadow-sm backdrop-blur-md transition hover:bg-white/70 dark:border-[var(--line)] dark:bg-[var(--card)]"
              >
                See how it works
              </a>
            </div>
          </div>
        </section>

        <HowItWorks />
        <ProductPreview />
      </main>

      <footer className="border-t border-[var(--line)] bg-[#f6fafe] px-4 py-10 md:px-10 dark:bg-[var(--bg)]">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <BrandMark href="/" size="sm" />
            <nav className="flex flex-wrap justify-center gap-6 text-sm font-medium text-[var(--muted)]">
              <a href="#how" className="hover:text-[var(--blue)]">
                How it works
              </a>
              <a href="#preview" className="hover:text-[var(--blue)]">
                Preview
              </a>
              <Link href="/login" className="hover:text-[var(--blue)]">
                Sign in
              </Link>
            </nav>
            <a
              href="https://github.com/Sameermistrii"
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-[var(--muted)] hover:text-[var(--blue)]"
            >
              Made with 💙 by Sameer Mistri
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Sign in",
      body: "Google or LinkedIn.",
    },
    {
      n: "02",
      title: "Fill your slots",
      body: "Write a post, preview it, and drop it on a time.",
    },
    {
      n: "03",
      title: "We publish",
      body: "When the slot is due, UniSin posts for you.",
    },
  ];

  return (
    <section
      id="how"
      className="relative flex min-h-screen scroll-mt-20 flex-col justify-center overflow-hidden border-t border-[var(--line)] bg-[#f6fafe] px-4 py-16 sm:px-6 md:px-10 md:py-24 dark:bg-[var(--bg)]"
    >
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-[var(--blue)]/10 blur-3xl" />
      <div className="pointer-events-none absolute top-20 -right-20 h-80 w-80 rounded-full bg-[var(--blue-soft)] blur-3xl" />
      <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col items-center gap-6">
        <span className="rounded-full bg-[var(--blue)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--blue)]">
          How it works
        </span>
        <h2 className="text-center text-3xl font-bold tracking-tight text-[var(--ink)] md:text-5xl">
          Three steps. Then it runs on its own.
        </h2>
        <div className="relative mt-10 grid w-full grid-cols-1 gap-6 md:grid-cols-3">
          <div className="absolute top-10 right-[15%] left-[15%] hidden h-0.5 bg-gradient-to-r from-transparent via-[var(--blue)]/20 to-transparent md:block" />
          {steps.map((step) => (
            <article
              key={step.n}
              className="group relative z-10 rounded-2xl border border-[var(--line)] bg-[var(--card)]/90 p-8 shadow-sm backdrop-blur-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-[var(--blue)]/10"
            >
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-[var(--blue)]/20 bg-gradient-to-br from-[var(--blue-soft)] to-white text-sm font-bold text-[var(--blue)] dark:to-[var(--card)]">
                {step.n}
              </div>
              <h3 className="mt-4 text-xl font-semibold text-[var(--ink)]">{step.title}</h3>
              <p className="mt-2 text-[var(--muted)]">{step.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductPreview() {
  return (
    <section
      id="preview"
      className="relative flex min-h-screen scroll-mt-20 flex-col justify-center overflow-hidden border-t border-[var(--line)] bg-gradient-to-br from-[#f8fafc] via-[#e0f2fe]/40 to-[#eff6ff] px-4 py-16 sm:px-6 md:px-10 md:py-24 dark:from-[var(--bg)] dark:via-[var(--bg)] dark:to-[var(--card)]"
    >
      <div className="pointer-events-none absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-[var(--blue)]/10 blur-[80px]" />
      <div className="pointer-events-none absolute right-[-10%] bottom-[-20%] h-[600px] w-[600px] rounded-full bg-sky-200/30 blur-[100px]" />
      <div className="relative z-10 mx-auto grid w-full max-w-[1440px] items-center gap-12 lg:grid-cols-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[var(--ink)] md:text-5xl md:leading-tight">
            Your week,
            <br />
            <span className="text-[var(--blue)]">already laid out.</span>
          </h2>
          <p className="mt-4 max-w-lg text-lg text-[var(--muted)]">
            Empty cards are open slots. Add a post when you are ready.
          </p>
        </div>
        <div className="preview-frame relative mx-auto w-full max-w-xl lg:mr-0">
          <div className="preview-tilt relative flex w-full flex-col gap-6 rounded-2xl border border-white/50 bg-[var(--card)]/80 p-4 shadow-[0_30px_60px_-15px_rgba(10,102,194,0.15)] backdrop-blur-xl md:p-6 dark:border-[var(--line)]">
            <DayCard
              title="Thursday"
              slots={[
                { time: "09:00 AM", filled: false },
                { time: "06:00 PM", filled: true },
              ]}
            />
            <DayCard
              title="Friday"
              slots={[
                { time: "09:00 AM", filled: false },
                { time: "06:00 PM", filled: false },
              ]}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function DayCard({
  title,
  slots,
}: {
  title: string;
  slots: { time: string; filled: boolean }[];
}) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-5 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-[var(--ink)]">{title}</h3>
      <div className="relative flex flex-col gap-3 pl-5">
        <div className="absolute top-3 bottom-3 left-[7px] w-px bg-[var(--line)]" />
        {slots.map((slot) => (
          <div key={slot.time} className="flex items-start gap-3">
            <div
              className={`relative z-10 mt-3 h-2 w-2 shrink-0 -ml-[21px] rounded-full ring-4 ring-[var(--card)] ${
                slot.filled ? "bg-[var(--blue)]" : "bg-[var(--line)]"
              }`}
            />
            {slot.filled ? (
              <div className="min-h-[88px] flex-1 rounded-xl border border-[var(--line)] bg-gradient-to-r from-[var(--blue-soft)]/50 to-[var(--card)] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)]">{slot.time}</p>
                <div className="mt-3 flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--blue-soft)] text-sm font-semibold text-[var(--blue)]">
                    U
                  </div>
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-2.5 w-3/4 rounded-full bg-[var(--line)]" />
                    <div className="h-2.5 w-1/2 rounded-full bg-[var(--line)]" />
                  </div>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex min-h-[88px] flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-[var(--line)] bg-[var(--bg)]/50 p-4 transition hover:border-[var(--blue)] hover:bg-[var(--blue-soft)]/40"
              >
                <span className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)]">
                  {slot.time}
                </span>
                <span className="text-sm font-medium text-[var(--blue)]">+ Add to queue</span>
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function PostCardArt() {
  return (
    <svg fill="none" height="120" viewBox="0 0 100 120" width="100" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect height="110" rx="8" stroke="#0a66c2" strokeWidth="4" width="92" x="4" y="4" />
      <circle cx="20" cy="20" fill="#0a66c2" r="6" />
      <rect fill="#0a66c2" height="4" rx="2" width="40" x="32" y="16" />
      <rect fill="#0a66c2" height="4" rx="2" width="20" x="32" y="24" />
      <rect fill="#0a66c2" height="60" rx="4" width="76" x="12" y="40" />
    </svg>
  );
}

function FeedCardArt() {
  return (
    <svg fill="none" height="80" viewBox="0 0 100 80" width="100" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect height="72" rx="8" stroke="#0a66c2" strokeWidth="4" width="92" x="4" y="4" />
      <circle cx="20" cy="20" fill="#0a66c2" r="6" />
      <rect fill="#0a66c2" height="4" rx="2" width="50" x="32" y="18" />
      <rect fill="#0a66c2" height="4" rx="2" width="76" x="12" y="36" />
      <rect fill="#0a66c2" height="4" rx="2" width="76" x="12" y="48" />
      <rect fill="#0a66c2" height="4" rx="2" width="40" x="12" y="60" />
    </svg>
  );
}
