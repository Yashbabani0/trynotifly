import { normalizePlanSlug } from "@trynotifly/db";

export const NON_TERMINAL_SUBSCRIPTION_STATUSES = [
  "created",
  "authenticated",
  "active",
  "pending",
  "halted",
  "cancel_scheduled",
] as const;

export const TERMINAL_SUBSCRIPTION_STATUSES = [
  "authentication_failed",
  "cancelled",
  "completed",
  "expired",
] as const;

export const BLOCKING_SUBSCRIPTION_STATUSES = [
  "authenticated",
  "active",
  "pending",
  "halted",
  "cancel_scheduled",
] as const;

export const RETRYABLE_CHECKOUT_STATUSES = [
  "created",
  "authentication_failed",
] as const;

export function isNonTerminalSubscriptionStatus(status?: string | null) {
  return NON_TERMINAL_SUBSCRIPTION_STATUSES.includes(
    status as (typeof NON_TERMINAL_SUBSCRIPTION_STATUSES)[number],
  );
}

export function canCancelSubscriptionStatus(status?: string | null) {
  return (
    status === "authenticated" ||
    status === "active" ||
    status === "pending" ||
    status === "halted"
  );
}

export function isBlockingPaidSubscriptionStatus(status?: string | null) {
  return BLOCKING_SUBSCRIPTION_STATUSES.includes(
    status as (typeof BLOCKING_SUBSCRIPTION_STATUSES)[number],
  );
}

export function isRetryableCheckoutStatus(status?: string | null) {
  return RETRYABLE_CHECKOUT_STATUSES.includes(
    status as (typeof RETRYABLE_CHECKOUT_STATUSES)[number],
  );
}

export function shouldBlockNewSubscription(input: {
  razorpaySubscriptionId?: string | null;
  subscriptionStatus?: string | null;
}) {
  return Boolean(
    input.razorpaySubscriptionId &&
      isBlockingPaidSubscriptionStatus(input.subscriptionStatus),
  );
}

export function getActivePlanSlug(input: {
  organizationPlan?: string | null;
  billingPlanSlug?: string | null;
}) {
  return normalizePlanSlug(input.billingPlanSlug ?? input.organizationPlan);
}

export function getPendingPlanSlug(input: {
  pendingPlanSlug?: string | null;
}) {
  return input.pendingPlanSlug ? normalizePlanSlug(input.pendingPlanSlug) : null;
}
