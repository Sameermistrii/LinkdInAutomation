"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { QueueBoard, type QueueSlot } from "@/components/QueueBoard";
import { ScheduleModal } from "@/components/ScheduleModal";
import { StatusTabs, type TabKey } from "@/components/StatusTabs";
import { keepQueueSlot } from "@/lib/datetime";

type Post = {
  id: number;
  body: string;
  status: "draft" | "queued" | "published" | "error";
  scheduledAt: string | null;
  publishedAt: string | null;
  errorMessage: string;
};

type Account = {
  name: string;
  headline: string;
  photoUrl: string;
};

type Initial = {
  name: string;
  photoUrl: string;
  headline: string;
  connected: boolean;
};

export function Dashboard({ initial }: { initial: Initial }) {
  const [tab, setTab] = useState<TabKey>("queued");
  const [posts, setPosts] = useState<Post[]>([]);
  const [counts, setCounts] = useState<Record<TabKey, number>>({
    queued: 0,
    published: 0,
    draft: 0,
    error: 0,
  });
  const [slots, setSlots] = useState<QueueSlot[]>([]);
  const [account, setAccount] = useState<Account | null>(
    initial.connected
      ? { name: initial.name, headline: initial.headline, photoUrl: initial.photoUrl }
      : null,
  );
  const [sessionName, setSessionName] = useState(initial.name);
  const [sessionPhoto, setSessionPhoto] = useState(initial.photoUrl);
  const [connected, setConnected] = useState(initial.connected);
  const [ready, setReady] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleEditAt, setScheduleEditAt] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [nowMs, setNowMs] = useState(() => Date.now());

  async function load() {
    try {
      const slotsRes = await fetch("/api/queue-slots").then((r) => r.json());
      const [postsRes, accountRes, meRes] = await Promise.all([
        fetch("/api/posts").then((r) => r.json()),
        fetch("/api/account").then((r) => r.json()),
        fetch("/api/auth/me").then((r) => r.json()),
      ]);
      const loaded: Post[] = postsRes.posts ?? [];
      setPosts(loaded);
      setCounts(
        postsRes.counts ?? {
          queued: loaded.filter((p) => p.status === "queued").length,
          published: loaded.filter((p) => p.status === "published").length,
          draft: loaded.filter((p) => p.status === "draft").length,
          error: loaded.filter((p) => p.status === "error").length,
        },
      );
      setSlots(slotsRes.slots ?? []);
      setConnected(Boolean(accountRes.connected));
      setAccount(accountRes.account);
      setSessionName(meRes.user?.name || accountRes.account?.name || initial.name);
      setSessionPhoto(meRes.user?.picture || accountRes.account?.photoUrl || initial.photoUrl);
    } finally {
      setReady(true);
    }
  }

  useEffect(() => {
    void load();
    const params = new URLSearchParams(window.location.search);
    if (params.get("connected")) setNotice("LinkedIn connected.");
    if (params.get("authError")) setNotice(params.get("authError") || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (scheduleOpen) return;
    const tick = () => void load();
    const id = window.setInterval(tick, 15_000);
    const onShow = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onShow);
    window.addEventListener("focus", tick);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onShow);
      window.removeEventListener("focus", tick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scheduleOpen]);

  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), 10_000);
    return () => window.clearInterval(id);
  }, []);

  const upcomingSlots = useMemo(
    () => slots.filter((s) => keepQueueSlot(new Date(s.at).getTime(), Boolean(s.post), nowMs)),
    [slots, nowMs],
  );

  const subtitle = useMemo(() => {
    if (!ready) return "Loading your posts…";
    if (!connected) return "Connect LinkedIn to start scheduling.";
    const openSlots = upcomingSlots.filter((s) => !s.post).length;
    if (counts.queued === 0 && openSlots === 0) return "You have no scheduled posts.";
    if (counts.queued === 0) {
      return `${openSlots} open slot${openSlots === 1 ? "" : "s"} this week — add posts to fill them.`;
    }
    return `You have ${counts.queued} scheduled post${counts.queued === 1 ? "" : "s"}.`;
  }, [ready, connected, counts.queued, upcomingSlots]);

  async function removePost(id: number) {
    await fetch(`/api/posts/${id}`, { method: "DELETE" });
    await load();
  }

  async function skipDay(date: string, ats: string[]) {
    const res = await fetch("/api/schedule", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "skip", date, ats }),
    });
    const json = await res.json();
    if (!res.ok) setNotice(json.error || "Could not skip this day");
    await load();
  }

  async function postNow(id: number) {
    const res = await fetch(`/api/posts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "now" }),
    });
    const json = await res.json();
    if (!res.ok) setNotice(json.error || "Could not publish");
    else setNotice("Published to LinkedIn.");
    await load();
  }

  const list = posts.filter((p) => p.status === tab);
  const showQueue = connected;

  return (
    <div className="flex flex-col gap-8 px-4 py-6 md:px-8 md:py-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight md:text-5xl">My posts.</h1>
        <p className="text-lg text-[var(--muted)]">{subtitle}</p>
      </div>

      {notice ? (
        <div className="rounded-xl bg-white px-4 py-3 text-sm shadow-sm dark:bg-[var(--card)]">{notice}</div>
      ) : null}

      {!ready ? (
        <div className="h-40 animate-pulse rounded-xl bg-white dark:bg-[var(--card)]" />
      ) : !showQueue ? (
        <div className="rounded-xl bg-white p-8 shadow-sm dark:bg-[var(--card)]">
          <p className="mb-4 max-w-xl text-[var(--muted)]">
            Connect LinkedIn once so we can publish to your profile or Company Page. Signing in with
            Google only opens your dashboard.
          </p>
          <Link
            href="/api/auth/linkedin"
            className="inline-flex rounded-full bg-[#0a66c2] px-5 py-2.5 text-sm font-medium text-white"
          >
            Connect LinkedIn
          </Link>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between">
            <StatusTabs active={tab} counts={counts} onChange={setTab} />
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:w-auto">
              <button
                type="button"
                onClick={() => {
                  setScheduleEditAt(null);
                  setScheduleOpen(true);
                }}
                className="w-full rounded-lg border border-[#004e99]/20 bg-white px-4 py-2 text-center text-sm font-semibold text-[#004e99] hover:bg-[#eff6ff] sm:w-auto dark:bg-[var(--card)]"
              >
                Add schedule
              </button>
              <Link
                href="/compose"
                className="inline-flex w-full items-center justify-center gap-1 rounded-lg bg-[#004e99] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#005eb5] sm:w-auto"
              >
                <span className="text-lg leading-none">+</span>
                New post
              </Link>
            </div>
          </div>

          {tab === "queued" ? (
              <QueueBoard
                slots={upcomingSlots}
                name={account?.name || sessionName}
                photoUrl={account?.photoUrl || sessionPhoto}
                onDelete={(id) => void removePost(id)}
                onSkipDay={(date, ats) => void skipDay(date, ats)}
                onPostNow={(id) => void postNow(id)}
                onEditSlot={(at) => {
                  setScheduleEditAt(at);
                  setScheduleOpen(true);
                }}
              />
          ) : (
            <PostList
              posts={list}
              onDelete={(id) => void removePost(id)}
              onPostNow={(id) => void postNow(id)}
            />
          )}
        </>
      )}

      <button
        type="button"
        className="fixed right-4 bottom-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#004e99] text-white shadow-lg hover:scale-105 lg:right-8 lg:bottom-8"
        title="Help"
        onClick={() =>
          setNotice("Add posts to your time slots. They publish when the time comes — keep this tab open or run the worker. On Vercel Hobby, auto-publish is once a day, so opening My posts also sends anything already due.");
        }
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
          <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
        </svg>
      </button>

      <ScheduleModal
        open={scheduleOpen}
        initialAt={scheduleEditAt}
        onClose={() => {
          setScheduleOpen(false);
          setScheduleEditAt(null);
        }}
        onSubmit={async (at, from, date) => {
          const res = await fetch("/api/schedule", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(
              from ? { action: "move", from, at, date } : { action: "extra", at, date },
            ),
          });
          const json = await res.json();
          if (!res.ok) throw new Error(json.error || "Could not save schedule");
          await load();
          setNotice(from ? "Schedule updated." : "Schedule added. Put a post in that slot when you are ready.");
        }}
      />
    </div>
  );
}

function PostList({
  posts,
  onDelete,
  onPostNow,
  emptyText = "Nothing here yet.",
}: {
  posts: Post[];
  onDelete: (id: number) => void;
  onPostNow: (id: number) => void;
  emptyText?: string;
}) {
  if (!posts.length) {
    return <div className="rounded-xl bg-white p-8 text-[var(--muted)] shadow-sm dark:bg-[var(--card)]">{emptyText}</div>;
  }
  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <div key={post.id} className="flex flex-col gap-3 rounded-xl bg-white px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:gap-4 sm:px-5 dark:bg-[var(--card)]">
          <p className="min-w-0 flex-1 truncate">{post.body || "Untitled post"}</p>
          {post.errorMessage ? (
            <span className="max-w-full truncate text-xs text-red-600 sm:max-w-xs">{post.errorMessage}</span>
          ) : null}
          <div className="flex flex-wrap gap-3">
          <Link href={`/compose/${post.id}`} className="text-sm text-[var(--blue)]">
            Edit
          </Link>
          {post.status !== "published" ? (
            <button type="button" className="text-sm text-[var(--blue)]" onClick={() => onPostNow(post.id)}>
              Post now
            </button>
          ) : null}
          <button type="button" className="text-sm text-[var(--muted)]" onClick={() => onDelete(post.id)}>
            Delete
          </button>
          </div>
        </div>
      ))}
    </div>
  );
}
