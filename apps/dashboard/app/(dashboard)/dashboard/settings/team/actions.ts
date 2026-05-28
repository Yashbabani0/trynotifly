"use server";

import { revalidatePath } from "next/cache";
import { getOnboardingState } from "@/lib/onboarding/service";
import { inviteMember } from "@/lib/invitations";
import { inviteMemberSchema, type InviteMemberInput } from "@/lib/onboarding/schemas";
import { requireUser } from "@/lib/session";

export async function inviteMemberAction(values: InviteMemberInput) {
  const user = await requireUser();
  const state = await getOnboardingState(user.id);

  if (!state.organization) {
    return {
      ok: false,
      message: "Create a workspace before inviting teammates.",
    };
  }

  const parsed = inviteMemberSchema.safeParse(values);

  if (!parsed.success) {
    return {
      ok: false,
      message: "Check the invitation details.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await inviteMember({
      inviterId: user.id,
      organizationId: state.organization.id,
      ...parsed.data,
    });
    revalidatePath("/dashboard/settings/team");

    return {
      ok: true,
      message: "Invitation sent.",
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Could not send invitation.",
    };
  }
}
