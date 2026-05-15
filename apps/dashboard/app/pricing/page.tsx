"use client";

import { useState } from "react";

export default function PricingPage() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  const plans = [
    {
      name: "Free",
      monthlyPrice: "₹0",
      yearlyPrice: "₹0",
      description: "For testing, development, and side projects.",
      cta: "Get Started",
      highlight: false,
      features: [
        "2,000 emails / month",
        "100,000 push notifications / month",
        "0 SMS credits",
        "0 WhatsApp conversations",
        "API access",
        "Dashboard and analytics",
        "Basic logs and monitoring",
        "Test environment",
        "Community support",
      ],
    },
    {
      name: "Pro",
      monthlyPrice: "₹999",
      yearlyPrice: "₹9,590",
      description: "For production applications and growing startups.",
      cta: "Start Pro",
      highlight: true,
      features: [
        "15,000 emails / month",
        "1,000,000 push notifications / month",
        "500 SMS credits / month",
        "250 WhatsApp utility/auth conversations",
        "Advanced analytics",
        "Delivery logs and retries",
        "Custom API keys",
        "Rate limit controls",
        "Priority email support",
      ],
    },
    {
      name: "Growth",
      monthlyPrice: "₹4,999",
      yearlyPrice: "₹47,990",
      description: "For scaling businesses and high-volume workloads.",
      cta: "Upgrade to Growth",
      highlight: false,
      features: [
        "75,000 emails / month",
        "10,000,000 push notifications / month",
        "3,000 SMS credits / month",
        "1,500 WhatsApp utility/auth conversations",
        "Advanced operational analytics",
        "Team workspaces",
        "Extended log retention",
        "Webhook support",
        "Priority infrastructure queues",
        "Priority support",
      ],
    },
    {
      name: "Enterprise",
      monthlyPrice: "Custom",
      yearlyPrice: "Custom",
      description:
        "Custom infrastructure and high-volume delivery.",
      cta: "Contact Sales",
      highlight: false,
      features: [
        "Custom notification quotas",
        "Dedicated onboarding",
        "Custom routing",
        "Priority infrastructure",
        "Advanced analytics",
        "Dedicated support",
        "Custom retention policies",
        "Enterprise security discussions",
        "Negotiated pricing",
      ],
    },
  ];

  const overages = [
    {
      service: "Email",
      pricing: "₹0.04 – ₹0.06 per email",
    },
    {
      service: "SMS",
      pricing: "₹0.45 – ₹0.60 per SMS",
    },
    {
      service: "WhatsApp Utility/Auth",
      pricing: "₹0.20 – ₹0.35 per conversation",
    },
    {
      service: "WhatsApp Marketing",
      pricing: "Pay-as-you-go pricing",
    },
  ];

  return (
    <main className="min-h-screen bg-[#0b0d12] text-[#f4f5f8]">
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-[#8284ff]">
              Pricing
            </p>

            <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">
              Developer-first notification infrastructure.
            </h1>

            <p className="mt-6 text-lg leading-8 text-[#a8acba]">
              Multi-channel notifications for email, SMS,
              WhatsApp, and push — designed for developers,
              startups, and scalable production workloads.
            </p>

            <p className="mt-4 text-sm text-[#8f94a3]">
              All prices shown in INR. Taxes may apply.
            </p>
          </div>

          <div className="mt-14 flex flex-wrap gap-4 text-sm text-[#c7cad4]">
            <div className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2">
              No hidden fees
            </div>

            <div className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2">
              Usage-based scaling
            </div>

            <div className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2">
              API-first workflows
            </div>

            <div className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2">
              Enterprise-ready architecture
            </div>
          </div>

          <div className="mt-12 flex items-center justify-center">
            <div className="flex rounded-2xl border border-white/10 bg-white/[0.03] p-1">
              <button
                onClick={() => setBilling("monthly")}
                className={`rounded-xl px-5 py-2 text-sm transition ${
                  billing === "monthly"
                    ? "bg-[#8284ff] text-white"
                    : "text-[#a8acba]"
                }`}
              >
                Monthly
              </button>

              <button
                onClick={() => setBilling("yearly")}
                className={`flex items-center gap-2 rounded-xl px-5 py-2 text-sm transition ${
                  billing === "yearly"
                    ? "bg-[#8284ff] text-white"
                    : "text-[#a8acba]"
                }`}
              >
                Yearly

                <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-[11px] text-green-400">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-8 lg:grid-cols-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-3xl border p-8 ${
                plan.highlight
                  ? "border-[#8284ff] bg-[#11141c] shadow-[0_0_0_1px_rgba(130,132,255,0.2)]"
                  : "border-white/10 bg-white/[0.03]"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-6 rounded-full bg-[#8284ff] px-3 py-1 text-xs font-medium text-white">
                  Most Popular
                </div>
              )}

              <div>
                <h2 className="text-2xl font-semibold tracking-tight">
                  {plan.name}
                </h2>

                <p className="mt-3 text-sm leading-6 text-[#a8acba]">
                  {plan.description}
                </p>
              </div>

              <div className="mt-8 flex items-end gap-2">
                <span className="text-5xl font-semibold tracking-tight">
                  {billing === "monthly"
                    ? plan.monthlyPrice
                    : plan.yearlyPrice}
                </span>

                <span className="pb-1 text-sm text-[#8f94a3]">
                  {billing === "monthly"
                    ? "/ month"
                    : "/ year"}
                </span>
              </div>

              <button
                className={`mt-8 inline-flex w-full items-center justify-center rounded-2xl px-5 py-3 text-sm font-medium transition ${
                  plan.highlight
                    ? "bg-[#8284ff] text-white hover:opacity-90"
                    : "border border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.05]"
                }`}
              >
                {plan.cta}
              </button>

              <div className="mt-10 space-y-4">
                {plan.features.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-start gap-3 text-sm text-[#d6d8df]"
                  >
                    <div className="mt-1 h-2 w-2 rounded-full bg-[#8284ff]" />

                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#8284ff]">
              Usage Pricing
            </p>

            <h2 className="mt-4 text-4xl font-semibold tracking-tight">
              Scalable overage pricing.
            </h2>

            <p className="mt-5 text-[15px] leading-7 text-[#a8acba]">
              Notification delivery can scale dynamically
              beyond plan limits. Additional usage may be
              billed based on operational pricing and
              provider costs.
            </p>
          </div>

          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
            <div className="grid grid-cols-2 border-b border-white/10 bg-[#11141c] px-6 py-4 text-sm font-medium text-[#d8dae2]">
              <div>Service</div>
              <div>Pricing</div>
            </div>

            {overages.map((item) => (
              <div
                key={item.service}
                className="grid grid-cols-2 border-b border-white/10 px-6 py-5 text-sm text-[#c7cad4] last:border-none"
              >
                <div>{item.service}</div>

                <div>{item.pricing}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#8284ff]">
                  Dedicated Infrastructure Add-ons
                </p>

                <h2 className="mt-4 text-4xl font-semibold tracking-tight">
                  Dedicated IP Address
                </h2>

                <div className="mt-6 flex items-end gap-2">
                  <span className="text-5xl font-semibold tracking-tight">
                    ₹1,900
                  </span>

                  <span className="pb-1 text-sm text-[#8f94a3]">
                    / month
                  </span>
                </div>

                <p className="mt-2 text-sm text-[#8f94a3]">
                  Billed annually
                </p>

                <p className="mt-6 text-[15px] leading-7 text-[#a8acba]">
                  Dedicated IP infrastructure is suitable for
                  high-volume transactional traffic,
                  enterprise routing requirements, and
                  advanced sender reputation management.
                </p>
              </div>

              <div className="grid gap-4 text-sm text-[#d6d8df]">
                {[
                  "Isolated sender reputation",
                  "Improved deliverability control",
                  "Enterprise-ready routing",
                  "High-volume production traffic",
                  "Advanced operational monitoring",
                  "Priority infrastructure handling",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3"
                  >
                    <div className="mt-1 h-2 w-2 rounded-full bg-[#8284ff]" />

                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-sm text-yellow-200">
              Dedicated IPs may require warm-up and
              operational review before production usage.
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#8284ff]">
                Important Information
              </p>

              <h2 className="mt-4 text-4xl font-semibold tracking-tight">
                Operational and compliance requirements.
              </h2>
            </div>

            <div className="space-y-8 text-[15px] leading-7 text-[#c7cad4]">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  SMS Compliance
                </h3>

                <p className="mt-3">
                  SMS delivery within India may require DLT
                  registration, approved templates, sender
                  verification, and telecom compliance
                  checks before activation.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white">
                  WhatsApp Messaging
                </h3>

                <p className="mt-3">
                  WhatsApp messaging may require Meta
                  business verification, approved templates,
                  and operational review before activation.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white">
                  Usage Limits
                </h3>

                <p className="mt-3">
                  Limits, quotas, and operational pricing
                  may change over time based on
                  infrastructure requirements, provider
                  pricing, abuse prevention, and platform
                  scaling.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="rounded-3xl border border-white/10 bg-[#11141c] p-10 text-center">
            <h2 className="text-4xl font-semibold tracking-tight">
              Need custom infrastructure or compliance support?
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-7 text-[#a8acba]">
              Need custom infrastructure, compliance
              discussions, provider routing, or high-volume
              notification delivery? Contact enterprise sales
              for custom pricing and operational planning.
            </p>

            <button className="mt-8 rounded-2xl bg-[#8284ff] px-6 py-3 text-sm font-medium text-white transition hover:opacity-90">
              Contact Enterprise Sales
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}