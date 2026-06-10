import { Suspense } from "react";
import { headers } from "next/headers";
import { connectMongoDB } from "@/lib/mongodb";
import mongoose from "mongoose";
import { PricingClient } from "./pricing-client";
import { PricingSkeleton } from "./pricing-skeleton";

export type Currency = "inr" | "usd";

async function getPlans() {
  await connectMongoDB();

  return mongoose.connection
    .collection("Plans")
    .find({})
    .sort({ sortOrder: 1 })
    .toArray();
}

async function PricingContent() {
  const headersList = await headers();

  const country =
    headersList.get("x-vercel-ip-country") ||
    headersList.get("cf-ipcountry") ||
    "IN";

  const currency: Currency = country === "IN" ? "inr" : "usd";

  const plans = await getPlans();

  return (
    <PricingClient
      plans={JSON.parse(JSON.stringify(plans))}
      currency={currency}
    />
  );
}

export function Pricing() {
  return (
    <section className="relative overflow-hidden bg-black py-24 text-white sm:py-32">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-size-[64px_64px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(132,255,204,0.16),transparent_35%),linear-gradient(to_bottom,black,rgba(0,0,0,0.94))]" />

      <div className="relative mx-auto max-w-7xl px-6">
        <Suspense fallback={<PricingSkeleton />}>
          <PricingContent />
        </Suspense>
      </div>
    </section>
  );
}
