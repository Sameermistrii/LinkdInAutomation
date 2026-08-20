"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function CreatePostChooser({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-stretch justify-center bg-black/40 sm:items-center sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="card relative flex h-full w-full max-w-2xl flex-col overflow-y-auto rounded-none p-6 shadow-xl sm:h-auto sm:rounded-2xl sm:p-8"
        role="dialog"
        aria-labelledby="create-post-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-xl text-[var(--muted)] hover:bg-[var(--bg)]"
          aria-label="Close"
        >
          ×
        </button>
        <h2 id="create-post-title" className="mb-8 pr-8 text-center text-xl font-semibold tracking-tight sm:text-2xl">
          Ready to create your next LinkedIn post?
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="relative rounded-2xl border border-[var(--line)] p-6 opacity-80">
            <span className="absolute right-4 top-4 rounded-full bg-[var(--line)] px-2 py-0.5 text-[10px] font-medium text-[var(--muted)]">
              Soon
            </span>
            <div className="mb-5 flex h-24 items-center justify-center rounded-xl bg-[#efe7ff]">
              <div className="flex h-16 w-20 flex-col items-center justify-center rounded-lg bg-white shadow-sm">
                <span className="text-lg text-[#7c5cbf]">✦</span>
                <span className="mt-2 h-1.5 w-10 rounded-full bg-[var(--line)]" />
                <span className="mt-1 h-1.5 w-7 rounded-full bg-[var(--line)]" />
              </div>
            </div>
            <p className="font-semibold">Create by AI</p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Let AI generate a draft from a short brief. This will live in AI Buddy.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              onClose();
              router.push("/compose");
            }}
            className="rounded-2xl border border-[var(--line)] p-6 text-left transition hover:border-[var(--blue)] hover:bg-[var(--blue-soft)]/40"
          >
            <div className="mb-5 flex h-24 items-center justify-center rounded-xl bg-[#e7f1fb]">
              <div className="flex h-16 w-20 flex-col items-center justify-center rounded-lg bg-white shadow-sm">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0a66c2" strokeWidth="1.8">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                </svg>
                <span className="mt-2 h-1.5 w-10 rounded-full bg-[var(--line)]" />
                <span className="mt-1 h-1.5 w-7 rounded-full bg-[var(--line)]" />
              </div>
            </div>
            <p className="font-semibold">Create manually</p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Write your own post, preview it, and add it to the queue.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
