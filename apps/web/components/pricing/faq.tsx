type PricingFaqItem = {
  question: string;
  answer: string;
};

interface PricingFaqProps {
  faqs: PricingFaqItem[];
}

export function PricingFaq({ faqs }: PricingFaqProps) {
  return (
    <section className="border-t py-20 sm:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <div>
          <p className="text-sm font-medium text-primary">FAQ</p>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Pricing questions
          </h2>
          <p className="mt-4 text-muted-foreground">
            Common questions about plans, credits and billing.
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
