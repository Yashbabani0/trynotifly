import { StatusCta } from "@/components/status/status-cta";
import { StatusHero } from "@/components/status/status-hero";
import { StatusIncidents } from "@/components/status/status-incidents";
import { StatusServices } from "@/components/status/status-services";

export default function StatusPage() {
  return (
    <main>
      <StatusHero />
      <StatusServices />
      <StatusIncidents />
      <StatusCta />
    </main>
  );
}