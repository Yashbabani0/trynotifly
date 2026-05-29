import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardContext } from "@/lib/dashboard-context";

export default async function BillingSuccessPage() {
  const { organization, billing } = await getDashboardContext();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <p className="text-sm text-muted-foreground">Billing</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">
          Subscription authenticated
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Razorpay authentication succeeded. Your plan and credits are activated
          after Razorpay confirms the subscription webhook.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle>Current billing</CardTitle>
            <Badge>{billing.status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">Plan</p>
            <p className="mt-1 text-lg font-semibold">{organization.plan}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Billing status</p>
            <p className="mt-1 text-lg font-semibold">{billing.status}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Credit balance</p>
            <p className="mt-1 text-lg font-semibold">
              {organization.balance.toLocaleString()}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard/billing/plans">View plans</Link>
        </Button>
      </div>
    </div>
  );
}
