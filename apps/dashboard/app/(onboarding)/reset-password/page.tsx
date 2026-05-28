import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;

  return (
    <AuthShell
      title="Choose a new password"
      description="Create a strong password to regain access to your workspace."
      footer={
        <Link href="/signIn" className="text-primary hover:underline">
          Back to sign in
        </Link>
      }
    >
      <ResetPasswordForm token={params.token ?? ""} />
    </AuthShell>
  );
}
