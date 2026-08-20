"use client";

import { useEffect, useMemo, useState } from "react";
import {
  SCHEDULE_TEMPLATES,
  rulesFromTemplate,
  templateMatches,
} from "@/lib/schedule-templates";
import { dateKey, timeFromDate } from "@/lib/datetime";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_DOTS = ["S", "M", "T", "W", "T", "F", "S"];

type Rule = { weekday: number; time: string };

export function ScheduleModal({
  open,
  rules,
  onClose,
  onSave,
  onAddExtra,
}: {
  open: boolean;
  rules: Rule[];
  onClose: () => void;
  onSave: (rules: Rule[]) => Promise<void>;
  onAddExtra: (at: string) => Promise<void>;
}) {
  const [draft, setDraft] = useState<Rule[]>(rules);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [hint, setHint] = useState("");
  const [oneOffDate, setOneOffDate] = useState("");
  const [oneOffTime, setOneOffTime] = useState("");
  const [focusWeekday, setFocusWeekday] = useState<number | null>(null);

  useEffect(() => {
    if (open) {
      setDraft(rules);
      setError("");
      setHint("");
      setFocusWeekday(null);
      const n = new Date(Date.now() + 2 * 60 * 1000);
      setOneOffDate(dateKey(n));
      setOneOffTime(timeFromDate(n));
    }
  }, [open, rules]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const grouped = useMemo(() => {
    return DAYS.map((_, weekday) => ({
      weekday,
      times: draft.filter((r) => r.weekday === weekday).map((r) => r.time),
    }));
  }, [draft]);

  async function addOneOff() {
    if (!oneOffDate || !oneOffTime) {
      setError("Pick a date and time.");
      return;
    }
    setError("");
    try {
      const [y, mo, d] = oneOffDate.split("-").map(Number);
      const [hh, mm] = oneOffTime.split(":").map(Number);
      const at = new Date(y, mo - 1, d, hh, mm, 0, 0);
      if (Number.isNaN(at.getTime())) {
        setError("Pick a valid date and time.");
        return;
      }
      if (at.getTime() <= Date.now()) {
        setError("That time has already passed. Pick a later time.");
        return;
      }
      const time = `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
      const weekday = at.getDay();
      setDraft((prev) =>
        prev.some((r) => r.weekday === weekday && r.time === time)
          ? prev
          : [...prev, { weekday, time }],
      );
      setFocusWeekday(weekday);
      await onAddExtra(at.toISOString());
      setHint(`Added ${DAYS[weekday]} ${time}. It is on that weekday below.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add slot");
    }
  }

  async function addSoon() {
    setError("");
    try {
      await onAddExtra("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add slot");
    }
  }

  if (!open) return null;

  function addTime(weekday: number) {
    setDraft((prev) => [...prev, { weekday, time: "09:00" }]);
  }

  function updateTime(weekday: number, index: number, time: string) {
    const ofDay = draft.filter((r) => r.weekday === weekday);
    ofDay[index] = { weekday, time };
    setDraft([...draft.filter((r) => r.weekday !== weekday), ...ofDay]);
  }

  function removeTime(weekday: number, index: number) {
    const ofDay = draft.filter((r) => r.weekday === weekday).filter((_, i) => i !== index);
    setDraft([...draft.filter((r) => r.weekday !== weekday), ...ofDay]);
  }

  async function save() {
    setSaving(true);
    setError("");
    try {
      await onSave(draft);
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
        className="card flex max-h-[min(92vh,880px)] w-full max-w-2xl flex-col overflow-hidden shadow-xl"
        role="dialog"
        aria-labelledby="schedule-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[var(--line)] px-5 py-3">
          <h2 id="schedule-modal-title" className="text-lg font-semibold">
            Edit post schedule
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

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <p className="mb-3 text-sm text-[var(--muted)]">
            Start with a template, or add a one-off day. Empty days are skipped.
          </p>
          <div className="mb-4 grid grid-cols-2 gap-2">
            {SCHEDULE_TEMPLATES.map((template) => {
              const selected = templateMatches(template, draft);
              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => {
                    setDraft(rulesFromTemplate(template));
                    setHint(`Applied ${template.name}. Click Save schedule to keep it.`);
                    setFocusWeekday(template.days[0] ?? null);
                  }}
                  className={`rounded-xl border p-3 text-left transition ${
                    selected
                      ? "border-[var(--blue)] bg-[var(--blue-soft)]"
                      : "border-[var(--line)] hover:border-[var(--blue)]"
                  }`}
                >
                  <p className="text-sm font-semibold">{template.name}</p>
                  <p className="mt-0.5 text-xs text-[var(--muted)]">{template.blurb}</p>
                  <div className="mt-2 flex gap-1">
                    {DAY_DOTS.map((label, weekday) => {
                      const on = template.days.includes(weekday);
                      return (
                        <span
                          key={`${template.id}-${weekday}`}
                          className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-medium ${
                            on ? "bg-[var(--blue)] text-white" : "bg-[var(--line)] text-[var(--muted)]"
                          }`}
                        >
                          {label}
                        </span>
                      );
                    })}
                  </div>
                </button>
              );
            })}
          </div>
          {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}
          {hint ? <p className="mb-3 text-sm text-[var(--blue)]">{hint}</p> : null}
          <div className="mb-4 flex flex-wrap items-end gap-2 rounded-xl border border-[var(--line)] p-3">
            <label className="text-sm">
              Date
              <input
                type="date"
                value={oneOffDate}
                onChange={(e) => setOneOffDate(e.target.value)}
                className="mt-1 block rounded-lg border border-[var(--line)] bg-[var(--card)] px-2 py-1 text-sm"
              />
            </label>
            <label className="text-sm">
              Time
              <input
                type="time"
                value={oneOffTime}
                onChange={(e) => setOneOffTime(e.target.value)}
                className="mt-1 block rounded-lg border border-[var(--line)] bg-[var(--card)] px-2 py-1 text-sm"
              />
            </label>
            <button
              type="button"
              className="rounded-full bg-[var(--blue)] px-3 py-1.5 text-sm text-white"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                void addOneOff();
              }}
            >
              Add this day
            </button>
            <button type="button" className="text-sm text-[var(--blue)]" onClick={() => void addSoon()}>
              Slot in 2 minutes
            </button>
          </div>
          <div className="space-y-3 pr-1">
            {grouped.map((day) => (
              <div
                key={day.weekday}
                className={`rounded-xl border p-3 ${
                  focusWeekday === day.weekday ? "border-[var(--blue)]" : "border-[var(--line)]"
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium">{DAYS[day.weekday]}</span>
                  <button
                    type="button"
                    className="text-sm text-[var(--blue)]"
                    onClick={() => addTime(day.weekday)}
                  >
                    + Add time
                  </button>
                </div>
                {day.times.length === 0 ? (
                  <p className="text-sm text-[var(--muted)]">No posts this day</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {day.times.map((time, i) => (
                      <div key={`${day.weekday}-${i}`} className="flex items-center gap-1">
                        <input
                          type="time"
                          value={time}
                          onChange={(e) => updateTime(day.weekday, i, e.target.value)}
                          className="rounded-lg border border-[var(--line)] bg-[var(--card)] px-2 py-1 text-sm"
                        />
                        <button
                          type="button"
                          className="text-sm text-[var(--muted)]"
                          onClick={() => removeTime(day.weekday, i)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex shrink-0 justify-end gap-2 border-t border-[var(--line)] bg-[var(--card)] px-5 py-3">
          <button type="button" onClick={onClose} className="rounded-full px-4 py-2 text-sm">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving}
            className="rounded-full bg-[var(--blue)] px-4 py-2 text-sm font-medium text-white"
          >
            {saving ? "Saving…" : "Save schedule"}
          </button>
        </div>
      </div>
    </div>
  );
}
