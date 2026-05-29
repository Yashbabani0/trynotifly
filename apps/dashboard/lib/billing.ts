import {
  and,
  creditTransaction,
  db,
  eq,
  lte,
  member,
  normalizePlanSlug,
  organization,
  organizationBilling,
  plans,
  sql,
} from "@trynotifly/db";
import { auth } from "@/lib/auth";

export {
  BLOCKING_SUBSCRIPTION_STATUSES,
  canCancelSubscriptionStatus,
  getActivePlanSlug,
  getPendingPlanSlug,
  isBlockingPaidSubscriptionStatus,
  isNonTerminalSubscriptionStatus,
  isRetryableCheckoutStatus,
  NON_TERMINAL_SUBSCRIPTION_STATUSES,
  RETRYABLE_CHECKOUT_STATUSES,
  shouldBlockNewSubscription,
  TERMINAL_SUBSCRIPTION_STATUSES,
} from "@/lib/billing-state";

export type BillingAuthContext =
  | {
      ok: true;
      userId: string;
      organizationId: string;
      role: string;
    }
  | {
      ok: false;
      status: number;
      code: string;
      message: string;
    };

export function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

export function resolveThirtyDayPeriod(input: {
  start?: Date | null;
  end?: Date | null;
  fallbackStart?: Date | null;
}) {
  const periodStart = input.start ?? input.fallbackStart ?? new Date();
  const periodEnd = input.end ?? addDays(periodStart, 30);

  return {
    periodStart,
    periodEnd,
  };
}

function isFreePlan(planSlug?: string | null) {
  return normalizePlanSlug(planSlug) === "free";
}

export async function getBillingAuthContext(
  request: Request,
  organizationId: string,
): Promise<BillingAuthContext> {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user) {
    return {
      ok: false,
      status: 401,
      code: "UNAUTHORIZED",
      message: "Sign in before managing billing.",
    };
  }

  const membership = await db.query.member.findFirst({
    where: and(
      eq(member.userId, session.user.id),
      eq(member.organizationId, organizationId),
    ),
  });
  const role = membership?.role?.toLowerCase();

  if (!membership || (role !== "owner" && role !== "admin")) {
    return {
      ok: false,
      status: 403,
      code: "INSUFFICIENT_ROLE",
      message: "Only organization owners and admins can manage billing.",
    };
  }

  return {
    ok: true,
    userId: session.user.id,
    organizationId,
    role,
  };
}

export async function repairBillingPeriodForOrganization(organizationId: string) {
  const now = new Date();

  return db.transaction(async (tx) => {
    await tx.execute(
      sql`select id from "organization" where id = ${organizationId} for update`,
    );
    await tx.execute(
      sql`select id from "organization_billing" where organization_id = ${organizationId} for update`,
    );

    const [org, billing, freePlan] = await Promise.all([
      tx.query.organization.findFirst({
        where: eq(organization.id, organizationId),
      }),
      tx.query.organizationBilling.findFirst({
        where: eq(organizationBilling.organizationId, organizationId),
      }),
      tx.query.plans.findFirst({
        where: eq(plans.slug, "free"),
      }),
    ]);

    if (!org || !billing) {
      return null;
    }

    const currentPlanSlug = normalizePlanSlug(billing.planSlug ?? org.plan);
    const fallbackStart =
      billing.creditsLastResetAt ?? billing.lastChargedAt ?? billing.createdAt ?? now;
    const { periodStart, periodEnd } = resolveThirtyDayPeriod({
      start: billing.currentPeriodStart,
      end: billing.currentPeriodEnd,
      fallbackStart,
    });
    const missingPeriod =
      !billing.currentPeriodStart ||
      !billing.currentPeriodEnd ||
      !billing.creditsLastResetAt ||
      !billing.nextCreditResetAt;
    const shouldCapFreeCredits =
      isFreePlan(currentPlanSlug) && org.balance > (freePlan?.includedCredits ?? 500);

    if (!missingPeriod && !shouldCapFreeCredits) {
      return null;
    }

    if (shouldCapFreeCredits) {
      await tx
        .update(organization)
        .set({
          balance: freePlan?.includedCredits ?? 500,
          lastFreeCreditsGrantedAt: billing.creditsLastResetAt ?? periodStart,
          updatedAt: now,
        })
        .where(eq(organization.id, organizationId));
    }

    const [updatedBilling] = await tx
      .update(organizationBilling)
      .set({
        currentPeriodStart: billing.currentPeriodStart ?? periodStart,
        currentPeriodEnd: billing.currentPeriodEnd ?? periodEnd,
        creditsLastResetAt: billing.creditsLastResetAt ?? periodStart,
        nextCreditResetAt: billing.nextCreditResetAt ?? periodEnd,
        updatedAt: now,
      })
      .where(eq(organizationBilling.organizationId, organizationId))
      .returning();

    return updatedBilling ?? null;
  });
}

