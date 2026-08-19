"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { parseLinkedInProfileUrl } from "@/lib/thought-leaders";

type Leader = {
  id: string;
  name: string;
  headline: string;
  linkedinUrl: string;
  photoUrl: string;
  tags: string[];
};

type Custom = { url: string; name: string };

const AVATAR = [
  "bg-[#0a66c2] text-[#dbe6ff]",
  "bg-[#007467] text-[#66fde7]",
  "bg-[#7bd0ff] text-[#001e2c]",
  "bg-[#dfe3e7] text-[#171c1f]",
];

export function LeadersOnboarding() {
  const router = useRouter();
  const [catalog, setCatalog] = useState<Leader[]>([]);
  const [picked, setPicked] = useState<string[]>([]);
  const [custom, setCustom] = useState<Custom[]>([]);
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void fetch("/api/onboarding")
      .then((r) => r.json())
      .then((j) => {
        setCatalog(j.catalog ?? []);
        const saved = (j.savedLeaders ?? []) as {
          catalogId: string;
          custom: boolean;
          linkedinUrl: string;
          name: string;
        }[];
        setPicked(saved.filter((s) => s.catalogId).map((s) => s.catalogId));
        setCustom(saved.filter((s) => s.custom).map((s) => ({ url: s.linkedinUrl, name: s.name })));
      });
  }, []);

  const total = picked.length + custom.length;

  function toggle(id: string) {
    setError("");
    setPicked((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length + custom.length >= 10) return prev;
      return [...prev, id];
    });
  }

  function addUrl() {
    const parsed = parseLinkedInProfileUrl(url);
    if (!parsed) {
      setError("Paste a LinkedIn profile URL such as https://www.linkedin.com/in/username");
      return;
    }
    if (custom.some((c) => c.url === parsed.url)) return;
    if (total >= 10) {
      setError("Pick up to 10 thought leaders");
      return;
    }
    setCustom((prev) => [...prev, { url: parsed.url, name: parsed.name }]);
    setUrl("");
    setError("");
  }

  async function next() {
    if (total < 2) {
      setError("Select at least 2 thought leaders");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/onboarding", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "leaders", catalogIds: picked, custom }),
    });
    const json = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(json.error || "Could not save");
      return;
    }
    router.push("/onboarding/analyze");
  }

  async function skip() {
    await fetch("/api/onboarding", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "skip" }),
    });
    router.push("/home");
  }

  return (
    <div className="relative min-h-screen bg-[#f6fafe] text-[var(--ink)] dark:bg-[var(--bg)]">
      <header className="fixed top-0 z-50 w-full bg-[#f6fafe]/80 shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-xl dark:bg-[var(--bg)]/80">
        <div className="flex h-16 w-full items-center justify-between px-6 md:px-10">
          <Link href="/home" className="text-2xl font-semibold tracking-tight text-[#004e99]">
            UniSin
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="relative pt-16">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#e0e7ff] via-[#f3e8ff] to-[#dbeafe] dark:from-[var(--bg)] dark:via-[var(--card)] dark:to-[var(--bg)]" />
        <div className="unisin-blob pointer-events-none absolute top-[10%] left-[15%] z-0 h-64 w-64 rounded-full bg-[#004e99]/20 opacity-70 blur-3xl mix-blend-multiply dark:mix-blend-normal" />
        <div
          className="unisin-blob pointer-events-none absolute top-[20%] right-[20%] z-0 h-72 w-72 rounded-full bg-[#00668a]/20 opacity-70 blur-3xl mix-blend-multiply dark:mix-blend-normal"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="unisin-blob pointer-events-none absolute bottom-[10%] left-[30%] z-0 h-80 w-80 rounded-full bg-[#00594f]/20 opacity-70 blur-3xl mix-blend-multiply dark:mix-blend-normal"
          style={{ animationDelay: "4s" }}
        />

        <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-10 pb-16 md:px-10">
          <div className="flex flex-col gap-8 rounded-[32px] bg-white/60 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.08)] backdrop-blur-xl md:p-10 dark:bg-[var(--card)]/70">
            <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
              <div className="flex h-14 w-14 -rotate-6 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#004e99] to-[#00668a] text-white shadow-lg">
                <BulbIcon />
              </div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Discover industry thought leaders</h1>
              <p className="text-base leading-relaxed text-[var(--muted)]">
                Select 2–10 people who shape conversations in your field. These are bookmarks for
                inspiration — we cannot follow them for you on LinkedIn.
              </p>
            </div>

            <div className="mx-auto flex w-full max-w-2xl flex-col gap-2 md:flex-row">
              <div className="relative flex-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[var(--muted)]">
                  <LinkIcon />
                </div>
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addUrl();
                    }
                  }}
                  placeholder="Enter a LinkedIn profile URL e.g. https://www.linkedin.com/in/username"
                  className="h-12 w-full rounded-xl bg-white/50 pl-11 pr-4 text-base shadow-[inset_0_1px_3px_rgba(0,0,0,0.06)] outline-none placeholder:text-[var(--muted)] focus:bg-white focus:ring-2 focus:ring-[#004e99] dark:bg-[var(--card)]"
                />
              </div>
              <button
                type="button"
                onClick={addUrl}
                className="flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#004e99] px-8 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(10,102,194,0.3)] hover:bg-[#005eb5]"
              >
                <PlusIcon />
                Add Profile
              </button>
            </div>

            <div className="max-h-[70vh] min-h-[520px] overflow-y-auto overflow-x-hidden px-3 pt-5 pb-8">
            {custom.length ? (
              <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {custom.map((row, i) => (
                  <div key={row.url} className="relative">
                    <div className="absolute -top-3 -right-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-[#004e99] text-white shadow-md">
                      <CheckIcon />
                    </div>
                    <div className="flex h-full min-h-[220px] flex-col rounded-2xl bg-white p-7 shadow-[0_4px_24px_rgba(10,102,194,0.15)] ring-2 ring-[#004e99] md:p-8 dark:bg-[var(--card)]">
                      <div
                        className={`mb-4 flex h-14 w-14 items-center justify-center rounded-full text-xl font-semibold ${AVATAR[i % AVATAR.length]}`}
                      >
                        {initials(row.name)}
                      </div>
                      <h3 className="mb-1 truncate text-xl font-semibold">{row.name}</h3>
                      <p className="mb-4 flex-1 text-sm text-[var(--muted)]">Added from LinkedIn URL</p>
                      <button
                        type="button"
                        onClick={() => setCustom((p) => p.filter((x) => x.url !== row.url))}
                        className="self-start text-xs font-semibold text-[var(--muted)] hover:text-[var(--blue)]"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {catalog.map((leader, i) => {
                const on = picked.includes(leader.id);
                return (
                  <div key={leader.id} className="group relative">
                    <div
                      className={`absolute -top-3 -right-3 z-20 flex h-8 w-8 items-center justify-center rounded-full shadow-md transition ${
                        on
                          ? "scale-100 bg-[#004e99] text-white"
                          : "scale-0 bg-[#e4e9ed] text-[var(--muted)] opacity-0 group-hover:scale-100 group-hover:opacity-100"
                      }`}
                    >
                      {on ? <CheckIcon /> : <PlusIcon />}
                    </div>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => toggle(leader.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          toggle(leader.id);
                        }
                      }}
                      className={`flex h-full min-h-[220px] w-full cursor-pointer flex-col rounded-2xl p-7 text-left transition md:p-8 ${
                        on
                          ? "bg-white shadow-[0_4px_24px_rgba(10,102,194,0.15)] ring-2 ring-[#004e99] dark:bg-[var(--card)]"
                          : "bg-white/70 shadow-[0_2px_12px_rgba(0,0,0,0.04)] backdrop-blur-md hover:bg-white hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] dark:bg-[var(--card)]/50"
                      }`}
                    >
                      <div
                        className={`mb-5 flex h-14 w-14 items-center justify-center rounded-full text-xl font-semibold ${AVATAR[i % AVATAR.length]}`}
                      >
                        {initials(leader.name)}
                      </div>
                      <div className="mb-2 flex items-start justify-between gap-3">
                        <h3 className="truncate text-xl font-semibold">{leader.name}</h3>
                        <a
                          href={leader.linkedinUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="shrink-0 text-xs font-semibold text-[var(--blue)]"
                        >
                          Open
                        </a>
                      </div>
                      <p className="mb-6 line-clamp-2 min-h-[40px] flex-1 text-sm leading-relaxed text-[var(--muted)]">
                        {leader.headline}
                      </p>
                      <div className="mt-auto flex flex-wrap gap-2">
                        {leader.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                              on ? "bg-[#e0f2fe] text-[#004e99]" : "bg-[#e4e9ed] text-[var(--muted)]"
                            }`}
                          >
                            {hashTag(tag)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            </div>

            {error ? <p className="text-center text-sm text-red-600">{error}</p> : null}

            <div className="flex justify-center">
              <span className="flex items-center gap-2 rounded-full bg-[#e4e9ed]/50 px-4 py-2 text-xs font-bold backdrop-blur-sm">
                <span className="h-2 w-2 rounded-full bg-[#004e99]" />
                {total} selected · 2 minimum
              </span>
            </div>

            <div className="flex flex-col items-center justify-between gap-4 rounded-[24px] bg-white/80 p-2 shadow-[0_4px_16px_rgba(0,0,0,0.06)] backdrop-blur-xl sm:flex-row sm:rounded-full dark:bg-[var(--card)]">
              <button
                type="button"
                onClick={() => router.push("/onboarding/interests")}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold text-[var(--muted)] hover:bg-[#eaeef2] sm:w-auto"
              >
                <BackIcon />
                Back
              </button>
              <div className="flex w-full flex-col items-center gap-2 sm:w-auto sm:flex-row">
                <button
                  type="button"
                  onClick={() => void skip()}
                  className="h-12 w-full rounded-full px-6 text-sm font-semibold text-[var(--muted)] hover:bg-[#eaeef2] sm:w-auto"
                >
                  Skip for now
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void next()}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#004e99] px-8 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(10,102,194,0.3)] hover:bg-[#005eb5] disabled:opacity-50 sm:w-auto"
                >
                  Next Step
                  <ArrowIcon />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 z-50 h-2 w-full bg-[#e4e9ed] dark:bg-[var(--line)]">
          <div className="h-full bg-[#004e99] transition-all" style={{ width: "66%" }} />
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

function hashTag(tag: string) {
  return (
    "#" +
    tag
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join("")
  );
}

function BulbIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M9 21h6v-1H9v1Zm3-19a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2Z" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M10 13a5 5 0 0 0 7.07 0l1.41-1.41a5 5 0 0 0-7.07-7.07L10 5.76" />
      <path d="M14 11a5 5 0 0 0-7.07 0L5.52 12.41a5 5 0 0 0 7.07 7.07L14 18.24" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
      <path d="M5 12l4 4L19 7" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M19 12H5M11 18l-6-6 6-6" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
