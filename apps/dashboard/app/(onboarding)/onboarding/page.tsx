import { redirect } from "next/navigation";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import { getOnboardingState } from "@/lib/onboarding/service";
import { requireUser } from "@/lib/session";

export default async function OnboardingPage() {
  const user = await requireUser();
  const state = await getOnboardingState(user.id);

  if (state.completed) {
    redirect("/dashboard");
  }

  return <OnboardingFlow state={state} />;
}
