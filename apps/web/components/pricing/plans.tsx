import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type BillingCycle = "monthly" | "yearly";
type Currency = "inr" | "usd";

type PricingPlan = {
  name: string;
  description: string;
  monthlyInr: string;
  yearlyInr: string;
  monthlyUsd: string;
  yearlyUsd: string;
  credits: string;
  cta: string;
  href: string;
  popular?: boolean;
  features: string[];
};

interface PricingPlansProps {
  plans: PricingPlan[];
  billingCycle: BillingCycle;
  currency: Currency;
  enterpriseFeatures: string[];
}

export function PricingPlans({
  plans,
  billingCycle,
  currency,
  enterpriseFeatures,
}: PricingPlansProps) {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-stretch gap-5 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => {
            const price =
              currency === "inr"
                ? billingCycle === "monthly"
                  ? plan.monthlyInr
                  : plan.yearlyInr
                : billingCycle === "monthly"
                  ? plan.monthlyUsd
                  : plan.yearlyUsd;

            return (
              <div
                key={plan.name}
                className={`relative flex h-full rounded-3xl border bg-card p-7 shadow-sm ${
                  plan.popular ? "border-primary shadow-md" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute right-6 top-6 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    Most popular
                  </div>
                )}

                <div className="flex min-h-140 w-full flex-col">
                  <h2 className="text-2xl font-semibold tracking-tight">
                    {plan.name}
                  </h2>

                  <p className="mt-3 min-h-18 text-sm leading-6 text-muted-foreground">
                    {plan.description}
                  </p>

                  <div className="mt-6 min-h-12">
                    <span className="text-4xl font-bold tracking-tight">
                      {price}
                    </span>
                    <span className="ml-1 text-sm text-muted-foreground">
                      {billingCycle === "monthly" ? "/mo" : "/yr"}
                    </span>
                  </div>

                  <p className="mt-5 rounded-2xl bg-muted/40 px-4 py-3 text-sm font-medium">
                    {plan.credits}
                  </p>

                  <ul className="mt-6 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex gap-3 text-sm">
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="mt-auto w-full"
                    variant={plan.popular ? "default" : "outline"}
                    asChild
                  >
                    <Link href={plan.href}>{plan.cta}</Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 rounded-3xl border bg-card p-7 shadow-sm">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr_auto] lg:items-center">
            <div>
              <p className="text-sm font-medium text-primary">Enterprise</p>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                Need custom limits?
              </h2>

              <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
                For large teams, high-volume workloads, custom SLAs and
                dedicated support.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {enterpriseFeatures.map((feature) => (
                <div key={feature} className="flex gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span className="text-muted-foreground">{feature}</span>
                </div>
              ))}
            </div>

            <Button className="w-full lg:w-auto" asChild>
              <Link href="/enterprise">Contact Sales</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
