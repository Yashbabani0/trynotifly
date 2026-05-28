import { DomainDetailClient } from "@/components/domains/domain-detail-client";
import { getDashboardContext } from "@/lib/dashboard-context";

export default async function DashboardDomainDetailsPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  const { role } = await getDashboardContext();

  return (
    <DomainDetailClient
      initialDomain={decodeURIComponent(domain)}
      canManage={role === "owner" || role === "admin"}
    />
  );
}
