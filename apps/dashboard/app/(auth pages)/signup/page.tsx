import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/require-session";
import SignUpForm from "@/components/SignUp-Form";

export default async function Page() {
  const session = await requireSession(false);

  if (session) {
    redirect("/dashboard");
  }

  return <SignUpForm />;
}
