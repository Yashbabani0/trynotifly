const faqs = [
  {
    question: "Who should use the Enterprise plan?",
    answer:
      "Enterprise is for teams with high-volume notifications, custom limits, SLA requirements, dedicated support or advanced security needs.",
  },
  {
    question: "Can we get custom credit limits?",
    answer:
      "Yes. Enterprise plans can include custom monthly credits based on your expected usage across Email, SMS, WhatsApp and Push.",
  },
  {
    question: "Do you support custom SLAs?",
    answer:
      "SLA options can be discussed based on your volume, channels and support requirements.",
  },
  {
    question: "Can you help with migration?",
    answer:
      "Yes. Enterprise customers can receive implementation and migration support depending on their plan.",
  },
];

export function EnterpriseFaq() {
  return (
    <section className="border-t bg-muted/20 py-20 sm:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <div>
          <p className="text-sm font-medium text-primary">FAQ</p>

          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Enterprise questions
          </h2>

          <p className="mt-4 text-muted-foreground">
            Common questions about custom plans, support and higher-volume
            usage.
          </p>
        </div>

        <div className="divide-y rounded-3xl border bg-card px-6 shadow-sm">
          {faqs.map((faq) => (
            <div key={faq.question} className="py-6">
              <h3 className="font-semibold">{faq.question}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
