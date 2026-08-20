import { AppShell } from "@/components/AppShell";
import { Composer } from "@/components/Composer";
import { requireAppPage } from "@/lib/app-gate";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ComposePage({
  searchParams,
}: {
  searchParams: Promise<{ slot?: string; idea?: string }>;
}) {
  const { slot, idea } = await searchParams;
  const ctx = await requireAppPage();
  let organizations: { urn: string; name: string; logoUrl: string }[] = [];
  if (ctx.session) {
    organizations = await prisma.organization.findMany({
      where: { userId: ctx.session.userId },
      orderBy: { name: "asc" },
    });
  }

  return (
    <AppShell name={ctx.name || ctx.session!.name} photoUrl={ctx.photoUrl || ""} connected={ctx.connected}>
      <div className="px-4 py-6 md:px-8">
      <h1 className="mb-2 text-2xl font-semibold tracking-tight sm:text-3xl">New post</h1>
      <p className="mb-8 text-[var(--muted)]">Preview exactly how it will look, then add it to the queue.</p>
      <Composer
        slot={slot ?? null}
        idea={idea ?? null}
        account={{
          name: ctx.name || "Your name",
          headline: ctx.headline || "Your LinkedIn headline",
          photoUrl: ctx.photoUrl || "",
        }}
        organizations={organizations}
      />
      </div>
    </AppShell>
  );
}
