"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type Plan = {
  id: string;
  name: string;
  slug: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  yearlyDiscountPercent: number;
  isEnterprise: boolean;
};

export default function PlanPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState(true);
  const [selectingPlan, setSelectingPlan] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPlans() {
      try {
        const response = await fetch("/api/onboarding/plan/get");

        const data = await response.json();

        setPlans(data.plans || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchPlans();
  }, []);

  async function selectPlan(planSlug: string) {
    try {
      setSelectingPlan(planSlug);

      const response = await fetch("/api/onboarding/plan/select", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          planSlug,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      router.push("/onboarding/use-case");
    } catch (error) {
      console.error(error);
    } finally {
      setSelectingPlan(null);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        Loading plans...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black px-6 py-16 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-lime-400/20 bg-lime-400/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-lime-400">
              <div className="size-2 rounded-full bg-lime-400" />
              Step 02 · Plan Selection
            </div>

            <h1 className="text-5xl font-semibold tracking-tight lg:text-7xl">
              Scale your
              <span className="block text-lime-400">infrastructure.</span>
            </h1>
          </div>

          <div className="flex rounded-2xl border border-white/10 bg-white/[0.03] p-1">
            <button
              onClick={() => setBilling("monthly")}
              className={cn(
                "rounded-xl px-6 py-3 text-sm transition-all",
                billing === "monthly"
                  ? "bg-lime-400 text-black"
                  : "text-zinc-400",
              )}
            >
              Monthly
            </button>

            <button
              onClick={() => setBilling("yearly")}
              className={cn(
                "rounded-xl px-6 py-3 text-sm transition-all",
                billing === "yearly"
                  ? "bg-lime-400 text-black"
                  : "text-zinc-400",
              )}
            >
              Yearly
            </button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="rounded-3xl border border-white/10 bg-white/[0.03] p-7"
            >
              <h2 className="text-3xl font-semibold">{plan.name}</h2>

              <p className="mt-4 text-sm leading-7 text-zinc-400">
                {plan.description}
              </p>

              <div className="mt-10 flex items-end gap-2">
                <span className="text-5xl font-semibold">
                  {plan.isEnterprise
                    ? "Custom"
                    : `₹${
                        billing === "monthly"
                          ? plan.monthlyPrice
                          : plan.yearlyPrice
                      }`}
                </span>

                {!plan.isEnterprise && (
                  <span className="mb-1 text-zinc-500">
                    / {billing === "monthly" ? "month" : "year"}
                  </span>
                )}
              </div>

              <button
                onClick={() => selectPlan(plan.slug)}
                disabled={selectingPlan === plan.slug}
                className="mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-lime-400 bg-lime-400 text-sm font-medium text-black transition-all hover:bg-lime-300 disabled:opacity-50"
              >
                {selectingPlan === plan.slug ? "Processing..." : "Select Plan"}

                <ArrowRight className="size-4" />
              </button>

              <div className="mt-8 border-t border-white/10 pt-6">
                <div className="flex items-center gap-3 text-sm text-zinc-300">
                  <Check className="size-4 text-lime-400" />
                  Production ready infrastructure
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
