import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { getSession, type SessionUser } from "./session";

export async function ensureOnboardingFlag(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { onboardingCompletedAt: true },
  });
  if (!user || user.onboardingCompletedAt) return user?.onboardingCompletedAt ?? null;
  const posts = await prisma.post.count({ where: { userId } });
  if (posts > 0) {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { onboardingCompletedAt: new Date() },
      select: { onboardingCompletedAt: true },
    });
    return updated.onboardingCompletedAt;
  }
  return null;
}

export async function getShellContext() {
  const session = await getSession();
  if (!session) {
    return {
      session: null as SessionUser | null,
      connected: false,
      completed: false,
      name: "",
      photoUrl: "",
      headline: "",
    };
  }
  const completedAt = await ensureOnboardingFlag(session.userId);
  const account = await prisma.linkedInAccount.findUnique({
    where: { userId: session.userId },
    select: { name: true, photoUrl: true, headline: true },
  });
  return {
    session,
    connected: Boolean(account),
    completed: Boolean(completedAt),
    name: account?.name || session.name,
    photoUrl: account?.photoUrl || session.picture,
    headline: account?.headline || "",
  };
}

export async function requireAppPage(opts?: { allowIncomplete?: boolean }) {
  const ctx = await getShellContext();
  if (!ctx.session) redirect("/login");
  if (ctx.connected && !ctx.completed && !opts?.allowIncomplete) {
    redirect("/onboarding/interests");
  }
  return ctx;
}

export async function requireOnboardingPage() {
  const ctx = await getShellContext();
  if (!ctx.session) redirect("/login");
  if (!ctx.connected) redirect("/home");
  return ctx;
}