export async function resetFreeCreditsForOrganization(organizationId: string) {
  const now = new Date();

  return db.transaction(async (tx) => {
    await tx.execute(
      sql`select id from "organization" where id = ${organizationId} for update`,
    );
    await tx.execute(
      sql`select id from "organization_billing" where organization_id = ${organizationId} for update`,
    );

    const [org, billing, freePlan] = await Promise.all([
      tx.query.organization.findFirst({
        where: eq(organization.id, organizationId),
      }),
      tx.query.organizationBilling.findFirst({
        where: eq(organizationBilling.organizationId, organizationId),
      }),
      tx.query.plans.findFirst({
        where: eq(plans.slug, "free"),
      }),
    ]);

    if (!org || normalizePlanSlug(org.plan) !== "free") {
      return org ?? null;
    }

    const credits = freePlan?.includedCredits ?? 500;
    const { periodStart, periodEnd } = resolveThirtyDayPeriod({
      start: billing?.currentPeriodStart,
      end: billing?.currentPeriodEnd,
      fallbackStart: billing?.creditsLastResetAt ?? billing?.createdAt ?? now,
    });
    const nextCreditResetAt = billing?.nextCreditResetAt ?? periodEnd;
    const hasRetryablePendingCheckout =
      billing?.pendingRazorpaySubscriptionId &&
      (billing.subscriptionStatus === "created" ||
        billing.subscriptionStatus === "authentication_failed");

    if (hasRetryablePendingCheckout) {
      if (nextCreditResetAt > now && org.balance <= credits) {
        if (
          !billing.currentPeriodStart ||
          !billing.currentPeriodEnd ||
          !billing.creditsLastResetAt ||
          !billing.nextCreditResetAt
        ) {
          await tx
            .update(organizationBilling)
            .set({
              currentPeriodStart: billing.currentPeriodStart ?? periodStart,
              currentPeriodEnd: billing.currentPeriodEnd ?? periodEnd,
              creditsLastResetAt: billing.creditsLastResetAt ?? periodStart,
              nextCreditResetAt,
              updatedAt: now,
            })
            .where(eq(organizationBilling.organizationId, organizationId));
        }

        return org;
      }

      const resetStart = nextCreditResetAt > now ? periodStart : now;
      const resetEnd = nextCreditResetAt > now ? periodEnd : addDays(now, 30);
      const [updatedOrg] = await tx
        .update(organization)
        .set({
          balance: credits,
          lastFreeCreditsGrantedAt: now,
          updatedAt: now,
        })
        .where(eq(organization.id, organizationId))
        .returning();

      await tx
        .update(organizationBilling)
        .set({
          currentPeriodStart: nextCreditResetAt && nextCreditResetAt > now
            ? billing.currentPeriodStart
            : resetStart,
          currentPeriodEnd: nextCreditResetAt && nextCreditResetAt > now
            ? billing.currentPeriodEnd
            : resetEnd,
          creditsLastResetAt: nextCreditResetAt && nextCreditResetAt > now
            ? billing.creditsLastResetAt
            : resetStart,
          nextCreditResetAt: nextCreditResetAt && nextCreditResetAt > now
            ? billing.nextCreditResetAt
            : resetEnd,
          updatedAt: now,
        })
        .where(eq(organizationBilling.organizationId, organizationId));

      await tx.insert(creditTransaction).values({
        organizationId,
        amount: credits,
        type: "BONUS",
        status: "COMPLETED",
        description: "Free plan monthly credits",
        metadata: {
          source:
            nextCreditResetAt && nextCreditResetAt > now
              ? "free_plan_cap_with_pending_checkout"
              : "free_plan_reset_with_pending_checkout",
          planSlug: "free",
          previousBalance: org.balance,
          periodStart: resetStart.toISOString(),
          periodEnd: resetEnd.toISOString(),
        },
      });

      return {
        organization: updatedOrg ?? org,
        billing,
      };
    }

    if (nextCreditResetAt > now) {
      if (org.balance > credits) {
        const [cappedOrg] = await tx
          .update(organization)
          .set({
            balance: credits,
            lastFreeCreditsGrantedAt: billing?.creditsLastResetAt ?? now,
            updatedAt: now,
          })
          .where(eq(organization.id, organizationId))
          .returning();

        await tx.insert(creditTransaction).values({
          organizationId,
          amount: credits,
          type: "BONUS",
          status: "COMPLETED",
          description: "Free plan credits capped",
          metadata: {
            source: "free_plan_cap",
            previousBalance: org.balance,
            planSlug: "free",
          },
        });

        return {
          organization: cappedOrg ?? org,
          billing,
        };
      }

      if (
        billing &&
        (!billing.currentPeriodStart ||
          !billing.currentPeriodEnd ||
          !billing.creditsLastResetAt ||
          !billing.nextCreditResetAt)
      ) {
        await tx
          .update(organizationBilling)
          .set({
            currentPeriodStart: billing.currentPeriodStart ?? periodStart,
            currentPeriodEnd: billing.currentPeriodEnd ?? periodEnd,
            creditsLastResetAt: billing.creditsLastResetAt ?? periodStart,
            nextCreditResetAt,
            updatedAt: now,
          })
          .where(eq(organizationBilling.organizationId, organizationId));
      }

      return org;
    }

    const [updatedOrg] = await tx
      .update(organization)
      .set({
        balance: credits,
        lastFreeCreditsGrantedAt: now,
        updatedAt: now,
      })
      .where(eq(organization.id, organizationId))
      .returning();

    const [updatedBilling] = await tx
      .insert(organizationBilling)
      .values({
        organizationId,
        planId: freePlan?.id,
        planSlug: "free",
        billingProvider: "free",
        billingInterval: "monthly",
        status: "active",
        subscriptionStatus: "active",
        currentPeriodStart: now,
        currentPeriodEnd: addDays(now, 30),
        creditsLastResetAt: now,
        nextCreditResetAt: addDays(now, 30),
      })
      .onConflictDoUpdate({
        target: organizationBilling.organizationId,
        set: {
          planId: freePlan?.id,
          planSlug: "free",
          billingProvider: "free",
          billingInterval: "monthly",
          status: "active",
          subscriptionStatus: "active",
          currentPeriodStart: now,
          currentPeriodEnd: addDays(now, 30),
          creditsLastResetAt: now,
          nextCreditResetAt: addDays(now, 30),
          updatedAt: now,
        },
      })
      .returning();

    await tx.insert(creditTransaction).values({
      organizationId,
      amount: credits,
      type: "BONUS",
      status: "COMPLETED",
      description: "Free plan monthly credits",
      metadata: {
        source: "free_plan_reset",
        planSlug: "free",
        periodStart: now.toISOString(),
        periodEnd: addDays(now, 30).toISOString(),
      },
    });

    return {
      organization: updatedOrg ?? org,
      billing: updatedBilling ?? billing,
    };
  });
}

