export function parseTime(time: string) {
  const [h, m] = time.split(":").map((n) => parseInt(n, 10));
  return { hours: h || 0, minutes: m || 0 };
}

export function formatAtTime(at: string | Date) {
  return new Date(at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

export function dateKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function timeFromDate(date: Date) {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

export type Slot = {
  at: Date;
  weekday: number;
  time: string;
  extra?: boolean;
};

// Recurring weekday times + extra dates, minus past times and skipped days.
export function generateUpcomingSlots(
  rules: { weekday: number; time: string }[],
  days = 14,
  extras: Date[] = [],
  skipDates: string[] = [],
): Slot[] {
  const skip = new Set(skipDates);
  const slots: Slot[] = [];
  const now = new Date();
  for (let i = 0; i < days; i++) {
    const day = new Date(now);
    day.setDate(now.getDate() + i);
    day.setSeconds(0, 0);
    if (skip.has(dateKey(day))) continue;
    const weekday = day.getDay();
    const dayRules = rules.filter((r) => r.weekday === weekday);
    for (const rule of dayRules) {
      const { hours, minutes } = parseTime(rule.time);
      const at = new Date(day);
      at.setHours(hours, minutes, 0, 0);
      if (at.getTime() <= now.getTime()) continue;
      slots.push({ at, weekday, time: rule.time });
    }
  }
  for (const extra of extras) {
    if (extra.getTime() <= now.getTime()) continue;
    if (skip.has(dateKey(extra))) continue;
    slots.push({ at: extra, weekday: extra.getDay(), time: timeFromDate(extra), extra: true });
  }
  const byTime = new Map<number, Slot>();
  for (const slot of slots) {
    const t = slot.at.getTime();
    const prev = byTime.get(t);
    if (!prev) {
      byTime.set(t, slot);
      continue;
    }
    byTime.set(t, { ...prev, extra: Boolean(prev.extra || slot.extra) });
  }
  return [...byTime.values()].sort((a, b) => a.at.getTime() - b.at.getTime());
}
