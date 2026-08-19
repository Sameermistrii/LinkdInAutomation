import { Suspense } from "react";
import { InterestsOnboarding } from "@/components/onboarding/InterestsOnboarding";
import { requireOnboardingPage } from "@/lib/app-gate";

export const dynamic = "force-dynamic";

export default async function InterestsPage() {
  await requireOnboardingPage();
  return (
    <Suspense fallback={<div className="p-10 text-sm text-[var(--muted)]">Loading…</div>}>
      <InterestsOnboarding />
    </Suspense>
  );
}
