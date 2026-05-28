import { account, db, eq } from "@trynotifly/db";
import { ConnectedAccountsClient } from "@/components/account/connected-accounts-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardContext } from "@/lib/dashboard-context";

export default async function ConnectedAccountsPage() {
  const { user } = await getDashboardContext();
  const accounts = await db.query.account.findMany({
    where: eq(account.userId, user.id),
  });

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">Account</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">Connected accounts</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>OAuth providers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ConnectedAccountsClient accounts={accounts} />
        </CardContent>
      </Card>
    </div>
  );
}
