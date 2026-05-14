import { redirect } from "next/navigation";

import { requireSession } from "@/lib/auth/require-session";
import SignInForm from "@/components/SignIn-Form";

export default async function Page() {
  const session = await requireSession(false);

  if (session) {
    redirect("/dashboard");
  }

  return <SignInForm />;
}
