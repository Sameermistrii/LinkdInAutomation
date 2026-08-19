import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/http";
import { isSlotTaken, nextFreeSlot } from "@/lib/schedule";
import { publishPost } from "@/lib/publish";
import { requireUser } from "@/lib/session";

export async function GET() {
  const { session, error } = await requireUser();
  if (error || !session) return error!;
  const posts = await prisma.post.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
  });
  const counts = {
    queued: posts.filter((p) => p.status === "queued").length,
    published: posts.filter((p) => p.status === "published").length,
    draft: posts.filter((p) => p.status === "draft").length,
    error: posts.filter((p) => p.status === "error").length,
  };
  return NextResponse.json({ posts, counts });
}

export async function POST(request: Request) {
  const { session, error } = await requireUser();
  if (error || !session) return error!;

  const body = (await request.json()) as {
    body?: string;
    firstComment?: string;
    mediaPath?: string;
    mediaType?: string;
    authorType?: "PERSON" | "ORGANIZATION";
    organizationUrn?: string;
    status?: "draft" | "queued";
    scheduledAt?: string | null;
    action?: "next-slot" | "now";
  };

  const account = await prisma.linkedInAccount.findUnique({ where: { userId: session.userId } });
  if (!account) return jsonError("Connect LinkedIn first", 401);

  let scheduledAt: Date | null = body.scheduledAt ? new Date(body.scheduledAt) : null;
  let status = body.status ?? "draft";

  if (body.action === "next-slot") {
    const slot = await nextFreeSlot(session.userId);
    if (!slot) return jsonError("No free slots in the next 60 days. Edit your schedule.");
    scheduledAt = slot.at;
    status = "queued";
  }

  if (status === "queued" && scheduledAt) {
    if (await isSlotTaken(session.userId, scheduledAt)) return jsonError("That time slot is already taken");
  }

  const post = await prisma.post.create({
    data: {
      userId: session.userId,
      body: body.body ?? "",
      firstComment: body.firstComment ?? "",
      mediaPath: body.mediaPath ?? "",
      mediaType: body.mediaType ?? "",
      authorType: body.authorType === "ORGANIZATION" ? "ORGANIZATION" : "PERSON",
      organizationUrn: body.organizationUrn ?? "",
      status,
      scheduledAt,
    },
  });

  if (body.action === "now") {
    try {
      const published = await publishPost(post.id);
      return NextResponse.json({ post: published });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Publish failed";
      const failed = await prisma.post.update({
        where: { id: post.id },
        data: { status: "error", errorMessage: message },
      });
      return NextResponse.json({ post: failed, error: message }, { status: 502 });
    }
  }

  return NextResponse.json({ post });
}
