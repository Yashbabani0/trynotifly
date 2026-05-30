import { Cta } from "@/components/home/cta";
import { Workflow } from "@/components/features/workflow";
import { FeaturesHero } from "@/components/features/features-hero";
import { CoreFeatures } from "@/components/features/core-features";
import { ChannelFeatures } from "@/components/features/channel-features";
import { DashboardSection } from "@/components/features/dashboard-section";
import { SecuritySection } from "@/components/features/security-section";

export default function FeaturesPage() {
  return (
    <main>
      <FeaturesHero />
      <CoreFeatures />
      <Workflow />
      <ChannelFeatures />
      <DashboardSection />
      <SecuritySection />
      <Cta />
    </main>
  );
}
