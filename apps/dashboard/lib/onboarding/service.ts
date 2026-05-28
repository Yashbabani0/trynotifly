import {
  and,
  db,
  eq,
  member,
  organization,
  organizationOnboardingAnswer,
} from "@trynotifly/db";

export type OnboardingStep = "ORGANIZATION" | "PROFILE" | "COMPLETE";

export type OnboardingState = {
  step: OnboardingStep;
  completed: boolean;
  organization:
    | {
        id: string;
        name: string;
        slug: string;
        industry: string | null;
        useCase: string | null;
        teamSize: string | null;
        timezone: string | null;
        website: string | null;
      }
    | null;
  answers: Record<string, string>;
};

export async function getOnboardingState(userId: string): Promise<OnboardingState> {
  const membership = await db.query.member.findFirst({
    where: eq(member.userId, userId),
    with: {
      organization: {
        with: {
          onboardingAnswers: true,
        },
      },
    },
  });

  if (!membership?.organization) {
    console.info("onboarding.state.result", {
      userId,
      organizationId: null,
      completed: false,
      step: "ORGANIZATION",
    });

    return {
      step: "ORGANIZATION",
      completed: false,
      organization: null,
      answers: {},
    };
  }

  const org = membership.organization;
  const answers = Object.fromEntries(
    org.onboardingAnswers.map((answer) => [answer.questionKey, answer.answer]),
  );

  const state = {
    step: org.onboardingStep,
    completed: org.onboardingCompleted,
    organization: {
      id: org.id,
      name: org.name,
      slug: org.slug,
      industry: org.industry,
      useCase: org.useCase,
      teamSize: org.teamSize,
      timezone: org.timezone,
      website: org.website,
    },
    answers,
  };

  console.info("onboarding.state.result", {
    userId,
    organizationId: org.id,
    completed: state.completed,
    step: state.step,
  });

  return state;
}

export async function ensureSlugAvailable(slug: string, organizationId?: string) {
  const existing = await db.query.organization.findFirst({
    where: eq(organization.slug, slug),
  });

  return !existing || existing.id === organizationId;
}

export async function userOwnsOrganization(userId: string, organizationId: string) {
  const existingMember = await db.query.member.findFirst({
    where: and(eq(member.userId, userId), eq(member.organizationId, organizationId)),
  });

  return Boolean(existingMember);
}

export async function createOrUpdateOrganization(input: {
  userId: string;
  name: string;
  slug: string;
  industry: string;
  useCase: string;
  teamSize: string;
  timezone: string;
  website?: string;
}) {
  return db.transaction(async (tx) => {
    const existingMembership = await tx.query.member.findFirst({
      where: eq(member.userId, input.userId),
      with: {
        organization: true,
      },
    });

    const slugTaken = await tx.query.organization.findFirst({
      where: eq(organization.slug, input.slug),
    });

    if (slugTaken && slugTaken.id !== existingMembership?.organizationId) {
      throw new Error("This workspace slug is already taken.");
    }

    if (existingMembership?.organization) {
      await tx
        .update(organization)
        .set({
          name: input.name,
          slug: input.slug,
          industry: input.industry,
          useCase: input.useCase,
          teamSize: input.teamSize,
          timezone: input.timezone,
          website: input.website,
          onboardingStep: "PROFILE",
        })
        .where(eq(organization.id, existingMembership.organizationId));

      return existingMembership.organizationId;
    }

    const organizationId = crypto.randomUUID();
    const membershipId = crypto.randomUUID();
    const now = new Date();

    await tx.insert(organization).values({
      id: organizationId,
      name: input.name,
      slug: input.slug,
      industry: input.industry,
      useCase: input.useCase,
      teamSize: input.teamSize,
      timezone: input.timezone,
      website: input.website,
      onboardingStep: "PROFILE",
      onboardingCompleted: false,
    });

    await tx.insert(member).values({
      id: membershipId,
      organizationId,
      userId: input.userId,
      role: "owner",
      createdAt: now,
    });

    return organizationId;
  });
}

export async function saveOnboardingAnswers(input: {
  userId: string;
  organizationId: string;
  answers: Record<string, string>;
}) {
  const ownsOrganization = await userOwnsOrganization(
    input.userId,
    input.organizationId,
  );

  if (!ownsOrganization) {
    throw new Error("You do not have access to this workspace.");
  }

  return db.transaction(async (tx) => {
    for (const [questionKey, answer] of Object.entries(input.answers)) {
      await tx
        .insert(organizationOnboardingAnswer)
        .values({
          organizationId: input.organizationId,
          questionKey,
          answer,
        })
        .onConflictDoUpdate({
          target: [
            organizationOnboardingAnswer.organizationId,
            organizationOnboardingAnswer.questionKey,
          ],
          set: {
            answer,
            updatedAt: new Date(),
          },
        });
    }

    await tx
      .update(organization)
      .set({
        onboardingStep: "COMPLETE",
        onboardingCompleted: true,
        onboardingCompletedAt: new Date(),
      })
      .where(eq(organization.id, input.organizationId));
  });
}
