import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

const faqs = [
  {
    question: "Do I need Meta Business verification?",
    answer:
      "Depending on your WhatsApp Business setup, message volume, and account requirements, Meta Business verification may be required.",
  },
  {
    question: "What is a WhatsApp template message?",
    answer:
      "A template message is a pre-approved message format used for business-initiated WhatsApp communication.",
  },
  {
    question: "Can I send OTPs on WhatsApp?",
    answer:
      "Yes. WhatsApp can be used for authentication messages such as OTPs, login verification, and account recovery.",
  },
  {
    question: "Can I send marketing messages?",
    answer:
      "Marketing messages require user opt-in and must follow WhatsApp Business policies and template approval requirements.",
  },
  {
    question: "Do I get a green tick?",
    answer:
      "A green tick is not guaranteed. It depends on Meta approval, brand eligibility, and WhatsApp Business requirements.",
  },
];

export function WhatsappFaq() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight">
            WhatsApp FAQ
          </h2>

          <p className="my-2 text-muted-foreground">
            Common questions about WhatsApp Business messaging, templates,
            verification, and approvals.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={faq.question} value={`item-${index}`}>
              <AccordionTrigger className="text-left text-base font-medium">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
