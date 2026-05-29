import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BillingPendingPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <p className="text-sm text-muted-foreground">Billing</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">
          Payment pending
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Your subscription authentication may still be waiting for verification
          or webhook activation.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Verification in progress</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Refresh this page or return to plans in a moment. Credits are reset
            only after Razorpay confirms the subscription charge.
          </p>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/dashboard/billing/pending">Refresh</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard/billing/plans">Back to plans</Link>
        </Button>
      </div>
    </div>
  );
}
