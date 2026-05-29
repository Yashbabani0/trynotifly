import { NextResponse } from "next/server";
import {
  createRazorpaySubscription,
  getRazorpayKeyId,
} from "@trynotifly/billing/razorpay";
import {
  db,
  eq,
  isKnownPlanSlug,
  normalizePlanSlug,
  organizationBilling,
  plans,
  type PlanSlug,
} from "@trynotifly/db";
import {
  addDays,
  clearPendingSubscriptionForOrganization,
  cleanupAbandonedCreatedSubscriptionForOrganization,
  getBillingAuthContext,
  isBlockingPaidSubscriptionStatus,
  isRetryableCheckoutStatus,
  shouldBlockNewSubscription,
} from "@/lib/billing";

export const runtime = "nodejs";

type CreateSubscriptionBody = {
  organizationId?: unknown;
  planSlug?: unknown;
};

function jsonError(
  status: number,
  code: string,
  message: string,
  details?: Record<string, unknown>,
) {
  return NextResponse.json(
    { success: false, error: { code, message, details } },
    { status },
  );
}

function isPaidPlanSlug(planSlug: PlanSlug) {
  return planSlug === "starter" || planSlug === "premium" || planSlug === "business";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as CreateSubscriptionBody | null;
    const organizationId =
      typeof body?.organizationId === "string" ? body.organizationId : null;
    const rawPlanSlug = typeof body?.planSlug === "string" ? body.planSlug : null;

    if (!organizationId || !rawPlanSlug || !isKnownPlanSlug(rawPlanSlug)) {
      return jsonError(
        400,
        "INVALID_SUBSCRIPTION_REQUEST",
        "Send a valid organizationId and planSlug.",
      );
    }

    const authContext = await getBillingAuthContext(request, organizationId);

    if (!authContext.ok) {
      return jsonError(authContext.status, authContext.code, authContext.message);
    }

    const planSlug = normalizePlanSlug(rawPlanSlug);

    if (!isPaidPlanSlug(planSlug)) {
      return jsonError(
        400,
        "PLAN_NOT_SUBSCRIBABLE",
        "Free and contact-sales plans do not use Razorpay subscriptions.",
      );
    }

    await cleanupAbandonedCreatedSubscriptionForOrganization(organizationId);

    const [plan, billing] = await Promise.all([
      db.query.plans.findFirst({
        where: eq(plans.slug, planSlug),
      }),
      db.query.organizationBilling.findFirst({
        where: eq(organizationBilling.organizationId, organizationId),
      }),
    ]);

    if (!plan || !plan.isActive || !plan.razorpayPlanId) {
      return jsonError(
        400,
        "PLAN_NOT_SUBSCRIBABLE",
        "This plan is not available for Razorpay subscriptions.",
      );
    }

    if (
      billing?.subscriptionStatus === "created" &&
      billing.pendingRazorpaySubscriptionId &&
      billing.pendingPlanSlug === planSlug
    ) {
      return NextResponse.json({
        success: true,
        data: {
          subscriptionId: billing.pendingRazorpaySubscriptionId,
          razorpayKeyId: getRazorpayKeyId(),
          planName: plan.name,
          amount: plan.monthlyPriceInr ?? 0,
          currency: plan.currency,
          retryable: true,
          reusedExistingSubscription: true,
        },
      });
    }

    if (
      billing &&
      isRetryableCheckoutStatus(billing.subscriptionStatus) &&
      billing.pendingPlanSlug
    ) {
      await clearPendingSubscriptionForOrganization(organizationId);
    } else if (
      billing?.pendingRazorpaySubscriptionId &&
      isBlockingPaidSubscriptionStatus(billing.subscriptionStatus)
    ) {
      const activeOrPendingPlanSlug = billing.pendingPlanSlug ?? billing.planSlug;
      const samePlan = activeOrPendingPlanSlug === planSlug;

      return jsonError(
        409,
        samePlan
          ? "SUBSCRIPTION_ALREADY_EXISTS"
          : "CANCEL_CURRENT_SUBSCRIPTION_FIRST",
        samePlan
          ? "You already have an authenticated or pending subscription for this plan."
          : "Cancel your current subscription before starting a different paid plan.",
        {
          currentPlanSlug: billing.planSlug,
          requestedPlanSlug: planSlug,
          pendingPlanSlug: billing.pendingPlanSlug,
          currentPeriodEnd:
            billing.pendingCurrentPeriodEnd?.toISOString() ??
            billing.currentPeriodEnd?.toISOString() ??
            null,
          cancelAtPeriodEnd: billing.cancelAtPeriodEnd,
        },
      );
    } else if (
      billing &&
      shouldBlockNewSubscription({
        razorpaySubscriptionId: billing.razorpaySubscriptionId,
        subscriptionStatus: billing.subscriptionStatus,
      })
    ) {
      const activeOrPendingPlanSlug = billing.pendingPlanSlug ?? billing.planSlug;
      const samePlan = activeOrPendingPlanSlug === planSlug;

      return jsonError(
        409,
        samePlan
          ? "SUBSCRIPTION_ALREADY_EXISTS"
          : "CANCEL_CURRENT_SUBSCRIPTION_FIRST",
        samePlan
          ? "You already have an active or pending subscription for this plan."
          : "Cancel your current subscription before starting a different paid plan.",
        {
          currentPlanSlug: billing.planSlug,
          requestedPlanSlug: planSlug,
          pendingPlanSlug: billing.pendingPlanSlug,
          currentPeriodEnd: billing.currentPeriodEnd?.toISOString() ?? null,
          cancelAtPeriodEnd: billing.cancelAtPeriodEnd,
        },
      );
    }

    const subscription = await createRazorpaySubscription({
      planId: plan.razorpayPlanId,
      totalCount: 120,
      customerNotify: true,
      notes: {
        organizationId,
        planSlug,
        userId: authContext.userId,
      },
    });
    const now = new Date();
    const activePeriodStart = billing?.currentPeriodStart ?? now;
    const activePeriodEnd = billing?.currentPeriodEnd ?? addDays(activePeriodStart, 30);
    const activeCreditsLastResetAt =
      billing?.creditsLastResetAt ?? activePeriodStart;
    const activeNextCreditResetAt = billing?.nextCreditResetAt ?? activePeriodEnd;

    await db
      .insert(organizationBilling)
      .values({
        organizationId,
        planId: billing?.planId,
        planSlug: billing?.planSlug ?? "free",
        billingProvider: billing?.billingProvider ?? "free",
        billingInterval: "monthly",
        status: billing?.status ?? "active",
        subscriptionStatus: "created",
        pendingRazorpaySubscriptionId: subscription.id,
        pendingSubscriptionStatus: "created",
        pendingCurrentPeriodStart: subscription.current_start
          ? new Date(subscription.current_start * 1000)
          : null,
        pendingCurrentPeriodEnd: subscription.current_end
          ? new Date(subscription.current_end * 1000)
          : null,
        currentPeriodStart: activePeriodStart,
        currentPeriodEnd: activePeriodEnd,
        creditsLastResetAt: activeCreditsLastResetAt,
        nextCreditResetAt: activeNextCreditResetAt,
        cancelAtPeriodEnd: false,
        cancelledAt: null,
        pendingPlanSlug: planSlug,
      })
      .onConflictDoUpdate({
        target: organizationBilling.organizationId,
        set: {
          planId: billing?.planId,
          planSlug: billing?.planSlug ?? "free",
          billingProvider: billing?.billingProvider ?? "free",
          billingInterval: "monthly",
          status: billing?.status ?? "active",
          subscriptionStatus: "created",
          pendingRazorpaySubscriptionId: subscription.id,
          pendingSubscriptionStatus: "created",
          pendingCurrentPeriodStart: subscription.current_start
            ? new Date(subscription.current_start * 1000)
            : null,
          pendingCurrentPeriodEnd: subscription.current_end
            ? new Date(subscription.current_end * 1000)
            : null,
          currentPeriodStart: activePeriodStart,
          currentPeriodEnd: activePeriodEnd,
          creditsLastResetAt: activeCreditsLastResetAt,
          nextCreditResetAt: activeNextCreditResetAt,
          cancelAtPeriodEnd: false,
          cancelledAt: null,
          pendingPlanSlug: planSlug,
          updatedAt: now,
        },
      });

    return NextResponse.json({
      success: true,
      data: {
        subscriptionId: subscription.id,
        razorpayKeyId: getRazorpayKeyId(),
        planName: plan.name,
        amount: plan.monthlyPriceInr ?? 0,
        currency: plan.currency,
        retryable: false,
        reusedExistingSubscription: false,
      },
    });
  } catch (error) {
    console.error("razorpay.subscription.create.failed", { error });

    return jsonError(
      500,
      "RAZORPAY_SUBSCRIPTION_CREATE_FAILED",
      "Failed to create Razorpay subscription.",
    );
  }
}
