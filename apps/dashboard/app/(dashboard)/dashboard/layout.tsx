import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getOnboardingState } from "@/lib/onboarding/service";
import { requireUser } from "@/lib/session";
import { db, eq, member } from "@trynotifly/db";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const state = await getOnboardingState(user.id);

  if (!state.completed) {
    redirect("/onboarding");
  }

  const membership = await db.query.member.findFirst({
    where: eq(member.userId, user.id),
    with: {
      organization: true,
    },
  });

  if (!membership?.organization) {
    redirect("/onboarding");
  }

  return (
    <DashboardShell
      user={user}
      organization={membership.organization}
      role={membership.role}
    >
      {children}
    </DashboardShell>
  );
}
