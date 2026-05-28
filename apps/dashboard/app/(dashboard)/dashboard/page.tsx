import Link from "next/link";
import {
  apiKey,
  count,
  creditTransaction,
  db,
  emailDomain,
  eq,
  getPlanDefinition,
  member,
  senderEmailIdentity,
} from "@trynotifly/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardContext } from "@/lib/dashboard-context";

export default async function DashboardPage() {
  const { organization } = await getDashboardContext();
  const [memberCount, apiKeyCount, domainCount, senderCount, transactions] =
    await Promise.all([
      db
        .select({ value: count() })
        .from(member)
        .where(eq(member.organizationId, organization.id))
        .then(([result]) => result?.value ?? 0),
      db
        .select({ value: count() })
        .from(apiKey)
        .where(eq(apiKey.organizationId, organization.id))
        .then(([result]) => result?.value ?? 0),
      db
        .select({ value: count() })
        .from(emailDomain)
        .where(eq(emailDomain.organizationId, organization.id))
        .then(([result]) => result?.value ?? 0),
      db
        .select({ value: count() })
        .from(senderEmailIdentity)
        .where(eq(senderEmailIdentity.organizationId, organization.id))
        .then(([result]) => result?.value ?? 0),
      db.query.creditTransaction.findMany({
        where: eq(creditTransaction.organizationId, organization.id),
        orderBy: (table, { desc }) => [desc(table.createdAt)],
        limit: 5,
      }),
    ]);
  const plan = getPlanDefinition(organization.plan);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{organization.name}</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">
            Overview
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Monitor workspace setup, usage, developer access, and channels.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/billing/plans">Manage plan</Link>
        </Button>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          [
            "Credits",
            organization.balance.toLocaleString(),
            `${plan.includedCredits?.toLocaleString() ?? "Custom"} included`,
          ],
          [
            "Members",
            memberCount.toString(),
            `${plan.memberLimit ?? "Unlimited"} allowed`,
          ],
          [
            "Domains",
            domainCount.toString(),
            `${plan.domainLimit ?? "Unlimited"} allowed`,
          ],
          [
            "API keys",
            apiKeyCount.toString(),
            `${plan.apiKeyLimit ?? "Unlimited"} active allowed`,
          ],
        ].map(([label, value, helper]) => (
          <Card key={label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{value}</div>
              <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Workspace health</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {[
              ["Email", organization.emailEnabled],
              ["SMS", organization.smsEnabled],
              ["WhatsApp", organization.whatsappEnabled],
              ["App Push", organization.pushEnabled],
            ].map(([label, enabled]) => (
              <div
                key={label as string}
                className="rounded-lg border border-border p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{label}</span>
                  <Badge variant={enabled ? "default" : "outline"}>
                    {enabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              </div>
            ))}
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Sender emails</span>
                <Badge variant="secondary">{senderCount}</Badge>
              </div>
            </div>
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Organization status</span>
                <Badge
                  variant={
                    organization.status === "ACTIVE" ? "default" : "destructive"
                  }
                >
                  {organization.status.toLowerCase()}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent credits</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No credit transactions yet.
              </p>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {transaction.description ?? transaction.type}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {transaction.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                    <span className="font-mono text-sm">
                      {transaction.amount}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
