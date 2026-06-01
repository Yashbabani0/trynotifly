import { PrivacyContent } from "@/components/privacy/privacy-content";
import { PrivacyCta } from "@/components/privacy/privacy-cta";
import { PrivacyHero } from "@/components/privacy/privacy-hero";

export default function PrivacyPage() {
  return (
    <main>
      <PrivacyHero />
      <PrivacyContent />
      <PrivacyCta />
    </main>
  );
}
