"use client";
import { useEffect, useState } from "react";
import { Cta } from "@/components/home/cta";
import { PricingCredits } from "./credits";
import { PricingFaq } from "./faq";
import { PricingHero } from "./hero";
import { PricingPlans } from "./plans";

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

const plans: PricingPlan[] = [
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
      "Community support",
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
      "Webhooks",
      "3 team members",
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
      "10 team members",
      "Priority support",
      "Usage reporting",
    ],
  },
  {
    name: "Business",
    description: "For high-volume teams that need more limits and support.",
    monthlyInr: "₹2,999",
    yearlyInr: "₹28,790",
    monthlyUsd: "$49",
    yearlyUsd: "$470",
    credits: "100,000 credits / month",
    cta: "Start Business",
    href: "https://dashboard.trynotifly.com/sign-up",
    features: [
      "Everything in Growth",
      "Advanced reporting",
      "Higher throughput",
      "25 team members",
      "Dedicated support",
      "Priority processing",
    ],
  },
];

const enterpriseFeatures = [
  "Custom credits",
  "Custom channel limits",
  "Custom SLA",
  "Dedicated account manager",
  "Custom integrations",
  "Volume pricing",
];

const creditRules = [
  { channel: "Email", credits: "1 credit" },
  { channel: "Push", credits: "1 credit" },
  { channel: "SMS", credits: "25 credits" },
  { channel: "WhatsApp", credits: "80 credits" },
];

const faqs = [
  {
    question: "How do credits work?",
    answer:
      "Credits are consumed based on channel cost. Email and Push use fewer credits, while SMS and WhatsApp use more because provider costs are higher.",
  },
  {
    question: "Do yearly plans include a discount?",
    answer:
      "Yes. Yearly billing includes around 20% discount compared to monthly billing.",
  },
  {
    question: "Can I upgrade later?",
    answer:
      "Yes. You can upgrade as your usage grows. Your new limits apply after the billing update is completed.",
  },
  {
    question: "Do unused credits roll over?",
    answer:
      "Monthly plan credits reset every billing cycle. Custom rollover rules can be offered on enterprise plans.",
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

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [currency, setCurrency] = useState<Currency>("usd");

  useEffect(() => {
    setCurrency(detectCurrency());
  }, []);

  return (
    <main>
      <PricingHero
        billingCycle={billingCycle}
        setBillingCycle={setBillingCycle}
        currency={currency}
      />

      <PricingPlans
        plans={plans}
        billingCycle={billingCycle}
        currency={currency}
        enterpriseFeatures={enterpriseFeatures}
      />

      <PricingCredits creditRules={creditRules} />
      <PricingFaq faqs={faqs} />
      <Cta />
    </main>
  );
}
