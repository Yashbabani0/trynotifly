import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { getOnboardingState } from "@/lib/onboarding/service";
import { getSession } from "@/lib/session";

export default async function ForgotPasswordPage() {
  const session = await getSession();

  if (session?.user) {
    const state = await getOnboardingState(session.user.id);
    redirect(state.completed ? "/dashboard" : "/onboarding");
  }

  return (
    <AuthShell
      title="Reset access"
      description="Enter your email and we will send password reset instructions."
      footer={
        <Link href="/signIn" className="text-primary hover:underline">
          Back to sign in
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
