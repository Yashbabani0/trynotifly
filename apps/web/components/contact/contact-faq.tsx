import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

const faqs = [
  {
    question: "Can I contact sales before creating an account?",
    answer:
      "Yes. You can contact us for pricing, enterprise requirements or custom usage needs before creating an account.",
  },
  {
    question: "Where should I report abuse?",
    answer:
      "Use the contact form and choose “Abuse report” as the inquiry type. Include as much detail as possible so we can investigate quickly.",
  },
  {
    question: "Do you provide support for setup?",
    answer:
      "Yes. Support availability depends on your plan. Enterprise customers can receive dedicated implementation support.",
  },
  {
    question: "Can I ask billing or invoice questions here?",
    answer:
      "Yes. Choose “Billing” as the inquiry type and include details about your plan, payment or invoice request.",
  },
];

export function ContactFaq() {
  return (
    <section className="border-t py-20 sm:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <div>
          <p className="text-sm font-medium text-primary">FAQ</p>

          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Contact questions
          </h2>

          <p className="mt-4 text-muted-foreground">
            Quick answers about contacting TryNotifly.
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
