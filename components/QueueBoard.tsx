"use client";

import Link from "next/link";
import { formatDateHeading, formatTimeLabel, dateKey } from "@/lib/datetime";

export type QueuePost = {
  id: number;
  body: string;
  scheduledAt: string | null;
  status: string;
  errorMessage?: string;
};

export type QueueSlot = {
  at: string;
  time: string;
  weekday: number;
  extra?: boolean;
  post: QueuePost | null;
};

export function QueueBoard({
  slots,
  name,
  photoUrl,
  onDelete,
  onSkipDay,
  onPostNow,
}: {
  slots: QueueSlot[];
  name?: string;
  photoUrl?: string;
  onDelete: (id: number) => void;
  onSkipDay: (date: string) => void;
  onPostNow: (id: number) => void;
}) {
  const groups = groupByDay(slots);

  if (!groups.length) {
    return (
      <div className="card p-8 text-[var(--muted)]">
        No upcoming slots. Open Edit post schedule and pick a template.
      </div>
    );
  }

  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-3">
        <h2 className="text-xl font-semibold">Scheduled</h2>
        <p className="text-sm text-[var(--muted)]">Empty cards are open slots — add a post when you are ready.</p>
      </div>
      <div className="space-y-5">
        {groups.map((group) => (
          <div key={group.key} className="card overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-[var(--line)] bg-[var(--blue-soft)]/50 px-6 py-3.5">
              <div>
                <p className="text-lg font-medium">{group.label}</p>
                <p className="text-xs text-[var(--muted)]">
                  {group.slots.filter((s) => s.post).length} of {group.slots.length} slots filled
                </p>
              </div>
              <button
                type="button"
                className="text-sm text-[var(--muted)]"
                onClick={() => onSkipDay(group.date)}
              >
                Skip this day
              </button>
            </div>
            <div className="divide-y divide-[var(--line)]">
              {group.slots.map((slot) => (
                <SlotRow
                  key={slot.at}
                  slot={slot}
                  name={name}
                  photoUrl={photoUrl}
                  onDelete={onDelete}
                  onPostNow={onPostNow}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SlotRow({
  slot,
  name,
  photoUrl,
  onDelete,
  onPostNow,
}: {
  slot: QueueSlot;
  name?: string;
  photoUrl?: string;
  onDelete: (id: number) => void;
  onPostNow: (id: number) => void;
}) {
  const initial = (name || "You").slice(0, 1).toUpperCase();

  return (
    <div className="flex items-stretch gap-4 px-5 py-4">
      <div className="flex w-24 shrink-0 flex-col items-start justify-center">
        <span className="rounded-full bg-[var(--blue-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--blue)]">
          {formatTimeLabel(slot.time)}
        </span>
        {slot.extra ? <span className="mt-1 text-[10px] uppercase tracking-wide text-[var(--muted)]">Extra</span> : null}
      </div>

      {slot.post ? (
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Avatar photoUrl={photoUrl} initial={initial} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{name || "You"}</p>
            <p className="mt-0.5 line-clamp-2 text-sm text-[var(--muted)]">
              {slot.post.body || "Untitled post"}
            </p>
          </div>
          <Link href={`/compose/${slot.post.id}`} className="shrink-0 text-sm text-[var(--blue)]">
            Edit
          </Link>
          <button type="button" className="shrink-0 text-sm text-[var(--blue)]" onClick={() => onPostNow(slot.post!.id)}>
            Post now
          </button>
          <button type="button" className="shrink-0 text-sm text-[var(--muted)]" onClick={() => onDelete(slot.post!.id)}>
            Remove
          </button>
        </div>
      ) : (
        <Link
          href={`/compose?slot=${encodeURIComponent(slot.at)}`}
          className="group flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-dashed border-[var(--line)] bg-[var(--bg)]/60 px-3 py-2.5 transition hover:border-[var(--blue)] hover:bg-[var(--blue-soft)]/40"
        >
          <Avatar photoUrl={photoUrl} initial={initial} muted />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-[var(--muted)] group-hover:text-[var(--ink)]">
              Add a LinkedIn post
            </p>
            <div className="mt-1.5 space-y-1.5">
              <div className="h-2 w-4/5 rounded-full bg-[var(--line)]" />
              <div className="h-2 w-2/5 rounded-full bg-[var(--line)]" />
            </div>
          </div>
          <span className="shrink-0 rounded-full border border-[var(--line)] bg-[var(--card)] px-3 py-1.5 text-sm group-hover:border-[var(--blue)] group-hover:text-[var(--blue)]">
            + Add to queue
          </span>
        </Link>
      )}
    </div>
  );
}

function Avatar({
  photoUrl,
  initial,
  muted,
}: {
  photoUrl?: string;
  initial: string;
  muted?: boolean;
}) {
  return (
    <div
      className={`h-11 w-11 shrink-0 overflow-hidden rounded-full border border-[var(--line)] ${
        muted ? "opacity-70" : "bg-[var(--blue-soft)]"
      }`}
    >
      {photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photoUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-sm font-medium text-[var(--blue)]">
          {initial}
        </div>
      )}
    </div>
  );
}

function groupByDay(slots: QueueSlot[]) {
  const map = new Map<string, QueueSlot[]>();
  for (const slot of slots) {
    const d = new Date(slot.at);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    const list = map.get(key) ?? [];
    list.push(slot);
    map.set(key, list);
  }
  return [...map.entries()].map(([key, daySlots]) => ({
    key,
    date: dateKey(new Date(daySlots[0].at)),
    label: formatDateHeading(new Date(daySlots[0].at)),
    slots: daySlots,
  }));
}
