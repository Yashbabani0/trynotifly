import Link from "next/link";

import { Button } from "@/components/ui/button";

export function FeaturesHero() {
  return (
    <section className="border-b bg-linear-to-b from-primary/5 via-background to-background py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <p className="text-sm font-medium text-primary">Features</p>

        <h1 className="mx-auto mt-3 max-w-5xl text-balance font-heading text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Everything you need to build notification workflows
        </h1>

        <p className="mx-auto mt-6 max-w-3xl text-balance text-lg text-muted-foreground">
          Send Email, SMS, WhatsApp and Push notifications from one API, one
          dashboard and one billing system.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg" asChild>
            <Link href="https://dashboard.trynotifly.com/sign-up">
              Start Free
            </Link>
          </Button>

          <Button size="lg" variant="outline" asChild>
            <Link href="https://docs.trynotifly.com">View Documentation</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
