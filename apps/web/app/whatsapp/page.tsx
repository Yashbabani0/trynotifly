import { WhatsappBusiness } from "@/components/whatsapp/whatsapp-business";
import { WhatsappCta } from "@/components/whatsapp/whatsapp-cta";
import { WhatsappFaq } from "@/components/whatsapp/whatsapp-faq";
import { WhatsappFeatures } from "@/components/whatsapp/whatsapp-features";
import { WhatsappHero } from "@/components/whatsapp/whatsapp-hero";
import { WhatsappMessageTypes } from "@/components/whatsapp/whatsapp-message-types";
import { WhatsappUseCases } from "@/components/whatsapp/whatsapp-use-cases";

export default function WhatsappPage() {
  return (
    <main>
      <WhatsappHero />
      <WhatsappFeatures />
      <WhatsappBusiness />
      <WhatsappMessageTypes />
      <WhatsappUseCases />
      <WhatsappFaq />
      <WhatsappCta />
    </main>
  );
}
