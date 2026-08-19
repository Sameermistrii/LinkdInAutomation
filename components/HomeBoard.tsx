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
  const [openSlots, setOpenSlots] = useState(0);
  const [connected, setConnected] = useState(true);
  const [banner, setBanner] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("connected")) setBanner("LinkedIn connected.");
    if (params.get("authError")) setBanner(params.get("authError") || "");
    void Promise.all([fetch("/api/onboarding").then((r) => r.json()), fetch("/api/queue-slots").then((r) => r.json())]).then(
      ([onb, slots]) => {
        setConnected(Boolean(onb.connected));
        const items: Interest[] = onb.interests ?? [];
        setInterests(items);
        setActive(items[0]?.slug || "");
        setSaved(onb.savedLeaders ?? []);
        setCatalog(onb.catalog ?? []);
        const list = slots.slots ?? [];
        const now = Date.now();
        setOpenSlots(list.filter((s: { at: string; post: unknown }) => new Date(s.at).getTime() > now && !s.post).length);
      },
    );
  }, []);

  const topicLabel = interests.find((i) => i.slug === active)?.label || interests[0]?.label || "your field";
  const ideas = useMemo(() => ideaPromptsForTopic(topicLabel), [topicLabel]);
  const extra = catalog.filter((c) => !saved.some((s) => s.catalogId === c.id)).slice(0, 2);
  const leaders = [...saved, ...extra].slice(0, 6);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
      <div>
        {banner ? (
          <div className="card mb-6 px-4 py-3 text-sm">{banner}</div>
        ) : null}
        {!connected ? (
          <div className="card mb-6 p-6">
            <p className="text-[var(--muted)]">Connect LinkedIn to publish and personalize Home.</p>
            <Link href="/api/auth/linkedin" className="mt-3 inline-flex rounded-full bg-[#0a66c2] px-4 py-2 text-sm text-white">
              Connect LinkedIn
            </Link>
          </div>
        ) : null}
        <div className="mb-8 grid gap-4 md:grid-cols-2">
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="card bg-[var(--blue-soft)] p-6 text-left transition hover:border-[var(--blue)]"
          >
            <p className="text-lg font-semibold">Create a new post</p>
            <p className="mt-2 text-sm text-[var(--muted)]">Write, preview, and add it to your queue.</p>
          </button>
          <div className="card bg-[var(--blue-soft)] p-6">
            <p className="text-lg font-semibold">Start with an idea</p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Topic prompts for now. AI writing will live in AI Buddy later.
            </p>
          </div>
        </div>

        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Your topics</h2>
            <p className="text-sm text-[var(--muted)]">Ideas and leaders follow the pill you select.</p>
          </div>
          <Link href="/onboarding/interests?edit=1" className="text-sm text-[var(--blue)]">
            Edit interests
          </Link>
        </div>
        <div className="mb-8 flex flex-wrap gap-2">
          {interests.length ? (
            interests.map((topic) => (
              <button
                key={topic.slug}
                type="button"
                onClick={() => setActive(topic.slug)}
                className={`rounded-full border px-3 py-1.5 text-sm ${
                  active === topic.slug
                    ? "border-[var(--blue)] bg-[var(--blue)] text-white"
                    : "border-[var(--line)] bg-[var(--card)]"
                }`}
              >
                {topic.label}
              </button>
            ))
          ) : (
            <p className="text-sm text-[var(--muted)]">Finish onboarding to see topics here.</p>
          )}
        </div>

        <h2 className="mb-3 text-xl font-semibold">Prompt starters</h2>
        <div className="mb-10 grid gap-3">
          {ideas.map((idea) => (
            <div key={idea} className="card flex items-center justify-between gap-3 px-5 py-4">
              <p className="text-sm">{idea}</p>
              <Link
                href={`/compose?idea=${encodeURIComponent(idea)}`}
                className="shrink-0 rounded-full border border-[var(--line)] px-3 py-1.5 text-sm"
              >
                Use this idea
              </Link>
            </div>
          ))}
        </div>

        <h2 className="mb-1 text-xl font-semibold">Recommended thought leaders</h2>
        <p className="mb-4 text-sm text-[var(--muted)]">
          Inspiration only — we do not follow accounts for you.
        </p>
        {leaders.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {leaders.map((leader) => (
              <a
                key={leader.linkedinUrl + leader.name}
                href={leader.linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="card flex items-center gap-3 p-4"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={leader.photoUrl || leaderPhoto({ name: leader.name })}
                  alt=""
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div className="min-w-0">
                  <p className="font-medium">{leader.name}</p>
                  <p className="truncate text-sm text-[var(--muted)]">{leader.headline || "LinkedIn"}</p>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--muted)]">Finish onboarding to see leaders here.</p>
        )}
      </div>
      <aside className="space-y-4">
        <div className="card p-5">
          <p className="font-medium">This week</p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {openSlots} open slot{openSlots === 1 ? "" : "s"} in your queue.
          </p>
          <Link href="/posts" className="mt-3 inline-block text-sm text-[var(--blue)]">
            Go to My posts
          </Link>
        </div>
        <p className="px-1 text-xs text-[var(--muted)]">Hi {firstName}. UniSin publishes only through the official API.</p>
      </aside>
      <CreatePostChooser open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
