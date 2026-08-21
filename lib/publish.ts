import { prisma } from "./prisma";
import {
  createComment,
  createPost,
  getValidAccessToken,
  initializeDocumentUpload,
  initializeImageUpload,
  putBinary,
} from "./linkedin";
import { readMediaBytes } from "./media";
import { consumeExtraSlot } from "./schedule";

// Person URN unless this post is set to a Company Page.
function ownerUrn(post: { authorType: string; organizationUrn: string }, personUrn: string) {
  if (post.authorType === "ORGANIZATION" && post.organizationUrn) return post.organizationUrn;
  return personUrn;
}

function mediaKind(mediaType: string): "image" | "document" | null {
  if (mediaType.startsWith("image/")) return "image";
  if (mediaType === "application/pdf") return "document";
  return null;
}

export async function publishDuePosts(userId?: string) {
  const due = await prisma.post.findMany({
    where: {
      status: "queued",
      scheduledAt: { lte: new Date() },
      ...(userId ? { userId } : {}),
    },
    orderBy: { scheduledAt: "asc" },
  });

  const results: { id: number; ok: boolean; error?: string }[] = [];
  for (const post of due) {
    try {
      await publishPost(post.id);
      results.push({ id: post.id, ok: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Publish failed";
      await prisma.post.update({
        where: { id: post.id },
        data: { status: "error", errorMessage: message },
      });
      results.push({ id: post.id, ok: false, error: message });
    }
  }
  return results;
}

export async function publishPost(postId: number) {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) throw new Error("Post not found");
  if (post.status === "published") return post;

  const { token: accessToken, account } = await getValidAccessToken(post.userId);
  const authorUrn = ownerUrn(post, account.personUrn);

  let mediaUrn: string | undefined;
  let kind: "image" | "document" | undefined;
  if (post.mediaPath) {
    const bytes = await readMediaBytes(post.mediaPath);
    const detected = mediaKind(post.mediaType);
    if (detected === "image") {
      const init = await initializeImageUpload(accessToken, authorUrn);
      await putBinary(init.uploadUrl, bytes, post.mediaType || "image/jpeg");
      mediaUrn = init.imageUrn;
      kind = "image";
    } else if (detected === "document") {
      const init = await initializeDocumentUpload(accessToken, authorUrn);
      await putBinary(init.uploadUrl, bytes, post.mediaType || "application/pdf");
      mediaUrn = init.documentUrn;
      kind = "document";
    }
  }

  const postUrn = await createPost(accessToken, {
    authorUrn,
    commentary: post.body,
    mediaUrn,
    mediaKind: kind,
  });

  if (post.firstComment.trim()) {
    try {
      await createComment(accessToken, postUrn, post.firstComment.trim(), authorUrn);
    } catch (err) {
      const message = err instanceof Error ? err.message : "First comment failed";
      const saved = await prisma.post.update({
        where: { id: post.id },
        data: {
          status: "published",
          publishedAt: new Date(),
          linkedinPostUrn: postUrn,
          errorMessage: `Posted, but first comment failed: ${message}`,
        },
      });
      await consumeExtraSlot(post.userId, post.scheduledAt);
      return saved;
    }
  }

  const saved = await prisma.post.update({
    where: { id: post.id },
    data: {
      status: "published",
      publishedAt: new Date(),
      linkedinPostUrn: postUrn,
      errorMessage: "",
    },
  });
  await consumeExtraSlot(post.userId, post.scheduledAt);
  return saved;
}
