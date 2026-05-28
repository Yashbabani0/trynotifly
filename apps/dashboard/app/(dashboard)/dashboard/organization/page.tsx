import {
  apiKey,
  count,
  db,
  emailDomain,
  eq,
  getPlanDefinition,
  member,
  senderEmailIdentity,
} from "@trynotifly/db";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardContext } from "@/lib/dashboard-context";

export default async function OrganizationOverviewPage() {
  const { organization, role } = await getDashboardContext();
  const plan = getPlanDefinition(organization.plan);
  const [members, domains, keys, senders] = await Promise.all([
    db.select({ value: count() }).from(member).where(eq(member.organizationId, organization.id)),
    db
      .select({ value: count() })
      .from(emailDomain)
      .where(eq(emailDomain.organizationId, organization.id)),
    db.select({ value: count() }).from(apiKey).where(eq(apiKey.organizationId, organization.id)),
    db
      .select({ value: count() })
      .from(senderEmailIdentity)
      .where(eq(senderEmailIdentity.organizationId, organization.id)),
  ]);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Organization</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">{organization.name}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Workspace profile, limits, team, and channel readiness.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/organization/edit">Edit organization</Link>
        </Button>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Plan", plan.name, organization.plan],
          ["Members", members[0]?.value ?? 0, `${plan.memberLimit ?? "Unlimited"} allowed`],
          ["Domains", domains[0]?.value ?? 0, `${plan.domainLimit ?? "Unlimited"} allowed`],
          ["API keys", keys[0]?.value ?? 0, `${plan.apiKeyLimit ?? "Unlimited"} active allowed`],
        ].map(([label, value, helper]) => (
          <Card key={label as string}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{value}</div>
              <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            {[
              ["Slug", organization.slug],
              ["Website", organization.website ?? "Not set"],
              ["Timezone", organization.timezone ?? "Not set"],
              ["Industry", organization.industry ?? "Not set"],
              ["Use case", organization.useCase ?? "Not set"],
              ["Team size", organization.teamSize ?? "Not set"],
              ["Your role", role],
              ["Created", organization.createdAt.toLocaleDateString()],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 border-b border-border py-2 last:border-0">
                <span className="text-muted-foreground">{label}</span>
                <span className="text-right font-medium">{value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Channels</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {[
              ["Email", organization.emailEnabled, plan.channels.email],
              ["SMS", organization.smsEnabled, plan.channels.sms],
              ["WhatsApp", organization.whatsappEnabled, plan.channels.whatsapp],
              ["App Push", organization.pushEnabled, plan.channels.appPush],
            ].map(([label, enabled, available]) => (
              <div key={label as string} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground">
                    {available ? "Available on your plan" : "Upgrade required"}
                  </p>
                </div>
                <Badge variant={enabled ? "default" : available ? "outline" : "destructive"}>
                  {enabled ? "Enabled" : available ? "Disabled" : "Locked"}
                </Badge>
              </div>
            ))}
            <div className="rounded-lg border border-border p-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Sender emails</span>
                <Badge variant="secondary">{senders[0]?.value ?? 0}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
