"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ideaPromptsForTopic } from "@/lib/topics";
import { leaderPhoto } from "@/lib/thought-leaders";
import { CreatePostChooser } from "@/components/CreatePostChooser";

type Interest = { slug: string; label: string };
type Leader = {
  id?: string;
  catalogId?: string;
  name: string;
  headline: string;
  linkedinUrl: string;
  photoUrl?: string;
  tags?: string[];
};

export function HomeBoard({ firstName }: { firstName: string }) {
  const [interests, setInterests] = useState<Interest[]>([]);
  const [saved, setSaved] = useState<Leader[]>([]);
  const [catalog, setCatalog] = useState<(Leader & { id: string })[]>([]);
  const [active, setActive] = useState("");
  const [scheduledCount, setScheduledCount] = useState(0);
  const [connected, setConnected] = useState(true);
  const [banner, setBanner] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  // Interests, leaders, and queue count for the three Home cards.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("connected")) setBanner("LinkedIn connected.");
    if (params.get("authError")) setBanner(params.get("authError") || "");
    void Promise.all([
      fetch("/api/onboarding").then((r) => r.json()),
      fetch("/api/posts").then((r) => r.json()),
    ]).then(([onb, postsRes]) => {
        setConnected(Boolean(onb.connected));
        const items: Interest[] = onb.interests ?? [];
        setInterests(items);
        setActive(items[0]?.slug || "");
        setSaved(onb.savedLeaders ?? []);
        setCatalog(onb.catalog ?? []);
        const posts = (postsRes.posts ?? []) as { status: string; scheduledAt: string | null }[];
        setScheduledCount(posts.filter((p) => p.status === "queued").length);
      });
  }, []);

  const topicLabel = interests.find((i) => i.slug === active)?.label || interests[0]?.label || "your field";
  const ideas = useMemo(() => ideaPromptsForTopic(topicLabel), [topicLabel]);
  const extra = catalog.filter((c) => !saved.some((s) => s.catalogId === c.id)).slice(0, 2);
  const leaders = [...saved, ...extra].slice(0, 6);

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-4 py-6 md:px-10 md:py-8">
      {banner ? <div className="rounded-xl bg-white px-4 py-3 text-sm shadow-sm dark:bg-[var(--card)]">{banner}</div> : null}
      {!connected ? (
        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-[var(--card)]">
          <p className="text-[var(--muted)]">Connect LinkedIn to publish and personalize Home.</p>
          <Link href="/api/auth/linkedin" className="mt-3 inline-flex rounded-full bg-[#0a66c2] px-4 py-2 text-sm text-white">
            Connect LinkedIn
          </Link>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="group relative flex flex-col justify-between overflow-hidden rounded-xl bg-white p-6 shadow-sm hover:shadow-md dark:bg-[var(--card)]">
          <div className="relative z-10 flex flex-col gap-2">
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-[#0a66c2] text-[#dbe6ff]">
              <EditIcon />
            </div>
            <h2 className="text-xl font-semibold">Create a new post</h2>
            <p className="text-sm text-[var(--muted)]">Write, preview, and add it to your queue.</p>
          </div>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="relative z-10 mt-6 inline-flex items-center gap-1 self-start rounded-lg bg-[#004e99] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            Compose
            <ArrowIcon />
          </button>
        </div>

        <div className="flex flex-col justify-between rounded-xl bg-white p-6 shadow-sm hover:shadow-md dark:bg-[var(--card)]">
          <div className="flex flex-col gap-2">
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-[#40c2fd] text-[#004d6a]">
              <BulbIcon />
            </div>
            <h2 className="text-xl font-semibold">Start with an idea</h2>
            <p className="text-sm text-[var(--muted)]">Topic prompts for now. AI writing will live in AI Buddy later.</p>
          </div>
          <a
            href="#prompts"
            className="mt-6 inline-flex self-start rounded-lg border border-[#004e99] px-4 py-2 text-sm font-semibold text-[#004e99] hover:bg-[#f0f4f8]"
          >
            Browse ideas
          </a>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex flex-1 flex-col justify-between rounded-xl bg-white p-6 shadow-sm dark:bg-[var(--card)]">
            <div className="flex flex-col gap-2">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#007467] text-[#66fde7]">
                  <CalIcon />
                </div>
                <span className="text-3xl font-semibold text-[#004e99]">{scheduledCount}</span>
              </div>
              <h2 className="text-xl font-semibold">This week</h2>
              <p className="text-sm text-[var(--muted)]">
                scheduled post{scheduledCount === 1 ? "" : "s"} in your queue.
              </p>
            </div>
            <Link href="/posts" className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-[#004e99]">
              Go to My posts
              <ArrowIcon />
            </Link>
          </div>
          <p className="px-2 text-xs font-bold tracking-wide text-[var(--muted)]">
            Hi {firstName}. UniSin will publish your posts.
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-8 lg:flex-row">
        <div className="flex flex-1 flex-col gap-8">
          <section className="flex flex-col gap-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h3 className="text-2xl font-semibold">Your topics</h3>
                <p className="text-sm text-[var(--muted)]">Ideas and leaders follow the pill you select.</p>
              </div>
              <Link href="/onboarding/interests?edit=1" className="shrink-0 text-sm font-semibold text-[#004e99]">
                Edit interests
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {interests.length ? (
                interests.map((topic) => (
                  <button
                    key={topic.slug}
                    type="button"
                    onClick={() => setActive(topic.slug)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${
                      active === topic.slug
                        ? "bg-[#004e99] text-white shadow-sm"
                        : "bg-[#eaeef2] text-[var(--muted)] hover:bg-[#e4e9ed] dark:bg-[var(--card)]"
                    }`}
                  >
                    {topic.label}
                  </button>
                ))
              ) : (
                <p className="text-sm text-[var(--muted)]">Finish onboarding to see topics here.</p>
              )}
            </div>
          </section>

          <section id="prompts" className="flex scroll-mt-24 flex-col gap-3">
            {ideas.map((idea) => (
              <div
                key={idea}
                className="group flex flex-col items-start justify-between gap-4 rounded-xl bg-white p-4 shadow-sm sm:flex-row sm:items-center dark:bg-[var(--card)]"
              >
                <p className="flex-1 text-base">{idea}</p>
                <Link
                  href={`/compose?idea=${encodeURIComponent(idea)}`}
                  className="whitespace-nowrap rounded-lg bg-[#004e99] px-4 py-2 text-sm font-semibold text-white sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
                >
                  Use this idea
                </Link>
              </div>
            ))}
          </section>
        </div>

        <aside className="flex w-full flex-col gap-4 lg:w-[400px]">
          <div>
            <h3 className="text-2xl font-semibold">Recommended thought leaders</h3>
            <p className="text-sm text-[var(--muted)]">Inspiration only — we do not follow accounts for you.</p>
          </div>
          {leaders.length ? (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {leaders.map((leader) => (
                <a
                  key={leader.linkedinUrl + leader.name}
                  href={leader.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-col items-center gap-2 rounded-xl bg-white p-4 text-center shadow-sm transition hover:-translate-y-1 dark:bg-[var(--card)]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={leader.photoUrl || leaderPhoto({ name: leader.name, linkedinUrl: leader.linkedinUrl })}
                    alt=""
                    className="h-16 w-16 rounded-full object-cover shadow-md"
                  />
                  <span className="text-sm font-semibold">{leader.name}</span>
                  <span className="line-clamp-2 text-xs leading-tight text-[var(--muted)]">
                    {leader.headline || "LinkedIn"}
                  </span>
                </a>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--muted)]">Finish onboarding to see leaders here.</p>
          )}
        </aside>
      </div>
      <CreatePostChooser open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}

function EditIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M4 20h4l10-10-4-4L4 16v4Zm14.7-13.3a1 1 0 0 0 0-1.4l-2-2a1 1 0 0 0-1.4 0l-1.8 1.8 4 4 1.2-1.4Z" />
    </svg>
  );
}

function BulbIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M9 21h6v-1H9v1Zm3-19a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2Z" />
    </svg>
  );
}

function CalIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M7 2v2H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2H7Zm12 8H5v9h14v-9Z" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
