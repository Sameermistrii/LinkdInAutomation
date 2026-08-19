import { AppShell } from "@/components/AppShell";
import { Dashboard } from "@/components/Dashboard";
import { requireAppPage } from "@/lib/app-gate";

export const dynamic = "force-dynamic";

export default async function PostsPage() {
  const ctx = await requireAppPage();
  return (
    <AppShell name={ctx.name || ctx.session!.name} photoUrl={ctx.photoUrl || ""} connected={ctx.connected}>
      <Dashboard
        initial={{
          name: ctx.name || ctx.session!.name,
          photoUrl: ctx.photoUrl || "",
          headline: ctx.headline || "",
          connected: ctx.connected,
        }}
      />
    </AppShell>
  );
}
