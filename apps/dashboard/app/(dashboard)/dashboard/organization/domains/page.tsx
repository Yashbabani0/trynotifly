import { DashboardDomainsList } from "@/components/domains/dashboard-domains-list";
import { Button } from "@/components/ui/button";
import { getDashboardContext } from "@/lib/dashboard-context";
import Link from "next/link";

export default async function OrganizationDomainsPage() {
  const { role } = await getDashboardContext();
  const canManage = role === "owner" || role === "admin";

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Organization</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">Domains</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Verified and pending sending domains for this organization.
          </p>
        </div>
        {canManage ? (
          <Button asChild>
            <Link href="/dashboard/organization/domains/add">Add domain</Link>
          </Button>
        ) : null}
      </div>
      <DashboardDomainsList canManage={canManage} />
    </div>
  );
}
