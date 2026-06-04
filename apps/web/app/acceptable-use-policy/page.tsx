import { AcceptableUseContent } from "@/components/acceptable-use-policy/acceptable-use-content";
import { AcceptableUseCta } from "@/components/acceptable-use-policy/acceptable-use-cta";
import { AcceptableUseHero } from "@/components/acceptable-use-policy/acceptable-use-hero";

export default function AcceptableUsePolicyPage() {
  return (
    <main>
      <AcceptableUseHero />
      <AcceptableUseContent />
      <AcceptableUseCta />
    </main>
  );
}
