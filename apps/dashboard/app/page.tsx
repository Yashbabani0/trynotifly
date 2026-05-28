import { redirect } from "next/navigation";
import { getOnboardingState } from "@/lib/onboarding/service";
import { getSession } from "@/lib/session";

export default async function Page() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/signIn");
  }

  const state = await getOnboardingState(session.user.id);
  redirect(state.completed ? "/dashboard" : "/onboarding");
}
