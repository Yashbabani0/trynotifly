import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { db, member, eq } from "@trynotifly/db";
import { requireSession } from "@/lib/auth/require-session";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireSession();

  const userMembership = await db.query.member.findFirst({
    where: eq(member.userId, session!.user.id),

    with: {
      organization: true,
    },
  });

  // No organization yet
  if (!userMembership) {
    redirect("/onboarding/organization");
  }

  // Organization onboarding incomplete
  if (!userMembership.organization.onboardingCompleted) {
    const step = userMembership.organization.onboardingStep || "organization";

    redirect(`/onboarding/${step}`);
  }

  return <>{children}</>;
}
