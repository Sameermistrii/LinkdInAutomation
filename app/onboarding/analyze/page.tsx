import { AnalyzeOnboarding } from "@/components/onboarding/AnalyzeOnboarding";
import { requireOnboardingPage } from "@/lib/app-gate";

export const dynamic = "force-dynamic";

export default async function AnalyzePage() {
  await requireOnboardingPage();
  return <AnalyzeOnboarding />;
}
