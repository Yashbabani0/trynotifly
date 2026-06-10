"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Currency } from "./pricing";

type BillingCycle = "monthly" | "yearly";

type Plan = {
  _id?: string;
  slug: string;
  name: string;
  description: string;
  isPopular?: boolean;
  isEnterprise?: boolean;
  imageUrl?: string;
  currency: {
    inr: { monthly: number | null; yearly: number | null };
    usd: { monthly: number | null; yearly: number | null };
  };
  monthlyCredits: number | null;
  features: string[];
  cta?: string;
};

type PricingClientProps = {
  plans: Plan[];
  currency: Currency;
};

export function PricingClient({ plans, currency }: PricingClientProps) {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");

  const symbol = currency === "inr" ? "₹" : "$";
  const currencyLabel = currency === "inr" ? "INR pricing" : "USD pricing";

  return (
    <>
      <div className="mx-auto max-w-3xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mb-5 flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 backdrop-blur"
        >
          <Sparkles className="size-4 text-emerald-300" />
          Simple pricing for every notification workflow
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl font-semibold tracking-tight sm:text-6xl"
        >
          Pricing that scales with your product
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.08 }}
          className="mt-5 text-lg leading-8 text-white/60"
        >
          Start free, then upgrade when you need more credits, logs, analytics,
          team access, and priority support.
        </motion.p>
      </div>

      <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/65">
          {currencyLabel}
        </div>

        <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 p-1">
          {(["monthly", "yearly"] as const).map((item) => (
            <button
              key={item}
              onClick={() => setBillingCycle(item)}
              className={cn(
                "rounded-full px-5 py-2 text-sm font-medium text-white/60 transition",
                billingCycle === item && "bg-white text-black",
              )}
            >
              {item === "monthly" ? "Monthly" : "Yearly"}
            </button>
          ))}
        </div>

        <div className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
          Save 20%
        </div>
      </div>

      <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-5">
        {plans.map((plan, index) => {
          const price = plan.currency?.[currency]?.[billingCycle];

          return (
            <motion.div
              key={plan.slug}
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -8 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06 }}
              className={cn(
                "relative flex min-h-[760px] flex-col rounded-3xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur",
                "shadow-2xl shadow-emerald-500/5",
                plan.isPopular &&
                  "border-emerald-300/50 bg-emerald-300/[0.06] xl:-mt-7",
                plan.isEnterprise && "bg-white/[0.035]",
              )}
            >
              {plan.isPopular && (
                <div className="absolute right-5 top-5 rounded-full bg-emerald-300 px-3 py-1 text-xs font-semibold text-black">
                  Popular
                </div>
              )}

              <h3 className="text-2xl font-semibold">{plan.name}</h3>

              <p className="mt-4 min-h-20 text-sm leading-7 text-white/55">
                {plan.description}
              </p>

              {plan.isEnterprise && (
                <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                  <Image
                    src={plan.imageUrl ?? "/images/pricing/enterprise.png"}
                    alt="Enterprise pricing"
                    width={500}
                    height={260}
                    className="h-36 w-full object-cover opacity-85"
                  />
                </div>
              )}

              <div className="mt-7">
                {plan.isEnterprise ? (
                  <p className="text-4xl font-semibold">Custom</p>
                ) : (
                  <div className="flex items-end gap-1">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={`${plan.slug}-${currency}-${billingCycle}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.18 }}
                        className="text-4xl font-semibold"
                      >
                        {symbol}
                        {price?.toLocaleString("en-IN")}
                      </motion.span>
                    </AnimatePresence>

                    <span className="pb-1 text-sm text-white/45">
                      /{billingCycle === "monthly" ? "mo" : "yr"}
                    </span>
                  </div>
                )}

                <p className="mt-3 text-sm text-white/50">
                  {plan.monthlyCredits
                    ? `${plan.monthlyCredits.toLocaleString("en-IN")} credits/month`
                    : "Custom volume and limits"}
                </p>
              </div>

              <Button
                className={cn(
                  "mt-7 w-full rounded-full",
                  plan.isPopular
                    ? "bg-emerald-300 text-black hover:bg-emerald-200"
                    : "border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white",
                )}
                variant={plan.isPopular ? "default" : "outline"}
              >
                {plan.cta ?? (plan.isEnterprise ? "Contact us" : "Get started")}
                <ArrowRight className="ml-2 size-4" />
              </Button>

              <div className="mt-8 space-y-4">
                {plan.features.map((feature) => (
                  <div
                    key={feature}
                    className="flex gap-3 text-sm text-white/70"
                  >
                    <Check className="mt-0.5 size-4 shrink-0 text-emerald-300" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </>
  );
}
