import { prisma } from "./prisma";
import { dateKey, timeFromDate } from "./datetime";

export async function getScheduleRules(userId: string) {
  return prisma.scheduleRule.findMany({
    where: { userId },
    orderBy: [{ weekday: "asc" }, { time: "asc" }],
  });
}

export async function prunePastExtras(userId?: string) {
  await prisma.extraSlot.deleteMany({
    where: {
      at: { lte: new Date() },
      ...(userId ? { userId } : {}),
    },
  });
}

export async function consumeExtraSlot(userId: string, at: Date | null) {
  if (!at) return;
  const start = new Date(at);
  start.setSeconds(0, 0);
  const end = new Date(start.getTime() + 60 * 1000);
  await prisma.extraSlot.deleteMany({
    where: { userId, at: { gte: start, lt: end } },
  });
}

export async function getQueueSlots(userId: string) {
  await prunePastExtras(userId);
  const [extras, skips, queued] = await Promise.all([
    prisma.extraSlot.findMany({ where: { userId, at: { gt: new Date() } }, orderBy: { at: "asc" } }),
    prisma.scheduleSkip.findMany({ where: { userId } }),
    prisma.post.findMany({
      where: { userId, status: "queued", scheduledAt: { gt: new Date() } },
      select: { scheduledAt: true },
    }),
  ]);
  const skip = new Set(skips.map((s) => s.date));
  const byTime = new Map<number, { at: Date; weekday: number; time: string; extra: boolean }>();
  for (const e of extras) {
    if (skip.has(dateKey(e.at))) continue;
    byTime.set(e.at.getTime(), {
      at: e.at,
      weekday: e.at.getDay(),
      time: timeFromDate(e.at),
      extra: true,
    });
  }
  for (const p of queued) {
    const at = p.scheduledAt!;
    if (skip.has(dateKey(at))) continue;
    if (byTime.has(at.getTime())) continue;
    byTime.set(at.getTime(), {
      at,
      weekday: at.getDay(),
      time: timeFromDate(at),
      extra: true,
    });
  }
  return [...byTime.values()].sort((a, b) => a.at.getTime() - b.at.getTime());
}

export async function nextFreeSlot(userId: string, after?: Date) {
  const slots = await getQueueSlots(userId);
  const taken = await prisma.post.findMany({
    where: { userId, status: "queued", scheduledAt: { not: null } },
    select: { scheduledAt: true },
  });
  const takenSet = new Set(taken.map((p) => p.scheduledAt!.getTime()));
  const min = after?.getTime() ?? 0;
  return slots.find((s) => s.at.getTime() > min && !takenSet.has(s.at.getTime())) ?? null;
}

export async function isSlotTaken(userId: string, at: Date, ignorePostId?: number) {
  const existing = await prisma.post.findFirst({
    where: {
      userId,
      status: "queued",
      scheduledAt: at,
      ...(ignorePostId ? { id: { not: ignorePostId } } : {}),
    },
  });
  return Boolean(existing);
}
