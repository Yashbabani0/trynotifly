import { account, db, eq } from "@trynotifly/db";
import { PasswordUpdateForm } from "@/components/account/password-update-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardContext } from "@/lib/dashboard-context";

export default async function SecurityPage() {
  const { user } = await getDashboardContext();
  const accounts = await db.query.account.findMany({
    where: eq(account.userId, user.id),
  });
  const hasPassword = accounts.some(
    (item) => item.providerId === "credential" && Boolean(item.password),
  );

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">Account</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">Security</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Update password</CardTitle>
        </CardHeader>
        <CardContent>
          <PasswordUpdateForm hasPassword={hasPassword} />
        </CardContent>
      </Card>
    </div>
  );
}
