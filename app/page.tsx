import { Landing } from "@/components/Landing";
import { getShellContext } from "@/lib/app-gate";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function RootPage() {
  const ctx = await getShellContext();
  if (!ctx.session) return <Landing />;
  if (ctx.connected && !ctx.completed) redirect("/onboarding/interests");
  redirect("/home");
}
