import { InviteMemberForm } from "@/components/onboarding/invite-member-form";
import { getOnboardingState } from "@/lib/onboarding/service";
import { requireUser } from "@/lib/session";

export default async function TeamSettingsPage() {
  const user = await requireUser();
  const state = await getOnboardingState(user.id);

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm text-muted-foreground">
          {state.organization?.name ?? "Workspace"}
        </p>
        <h1 className="mt-2 text-3xl font-semibold">Team settings</h1>
        <div className="mt-8 rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold">Invite teammate</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Invite someone to collaborate in this workspace. Invitations expire
            after 24 hours.
          </p>
          <div className="mt-6">
            <InviteMemberForm />
          </div>
        </div>
      </div>
    </main>
  );
}
