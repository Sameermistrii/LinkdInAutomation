import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { publishDuePosts } from "@/lib/publish";
import { getQueueSlots } from "@/lib/schedule";
import { requireUser } from "@/lib/session";

export async function GET() {
  const { session, error } = await requireUser();
  if (error || !session) return error!;
  try {
    await publishDuePosts(session.userId);
  } catch (err) {
    console.error("[queue-slots] publish due failed", err);
  }
  const slots = await getQueueSlots(session.userId);
  const queued = await prisma.post.findMany({
    where: { userId: session.userId, status: "queued", scheduledAt: { not: null } },
  });
  const byTime = new Map(queued.map((p) => [p.scheduledAt!.getTime(), p]));
  return NextResponse.json({
    slots: slots.map((slot) => ({
      at: slot.at.toISOString(),
      weekday: slot.weekday,
      extra: true,
      post: byTime.get(slot.at.getTime()) ?? null,
    })),
  });
}
