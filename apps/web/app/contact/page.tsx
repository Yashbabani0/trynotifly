import { ContactFaq } from "@/components/contact/contact-faq";
import { ContactForm } from "@/components/contact/contact-form";
import { ContactHero } from "@/components/contact/contact-hero";
import { ContactOptions } from "@/components/contact/contact-options";

export default function ContactPage() {
  return (
    <main>
      <ContactHero />
      <ContactOptions />
      <ContactForm />
      <ContactFaq />
    </main>
  );
}
