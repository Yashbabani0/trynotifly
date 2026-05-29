import { NextResponse } from "next/server";
import {
  clearPendingSubscriptionForOrganization,
  getBillingAuthContext,
} from "@/lib/billing";

export const runtime = "nodejs";

type ClearPendingSubscriptionBody = {
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
    const body = (await request.json().catch(() => null)) as
      | ClearPendingSubscriptionBody
      | null;
    const organizationId =
      typeof body?.organizationId === "string" ? body.organizationId : null;

    if (!organizationId) {
      return jsonError(
        400,
        "INVALID_CLEAR_PENDING_REQUEST",
        "Send a valid organizationId.",
      );
    }

    const authContext = await getBillingAuthContext(request, organizationId);

    if (!authContext.ok) {
      return jsonError(authContext.status, authContext.code, authContext.message);
    }

    const cleared =
      await clearPendingSubscriptionForOrganization(organizationId);

    if (!cleared) {
      return jsonError(
        400,
        "NO_CLEARABLE_PENDING_SUBSCRIPTION",
        "There is no pending checkout that can be cleared.",
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        subscriptionStatus: cleared.subscriptionStatus,
      },
    });
  } catch (error) {
    console.error("razorpay.subscription.clear_pending.failed", { error });

    return jsonError(
      500,
      "CLEAR_PENDING_SUBSCRIPTION_FAILED",
      "Failed to clear pending subscription checkout.",
    );
  }
}
