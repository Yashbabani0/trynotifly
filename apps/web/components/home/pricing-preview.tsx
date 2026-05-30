"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type BillingCycle = "monthly" | "yearly";
type Currency = "inr" | "usd";

const plans = [
  {
    name: "Free",
    description: "For testing TryNotifly and small side projects.",
    monthlyInr: "₹0",
    yearlyInr: "₹0",
    monthlyUsd: "$0",
    yearlyUsd: "$0",
    credits: "500 credits / month",
    cta: "Start Free",
    href: "https://dashboard.trynotifly.com/sign-up",
    features: [
      "Email, SMS, WhatsApp and Push",
      "Basic analytics",
      "Test API keys",
      "1 workspace",
    ],
  },
  {
    name: "Starter",
    description: "For early production apps and small teams.",
    monthlyInr: "₹299",
    yearlyInr: "₹2,870",
    monthlyUsd: "$5",
    yearlyUsd: "$48",
    credits: "5,000 credits / month",
    cta: "Start Starter",
    href: "https://dashboard.trynotifly.com/sign-up",
    popular: true,
    features: [
      "Everything in Free",
      "Live API keys",
      "Custom domains",
      "Templates",
    ],
  },
  {
    name: "Growth",
    description: "For growing products with regular notification volume.",
    monthlyInr: "₹999",
    yearlyInr: "₹9,590",
    monthlyUsd: "$15",
    yearlyUsd: "$144",
    credits: "25,000 credits / month",
    cta: "Start Growth",
    href: "https://dashboard.trynotifly.com/sign-up",
    features: [
      "Everything in Starter",
      "Advanced analytics",
      "Higher rate limits",
      "Priority support",
    ],
  },
];

function detectCurrency(): Currency {
  if (typeof window === "undefined") return "usd";

  const locale = navigator.language.toLowerCase();
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const isIndia =
    locale === "en-in" ||
    locale.endsWith("-in") ||
    timezone === "Asia/Kolkata" ||
    timezone === "Asia/Calcutta";

  return isIndia ? "inr" : "usd";
}

export function PricingPreview() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [currency, setCurrency] = useState<Currency>("usd");

  useEffect(() => {
    setCurrency(detectCurrency());
  }, []);

  return (
    <section className="border-t bg-background py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-medium text-primary">Simple pricing</p>

          <h2 className="mt-3 text-balance font-heading text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Start free, scale as you grow
          </h2>

          <p className="mt-5 text-balance text-lg text-muted-foreground">
            One billing system for Email, SMS, WhatsApp and Push notifications.
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
              Showing prices in {currency === "inr" ? "INR" : "USD"} based on
              your region.
            </p>
          </div>
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
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
                className={`relative flex rounded-3xl border bg-card p-8 shadow-sm ${
                  plan.popular ? "border-primary shadow-md" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute right-6 top-6 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    Most popular
                  </div>
                )}

                <div className="flex min-h-120 w-full flex-col">
                  <h3 className="text-2xl font-semibold tracking-tight">
                    {plan.name}
                  </h3>

                  <p className="mt-3 min-h-12 text-sm leading-6 text-muted-foreground">
                    {plan.description}
                  </p>

                  <div className="mt-6">
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

        <div className="mt-10 text-center">
          <Button variant="ghost" asChild>
            <Link href="/pricing">View full pricing</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
