import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/http";
import { requireUser } from "@/lib/session";
import { TOPICS, slugifyLabel, suggestTopicsFromHeadline } from "@/lib/topics";
import {
  THOUGHT_LEADERS,
  getLeaderById,
  leaderPhoto,
  leadersForTopics,
  parseLinkedInProfileUrl,
} from "@/lib/thought-leaders";
import { ensureOnboardingFlag } from "@/lib/app-gate";

export async function GET() {
  const { session, error } = await requireUser();
  if (error || !session) return error!;
  await ensureOnboardingFlag(session.userId);
  const [account, user, interests, saved] = await Promise.all([
    prisma.linkedInAccount.findUnique({ where: { userId: session.userId } }),
    prisma.user.findUnique({
      where: { id: session.userId },
      select: { onboardingCompletedAt: true, personaBio: true, companyBio: true },
    }),
    prisma.interest.findMany({ where: { userId: session.userId }, orderBy: { createdAt: "asc" } }),
    prisma.savedLeader.findMany({ where: { userId: session.userId }, orderBy: { createdAt: "asc" } }),
  ]);
  const headline = account?.headline || "";
  const suggested = suggestTopicsFromHeadline(headline);
  const slugs = interests.length ? interests.map((i) => i.slug) : suggested.map((t) => t.slug);
  const catalog = leadersForTopics(slugs).map((l) => ({ ...l, photoUrl: leaderPhoto(l) }));
  const savedLeaders = saved.map((row) => {
    if (row.catalogId) {
      const leader = getLeaderById(row.catalogId);
      if (leader) {
        return {
          id: row.id,
          catalogId: leader.id,
          name: leader.name,
          headline: leader.headline,
          linkedinUrl: leader.linkedinUrl,
          photoUrl: leaderPhoto(leader),
          tags: leader.tags,
          custom: false,
        };
      }
    }
    return {
      id: row.id,
      catalogId: "",
      name: row.customName || "LinkedIn profile",
      headline: "",
      linkedinUrl: row.customUrl,
      photoUrl: leaderPhoto({ name: row.customName || "User" }),
      tags: [] as string[],
      custom: true,
    };
  });
  return NextResponse.json({
    connected: Boolean(account),
    completed: Boolean(user?.onboardingCompletedAt),
    profile: {
      name: account?.name || session.name,
      headline,
      photoUrl: account?.photoUrl || session.picture,
      personaBio: user?.personaBio || "",
      companyBio: user?.companyBio || "",
    },
    topics: TOPICS,
    suggested: suggested.map((t) => t.slug),
    interests,
    catalog,
    allLeaders: THOUGHT_LEADERS.map((l) => ({ ...l, photoUrl: leaderPhoto(l) })),
    savedLeaders,
  });
}

export async function PUT(request: Request) {
  const { session, error } = await requireUser();
  if (error || !session) return error!;
  const body = (await request.json()) as {
    action?: "interests" | "leaders" | "complete" | "skip" | "persona";
    interests?: { slug: string; label: string }[];
    catalogIds?: string[];
    custom?: { url: string; name?: string }[];
    personaBio?: string;
    companyBio?: string;
  };

  if (body.action === "skip" || body.action === "complete") {
    if (body.action === "complete") {
      const [interestCount, leaderCount] = await Promise.all([
        prisma.interest.count({ where: { userId: session.userId } }),
        prisma.savedLeader.count({ where: { userId: session.userId } }),
      ]);
      if (interestCount < 3) return jsonError("Pick at least 3 topics");
      if (leaderCount < 2) return jsonError("Pick at least 2 thought leaders");
    }
    await prisma.user.update({
      where: { id: session.userId },
      data: { onboardingCompletedAt: new Date() },
    });
    return NextResponse.json({ ok: true });
  }

  if (body.action === "persona") {
    const personaBio = (body.personaBio ?? "").slice(0, 5000);
    const companyBio = (body.companyBio ?? "").slice(0, 5000);
    await prisma.user.update({
      where: { id: session.userId },
      data: { personaBio, companyBio },
    });
    return NextResponse.json({ ok: true });
  }

  if (body.action === "interests") {
    const items = (body.interests ?? [])
      .map((item) => ({
        slug: item.slug || slugifyLabel(item.label),
        label: item.label.trim(),
      }))
      .filter((item) => item.label);
    if (items.length > 10) return jsonError("Choose up to 10 topics");
    await prisma.interest.deleteMany({ where: { userId: session.userId } });
    if (items.length) {
      await prisma.interest.createMany({
        data: items.map((item) => ({ ...item, userId: session.userId })),
      });
    }
    return NextResponse.json({ ok: true, count: items.length });
  }

  if (body.action === "leaders") {
    const catalogIds = [...new Set(body.catalogIds ?? [])].filter((id) => getLeaderById(id));
    const custom = (body.custom ?? [])
      .map((row) => {
        const parsed = parseLinkedInProfileUrl(row.url);
        if (!parsed) return null;
        return { url: parsed.url, name: (row.name || parsed.name).trim() };
      })
      .filter(Boolean) as { url: string; name: string }[];
    const total = catalogIds.length + custom.length;
    if (total > 10) return jsonError("Pick up to 10 thought leaders");
    await prisma.savedLeader.deleteMany({ where: { userId: session.userId } });
    if (catalogIds.length) {
      await prisma.savedLeader.createMany({
        data: catalogIds.map((catalogId) => ({ userId: session.userId, catalogId })),
      });
    }
    if (custom.length) {
      await prisma.savedLeader.createMany({
        data: custom.map((row) => ({
          userId: session.userId,
          customUrl: row.url,
          customName: row.name,
        })),
      });
    }
    return NextResponse.json({ ok: true, count: total });
  }

  return jsonError("Unknown action");
}
