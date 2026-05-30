type CreditRule = {
  channel: string;
  credits: string;
};

interface PricingCreditsProps {
  creditRules: CreditRule[];
}

export function PricingCredits({ creditRules }: PricingCreditsProps) {
  return (
    <section className="border-t bg-muted/20 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-medium text-primary">Credit system</p>

          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            One balance for every channel
          </h2>

          <p className="mt-5 text-lg text-muted-foreground">
            Credits are consumed based on channel cost. Lower-cost channels use
            fewer credits, while SMS and WhatsApp use more.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {creditRules.map((rule) => (
            <div
              key={rule.channel}
              className="rounded-3xl border bg-card p-6 text-center shadow-sm"
            >
              <p className="text-lg font-semibold">{rule.channel}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {rule.credits}
              </p>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-8 max-w-3xl rounded-3xl border bg-card p-6 text-center text-sm leading-6 text-muted-foreground shadow-sm">
          Example: 5,000 credits can be used for 5,000 emails, 200 SMS, 62
          WhatsApp messages, 5,000 push notifications, or any mixed usage.
        </div>
      </div>
    </section>
  );
}
