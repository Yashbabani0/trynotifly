import { EmailAnalytics } from "@/components/email/email-analytics";
import { EmailCta } from "@/components/email/email-cta";
import { EmailDomainVerification } from "@/components/email/email-domain-verification";
import { EmailFeatures } from "@/components/email/email-features";
import { EmailHero } from "@/components/email/email-hero";
import { EmailTemplates } from "@/components/email/email-templates";
import { EmailUseCases } from "@/components/email/email-use-cases";

export default function EmailPage() {
  return (
    <main>
      <EmailHero />
      <EmailFeatures />
      <EmailUseCases />
      <EmailDomainVerification />
      <EmailTemplates />
      <EmailAnalytics />
      <EmailCta />
    </main>
  );
}