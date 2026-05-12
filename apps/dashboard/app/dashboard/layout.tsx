import { ReactNode } from "react";

import { requireSession } from "@/lib/auth/require-session";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireSession();

  return <>{children}</>;
}
