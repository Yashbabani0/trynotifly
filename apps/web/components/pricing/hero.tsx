type BillingCycle = "monthly" | "yearly";
type Currency = "inr" | "usd";

interface PricingHeroProps {
  billingCycle: BillingCycle;
  setBillingCycle: (cycle: BillingCycle) => void;
  currency: Currency;
}

export function PricingHero({
  billingCycle,
  setBillingCycle,
  currency,
}: PricingHeroProps) {
  return (
    <section className="border-b bg-linear-to-b from-primary/5 via-background to-background py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <p className="text-sm font-medium text-primary">Pricing</p>

        <h1 className="mx-auto mt-3 max-w-4xl text-balance font-heading text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Simple pricing that scales with your notifications
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground">
          Start free, then upgrade when your Email, SMS, WhatsApp and Push
          volume grows.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3">
          <div className="inline-flex rounded-full border bg-card p-1 text-sm">
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={`rounded-full px-4 py-2 font-medium transition ${
                billingCycle === "monthly"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Monthly
            </button>

            <button
              type="button"
              onClick={() => setBillingCycle("yearly")}
              className={`rounded-full px-4 py-2 font-medium transition ${
                billingCycle === "yearly"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Yearly
              <span className="ml-1 text-xs">Save 20%</span>
            </button>
          </div>

          <p className="text-sm text-muted-foreground">
            Showing prices in {currency === "inr" ? "INR" : "USD"} based on your
            region.
            <br />
            Final billing currency is confirmed during checkout.
          </p>
        </div>
      </div>
    </section>
  );
}