export async function cleanupAbandonedCreatedSubscriptionForOrganization(
  organizationId: string,
) {
  const now = new Date();
  const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  return db.transaction(async (tx) => {
    await tx.execute(
      sql`select id from "organization_billing" where organization_id = ${organizationId} for update`,
    );

    const billing = await tx.query.organizationBilling.findFirst({
      where: eq(organizationBilling.organizationId, organizationId),
    });

    if (
      !billing ||
      billing.subscriptionStatus !== "created" ||
      billing.updatedAt > cutoff
    ) {
      return null;
    }

    const currentPlanSlug = normalizePlanSlug(billing.planSlug);

    const [updatedBilling] = await tx
      .update(organizationBilling)
      .set({
        billingProvider: currentPlanSlug === "free" ? "free" : billing.billingProvider,
        subscriptionStatus: "expired",
        status: currentPlanSlug === "free" ? "active" : billing.status,
        providerSubscriptionId: billing.providerSubscriptionId,
        pendingRazorpaySubscriptionId: null,
        pendingSubscriptionStatus: null,
        pendingCurrentPeriodStart: null,
        pendingCurrentPeriodEnd: null,
        pendingPlanSlug: null,
        updatedAt: now,
      })
      .where(eq(organizationBilling.organizationId, organizationId))
      .returning();

    return updatedBilling ?? null;
  });
}

