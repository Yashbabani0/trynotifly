import { db, emailDomain, eq, senderEmailIdentity } from "@trynotifly/db";
import { Badge } from "@/components/ui/badge";
import { ChannelSettingsCard } from "@/components/dashboard/channel-settings-card";
import { getDashboardContext } from "@/lib/dashboard-context";

export default async function EmailChannelPage() {
  const { organization, plan } = await getDashboardContext();
  const [domains, senders] = await Promise.all([
    db.query.emailDomain.findMany({
      where: eq(emailDomain.organizationId, organization.id),
      orderBy: (table, { desc }) => [desc(table.createdAt)],
    }),
    db.query.senderEmailIdentity.findMany({
      where: eq(senderEmailIdentity.organizationId, organization.id),
      orderBy: (table, { desc }) => [desc(table.createdAt)],
    }),
  ]);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">Channels</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">Email</h2>
      </div>
      <ChannelSettingsCard
        title="Email notifications"
        channel="email"
        enabled={organization.emailEnabled}
        available={plan.channels.email}
        description="Send transactional email using verified domains, sender identities, DKIM, SPF, DMARC, and custom MAIL FROM."
        setupHref="/email/domains"
        stats={
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">Domains</p>
              <p className="mt-1 text-2xl font-semibold">{domains.length}</p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">Ready domains</p>
              <p className="mt-1 text-2xl font-semibold">
                {domains.filter((domain) => domain.fullyVerified).length}
              </p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-muted-foreground">Sender emails</p>
              <p className="mt-1 text-2xl font-semibold">{senders.length}</p>
            </div>
          </div>
        }
      />
      <div className="mt-6 rounded-lg border border-border bg-card p-4">
        <h3 className="font-semibold">Domain readiness</h3>
        <div className="mt-3 space-y-2">
          {domains.length === 0 ? (
            <p className="text-sm text-muted-foreground">No domains have been added yet.</p>
          ) : (
            domains.slice(0, 6).map((domain) => (
              <div key={domain.id} className="flex items-center justify-between rounded-md border border-border p-3">
                <span className="font-medium">{domain.domain}</span>
                <Badge variant={domain.fullyVerified ? "default" : "outline"}>
                  {domain.fullyVerified ? "Ready" : domain.status.toLowerCase()}
                </Badge>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
