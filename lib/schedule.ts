import { prisma } from "./prisma";
import { generateUpcomingSlots } from "./datetime";

export async function getScheduleRules(userId: string) {
  const rules = await prisma.scheduleRule.findMany({
    where: { userId },
    orderBy: [{ weekday: "asc" }, { time: "asc" }],
  });
  if (rules.length) return rules;
  const defaults = [];
  for (const weekday of [1, 2, 3, 4, 5]) {
    defaults.push({ userId, weekday, time: "09:00" });
    defaults.push({ userId, weekday, time: "18:00" });
  }
  await prisma.scheduleRule.createMany({ data: defaults });
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

export async function getQueueSlots(userId: string, days = 14) {
  await prunePastExtras(userId);
  const [rules, extras, skips] = await Promise.all([
    getScheduleRules(userId),
    prisma.extraSlot.findMany({ where: { userId, at: { gt: new Date() } } }),
    prisma.scheduleSkip.findMany({ where: { userId } }),
  ]);
  return generateUpcomingSlots(
    rules,
    days,
    extras.map((e) => e.at),
    skips.map((s) => s.date),
  );
}

export async function nextFreeSlot(userId: string, after?: Date) {
  const slots = await getQueueSlots(userId, 60);
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