export async function clearPendingSubscriptionForOrganization(
  organizationId: string,
) {
  const now = new Date();

  return db.transaction(async (tx) => {
    await tx.execute(
      sql`select id from "organization_billing" where organization_id = ${organizationId} for update`,
    );

    const billing = await tx.query.organizationBilling.findFirst({
      where: eq(organizationBilling.organizationId, organizationId),
    });

    if (
      !billing ||
      (billing.subscriptionStatus !== "created" &&
        billing.subscriptionStatus !== "authentication_failed")
    ) {
      return null;
    }

    const [updatedBilling] = await tx
      .update(organizationBilling)
      .set({
        subscriptionStatus: "expired",
        status: billing.status,
        pendingRazorpaySubscriptionId: null,
        pendingSubscriptionStatus: null,
        pendingCurrentPeriodStart: null,
        pendingCurrentPeriodEnd: null,
        pendingPlanSlug: null,
        cancelAtPeriodEnd: billing.cancelAtPeriodEnd,
        cancelledAt: billing.cancelledAt,
        updatedAt: now,
      })
      .where(eq(organizationBilling.organizationId, organizationId))
      .returning();

    return updatedBilling ?? null;
  });
}

export async function resetPaidCreditsForOrganizationIfDue(
  organizationId: string,
) {
  const now = new Date();

  return db.transaction(async (tx) => {
    await tx.execute(
      sql`select id from "organization_billing" where organization_id = ${organizationId} for update`,
    );

    const billing = await tx.query.organizationBilling.findFirst({
      where: eq(organizationBilling.organizationId, organizationId),
    });

    if (
      !billing ||
      billing.billingProvider !== "razorpay" ||
      billing.subscriptionStatus !== "active" ||
      (billing.nextCreditResetAt && billing.nextCreditResetAt > now)
    ) {
      return null;
    }

    const plan = await tx.query.plans.findFirst({
      where: eq(plans.slug, billing.planSlug),
    });
    const credits = plan?.includedCredits ?? 0;

    if (credits <= 0) {
      return null;
    }

    const periodStart = now;
    const periodEnd = addDays(now, 30);

    await tx
      .update(organization)
      .set({
        balance: credits,
        updatedAt: now,
      })
      .where(eq(organization.id, organizationId));

    await tx
      .update(organizationBilling)
      .set({
        creditsLastResetAt: now,
        nextCreditResetAt: periodEnd,
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        updatedAt: now,
      })
      .where(eq(organizationBilling.organizationId, organizationId));

    await tx.insert(creditTransaction).values({
      organizationId,
      amount: credits,
      type: "PURCHASE",
      status: "COMPLETED",
      description: `${plan?.name ?? "Paid plan"} monthly credits reset`,
      metadata: {
        source: "paid_plan_scheduled_reset",
        planSlug: billing.planSlug,
        subscriptionId: billing.razorpaySubscriptionId,
        periodStart: now.toISOString(),
        periodEnd: periodEnd.toISOString(),
      },
    });

    return true;
  });
}

