import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

const faqs = [
  {
    question: "What is DLT?",
    answer:
      "DLT is a telecom compliance system used in India for commercial SMS communication. Businesses generally need approved entities, sender IDs, and message templates.",
  },
  {
    question: "Do I need a sender ID?",
    answer:
      "For production SMS traffic in India, businesses usually need an approved sender ID before sending transactional or utility SMS.",
  },
  {
    question: "Can I send OTP messages?",
    answer:
      "Yes. TryNotifly is designed for OTPs, authentication messages, verification codes, and transactional alerts.",
  },
  {
    question: "Are promotional SMS supported?",
    answer:
      "TryNotifly is focused on transactional and product notification workflows. Promotional messaging may require separate consent, templates, and compliance handling.",
  },
];

export function SmsFaq() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight">SMS FAQ</h2>
          <p className="my-2 text-muted-foreground">
            Common questions about SMS delivery, DLT, OTPs, and transactional
            messaging.
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
