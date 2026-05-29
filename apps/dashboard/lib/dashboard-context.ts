import { redirect } from "next/navigation";
import {
  and,
  db,
  eq,
  getPlanDefinition,
  member,
  organization,
  organizationBilling,
} from "@trynotifly/db";
import { getSession } from "@/lib/session";
import { processBillingMaintenanceForOrganization } from "@/lib/billing";

export type DashboardRole = "owner" | "admin" | "member";

export class DashboardError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode = 400,
  ) {
    super(message);
  }
}

export function normalizeRole(role?: string | null): DashboardRole {
  return role === "owner" || role === "admin" ? role : "member";
}

export function assertCanManage(role: string | null | undefined) {
  const normalized = normalizeRole(role);

  if (normalized !== "owner" && normalized !== "admin") {
    throw new DashboardError(
      "Only organization owners and admins can perform this action.",
      "INSUFFICIENT_ROLE",
      403,
    );
  }
}

export async function getDashboardContext() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/signIn");
  }

  const membership = await db.query.member.findFirst({
    where: eq(member.userId, session.user.id),
    with: {
      organization: {
        with: {
          billing: {
            with: {
              plan: true,
            },
          },
        },
      },
    },
  });

  if (!membership?.organization) {
    redirect("/onboarding");
  }

  if (!membership.organization.onboardingCompleted) {
    redirect("/onboarding");
  }

  const billing =
    membership.organization.billing ??
    (await ensureOrganizationBilling(membership.organization.id, membership.organization.plan));
  await processBillingMaintenanceForOrganization(membership.organization.id);
  const refreshedOrganization = await db.query.organization.findFirst({
    where: eq(organization.id, membership.organization.id),
    with: {
      billing: {
        with: {
          plan: true,
        },
      },
    },
  });
  const organizationWithBilling = refreshedOrganization ?? membership.organization;
  const refreshedBilling = organizationWithBilling.billing ?? billing;
  const plan = getPlanDefinition(refreshedBilling.planSlug);

  return {
    user: session.user,
    organization: organizationWithBilling,
    membership,
    role: normalizeRole(membership.role),
    billing: refreshedBilling,
    plan,
  };
}

export async function ensureOrganizationBilling(
  organizationId: string,
  planSlug: string | null | undefined,
) {
  const normalizedPlan = getPlanDefinition(planSlug);
  const plan = await db.query.plans.findFirst({
    where: (table, { eq }) => eq(table.slug, normalizedPlan.slug),
  });

  const inserted = await db
    .insert(organizationBilling)
    .values({
      organizationId,
      planId: plan?.id,
      planSlug: normalizedPlan.slug,
      billingProvider: normalizedPlan.slug === "free" ? "free" : "manual",
      billingInterval: "monthly",
      subscriptionStatus: "active",
      status: normalizedPlan.isContactSales ? "contact_sales" : "active",
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      creditsLastResetAt: null,
      nextCreditResetAt: new Date(),
    })
    .onConflictDoUpdate({
      target: organizationBilling.organizationId,
      set: {
        planId: plan?.id,
        planSlug: normalizedPlan.slug,
        billingProvider: normalizedPlan.slug === "free" ? "free" : "manual",
        updatedAt: new Date(),
      },
    })
    .returning();

  return inserted[0]!;
}

export async function getMembership(userId: string, organizationId: string) {
  return db.query.member.findFirst({
    where: and(eq(member.userId, userId), eq(member.organizationId, organizationId)),
  });
}

export async function getOrganizationById(organizationId: string) {
  return db.query.organization.findFirst({
    where: eq(organization.id, organizationId),
  });
}
