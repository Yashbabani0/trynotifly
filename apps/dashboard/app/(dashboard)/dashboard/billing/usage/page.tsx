import { getPlanDefinition } from "@trynotifly/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardContext } from "@/lib/dashboard-context";

export default async function UsagePage() {
  const { organization } = await getDashboardContext();
  const plan = getPlanDefinition(organization.plan);
  const used = Math.max(0, (plan.includedCredits ?? 0) - organization.balance);
  const percent = plan.includedCredits ? Math.min(100, Math.round((used / plan.includedCredits) * 100)) : 0;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">Billing</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">Usage</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Credit usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-3 rounded-full bg-muted">
            <div className="h-3 rounded-full bg-primary" style={{ width: `${percent}%` }} />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            {used.toLocaleString()} of {plan.includedCredits?.toLocaleString() ?? "custom"} included credits used.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
