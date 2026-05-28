import { redirect } from "next/navigation";
import { getOnboardingState } from "@/lib/onboarding/service";
import { requireUser } from "@/lib/session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const state = await getOnboardingState(user.id);

  if (!state.completed) {
    redirect("/onboarding");
  }

  return children;
}
