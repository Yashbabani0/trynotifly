// components/home/cta.tsx

import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";

const benefits = [
  "500 free credits included",
  "No credit card required",
  "Email, SMS, WhatsApp & Push",
];

export function Cta() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] border bg-card p-8 shadow-sm sm:p-12 lg:p-16">
          <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-transparent" />

          <div className="relative mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center rounded-full border bg-background px-4 py-1.5 text-sm text-muted-foreground">
              Ready to get started?
            </div>

            <h2 className="mt-6 text-balance font-heading text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Build notifications once.
              <br />
              Deliver everywhere.
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-balance text-lg text-muted-foreground">
              Start sending Email, SMS, WhatsApp and Push notifications from a
              single platform designed for developers and growing teams.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="https://dashboard.trynotifly.com/sign-up">
                  Start Free
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>

              <Button size="lg" variant="outline" asChild>
                <Link href="/pricing">View Pricing</Link>
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
              {benefits.map((benefit) => (
                <div
                  key={benefit}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <CheckCircle2 className="size-4 text-primary" />
                  {benefit}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
