import { NextResponse } from "next/server";
import { cancelRazorpaySubscriptionAtCycleEnd } from "@trynotifly/billing/razorpay";
import { db, eq, organizationBilling } from "@trynotifly/db";
import {
  addDays,
  canCancelSubscriptionStatus,
  getBillingAuthContext,
} from "@/lib/billing";

export const runtime = "nodejs";

type CancelSubscriptionBody = {
  organizationId?: unknown;
};

function jsonError(status: number, code: string, message: string) {
  return NextResponse.json(
    { success: false, error: { code, message } },
    { status },
  );
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as CancelSubscriptionBody | null;
    const organizationId =
      typeof body?.organizationId === "string" ? body.organizationId : null;

    if (!organizationId) {
      return jsonError(
        400,
        "INVALID_CANCEL_REQUEST",
        "Send a valid organizationId.",
      );
    }

    const authContext = await getBillingAuthContext(request, organizationId);

    if (!authContext.ok) {
      return jsonError(authContext.status, authContext.code, authContext.message);
    }

    const billing = await db.query.organizationBilling.findFirst({
      where: eq(organizationBilling.organizationId, organizationId),
    });

    const subscriptionId =
      billing?.razorpaySubscriptionId ?? billing?.pendingRazorpaySubscriptionId;

    if (
      !billing ||
      !subscriptionId ||
      !canCancelSubscriptionStatus(billing.subscriptionStatus)
    ) {
      return jsonError(
        400,
        "NO_ACTIVE_SUBSCRIPTION",
        "There is no active or pending Razorpay subscription to cancel.",
      );
    }

    const subscription = await cancelRazorpaySubscriptionAtCycleEnd(
      subscriptionId,
    );
    const now = new Date();
    const currentPeriodEnd = subscription.current_end
      ? new Date(subscription.current_end * 1000)
      : billing.currentPeriodEnd ?? addDays(now, 30);

    await db
      .update(organizationBilling)
      .set({
        cancelAtPeriodEnd: true,
        cancelledAt: now,
        subscriptionStatus: "cancel_scheduled",
        pendingSubscriptionStatus: billing.pendingRazorpaySubscriptionId
          ? "cancel_scheduled"
          : billing.pendingSubscriptionStatus,
        currentPeriodEnd,
        nextCreditResetAt: currentPeriodEnd,
        updatedAt: now,
      })
      .where(eq(organizationBilling.organizationId, organizationId));

    return NextResponse.json({
      success: true,
      data: {
        subscriptionId,
        currentPeriodEnd: currentPeriodEnd.toISOString(),
      },
    });
  } catch (error) {
    console.error("razorpay.subscription.cancel.failed", { error });

    return jsonError(
      500,
      "RAZORPAY_SUBSCRIPTION_CANCEL_FAILED",
      "Could not schedule subscription cancellation.",
    );
  }
}
