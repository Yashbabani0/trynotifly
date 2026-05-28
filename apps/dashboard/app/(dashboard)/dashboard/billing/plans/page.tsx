import { PLAN_DEFINITIONS } from "@trynotifly/db";
import { ActionSubmit } from "@/components/dashboard/action-submit";
import { ServerActionForm } from "@/components/dashboard/server-action-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardContext } from "@/lib/dashboard-context";
import { changePlanAction } from "../actions";

function price(plan: (typeof PLAN_DEFINITIONS)[keyof typeof PLAN_DEFINITIONS]) {
  if (plan.isContactSales) {
    return "Contact sales";
  }

  return `₹${plan.monthlyPrice?.toLocaleString("en-IN") ?? 0}/mo`;
}

export default async function PlansPage() {
  const { organization, billing } = await getDashboardContext();
  const definitions = Object.values(PLAN_DEFINITIONS).sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <div>
        <p className="text-sm text-muted-foreground">Billing</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">Plans</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Manual plan activation for now. Limits are enforced server-side across the workspace.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current billing</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">Current plan</p>
            <p className="mt-1 text-lg font-semibold">{organization.plan}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <p className="mt-1 text-lg font-semibold">{billing.status}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Credits balance</p>
            <p className="mt-1 text-lg font-semibold">{organization.balance.toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-4 lg:grid-cols-5">
        {definitions.map((plan) => {
          const current = organization.plan === plan.slug;
          return (
            <Card key={plan.slug} className={current ? "border-primary" : undefined}>
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle>{plan.name}</CardTitle>
                  {current ? <Badge>Current</Badge> : null}
                </div>
                <p className="text-2xl font-semibold">{price(plan)}</p>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li>{plan.includedCredits?.toLocaleString() ?? "Custom"} credits</li>
                  <li>{plan.domainLimit ?? "Unlimited"} domains</li>
                  <li>{plan.apiKeyLimit ?? "Unlimited"} API keys</li>
                  <li>{plan.memberLimit ?? "Unlimited"} members</li>
                  <li>{plan.senderEmailLimit ?? "Unlimited"} sender emails</li>
                  <li>{plan.support}</li>
                </ul>
                <ServerActionForm action={changePlanAction} className="space-y-3">
                  <input type="hidden" name="plan" value={plan.slug} />
                  <ActionSubmit
                    pendingLabel="Updating"
                    variant={current ? "outline" : "default"}
                    className="w-full"
                  >
                    {current ? "Current plan" : plan.isContactSales ? "Contact sales" : "Activate manually"}
                  </ActionSubmit>
                </ServerActionForm>
              </CardContent>
            </Card>
          );
        })}
      </section>
    </div>
  );
}
