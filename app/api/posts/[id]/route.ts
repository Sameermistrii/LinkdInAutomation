import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/http";
import { isSlotTaken, nextFreeSlot } from "@/lib/schedule";
import { publishPost } from "@/lib/publish";
import { requireUser } from "@/lib/session";

type Ctx = { params: Promise<{ id: string }> };

async function ownedPost(userId: string, id: number) {
  return prisma.post.findFirst({ where: { id, userId } });
}

export async function GET(_req: Request, ctx: Ctx) {
  const { session, error } = await requireUser();
  if (error || !session) return error!;
  const { id } = await ctx.params;
  const post = await ownedPost(session.userId, Number(id));
  if (!post) return jsonError("Not found", 404);
  return NextResponse.json({ post });
}

export async function PATCH(request: Request, ctx: Ctx) {
  const { session, error } = await requireUser();
  if (error || !session) return error!;
  const { id } = await ctx.params;
  const postId = Number(id);
  const existing = await ownedPost(session.userId, postId);
  if (!existing) return jsonError("Not found", 404);

  const body = (await request.json()) as {
    body?: string;
    firstComment?: string;
    mediaPath?: string;
    mediaType?: string;
    authorType?: "PERSON" | "ORGANIZATION";
    organizationUrn?: string;
    status?: "draft" | "queued" | "published" | "error";
    scheduledAt?: string | null;
    action?: "next-slot" | "now" | "clear-media";
  };

  let scheduledAt =
    body.scheduledAt === undefined
      ? existing.scheduledAt
      : body.scheduledAt
        ? new Date(body.scheduledAt)
        : null;
  let status = body.status ?? existing.status;

  if (body.action === "next-slot") {
    const slot = await nextFreeSlot(session.userId);
    if (!slot) return jsonError("No free slots in the next 60 days. Edit your schedule.");
    scheduledAt = slot.at;
    status = "queued";
  }

  if (status === "queued" && scheduledAt) {
    if (await isSlotTaken(session.userId, scheduledAt, postId)) {
      return jsonError("That time slot is already taken");
    }
  }

  const updated = await prisma.post.update({
    where: { id: postId },
    data: {
      body: body.body ?? existing.body,
      firstComment: body.firstComment ?? existing.firstComment,
      mediaPath: body.action === "clear-media" ? "" : (body.mediaPath ?? existing.mediaPath),
      mediaType: body.action === "clear-media" ? "" : (body.mediaType ?? existing.mediaType),
      authorType: body.authorType ?? existing.authorType,
      organizationUrn: body.organizationUrn ?? existing.organizationUrn,
      status,
      scheduledAt,
      errorMessage: status === "queued" || status === "draft" ? "" : existing.errorMessage,
    },
  });

  if (body.action === "now") {
    try {
      const published = await publishPost(updated.id);
      return NextResponse.json({ post: published });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Publish failed";
      const failed = await prisma.post.update({
        where: { id: updated.id },
        data: { status: "error", errorMessage: message },
      });
      return NextResponse.json({ post: failed, error: message }, { status: 502 });
    }
  }

  return NextResponse.json({ post: updated });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const { session, error } = await requireUser();
  if (error || !session) return error!;
  const { id } = await ctx.params;
  await prisma.post.deleteMany({ where: { id: Number(id), userId: session.userId } });
  return NextResponse.json({ ok: true });
}
