import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export function FaqCta() {
  return (
    <section className="border-t bg-muted/20 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <p className="text-sm font-medium text-primary">
          Still have questions?
        </p>

        <h2 className="mx-auto mt-3 max-w-3xl text-balance font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          Contact us and we will help you choose the right setup
        </h2>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button size="lg" asChild>
            <Link href="/contact">
              Contact Us
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
