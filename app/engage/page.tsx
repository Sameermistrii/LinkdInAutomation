import { AppShell } from "@/components/AppShell";
import { requireAppPage } from "@/lib/app-gate";

export const dynamic = "force-dynamic";

export default async function EngagePage() {
  const ctx = await requireAppPage();
  return (
    <AppShell name={ctx.name || ctx.session!.name} photoUrl={ctx.photoUrl || ""} connected={ctx.connected}>
      <div className="card max-w-xl p-8">
        <div className="mb-2 flex items-center gap-2">
          <h2 className="text-2xl font-semibold">Engage</h2>
          <span className="rounded-full bg-[var(--line)] px-2 py-0.5 text-xs text-[var(--muted)]">Soon</span>
        </div>
        <p className="text-[var(--muted)]">
          Later, Engage will help you reply to comments on posts UniSin published. Official comment APIs
          are limited, so this stays off until we can do it within LinkedIn’s rules.
        </p>
      </div>
    </AppShell>
  );
}
