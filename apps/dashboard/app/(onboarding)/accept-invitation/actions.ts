"use server";

import { redirect } from "next/navigation";
import { acceptInvitation } from "@/lib/invitations";
import { acceptInvitationSchema } from "@/lib/onboarding/schemas";
import { requireUser } from "@/lib/session";

export async function acceptInvitationAction(invitationId: string) {
  const user = await requireUser();
  const parsed = acceptInvitationSchema.safeParse({ invitationId });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Invitation id is missing.",
    };
  }

  try {
    await acceptInvitation({
      invitationId: parsed.data.invitationId,
      userId: user.id,
      userEmail: user.email,
    });
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Could not accept invitation.",
    };
  }

  redirect("/dashboard");
}
