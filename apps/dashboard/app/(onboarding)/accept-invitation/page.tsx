import { redirect } from "next/navigation";
import { AcceptInvitationForm } from "@/components/onboarding/accept-invitation-form";
import { getSession } from "@/lib/session";

export default async function AcceptInvitationPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const [params, session] = await Promise.all([searchParams, getSession()]);
  const id = params.id ?? "";

  if (!session?.user) {
    redirect(`/signIn?next=/accept-invitation?id=${encodeURIComponent(id)}`);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10 text-foreground">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6">
        <h1 className="text-2xl font-semibold">Accept invitation</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Join this TryNotifly workspace using the same email address that
          received the invitation.
        </p>
        <div className="mt-6">
          <AcceptInvitationForm invitationId={id} />
        </div>
      </div>
    </main>
  );
}
