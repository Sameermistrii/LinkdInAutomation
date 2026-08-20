import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getQueueSlots } from "@/lib/schedule";
import { requireUser } from "@/lib/session";
import { timeFromDate } from "@/lib/datetime";

export async function GET() {
  const { session, error } = await requireUser();
  if (error || !session) return error!;
  const slots = await getQueueSlots(session.userId, 14);
  const extras = await prisma.extraSlot.findMany({
    where: { userId: session.userId, at: { gt: new Date() } },
    orderBy: { at: "asc" },
  });
  const queued = await prisma.post.findMany({
    where: { userId: session.userId, status: "queued", scheduledAt: { not: null } },
  });
  const byTime = new Map(queued.map((p) => [p.scheduledAt!.getTime(), p]));
  const extraTimes = new Set(extras.map((e) => e.at.getTime()));
  const filled = slots.map((slot) => ({
    at: slot.at.toISOString(),
    time: slot.time,
    weekday: slot.weekday,
    extra: Boolean(slot.extra) || extraTimes.has(slot.at.getTime()),
    post: byTime.get(slot.at.getTime()) ?? null,
  }));
  for (const extra of extras) {
    if (filled.some((s) => new Date(s.at).getTime() === extra.at.getTime())) continue;
    filled.push({
      at: extra.at.toISOString(),
      time: timeFromDate(extra.at),
      weekday: extra.at.getDay(),
      extra: true,
      post: byTime.get(extra.at.getTime()) ?? null,
    });
  }
  filled.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
  return NextResponse.json({ slots: filled });
}
