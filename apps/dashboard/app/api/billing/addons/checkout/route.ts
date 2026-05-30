import { NextResponse } from "next/server";
import { createRazorpayOrder, getRazorpayKeyId } from "@trynotifly/billing/razorpay";
import {
  and,
  creditAddonPacks,
  creditTransaction,
  db,
  eq,
  member,
} from "@trynotifly/db";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

type AddonCheckoutBody = {
  organizationId?: unknown;
  addonPackSlug?: unknown;
};

function jsonError(status: number, code: string, message: string) {
  return NextResponse.json(
    { success: false, error: { code, message } },
    { status },
  );
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return jsonError(401, "UNAUTHORIZED", "Sign in before buying credits.");
    }

    const body = (await request.json().catch(() => null)) as AddonCheckoutBody | null;
    const organizationId =
      typeof body?.organizationId === "string" ? body.organizationId : null;
    const addonPackSlug =
      typeof body?.addonPackSlug === "string" ? body.addonPackSlug : null;

    if (!organizationId || !addonPackSlug) {
      return jsonError(
        400,
        "INVALID_ADDON_CHECKOUT_REQUEST",
        "Send a valid organizationId and addonPackSlug.",
      );
    }

    const membership = await db.query.member.findFirst({
      where: and(
        eq(member.organizationId, organizationId),
        eq(member.userId, session.user.id),
      ),
    });

    if (!membership) {
      return jsonError(403, "FORBIDDEN", "You do not belong to this organization.");
    }

    const pack = await db.query.creditAddonPacks.findFirst({
      where: and(
        eq(creditAddonPacks.slug, addonPackSlug),
        eq(creditAddonPacks.isActive, true),
      ),
    });

    if (!pack) {
      return jsonError(404, "ADDON_PACK_NOT_FOUND", "Credit pack is not available.");
    }

    const order = await createRazorpayOrder({
      amountInr: pack.priceInr,
      currency: "INR",
      receipt: `addon_${organizationId}_${Date.now()}`,
      notes: {
        organizationId,
        addonPackSlug: pack.slug,
        userId: session.user.id,
      },
    });

    await db.insert(creditTransaction).values({
      organizationId,
      amount: pack.credits,
      type: "ADDON_PURCHASE",
      status: "PENDING",
      description: `${pack.name} add-on credits`,
      provider: "razorpay",
      providerOrderId: order.id,
      currency: pack.currency,
      metadata: {
        addonPackSlug: pack.slug,
        priceInr: pack.priceInr,
        orderId: order.id,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.id,
        razorpayKeyId: getRazorpayKeyId(),
        amount: order.amount,
        currency: order.currency,
        name: pack.name,
        description: pack.description,
      },
    });
  } catch (error) {
    console.error("billing.addon.checkout.failed", { error });

    return jsonError(
      500,
      "ADDON_CHECKOUT_FAILED",
      "Could not start credit pack checkout.",
    );
  }
}
