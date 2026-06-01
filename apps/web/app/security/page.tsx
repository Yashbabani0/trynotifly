import { SecurityCta } from "@/components/security/security-cta";
import { SecurityFeatures } from "@/components/security/security-features";
import { SecurityHero } from "@/components/security/security-hero";
import { SecurityPractices } from "@/components/security/security-practices";

export default function SecurityPage() {
  return (
    <main>
      <SecurityHero />
      <SecurityFeatures />
      <SecurityPractices />
      <SecurityCta />
    </main>
  );
}
