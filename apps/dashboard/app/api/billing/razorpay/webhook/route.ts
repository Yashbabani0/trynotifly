import { NextResponse } from "next/server";
import { verifyRazorpayWebhookSignature } from "@trynotifly/billing/razorpay";
import {
  billingTransactions,
  creditTransaction,
  db,
  eq,
  organization,
  organizationBilling,
  plans,
  sql,
} from "@trynotifly/db";
import { addDays, resetFreeCreditsForOrganization } from "@/lib/billing";

export const runtime = "nodejs";

type RazorpayEntity = {
  id?: string;
  status?: string;
  plan_id?: string;
  current_start?: number | null;
  current_end?: number | null;
  notes?: Record<string, string>;
  amount?: number;
  currency?: string;
  subscription_id?: string;
  payment_id?: string;
  invoice_id?: string;
  order_id?: string;
};

type RazorpayWebhookPayload = {
  id?: string;
  event?: string;
  created_at?: number;
  payload?: {
    subscription?: {
      entity?: RazorpayEntity;
    };
    payment?: {
      entity?: RazorpayEntity;
    };
    invoice?: {
      entity?: RazorpayEntity;
    };
  };
};

function unixToDate(value?: number | null) {
  return value ? new Date(value * 1000) : null;
}

function eventKey(payload: RazorpayWebhookPayload, eventType: string) {
  const subscriptionId = payload.payload?.subscription?.entity?.id;
  const paymentId = payload.payload?.payment?.entity?.id;
  const invoiceId = payload.payload?.invoice?.entity?.id;

  return (
    payload.id ??
    [eventType, subscriptionId, paymentId, invoiceId, payload.created_at]
      .filter(Boolean)
      .join(":")
  );
}

async function findBilling(subscription: RazorpayEntity) {
  if (subscription.id) {
    const bySubscription = await db.query.organizationBilling.findFirst({
      where: eq(organizationBilling.razorpaySubscriptionId, subscription.id),
    });

    if (bySubscription) {
      return bySubscription;
    }

    const byPendingSubscription = await db.query.organizationBilling.findFirst({
      where: eq(organizationBilling.pendingRazorpaySubscriptionId, subscription.id),
    });

    if (byPendingSubscription) {
      return byPendingSubscription;
    }
  }

  const organizationId = subscription.notes?.organizationId;

  if (!organizationId) {
    return null;
  }

  return db.query.organizationBilling.findFirst({
    where: eq(organizationBilling.organizationId, organizationId),
  });
}

