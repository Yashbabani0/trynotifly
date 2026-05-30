import { NextResponse } from "next/server";
import {
  fetchRazorpaySubscription,
  verifyRazorpaySubscriptionCheckoutSignature,
} from "@trynotifly/billing/razorpay";
import {
  and,
  billingTransactions,
  creditTransaction,
  db,
  eq,
  organization,
  organizationBilling,
  plans,
  sql,
} from "@trynotifly/db";
import {
  addDays,
  getBillingAuthContext,
  resolveThirtyDayPeriod,
} from "@/lib/billing";

export const runtime = "nodejs";

type VerifySubscriptionBody = {
  organizationId?: unknown;
  subscriptionId?: unknown;
  razorpay_payment_id?: unknown;
  razorpay_subscription_id?: unknown;
  razorpay_signature?: unknown;
};

function jsonError(status: number, code: string, message: string) {
  return NextResponse.json(
    { success: false, error: { code, message } },
    { status },
  );
}

async function markSubscriptionAuthenticationFailed(organizationId: string) {
  await db
    .update(organizationBilling)
    .set({
      pendingSubscriptionStatus: "authentication_failed",
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(organizationBilling.organizationId, organizationId),
        eq(organizationBilling.pendingSubscriptionStatus, "created"),
      ),
    );
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as VerifySubscriptionBody | null;
    const organizationId =
      typeof body?.organizationId === "string" ? body.organizationId : null;
    const subscriptionId =
      typeof body?.subscriptionId === "string" ? body.subscriptionId : null;
    const razorpayPaymentId =
      typeof body?.razorpay_payment_id === "string"
        ? body.razorpay_payment_id
        : null;
    const returnedSubscriptionId =
      typeof body?.razorpay_subscription_id === "string"
        ? body.razorpay_subscription_id
        : null;
    const razorpaySignature =
      typeof body?.razorpay_signature === "string"
        ? body.razorpay_signature
        : null;

    if (
      !organizationId ||
      !subscriptionId ||
      !razorpayPaymentId ||
      !returnedSubscriptionId ||
      !razorpaySignature
    ) {
      return jsonError(
        400,
        "INVALID_SUBSCRIPTION_VERIFY_REQUEST",
        "Missing Razorpay subscription verification fields.",
      );
    }

    const authContext = await getBillingAuthContext(request, organizationId);

    if (!authContext.ok) {
      return jsonError(authContext.status, authContext.code, authContext.message);
    }

    const billing = await db.query.organizationBilling.findFirst({
      where: eq(organizationBilling.organizationId, organizationId),
    });

    if (!billing || billing.pendingRazorpaySubscriptionId !== subscriptionId) {
      if (billing?.pendingRazorpaySubscriptionId === subscriptionId) {
        await markSubscriptionAuthenticationFailed(organizationId);
      }

      return jsonError(
        404,
        "SUBSCRIPTION_NOT_FOUND",
        "This subscription does not belong to the organization.",
      );
    }

    if (returnedSubscriptionId !== subscriptionId) {
      await markSubscriptionAuthenticationFailed(organizationId);

      return jsonError(
        400,
        "SUBSCRIPTION_MISMATCH",
        "The returned subscription does not match the server-created subscription.",
      );
    }

    const signatureValid = verifyRazorpaySubscriptionCheckoutSignature({
      razorpayPaymentId,
      subscriptionId,
      razorpaySignature,
    });

    if (!signatureValid) {
      await markSubscriptionAuthenticationFailed(organizationId);

      return jsonError(
        400,
        "INVALID_RAZORPAY_SIGNATURE",
        "Invalid Razorpay signature.",
      );
    }

    const checkoutPlanSlug = billing.pendingPlanSlug ?? billing.planSlug;
    const plan = await db.query.plans.findFirst({
      where: eq(plans.slug, checkoutPlanSlug),
    });
    const now = new Date();
    const razorpaySubscription = await fetchRazorpaySubscription(subscriptionId);
    const subscriptionPeriodStart = razorpaySubscription.current_start
      ? new Date(razorpaySubscription.current_start * 1000)
      : now;
    const subscriptionPeriodEnd = razorpaySubscription.current_end
      ? new Date(razorpaySubscription.current_end * 1000)
      : addDays(subscriptionPeriodStart, 30);
    const { periodStart, periodEnd } = resolveThirtyDayPeriod({
      start: subscriptionPeriodStart,
      end: subscriptionPeriodEnd,
      fallbackStart: now,
    });
    const subscriptionIsActive = razorpaySubscription.status === "active";

    await db.transaction(async (tx) => {
      if (subscriptionIsActive) {
        await tx
          .update(organization)
          .set({
            plan: checkoutPlanSlug,
            balance: sql`${organization.balance} + ${plan?.includedCredits ?? 0}`,
            updatedAt: now,
          })
          .where(eq(organization.id, organizationId));

        await tx
          .update(organizationBilling)
          .set({
            planId: plan?.id,
            planSlug: checkoutPlanSlug,
            billingProvider: "razorpay",
            status: "active",
            subscriptionStatus: "active",
            providerSubscriptionId: subscriptionId,
            razorpaySubscriptionId: subscriptionId,
            razorpayPlanId: razorpaySubscription.plan_id ?? plan?.razorpayPlanId,
            currentPeriodStart: periodStart,
            currentPeriodEnd: periodEnd,
            creditsLastResetAt: periodStart,
            nextCreditResetAt: periodEnd,
            pendingPlanSlug: null,
            pendingRazorpaySubscriptionId: null,
            pendingSubscriptionStatus: null,
            pendingCurrentPeriodStart: null,
            pendingCurrentPeriodEnd: null,
            updatedAt: now,
          })
          .where(eq(organizationBilling.organizationId, organizationId));

        if ((plan?.includedCredits ?? 0) > 0) {
          await tx.insert(creditTransaction).values({
            organizationId,
            amount: plan?.includedCredits ?? 0,
            type: "PURCHASE",
            status: "COMPLETED",
            description: `${plan?.name ?? "Paid plan"} monthly credits reset`,
            metadata: {
              source: "checkout_verified_active_reset",
              planSlug: checkoutPlanSlug,
              subscriptionId,
              periodStart: periodStart.toISOString(),
              periodEnd: periodEnd.toISOString(),
            },
          });
        }
      } else {
        await tx
          .update(organizationBilling)
          .set({
            pendingSubscriptionStatus: "authenticated",
            pendingCurrentPeriodStart: periodStart,
            pendingCurrentPeriodEnd: periodEnd,
            updatedAt: now,
          })
          .where(eq(organizationBilling.organizationId, organizationId));
      }

      await tx
        .insert(billingTransactions)
        .values({
          organizationId,
          provider: "razorpay",
          providerSubscriptionId: subscriptionId,
          providerPaymentId: razorpayPaymentId,
          razorpaySubscriptionId: subscriptionId,
          razorpayPaymentId,
          providerSignature: razorpaySignature,
          planId: plan?.id,
          planSlug: checkoutPlanSlug,
          amount: (plan?.monthlyPriceInr ?? 0) * 100,
          currency: plan?.currency ?? "INR",
          status: "pending",
          eventType: "checkout.authenticated",
          rawPayload: body,
        })
        .onConflictDoUpdate({
          target: billingTransactions.razorpayPaymentId,
          set: {
            providerSignature: razorpaySignature,
            status: "pending",
            eventType: "checkout.authenticated",
            rawPayload: body,
            updatedAt: now,
          },
        });
    });

    return NextResponse.json({
      success: true,
      data: {
        status: subscriptionIsActive ? "active" : "authenticated",
      },
    });
  } catch (error) {
    console.error("razorpay.subscription.verify.failed", { error });

    return jsonError(
      500,
      "RAZORPAY_SUBSCRIPTION_VERIFY_FAILED",
      "Failed to verify Razorpay subscription payment.",
    );
  }
}
