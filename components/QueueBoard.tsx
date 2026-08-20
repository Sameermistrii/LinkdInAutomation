"use client";

import Link from "next/link";
import { formatTimeLabel, dateKey } from "@/lib/datetime";

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
  onEditSlot,
}: {
  slots: QueueSlot[];
  name?: string;
  photoUrl?: string;
  onDelete: (id: number) => void;
  onSkipDay: (date: string) => void;
  onPostNow: (id: number) => void;
  onEditSlot: (at: string) => void;
}) {
  const groups = groupByDay(slots);

  if (!groups.length) {
    return (
      <div className="rounded-xl bg-white p-8 text-[var(--muted)] shadow-sm dark:bg-[var(--card)]">
        No upcoming schedules. Click Add schedule and pick a date and time.
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-8">
      <div>
        <div className="mb-4 flex items-center gap-6">
          <h2 className="whitespace-nowrap text-2xl font-semibold">Scheduled</h2>
          <div className="h-px flex-1 bg-[#dfe3e7] dark:bg-[var(--line)]" />
        </div>
        <p className="text-sm text-[var(--muted)]">
          Click a date or a time to change it. Empty cards are open — add a post when you are ready.
        </p>
      </div>
      <div className="flex flex-col gap-8">
        {groups.map((group) => {
          const filled = group.slots.filter((s) => s.post).length;
          return (
            <div key={group.key} className="rounded-xl bg-white p-4 shadow-sm md:p-6 dark:bg-[var(--card)]">
              <div className="mb-6 flex flex-col gap-3 border-b border-[#dfe3e7] pb-4 sm:flex-row sm:items-center sm:justify-between dark:border-[var(--line)]">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    className="text-xl font-semibold hover:text-[#004e99] hover:underline"
                    title="Edit this date"
                    onClick={() => onEditSlot(group.slots[0].at)}
                  >
                    {group.label}
                  </button>
                  <span className="rounded bg-[#e4e9ed] px-2 py-1 text-xs font-bold text-[var(--muted)] dark:bg-[var(--line)]">
                    {filled} of {group.slots.length} slots filled
                  </span>
                </div>
                <button
                  type="button"
                  className="self-start text-sm font-semibold text-[#004e99] hover:underline sm:self-auto"
                  onClick={() => onSkipDay(group.date)}
                >
                  Skip this day
                </button>
              </div>
              <div className="flex flex-col gap-6">
                {group.slots.map((slot) => (
                  <SlotRow
                    key={slot.at}
                    slot={slot}
                    name={name}
                    photoUrl={photoUrl}
                    onDelete={onDelete}
                    onPostNow={onPostNow}
                    onEditSlot={onEditSlot}
                  />
                ))}
              </div>
            </div>
          );
        })}
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
  onEditSlot,
}: {
  slot: QueueSlot;
  name?: string;
  photoUrl?: string;
  onDelete: (id: number) => void;
  onPostNow: (id: number) => void;
  onEditSlot: (at: string) => void;
}) {
  const initial = initials(name || "You");
  const dayLabel = new Date(slot.at).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

  return (
    <div className="flex flex-col gap-2 md:flex-row md:gap-6">
      <div className="w-auto shrink-0 pt-0 text-sm font-semibold text-[var(--muted)] md:w-28 md:pt-4">
        <button
          type="button"
          className="text-left hover:text-[#004e99] hover:underline"
          title="Edit this time"
          onClick={() => onEditSlot(slot.at)}
        >
          {formatTimeLabel(slot.time)}
        </button>
      </div>

      {slot.post ? (
        <div className="relative min-h-[140px] flex-1 overflow-hidden rounded-lg bg-[#f6fafe] p-4 shadow-sm md:p-6 dark:bg-[var(--bg)]">
          <div className="absolute top-0 left-0 h-full w-1 bg-[#00668a]" />
          <div className="flex gap-4">
            <Avatar photoUrl={photoUrl} initial={initial} />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="flex items-center justify-between gap-3">
                <span className="font-bold">{(name || "You").toUpperCase()}</span>
                <button
                  type="button"
                  className="flex items-center gap-1 rounded bg-[#eaeef2] px-2 py-1 text-xs font-bold text-[var(--muted)] hover:text-[#004e99] hover:underline dark:bg-[var(--line)]"
                  title="Edit this date"
                  onClick={() => onEditSlot(slot.at)}
                >
                  {dayLabel}
                </button>
              </div>
              <p className="line-clamp-2 text-base text-[var(--muted)]">{slot.post.body || "Untitled post"}</p>
              <div className="mt-2 flex flex-wrap items-center gap-3 border-t border-[#dfe3e7] pt-2 dark:border-[var(--line)]">
                <Link href={`/compose/${slot.post.id}`} className="text-xs font-bold text-[var(--muted)] hover:text-[#004e99]">
                  Edit
                </Link>
                <span className="h-1 w-1 rounded-full bg-[#dfe3e7]" />
                <button
                  type="button"
                  className="text-xs font-bold text-[var(--muted)] hover:text-[#004e99]"
                  onClick={() => onPostNow(slot.post!.id)}
                >
                  Post now
                </button>
                <span className="h-1 w-1 rounded-full bg-[#dfe3e7]" />
                <button
                  type="button"
                  className="text-xs font-bold text-red-600 hover:text-red-500"
                  onClick={() => onDelete(slot.post!.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Link
          href={`/compose?slot=${encodeURIComponent(slot.at)}`}
          className="group flex min-h-[140px] flex-1 cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-[#c1c6d4]/50 bg-[#f0f4f8] p-6 transition hover:bg-[#e4e9ed] dark:border-[var(--line)] dark:bg-[var(--bg)]"
        >
          <div className="flex w-full max-w-sm flex-col items-center gap-2">
            <div className="h-3 w-3/4 rounded bg-[#dfe3e7] dark:bg-[var(--line)]" />
            <div className="h-3 w-1/2 rounded bg-[#dfe3e7] dark:bg-[var(--line)]" />
          </div>
          <div className="text-sm font-semibold text-[var(--muted)] group-hover:text-[#004e99]">Add a LinkedIn post</div>
          <span className="rounded-full bg-white px-4 py-2 text-xs font-bold text-[#004e99] shadow-sm opacity-100 transition sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 dark:bg-[var(--card)]">
            + Add to queue
          </span>
        </Link>
      )}
    </div>
  );
}

function Avatar({ photoUrl, initial }: { photoUrl?: string; initial: string }) {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#0a66c2] text-sm font-bold text-[#dbe6ff]">
      {photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photoUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        initial
      )}
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

// Bucket slots by local calendar day for the queue board.
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
    label: new Date(daySlots[0].at).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" }),
    slots: daySlots,
  }));
}
