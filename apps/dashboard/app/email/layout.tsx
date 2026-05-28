import { redirect } from "next/navigation";

export default async function EmailLayout({
}: {
  children: React.ReactNode;
}) {
  redirect("/dashboard/organization/domains");
}
