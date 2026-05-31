import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export function EnterpriseHero() {
  return (
    <section className="border-b bg-linear-to-b from-primary/5 via-background to-background py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <p className="text-sm font-medium text-primary">Enterprise</p>

        <h1 className="mx-auto mt-3 max-w-5xl text-balance font-heading text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Custom notification infrastructure for high-volume teams
        </h1>

        <p className="mx-auto mt-6 max-w-3xl text-balance text-lg text-muted-foreground">
          Get custom credits, higher throughput, SLA options, dedicated support
          and advanced controls for Email, SMS, WhatsApp and Push notifications.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg" asChild>
            <Link href="#contact-sales">
              Contact Sales
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>

          <Button size="lg" variant="outline" asChild>
            <Link href="/pricing">View Pricing</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
