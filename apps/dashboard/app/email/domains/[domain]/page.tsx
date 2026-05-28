import { DomainDetailClient } from "@/components/domains/domain-detail-client";

export default async function DomainDetailsPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;

  return <DomainDetailClient initialDomain={decodeURIComponent(domain)} />;
}
