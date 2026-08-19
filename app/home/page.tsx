import { AppShell } from "@/components/AppShell";
import { HomeBoard } from "@/components/HomeBoard";
import { requireAppPage } from "@/lib/app-gate";

export const dynamic = "force-dynamic";

function greeting(name: string) {
  const hour = new Date().getHours();
  const first = name.split(" ")[0] || "there";
  if (hour < 12) return `Good morning, ${first}`;
  if (hour < 18) return `Good afternoon, ${first}`;
  return `Good evening, ${first}`;
}

export default async function HomePage() {
  const ctx = await requireAppPage();
  const name = ctx.name || ctx.session!.name;
  return (
    <AppShell name={name} photoUrl={ctx.photoUrl || ""} connected={ctx.connected} greeting={greeting(name)}>
      <HomeBoard firstName={name.split(" ")[0] || "there"} />
    </AppShell>
  );
}
