import { EnterpriseFaq } from "@/components/enterprise/enterprise-faq";
import { EnterpriseFeatures } from "@/components/enterprise/enterprise-features";
import { EnterpriseForm } from "@/components/enterprise/enterprise-form";
import { EnterpriseHero } from "@/components/enterprise/enterprise-hero";
import { EnterpriseUseCases } from "@/components/enterprise/enterprise-use-cases";
import { Cta } from "@/components/home/cta";

export default function EnterprisePage() {
  return (
    <main>
      <EnterpriseHero />
      <EnterpriseFeatures />
      <EnterpriseUseCases />
      <EnterpriseForm />
      <EnterpriseFaq />
      <Cta />
    </main>
  );
}
