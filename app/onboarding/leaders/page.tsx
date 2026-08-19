import { LeadersOnboarding } from "@/components/onboarding/LeadersOnboarding";
import { requireOnboardingPage } from "@/lib/app-gate";

export const dynamic = "force-dynamic";

export default async function LeadersPage() {
  await requireOnboardingPage();
  return <LeadersOnboarding />;
}