export async function expireScheduledCancellationForOrganization(
  organizationId: string,
) {
  const now = new Date();

  return db.transaction(async (tx) => {
    await tx.execute(
      sql`select id from "organization_billing" where organization_id = ${organizationId} for update`,
    );

    const billing = await tx.query.organizationBilling.findFirst({
      where: eq(organizationBilling.organizationId, organizationId),
    });

    if (
      !billing ||
      !billing.cancelAtPeriodEnd ||
      !billing.currentPeriodEnd ||
      billing.currentPeriodEnd > now
    ) {
      return null;
    }

    const freePlan = await tx.query.plans.findFirst({
      where: eq(plans.slug, "free"),
    });
    const credits = freePlan?.includedCredits ?? 500;

    await tx
      .update(organization)
      .set({
        plan: "free",
        balance: credits,
        lastFreeCreditsGrantedAt: now,
        updatedAt: now,
      })
      .where(eq(organization.id, organizationId));

    await tx
      .update(organizationBilling)
      .set({
        planId: freePlan?.id,
        planSlug: "free",
        billingProvider: "free",
        status: "active",
        subscriptionStatus: "active",
        cancelAtPeriodEnd: false,
        providerSubscriptionId: null,
        razorpaySubscriptionId: null,
        razorpayPlanId: null,
        currentPeriodStart: now,
        currentPeriodEnd: addDays(now, 30),
        creditsLastResetAt: now,
        nextCreditResetAt: addDays(now, 30),
        pendingPlanSlug: null,
        pendingRazorpaySubscriptionId: null,
        pendingSubscriptionStatus: null,
        pendingCurrentPeriodStart: null,
        pendingCurrentPeriodEnd: null,
        updatedAt: now,
      })
      .where(eq(organizationBilling.organizationId, organizationId));

    await tx.insert(creditTransaction).values({
      organizationId,
      amount: credits,
      type: "BONUS",
      status: "COMPLETED",
      description: "Free plan monthly credits",
      metadata: {
        source: "subscription_expired_free_reset",
        previousSubscriptionId: billing.razorpaySubscriptionId,
      },
    });

    return true;
  });
}

export async function processBillingMaintenanceForOrganization(
  organizationId: string,
) {
  await cleanupAbandonedCreatedSubscriptionForOrganization(organizationId);
  await expireScheduledCancellationForOrganization(organizationId);
  await repairBillingPeriodForOrganization(organizationId);

  const currentBilling = await db.query.organizationBilling.findFirst({
    where: eq(organizationBilling.organizationId, organizationId),
  });

  if (
    currentBilling?.razorpaySubscriptionId &&
    currentBilling.subscriptionStatus === "authenticated"
  ) {
    return null;
  }

  if (currentBilling?.planSlug === "free") {
    return resetFreeCreditsForOrganization(organizationId);
  }

  return resetPaidCreditsForOrganizationIfDue(organizationId);
}

export async function expireScheduledCancellations() {
  const now = new Date();
  const billings = await db.query.organizationBilling.findMany({
    where: and(
      eq(organizationBilling.cancelAtPeriodEnd, true),
      lte(organizationBilling.currentPeriodEnd, now),
    ),
  });

  for (const billing of billings) {
    await expireScheduledCancellationForOrganization(billing.organizationId);
  }

  return billings.length;
}

export async function cleanupAbandonedCreatedSubscriptions() {
  const billings = await db.query.organizationBilling.findMany({
    where: eq(organizationBilling.subscriptionStatus, "created"),
  });

  for (const billing of billings) {
    await cleanupAbandonedCreatedSubscriptionForOrganization(billing.organizationId);
  }

  return billings.length;
}

export async function resetDueFreeCredits() {
  const billings = await db.query.organizationBilling.findMany({
    where: eq(organizationBilling.planSlug, "free"),
  });

  for (const billing of billings) {
    await resetFreeCreditsForOrganization(billing.organizationId);
  }

  return billings.length;
}

export async function resetDuePaidCredits() {
  const billings = await db.query.organizationBilling.findMany({
    where: eq(organizationBilling.subscriptionStatus, "active"),
  });

  for (const billing of billings) {
    if (billing.planSlug !== "free") {
      await resetPaidCreditsForOrganizationIfDue(billing.organizationId);
    }
  }

  return billings.length;
}
