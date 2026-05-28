import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { getOnboardingState } from "@/lib/onboarding/service";
import { getSession } from "@/lib/session";

export default async function SignUpPage() {
  const session = await getSession();

  if (session?.user) {
    const state = await getOnboardingState(session.user.id);
    redirect(state.completed ? "/dashboard" : "/onboarding");
  }

  return (
    <AuthShell
      title="Create your account"
      description="Start with your user account, then we will configure your workspace."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/signIn" className="text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
      oauth={<OAuthButtons />}
    >
      <SignUpForm />
    </AuthShell>
  );
}
