import { redirect } from "next/navigation";

export default async function DomainSettingsPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;

  redirect(`/dashboard/organization/domains/${encodeURIComponent(domain)}#settings`);
}
