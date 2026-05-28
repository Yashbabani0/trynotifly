import { redirect } from "next/navigation";
import AddDomainPage from "@/app/email/domains/add/page";
import { getDashboardContext } from "@/lib/dashboard-context";

export default async function DashboardAddDomainPage() {
  const { role } = await getDashboardContext();

  if (role !== "owner" && role !== "admin") {
    redirect("/dashboard/organization/domains");
  }

  return <AddDomainPage />;
}