async function recordWebhookTransaction(input: {
  organizationId: string;
  planId?: string;
  planSlug: "free" | "starter" | "growth" | "premium" | "business" | "enterprise";
  eventType: string;
  eventId: string;
  subscriptionId?: string;
  payment?: RazorpayEntity;
  invoice?: RazorpayEntity;
  amount: number;
  currency: string;
  status: "created" | "pending" | "paid" | "failed" | "refunded";
  rawPayload: RazorpayWebhookPayload;
}) {
  if (input.payment?.id) {
    const existingPayment = await db.query.billingTransactions.findFirst({
      where: eq(billingTransactions.razorpayPaymentId, input.payment.id),
    });

    if (existingPayment) {
      await db
        .update(billingTransactions)
        .set({
          providerEventId: input.eventId,
          razorpayInvoiceId: input.invoice?.id ?? input.payment.invoice_id,
          status: input.status,
          eventType: input.eventType,
          rawPayload: input.rawPayload,
          updatedAt: new Date(),
        })
        .where(eq(billingTransactions.id, existingPayment.id));
      return;
    }
  }

  await db
    .insert(billingTransactions)
    .values({
      organizationId: input.organizationId,
      provider: "razorpay",
      providerEventId: input.eventId,
      providerSubscriptionId: input.subscriptionId,
      providerPaymentId: input.payment?.id,
      razorpaySubscriptionId: input.subscriptionId,
      razorpayPaymentId: input.payment?.id,
      razorpayInvoiceId: input.invoice?.id ?? input.payment?.invoice_id,
      planId: input.planId,
      planSlug: input.planSlug,
      amount: input.amount,
      currency: input.currency,
      status: input.status,
      eventType: input.eventType,
      rawPayload: input.rawPayload,
    })
    .onConflictDoNothing({
      target: billingTransactions.providerEventId,
    });
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!signature) {
    return NextResponse.json(
      { success: false, error: { code: "WEBHOOK_SIGNATURE_REQUIRED" } },
      { status: 400 },
    );
  }

  if (!verifyRazorpayWebhookSignature({ body, signature })) {
    return NextResponse.json(
      { success: false, error: { code: "INVALID_WEBHOOK_SIGNATURE" } },
      { status: 400 },
    );
  }

  const payload = JSON.parse(body) as RazorpayWebhookPayload;
  const eventType = payload.event;
  const subscription = payload.payload?.subscription?.entity;
  const payment = payload.payload?.payment?.entity;
  const invoice = payload.payload?.invoice?.entity;

  if (eventType === "payment.captured" && payment?.order_id) {
    const webhookEventId = eventKey(payload, eventType);
    const now = new Date();

    await db.transaction(async (tx) => {
      const existingEvent = await tx.query.billingTransactions.findFirst({
        where: eq(billingTransactions.providerEventId, webhookEventId),
      });

      if (existingEvent) {
        return;
      }

      const pendingCreditTransaction =
        await tx.query.creditTransaction.findFirst({
          where: eq(creditTransaction.providerOrderId, payment.order_id!),
        });

      if (
        !pendingCreditTransaction ||
        pendingCreditTransaction.status === "COMPLETED"
      ) {
        return;
      }

      await tx
        .update(creditTransaction)
        .set({
          status: "COMPLETED",
          providerPaymentId: payment.id,
          providerTransactionId: payment.id,
          metadata: {
            ...(pendingCreditTransaction.metadata &&
            typeof pendingCreditTransaction.metadata === "object"
              ? pendingCreditTransaction.metadata
              : {}),
            paymentId: payment.id,
            eventId: webhookEventId,
            rawPayload: payload,
          },
        })
        .where(eq(creditTransaction.id, pendingCreditTransaction.id));

      await tx
        .update(organization)
        .set({
          balance: sql`${organization.balance} + ${pendingCreditTransaction.amount}`,
          updatedAt: now,
        })
        .where(eq(organization.id, pendingCreditTransaction.organizationId));

      await tx.insert(billingTransactions).values({
        organizationId: pendingCreditTransaction.organizationId,
        provider: "razorpay",
        providerEventId: webhookEventId,
        providerOrderId: payment.order_id,
        providerPaymentId: payment.id,
        razorpayPaymentId: payment.id,
        amount: payment.amount ?? 0,
        currency: payment.currency ?? "INR",
        planSlug: "free",
        status: "paid",
        eventType,
        rawPayload: payload,
      });
    });

    return NextResponse.json({ success: true });
  }

  if (!eventType || !subscription) {
    return NextResponse.json({ success: true, ignored: true });
  }

  const billing = await findBilling(subscription);

  if (!billing) {
    return NextResponse.json({ success: true, ignored: true });
  }

  const planSlug = (subscription.notes?.planSlug ?? billing.planSlug) as
    | "free"
    | "starter"
    | "growth"
    | "premium"
    | "business"
    | "enterprise";
  const plan = await db.query.plans.findFirst({
    where: eq(plans.slug, planSlug),
  });
  const currentPeriodStart = unixToDate(subscription.current_start) ?? new Date();
  const currentPeriodEnd =
    unixToDate(subscription.current_end) ?? addDays(currentPeriodStart, 30);
  const webhookEventId = eventKey(payload, eventType);
  const now = new Date();

  if (eventType === "subscription.activated") {
    const credits = plan?.includedCredits ?? 0;

    await db.transaction(async (tx) => {
      const existing = await tx.query.billingTransactions.findFirst({
        where: eq(billingTransactions.providerEventId, webhookEventId),
      });

      if (existing) {
        return;
      }

      await tx.insert(billingTransactions).values({
        organizationId: billing.organizationId,
        provider: "razorpay",
        providerEventId: webhookEventId,
        providerSubscriptionId: subscription.id,
        razorpaySubscriptionId: subscription.id,
        planId: plan?.id,
        planSlug,
        amount: 0,
        currency: plan?.currency ?? "INR",
        status: "paid",
        eventType,
        rawPayload: payload,
      });

      await tx
        .update(organization)
        .set({
          plan: planSlug,
          balance: sql`${organization.balance} + ${credits}`,
          updatedAt: now,
        })
        .where(eq(organization.id, billing.organizationId));

      await tx
        .update(organizationBilling)
        .set({
          planId: plan?.id,
          planSlug,
          billingProvider: "razorpay",
          billingInterval: "monthly",
          status: "active",
          subscriptionStatus: "active",
          providerSubscriptionId: subscription.id,
          razorpaySubscriptionId: subscription.id,
          razorpayPlanId: subscription.plan_id ?? plan?.razorpayPlanId,
          currentPeriodStart,
          currentPeriodEnd,
          creditsLastResetAt: currentPeriodStart,
          nextCreditResetAt: currentPeriodEnd,
          cancelAtPeriodEnd: false,
          pendingPlanSlug: null,
          pendingRazorpaySubscriptionId: null,
          pendingSubscriptionStatus: null,
          pendingCurrentPeriodStart: null,
          pendingCurrentPeriodEnd: null,
          updatedAt: now,
        })
        .where(eq(organizationBilling.organizationId, billing.organizationId));

      if (credits > 0) {
        await tx.insert(creditTransaction).values({
          organizationId: billing.organizationId,
          amount: credits,
          type: "PURCHASE",
          status: "COMPLETED",
          description: `${plan?.name ?? "Paid plan"} monthly credits reset`,
          metadata: {
            source: "subscription_activated_reset",
            planSlug,
            subscriptionId: subscription.id,
            eventId: webhookEventId,
            periodStart: currentPeriodStart.toISOString(),
            periodEnd: currentPeriodEnd.toISOString(),
          },
        });
      }
    });

    return NextResponse.json({ success: true });
  }

  if (eventType === "subscription.charged" || eventType === "invoice.paid") {
    const amount = payment?.amount ?? invoice?.amount ?? (plan?.monthlyPriceInr ?? 0) * 100;
    const currency = payment?.currency ?? invoice?.currency ?? plan?.currency ?? "INR";
    const credits = plan?.includedCredits ?? 0;

    await db.transaction(async (tx) => {
      const existing = await tx.query.billingTransactions.findFirst({
        where: eq(billingTransactions.providerEventId, webhookEventId),
      });

      if (existing) {
        return;
      }

      if (payment?.id) {
        const existingPayment = await tx.query.billingTransactions.findFirst({
          where: eq(billingTransactions.razorpayPaymentId, payment.id),
        });

        if (existingPayment) {
          await tx
            .update(billingTransactions)
            .set({
              providerEventId: webhookEventId,
              razorpayInvoiceId: invoice?.id ?? payment.invoice_id,
              amount,
              currency,
              status: "paid",
              eventType,
              rawPayload: payload,
              updatedAt: now,
            })
            .where(eq(billingTransactions.id, existingPayment.id));
        } else {
          await tx.insert(billingTransactions).values({
            organizationId: billing.organizationId,
            provider: "razorpay",
            providerEventId: webhookEventId,
            providerSubscriptionId: subscription.id,
            providerPaymentId: payment?.id,
            razorpaySubscriptionId: subscription.id,
            razorpayPaymentId: payment?.id,
            razorpayInvoiceId: invoice?.id ?? payment?.invoice_id,
            planId: plan?.id,
            planSlug,
            amount,
            currency,
            status: "paid",
            eventType,
            rawPayload: payload,
          });
        }
      } else {
        await tx.insert(billingTransactions).values({
          organizationId: billing.organizationId,
          provider: "razorpay",
          providerEventId: webhookEventId,
          providerSubscriptionId: subscription.id,
          razorpaySubscriptionId: subscription.id,
          razorpayInvoiceId: invoice?.id,
          planId: plan?.id,
          planSlug,
          amount,
          currency,
          status: "paid",
          eventType,
          rawPayload: payload,
        });
      }

      await tx
        .update(organization)
        .set({
          plan: planSlug,
          balance: sql`${organization.balance} + ${credits}`,
          updatedAt: now,
        })
        .where(eq(organization.id, billing.organizationId));

      await tx
        .update(organizationBilling)
        .set({
          planId: plan?.id,
          planSlug,
          billingProvider: "razorpay",
          status: "active",
          subscriptionStatus: "active",
          providerSubscriptionId: subscription.id,
          razorpaySubscriptionId: subscription.id,
          razorpayPlanId: subscription.plan_id ?? plan?.razorpayPlanId,
          currentPeriodStart,
          currentPeriodEnd,
          lastChargedAt: now,
          creditsLastResetAt: currentPeriodStart,
          nextCreditResetAt: currentPeriodEnd,
          pendingPlanSlug: null,
          pendingRazorpaySubscriptionId: null,
          pendingSubscriptionStatus: null,
          pendingCurrentPeriodStart: null,
          pendingCurrentPeriodEnd: null,
          updatedAt: now,
        })
        .where(eq(organizationBilling.organizationId, billing.organizationId));

      if (credits > 0) {
        await tx.insert(creditTransaction).values({
          organizationId: billing.organizationId,
          amount: credits,
          type: "PURCHASE",
          status: "COMPLETED",
          description: `${plan?.name ?? "Paid plan"} monthly credits reset`,
          metadata: {
            source: "subscription_charged_reset",
            planSlug,
            subscriptionId: subscription.id,
            eventId: webhookEventId,
            paymentId: payment?.id,
            invoiceId: invoice?.id ?? payment?.invoice_id,
            periodStart: currentPeriodStart.toISOString(),
            periodEnd: currentPeriodEnd.toISOString(),
          },
        });
      }
    });

    return NextResponse.json({ success: true });
  }

  if (eventType === "subscription.pending" || eventType === "subscription.halted") {
    const isPendingCheckoutSubscription =
      billing.pendingRazorpaySubscriptionId === subscription.id &&
      billing.razorpaySubscriptionId !== subscription.id;

    await db
      .update(organizationBilling)
      .set({
        subscriptionStatus: isPendingCheckoutSubscription
          ? billing.subscriptionStatus
          : eventType === "subscription.pending"
            ? "pending"
            : "halted",
        pendingSubscriptionStatus: isPendingCheckoutSubscription
          ? eventType === "subscription.pending"
            ? "pending"
            : "halted"
          : billing.pendingSubscriptionStatus,
        status: isPendingCheckoutSubscription ? billing.status : "past_due",
        updatedAt: now,
      })
      .where(eq(organizationBilling.organizationId, billing.organizationId));

    await recordWebhookTransaction({
      organizationId: billing.organizationId,
      planId: plan?.id,
      planSlug,
      eventType,
      eventId: webhookEventId,
      subscriptionId: subscription.id,
      payment,
      invoice,
      amount: payment?.amount ?? invoice?.amount ?? 0,
      currency: payment?.currency ?? invoice?.currency ?? "INR",
      status: "failed",
      rawPayload: payload,
    });

    return NextResponse.json({ success: true });
  }

  if (eventType === "subscription.cancelled" || eventType === "subscription.completed") {
    const isPendingCheckoutSubscription =
      billing.pendingRazorpaySubscriptionId === subscription.id &&
      billing.razorpaySubscriptionId !== subscription.id;

    if (isPendingCheckoutSubscription) {
      await db
        .update(organizationBilling)
        .set({
          pendingPlanSlug: null,
          pendingRazorpaySubscriptionId: null,
          pendingSubscriptionStatus: null,
          pendingCurrentPeriodStart: null,
          pendingCurrentPeriodEnd: null,
          updatedAt: now,
        })
        .where(eq(organizationBilling.organizationId, billing.organizationId));

      return NextResponse.json({ success: true });
    }

    if (currentPeriodEnd > now) {
      await db
        .update(organizationBilling)
        .set({
          cancelAtPeriodEnd: true,
          cancelledAt: now,
          subscriptionStatus: "cancel_scheduled",
          currentPeriodEnd,
          nextCreditResetAt: currentPeriodEnd,
          updatedAt: now,
        })
        .where(eq(organizationBilling.organizationId, billing.organizationId));
    } else {
      await db
        .update(organization)
        .set({
          plan: "free",
          updatedAt: now,
        })
        .where(eq(organization.id, billing.organizationId));
      await db
        .update(organizationBilling)
        .set({
          planSlug: "free",
          billingProvider: "free",
          subscriptionStatus: "active",
          status: "active",
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
        .where(eq(organizationBilling.organizationId, billing.organizationId));
      await resetFreeCreditsForOrganization(billing.organizationId);
    }

    return NextResponse.json({ success: true });
  }

  if (eventType === "payment.failed") {
    await recordWebhookTransaction({
      organizationId: billing.organizationId,
      planId: plan?.id,
      planSlug,
      eventType,
      eventId: webhookEventId,
      subscriptionId: subscription.id,
      payment,
      invoice,
      amount: payment?.amount ?? 0,
      currency: payment?.currency ?? "INR",
      status: "failed",
      rawPayload: payload,
    });
  }

  return NextResponse.json({ success: true });
}
