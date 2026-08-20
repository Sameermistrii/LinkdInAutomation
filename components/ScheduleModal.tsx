"use client";

import { useEffect, useState } from "react";
import { dateKey, timeFromDate } from "@/lib/datetime";

export function ScheduleModal({
  open,
  initialAt,
  onClose,
  onSubmit,
}: {
  open: boolean;
  initialAt?: string | null;
  onClose: () => void;
  onSubmit: (at: string, from: string | undefined, date: string) => Promise<void>;
}) {
  const editing = Boolean(initialAt);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setError("");
    const base = initialAt ? new Date(initialAt) : new Date(Date.now() + 60 * 60 * 1000);
    if (Number.isNaN(base.getTime())) {
      const fallback = new Date(Date.now() + 60 * 60 * 1000);
      setDate(dateKey(fallback));
      setTime(timeFromDate(fallback));
      return;
    }
    setDate(dateKey(base));
    setTime(timeFromDate(base));
  }, [open, initialAt]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  async function save() {
    if (!date || !time) {
      setError("Pick a date and a time.");
      return;
    }
    const [y, mo, d] = date.split("-").map(Number);
    const [hh, mm] = time.split(":").map(Number);
    const at = new Date(y, mo - 1, d, hh, mm, 0, 0);
    if (Number.isNaN(at.getTime())) {
      setError("That date or time is not valid.");
      return;
    }
    if (at.getTime() <= Date.now()) {
      setError("Pick a time in the future.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSubmit(at.toISOString(), initialAt || undefined, date);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="card w-full max-w-md shadow-xl"
        role="dialog"
        aria-labelledby="schedule-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-3">
          <h2 id="schedule-modal-title" className="text-lg font-semibold">
            {editing ? "Edit schedule" : "Add schedule"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-xl leading-none text-[var(--muted)] hover:bg-[var(--bg)]"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="space-y-4 px-5 py-4">
          <p className="text-sm text-[var(--muted)]">
            Choose when this slot should go out. Click a date or time on My posts to change one later.
          </p>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <label className="block text-sm font-medium">
            Date
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-[var(--line)] bg-[var(--card)] px-3 py-2 text-base"
            />
          </label>
          <label className="block text-sm font-medium">
            Time
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-[var(--line)] bg-[var(--card)] px-3 py-2 text-base"
            />
          </label>
        </div>
        <div className="flex justify-end gap-2 border-t border-[var(--line)] px-5 py-3">
          <button type="button" onClick={onClose} className="rounded-full px-4 py-2 text-sm">
            Cancel
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => void save()}
            className="rounded-full bg-[var(--blue)] px-4 py-2 text-sm font-medium text-white"
          >
            {saving ? "Saving…" : editing ? "Save changes" : "Add schedule"}
          </button>
        </div>
      </div>
    </div>
  );
}
