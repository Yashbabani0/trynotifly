// app/onboarding/layout.tsx

import { ReactNode } from "react";
import { requireSession } from "@/lib/auth/require-session";

export default async function OnboardingLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireSession();

  return <>{children}</>;
}