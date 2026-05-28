"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import {
  createOrUpdateOrganization,
  getOnboardingState,
  saveOnboardingAnswers,
} from "@/lib/onboarding/service";
import { sendWelcomeEmail } from "@/lib/email";
import { getEmailEnv } from "@/lib/env";
import {
  organizationStepSchema,
  profileStepSchema,
  type OrganizationStepInput,
  type ProfileStepInput,
} from "@/lib/onboarding/schemas";

export type ActionResult = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

function fieldErrors(error: unknown): Record<string, string[] | undefined> | undefined {
  if (error && typeof error === "object" && "flatten" in error) {
    return undefined;
  }

  return undefined;
}

export async function saveOrganizationStep(
  values: OrganizationStepInput,
): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = organizationStepSchema.safeParse(values);

  if (!parsed.success) {
    return {
      ok: false,
      message: "Check the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await createOrUpdateOrganization({
      userId: user.id,
      ...parsed.data,
    });

    revalidatePath("/onboarding");

    return {
      ok: true,
      message: "Workspace saved.",
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Could not save your workspace.",
      fieldErrors: fieldErrors(error),
    };
  }
}

export async function saveProfileStep(
  values: ProfileStepInput,
): Promise<ActionResult> {
  const user = await requireUser();
  const state = await getOnboardingState(user.id);

  if (!state.organization) {
    return {
      ok: false,
      message: "Create your workspace before completing this step.",
    };
  }

  const parsed = profileStepSchema.safeParse(values);

  if (!parsed.success) {
    return {
      ok: false,
      message: "Check the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  await saveOnboardingAnswers({
    userId: user.id,
    organizationId: state.organization.id,
    answers: {
      platformUse: parsed.data.platformUse,
      expectedVolume: parsed.data.expectedVolume,
      preferredChannels: parsed.data.preferredChannels.join(","),
      teamRole: parsed.data.teamRole,
      experienceLevel: parsed.data.experienceLevel,
    },
  });

  try {
    await sendWelcomeEmail({
      to: user.email,
      userName: user.name,
      organizationName: state.organization.name,
      dashboardUrl: `${getEmailEnv().APP_URL}/dashboard`,
    });
  } catch (error) {
    console.error("onboarding.welcome_email_failed", {
      userId: user.id,
      organizationId: state.organization.id,
      error,
    });
  }

  revalidatePath("/onboarding");
  redirect("/dashboard");
}
