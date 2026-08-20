import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Composer } from "@/components/Composer";
import { requireAppPage } from "@/lib/app-gate";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EditComposePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await requireAppPage();
  const post = await prisma.post.findFirst({
    where: { id: Number(id), userId: ctx.session!.userId },
  });
  if (!post) notFound();
  const organizations = await prisma.organization.findMany({
    where: { userId: ctx.session!.userId },
    orderBy: { name: "asc" },
  });

  return (
    <AppShell name={ctx.name || ctx.session!.name} photoUrl={ctx.photoUrl || ""} connected={ctx.connected}>
      <div className="px-4 py-6 md:px-8">
      <h1 className="mb-8 text-2xl font-semibold tracking-tight sm:text-3xl">Edit post</h1>
      <Composer
        initial={{
          id: post.id,
          body: post.body,
          firstComment: post.firstComment,
          mediaPath: post.mediaPath,
          mediaType: post.mediaType,
          authorType: post.authorType,
          organizationUrn: post.organizationUrn,
          scheduledAt: post.scheduledAt?.toISOString() ?? null,
        }}
        slot={post.scheduledAt?.toISOString() ?? null}
        account={{
          name: ctx.name || ctx.session!.name,
          headline: ctx.headline || "",
          photoUrl: ctx.photoUrl || "",
        }}
        organizations={organizations}
      />
      </div>
    </AppShell>
  );
}
