import { describe, expect, test } from "bun:test";
import {
  canCancelSubscriptionStatus,
  getActivePlanSlug,
  getPendingPlanSlug,
  shouldBlockNewSubscription,
} from "./billing-state";

describe("billing subscription state", () => {
  test("created subscription keeps the active plan unchanged", () => {
    expect(
      getActivePlanSlug({
        billingPlanSlug: "free",
        organizationPlan: "free",
      }),
    ).toBe("free");
    expect(getPendingPlanSlug({ pendingPlanSlug: "premium" })).toBe("premium");
    expect(
      shouldBlockNewSubscription({
        razorpaySubscriptionId: "sub_created",
        subscriptionStatus: "created",
      }),
    ).toBe(false);
    expect(canCancelSubscriptionStatus("created")).toBe(false);
  });

  test("activated subscription is cancellable and uses the promoted plan", () => {
    expect(
      getActivePlanSlug({
        billingPlanSlug: "premium",
        organizationPlan: "free",
      }),
    ).toBe("premium");
    expect(getPendingPlanSlug({ pendingPlanSlug: null })).toBe(null);
    expect(canCancelSubscriptionStatus("active")).toBe(true);
    expect(
      shouldBlockNewSubscription({
        razorpaySubscriptionId: "sub_active",
        subscriptionStatus: "active",
      }),
    ).toBe(true);
  });

  test("expired abandoned subscription does not block checkout", () => {
    expect(
      shouldBlockNewSubscription({
        razorpaySubscriptionId: null,
        subscriptionStatus: "expired",
      }),
    ).toBe(false);
    expect(getPendingPlanSlug({ pendingPlanSlug: null })).toBe(null);
  });
});
