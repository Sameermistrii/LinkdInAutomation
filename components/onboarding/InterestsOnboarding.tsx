"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BrandMark } from "@/components/BrandMark";
import { slugifyLabel } from "@/lib/topics";

type Topic = { slug: string; label: string };

export function InterestsOnboarding() {
  const router = useRouter();
  const edit = useSearchParams().get("edit") === "1";
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selected, setSelected] = useState<Topic[]>([]);
  const [custom, setCustom] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void fetch("/api/onboarding")
      .then((r) => r.json())
      .then((j) => {
        setTopics(j.topics ?? []);
        if (j.interests?.length) setSelected(j.interests);
        else {
          const suggested = (j.suggested as string[]) ?? [];
          setSelected((j.topics as Topic[]).filter((t) => suggested.includes(t.slug)).slice(0, 3));
        }
      });
  }, []);

  const selectedSlugs = useMemo(() => new Set(selected.map((t) => t.slug)), [selected]);
  const chips = useMemo(
    () => [...selected.filter((t) => !topics.some((x) => x.slug === t.slug)), ...topics],
    [selected, topics],
  );

  function toggle(topic: Topic) {
    setError("");
    setSelected((prev) => {
      if (prev.some((t) => t.slug === topic.slug)) return prev.filter((t) => t.slug !== topic.slug);
      if (prev.length >= 8) return prev;
      return [...prev, topic];
    });
  }

  function addCustom() {
    const label = custom.trim();
    if (!label) return;
    const slug = slugifyLabel(label);
    if (selected.some((t) => t.slug === slug)) return;
    if (selected.length >= 8) {
      setError("Choose up to 8 topics");
      return;
    }
    setSelected((prev) => [...prev, { slug, label }]);
    setCustom("");
  }

  async function next() {
    if (selected.length < 3) {
      setError("Select at least 3 topics");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/onboarding", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "interests", interests: selected }),
    });
    const json = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(json.error || "Could not save");
      return;
    }
    router.push(edit ? "/home" : "/onboarding/leaders");
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
    <div className="relative min-h-screen overflow-x-hidden bg-[#f6fafe] text-[var(--ink)] dark:bg-[var(--bg)]">
      <header className="fixed top-0 z-50 w-full border-b border-white/20 bg-[#f6fafe]/60 shadow-[0_1px_12px_rgba(0,0,0,0.03)] backdrop-blur-xl dark:border-[var(--line)] dark:bg-[var(--bg)]/70">
        <div className="flex h-16 w-full items-center justify-between px-4 md:px-10">
          <BrandMark href="/home" size="lg" />
          <ThemeToggle />
        </div>
      </header>

      <main className="relative flex min-h-screen flex-col items-center overflow-hidden bg-gradient-to-br from-[#e0e7ff] via-[#f3e8ff] to-[#dbeafe] pt-16 dark:from-[var(--bg)] dark:via-[var(--card)] dark:to-[var(--bg)]">
        <div className="pointer-events-none absolute top-[-10%] left-[-10%] h-[50%] w-[50%] rounded-full bg-blue-400/20 blur-[120px] mix-blend-multiply dark:mix-blend-normal" />
        <div className="pointer-events-none absolute right-[-10%] bottom-[-10%] h-[60%] w-[60%] rounded-full bg-indigo-400/20 blur-[150px] mix-blend-multiply dark:mix-blend-normal" />
        <div className="pointer-events-none absolute top-[30%] right-[10%] h-[40%] w-[30%] rounded-full bg-purple-400/20 blur-[100px] mix-blend-multiply dark:mix-blend-normal" />

        <div className="relative z-10 mx-auto mt-6 flex w-full max-w-[1000px] flex-1 flex-col items-center px-4 py-8 md:px-10 md:py-12">
          <div className="relative flex w-full flex-col items-center overflow-hidden rounded-3xl border border-white/80 bg-white/60 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.04),inset_0_1px_2px_rgba(255,255,255,0.8)] backdrop-blur-2xl md:p-12 dark:border-[var(--line)] dark:bg-[var(--card)]/80">
            <div className="pointer-events-none absolute top-0 right-0 h-64 w-64 rounded-bl-full bg-gradient-to-bl from-white/40 to-transparent" />
            <div className="pointer-events-none absolute bottom-0 left-0 h-48 w-48 rounded-tr-full bg-gradient-to-tr from-white/40 to-transparent" />

            <div className="relative z-10 mb-8 flex max-w-2xl flex-col items-center text-center">
              <div className="mb-6 flex h-14 w-14 rotate-3 items-center justify-center rounded-2xl border border-white/60 bg-gradient-to-br from-[#e0f2fe] to-white text-[var(--blue)] shadow-[0_4px_12px_rgba(10,102,194,0.15)] dark:from-[var(--blue-soft)] dark:to-[var(--card)]">
                <InterestsIcon />
              </div>
              <h1 className="mb-4 bg-gradient-to-r from-[#004e99] via-[#00668a] to-purple-600 bg-clip-text pb-1 text-3xl font-bold tracking-tight text-transparent md:text-5xl md:leading-[56px]">
                Customize your interest areas
              </h1>
              <p className="max-w-xl text-lg leading-relaxed text-[var(--muted)]">
                Select 3–5 topics you are most passionate about. We use these to suggest thought leaders and
                post ideas. AI writing comes later.
              </p>
            </div>

            <div className="relative z-10 mb-12 w-full max-w-md">
              <div className="flex w-full flex-col gap-2 rounded-xl border border-white bg-white/80 p-1.5 shadow-[0_4px_16px_rgba(0,0,0,0.05)] backdrop-blur-md dark:border-[var(--line)] dark:bg-[var(--card)] sm:flex-row sm:items-center">
                <div className="flex min-w-0 flex-1 items-center">
                <span className="ml-2 text-[var(--muted)]">
                  <SearchIcon />
                </span>
                <input
                  value={custom}
                  onChange={(e) => setCustom(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustom();
                    }
                  }}
                  placeholder="Enter your own topic..."
                  className="min-w-0 flex-1 border-none bg-transparent px-3 py-2 text-base outline-none placeholder:text-[#727783]"
                />
                </div>
                <button
                  type="button"
                  onClick={addCustom}
                  className="w-full rounded-lg bg-gradient-to-r from-[#004e99] to-[#00668a] px-6 py-2 text-sm font-semibold text-white shadow-[0_2px_8px_rgba(10,102,194,0.3)] hover:from-[#005eb5] hover:to-[#004e99] sm:w-auto"
                >
                  Submit
                </button>
              </div>
            </div>

            <div className="relative z-10 mb-8 flex flex-wrap justify-center gap-2">
              {chips.map((topic) => {
                const on = selectedSlugs.has(topic.slug);
                return (
                  <button
                    key={topic.slug}
                    type="button"
                    onClick={() => toggle(topic)}
                    className={
                      on
                        ? "group relative flex items-center gap-2 overflow-hidden rounded-full border border-[var(--blue)]/20 bg-gradient-to-b from-[var(--blue)] to-[#003d7a] px-6 py-2 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(10,102,194,0.4)] transition hover:-translate-y-1 hover:scale-105"
                        : "rounded-full border border-white bg-white/70 px-4 py-2 text-sm font-semibold text-[var(--muted)] shadow-[0_2px_8px_rgba(0,0,0,0.04)] backdrop-blur-sm transition hover:-translate-y-1 hover:bg-white hover:text-[var(--blue)] dark:border-[var(--line)] dark:bg-[var(--card)]"
                    }
                  >
                    {on ? <CheckIcon /> : null}
                    {topic.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative z-10 mt-auto flex w-full flex-col items-center pb-8 pt-8">
            {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}
            <p className="mb-8 text-xs font-bold tracking-wider text-[#727783] uppercase">
              {selected.length} selected · 3 minimum, 8 maximum
            </p>
            <div className="flex w-full flex-col gap-2 rounded-2xl border border-white bg-white/80 p-2 shadow-[0_4px_16px_rgba(0,0,0,0.05)] backdrop-blur-md sm:max-w-md sm:flex-row sm:items-center sm:justify-between sm:rounded-full dark:border-[var(--line)] dark:bg-[var(--card)]">
              <button
                type="button"
                onClick={() => void skip()}
                className="w-full rounded-full px-6 py-3 text-sm font-semibold text-[var(--muted)] hover:bg-[#eaeef2]/50 hover:text-[var(--blue)] sm:w-auto sm:py-2"
              >
                Skip for now
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => void next()}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#004e99] to-[#00668a] px-8 py-3 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(10,102,194,0.3)] transition hover:-translate-y-1 disabled:opacity-50 sm:w-auto"
              >
                {edit ? "Save" : "Next Step"}
                <ArrowIcon />
              </button>
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 z-50 h-1.5 w-full bg-[#e4e9ed]/50 backdrop-blur-sm dark:bg-[var(--line)]">
          <div className="h-full w-1/3 rounded-r-full bg-gradient-to-r from-[var(--blue)] via-[#00668a] to-purple-500 shadow-[0_0_12px_rgba(10,102,194,0.6)]" />
        </div>
      </main>
    </div>
  );
}

function InterestsIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2a3 3 0 0 1 3 3c0 .74-.27 1.41-.72 1.94L16 8.66V11h2.34l1.72-1.72A3 3 0 1 1 22 12c0 .74-.27 1.41-.72 1.94L19.56 15.66 12 23.22 4.44 15.66 2.72 13.94A3 3 0 1 1 5.66 11H8V8.66l1.72-1.72A3 3 0 0 1 12 2Z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3-3" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
      <path d="M5 12l4 4L19 7" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
