import { asc, db, eq, plans } from "@trynotifly/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardContext } from "@/lib/dashboard-context";
import {
  CancelSubscriptionButton,
  ClearPendingSubscriptionButton,
  RazorpayCheckoutButton,
} from "@/components/dashboard/razorpay-button";
import {
  canCancelSubscriptionStatus as canCancelStatus,
  getActivePlanSlug,
  isBlockingPaidSubscriptionStatus,
  isRetryableCheckoutStatus,
} from "@/lib/billing";

function formatPrice(monthlyPriceInr: number | null) {
  if (!monthlyPriceInr) {
    return "Free";
  }

  return `₹${monthlyPriceInr.toLocaleString("en-IN")}/mo`;
}

function formatLimit(value: number | null, label: string) {
  return `${value?.toLocaleString() ?? "Unlimited"} ${label}`;
}

function formatDate(date?: Date | null) {
  return date
    ? date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Updating soon";
}

function getPeriodMetrics(start?: Date | null, end?: Date | null) {
  if (!start || !end) {
    return {
      daysRemaining: 0,
      periodProgressPercent: 0,
    };
  }

  const now = Date.now();
  const startTime = start.getTime();
  const endTime = end.getTime();
  const duration = Math.max(endTime - startTime, 1);
  const elapsed = Math.min(Math.max(now - startTime, 0), duration);
  const remaining = Math.max(endTime - now, 0);

  return {
    daysRemaining: Math.ceil(remaining / (24 * 60 * 60 * 1000)),
    periodProgressPercent: Math.round((elapsed / duration) * 100),
  };
}

function isPaidPlan(planSlug: string) {
  return planSlug === "starter" || planSlug === "premium" || planSlug === "business";
}

