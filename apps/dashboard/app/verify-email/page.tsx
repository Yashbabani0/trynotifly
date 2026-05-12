import { redirect } from "next/navigation";

import { requireSession } from "@/lib/auth/require-session";
import VerifyEmailPageContent from "@/components/Verify-Email-Page-Content";

export default async function Page() {
  const session = await requireSession(false);

  if (session?.user?.emailVerified) {
    redirect("/dashboard");
  }

  return <VerifyEmailPageContent />;
}
