import { redirect } from "next/navigation";

export default async function DomainSendersPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;

  redirect(`/dashboard/organization/domains/${encodeURIComponent(domain)}#senders`);
}
