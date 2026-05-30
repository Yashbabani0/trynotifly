import { Channels } from "@/components/home/channels";
import { Cta } from "@/components/home/cta";
import { DashboardPreview } from "@/components/home/dashboard-preview";
import { FaqPreview } from "@/components/home/faq-preview";
import { Features } from "@/components/home/features";
import { Hero } from "@/components/home/hero";
import { PricingPreview } from "@/components/home/pricing-preview";
import { Security } from "@/components/home/security";

export default function Home() {
  return (
    <div>
      <Hero />
      <DashboardPreview />
      <Channels />
      <Features />
      <Security />
      <PricingPreview />
      <FaqPreview />
      <Cta />
    </div>
  );
}
