import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Free",
    price: "₹0",
    description: "For testing and small projects.",
    credits: "500 credits / month",
    cta: "Start Free",
    href: "https://dashboard.trynotifly.com/sign-up",
    features: [
      "Email, SMS, WhatsApp and Push",
      "Basic analytics",
      "Test API keys",
      "Community support",
    ],
  },
  {
    name: "Starter",
    price: "₹299",
    description: "For production apps and early teams.",
    credits: "More monthly credits",
    cta: "Start Starter",
    href: "/pricing",
    highlighted: true,
    features: [
      "Live API keys",
      "Higher monthly credits",
      "Team members",
      "Email support",
    ],
  },
  {
    name: "Business",
    price: "Custom",
    description: "For teams with higher volume and support needs.",
    credits: "Custom limits",
    cta: "Contact Sales",
    href: "/enterprise",
    features: [
      "Custom channel limits",
      "Priority support",
      "SLA options",
      "Advanced security",
    ],
  },
];

export function PricingPreview() {
  return (
    <section className="border-t bg-background py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-medium text-primary">Simple pricing</p>

          <h2 className="mt-3 text-balance font-heading text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Start free, scale as you grow
          </h2>

          <p className="mt-5 text-balance text-lg text-muted-foreground">
            TryNotifly gives you one billing system for Email, SMS, WhatsApp and
            Push notifications.
          </p>
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={
                plan.highlighted
                  ? "rounded-3xl border border-primary bg-card p-8 shadow-md"
                  : "rounded-3xl border bg-card p-8 shadow-sm"
              }
            >
              {plan.highlighted && (
                <div className="mb-4 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  Recommended
                </div>
              )}

              <h3 className="text-xl font-semibold">{plan.name}</h3>

              <div className="mt-4 flex items-end gap-1">
                <span className="text-4xl font-bold tracking-tight">
                  {plan.price}
                </span>

                {plan.price !== "Custom" && (
                  <span className="pb-1 text-sm text-muted-foreground">
                    /month
                  </span>
                )}
              </div>

              <p className="mt-3 text-sm text-muted-foreground">
                {plan.description}
              </p>

              <p className="mt-4 rounded-2xl bg-muted/40 px-4 py-3 text-sm font-medium">
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
                className="mt-8 w-full"
                variant={plan.highlighted ? "default" : "outline"}
                asChild
              >
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Button variant="ghost" asChild>
            <Link href="/pricing">View full pricing</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
