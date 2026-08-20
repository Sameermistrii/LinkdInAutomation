import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/http";
import { getScheduleRules } from "@/lib/schedule";
import { requireUser } from "@/lib/session";
import { timeFromDate } from "@/lib/datetime";

export async function GET() {
  const { session, error } = await requireUser();
  if (error || !session) return error!;
  const [rules, extras, skips] = await Promise.all([
    getScheduleRules(session.userId),
    prisma.extraSlot.findMany({ where: { userId: session.userId }, orderBy: { at: "asc" } }),
    prisma.scheduleSkip.findMany({ where: { userId: session.userId } }),
  ]);
  return NextResponse.json({ rules, extras, skips });
}

export async function PUT(request: Request) {
  const { session, error } = await requireUser();
  if (error || !session) return error!;
  const body = (await request.json()) as {
    rules?: { weekday: number; time: string }[];
    action?: "extra" | "skip" | "unskip" | "move";
    at?: string;
    from?: string;
    date?: string;
    ats?: string[];
    minutesFromNow?: number;
  };

  if (body.action === "extra") {
    let at = body.at ? new Date(body.at) : new Date(Date.now() + (body.minutesFromNow ?? 2) * 60 * 1000);
    if (Number.isNaN(at.getTime())) return jsonError("Pick a valid date and time");
    at.setSeconds(0, 0);
    const time = timeFromDate(at);
    const weekday = at.getDay();
    if (!body.minutesFromNow && at.getTime() <= Date.now()) {
      return jsonError("That time has already passed. Pick a later time.");
    }
    try {
      await prisma.extraSlot.create({ data: { userId: session.userId, at } });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not save extra slot";
      if (!/Unique constraint/i.test(message)) return jsonError(message);
    }
    if (body.date) {
      await prisma.scheduleSkip.deleteMany({ where: { userId: session.userId, date: body.date } });
    } else {
      await prisma.scheduleSkip.deleteMany({ where: { userId: session.userId } });
    }
    return NextResponse.json({ ok: true, at: at.toISOString(), weekday, time });
  }

  if (body.action === "move" && body.from && body.at) {
    const from = new Date(body.from);
    const to = new Date(body.at);
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      return jsonError("Pick a valid date and time");
    }
    to.setSeconds(0, 0);
    if (to.getTime() <= Date.now()) return jsonError("Pick a time in the future.");
    const extra = await prisma.extraSlot.findFirst({
      where: { userId: session.userId, at: from },
    });
    if (extra) {
      await prisma.extraSlot.update({ where: { id: extra.id }, data: { at: to } });
    } else {
      await prisma.extraSlot.create({ data: { userId: session.userId, at: to } });
    }
    await prisma.post.updateMany({
      where: { userId: session.userId, status: "queued", scheduledAt: from },
      data: { scheduledAt: to },
    });
    return NextResponse.json({ ok: true, at: to.toISOString() });
  }

  if (body.action === "skip") {
    const ats = (body.ats ?? []).map((value) => new Date(value)).filter((d) => !Number.isNaN(d.getTime()));
    if (ats.length) {
      await prisma.extraSlot.deleteMany({
        where: { userId: session.userId, at: { in: ats } },
      });
    }
    return NextResponse.json({ ok: true });
  }

  if (body.action === "unskip" && body.date) {
    await prisma.scheduleSkip.deleteMany({
      where: { userId: session.userId, date: body.date },
    });
    return NextResponse.json({ ok: true });
  }

  const rules = body.rules ?? [];
  const cleaned = rules.filter(
    (r) => r.weekday >= 0 && r.weekday <= 6 && /^\d{2}:\d{2}$/.test(r.time),
  );
  const unique = cleaned.filter(
    (r, i, arr) => arr.findIndex((x) => x.weekday === r.weekday && x.time === r.time) === i,
  );
  if (!unique.length) return jsonError("Add at least one time slot");
  await prisma.scheduleRule.deleteMany({ where: { userId: session.userId } });
  await prisma.scheduleRule.createMany({
    data: unique.map((r) => ({ ...r, userId: session.userId })),
  });
  const saved = await prisma.scheduleRule.findMany({
    where: { userId: session.userId },
    orderBy: [{ weekday: "asc" }, { time: "asc" }],
  });
  return NextResponse.json({ rules: saved });
}