export default async function PlansPage() {
  const { user, organization, billing } = await getDashboardContext();
  const activePlans = (
    await db.query.plans.findMany({
      where: eq(plans.isActive, true),
      orderBy: [asc(plans.sortOrder)],
    })
  ).filter((plan) => plan.slug !== "enterprise");
  const currentPlan = getActivePlanSlug({
    billingPlanSlug: billing.planSlug,
    organizationPlan: organization.plan,
  });
  const hasNonTerminalRazorpaySubscription =
    Boolean(
      billing.razorpaySubscriptionId ?? billing.pendingRazorpaySubscriptionId,
    ) &&
    isBlockingPaidSubscriptionStatus(billing.subscriptionStatus);
  const hasRetryablePendingCheckout =
    Boolean(billing.pendingRazorpaySubscriptionId) &&
    isRetryableCheckoutStatus(billing.subscriptionStatus);
  const canCancelCurrentSubscription =
    Boolean(
      billing.razorpaySubscriptionId ?? billing.pendingRazorpaySubscriptionId,
    ) &&
    canCancelStatus(billing.subscriptionStatus);
  const cancellationScheduled =
    billing.cancelAtPeriodEnd || billing.subscriptionStatus === "cancel_scheduled";
  const fallbackPeriodEnd =
    billing.currentPeriodEnd ??
    (billing.currentPeriodStart
      ? new Date(billing.currentPeriodStart.getTime() + 30 * 24 * 60 * 60 * 1000)
      : null);
  const creditResetAt = billing.nextCreditResetAt ?? fallbackPeriodEnd;
  const usableUntil = billing.currentPeriodEnd ?? creditResetAt;
  const periodMetrics = getPeriodMetrics(
    billing.currentPeriodStart,
    usableUntil,
  );

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <div>
        <p className="text-sm text-muted-foreground">Billing</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">Plans</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose a monthly plan. Credits reset every 30 days and unused credits
          do not roll over.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle>Current billing</CardTitle>
            {cancellationScheduled ? (
              <Badge variant="outline">Cancels at period end</Badge>
            ) : (
              <Badge>
                {hasRetryablePendingCheckout
                  ? "Payment not completed"
                  : billing.subscriptionStatus}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-7">
          <div>
            <p className="text-xs text-muted-foreground">Current plan</p>
            <p className="mt-1 text-lg font-semibold">{currentPlan}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Subscription</p>
            <p className="mt-1 text-lg font-semibold">
              {hasRetryablePendingCheckout
                ? "Payment not completed"
                : billing.subscriptionStatus}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Credits remaining</p>
            <p className="mt-1 text-lg font-semibold">
              {organization.balance.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">
              {cancellationScheduled ? "Credits expire on" : "Credits reset on"}
            </p>
            <p className="mt-1 text-lg font-semibold">
              {formatDate(creditResetAt)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Usable until</p>
            <p className="mt-1 text-lg font-semibold">
              {formatDate(usableUntil)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Days remaining</p>
            <p className="mt-1 text-lg font-semibold">
              {periodMetrics.daysRemaining}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Period progress</p>
            <p className="mt-1 text-lg font-semibold">
              {periodMetrics.periodProgressPercent}%
            </p>
          </div>
        </CardContent>
      </Card>

      {billing.pendingPlanSlug && hasRetryablePendingCheckout ? (
        <Card>
          <CardHeader>
            <CardTitle>Payment not completed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Your {billing.pendingPlanSlug} subscription checkout was created,
              but payment authentication has not completed. Your current{" "}
              {currentPlan} plan remains active.
            </p>
            <div className="grid gap-2 sm:max-w-sm sm:grid-cols-2">
              <RazorpayCheckoutButton
                organizationId={organization.id}
                planSlug={billing.pendingPlanSlug}
                planName={billing.pendingPlanSlug}
                label="Retry payment"
                userName={user.name}
                userEmail={user.email}
              />
              <ClearPendingSubscriptionButton organizationId={organization.id} />
            </div>
          </CardContent>
        </Card>
      ) : billing.pendingPlanSlug && billing.subscriptionStatus === "authenticated" ? (
        <Card>
          <CardHeader>
            <CardTitle>Payment authentication pending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Razorpay authenticated your {billing.pendingPlanSlug} subscription.
              Your current {currentPlan} plan remains active until Razorpay sends
              activation confirmation.
            </p>
            {canCancelCurrentSubscription ? (
              <div className="mt-4 max-w-xs">
                <CancelSubscriptionButton organizationId={organization.id} />
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-4">
        {activePlans.map((plan) => {
          const current = currentPlan === plan.slug;
          const paid = isPaidPlan(plan.slug);
          const pendingForThisPlan =
            hasRetryablePendingCheckout && billing.pendingPlanSlug === plan.slug;
          const canStartSubscription =
            paid &&
            !current &&
            !hasNonTerminalRazorpaySubscription &&
            Boolean(plan.razorpayPlanId);

          return (
            <Card
              key={plan.slug}
              className={current ? "border-primary" : undefined}
            >
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle>{plan.name}</CardTitle>
                  {current ? <Badge>Current</Badge> : null}
                </div>
                <p className="text-2xl font-semibold">
                  {formatPrice(plan.monthlyPriceInr)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {plan.description}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li>
                    {plan.includedCredits?.toLocaleString() ?? "Custom"} credits
                    every 30 days
                  </li>
                  <li>{formatLimit(plan.domainLimit, "domains")}</li>
                  <li>{formatLimit(plan.apiKeyLimit, "API keys")}</li>
                  <li>{formatLimit(plan.memberLimit, "members")}</li>
                  <li>{formatLimit(plan.senderEmailLimit, "sender emails")}</li>
                  <li>{plan.support}</li>
                </ul>
                {current ? (
                  <div className="space-y-2">
                    <Button disabled variant="outline" className="w-full">
                      Current plan
                    </Button>
                    {paid && canCancelCurrentSubscription && !cancellationScheduled ? (
                      <CancelSubscriptionButton organizationId={organization.id} />
                    ) : null}
                    {cancellationScheduled ? (
                      <p className="text-xs text-muted-foreground">
                        Your plan remains active until{" "}
                        {formatDate(billing.currentPeriodEnd)}.
                      </p>
                    ) : null}
                  </div>
                ) : pendingForThisPlan ? (
                  <div className="space-y-2">
                    <RazorpayCheckoutButton
                      organizationId={organization.id}
                      planSlug={plan.slug}
                      planName={plan.name}
                      label="Retry payment"
                      userName={user.name}
                      userEmail={user.email}
                    />
                    <ClearPendingSubscriptionButton organizationId={organization.id} />
                  </div>
                ) : plan.slug === "free" && hasNonTerminalRazorpaySubscription ? (
                  <Button disabled variant="outline" className="w-full">
                    Current plan remains active
                  </Button>
                ) : canStartSubscription ? (
                  <RazorpayCheckoutButton
                    organizationId={organization.id}
                    planSlug={plan.slug}
                    planName={plan.name}
                    userName={user.name}
                    userEmail={user.email}
                  />
                ) : paid && hasNonTerminalRazorpaySubscription ? (
                  <Button disabled variant="outline" className="w-full">
                    {canCancelCurrentSubscription
                      ? "Cancel current plan first"
                      : "Payment authentication pending"}
                  </Button>
                ) : paid ? (
                  <RazorpayCheckoutButton
                    organizationId={organization.id}
                    planSlug={plan.slug}
                    planName={plan.name}
                    userName={user.name}
                    userEmail={user.email}
                  />
                ) : (
                  <Button disabled variant="outline" className="w-full">
                    Free plan
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </section>
    </div>
  );
}
