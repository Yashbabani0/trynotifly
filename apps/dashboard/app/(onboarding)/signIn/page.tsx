import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { SignInForm } from "@/components/auth/sign-in-form";
import { getOnboardingState } from "@/lib/onboarding/service";
import { getSession } from "@/lib/session";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const callbackURL = params.next?.startsWith("/") ? params.next : "/onboarding";
  const session = await getSession();

  if (session?.user) {
    const state = await getOnboardingState(session.user.id);
    redirect(state.completed ? "/dashboard" : "/onboarding");
  }

  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to continue setting up your notification workspace."
      footer={
        <>
          New to TryNotifly?{" "}
          <Link href="/signUp" className="text-primary hover:underline">
            Create an account
          </Link>
        </>
      }
      oauth={<OAuthButtons callbackURL={callbackURL} />}
    >
      <SignInForm callbackURL={callbackURL} />
    </AuthShell>
  );
}
