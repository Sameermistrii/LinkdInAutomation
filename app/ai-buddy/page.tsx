import { AppShell } from "@/components/AppShell";
import { requireAppPage } from "@/lib/app-gate";

export const dynamic = "force-dynamic";

export default async function AiBuddyPage() {
  const ctx = await requireAppPage();
  return (
    <AppShell name={ctx.name || ctx.session!.name} photoUrl={ctx.photoUrl || ""} connected={ctx.connected}>
      <div className="card max-w-xl p-8">
        <div className="mb-2 flex items-center gap-2">
          <h2 className="text-2xl font-semibold">AI Buddy</h2>
          <span className="rounded-full bg-[var(--line)] px-2 py-0.5 text-xs text-[var(--muted)]">Soon</span>
        </div>
        <p className="text-[var(--muted)]">
          Later, AI Buddy will draft posts in your voice using your interests and saved thought leaders.
          Nothing is generated yet.
        </p>
        <div className="mt-6 flex gap-2">
          <button type="button" disabled className="rounded-full bg-[var(--line)] px-4 py-2 text-sm text-[var(--muted)]">
            Generate ideas
          </button>
          <button type="button" disabled className="rounded-full border border-[var(--line)] px-4 py-2 text-sm text-[var(--muted)]">
            Rewrite in my voice
          </button>
        </div>
      </div>
    </AppShell>
  );
}
