import Link from "next/link";
import { Layers3 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function UseCasesHero() {
  return (
    <section className="border-b bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border bg-card shadow-sm">
          <Layers3 className="h-7 w-7 text-primary" />
        </div>

        <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
          Notification use cases for modern businesses
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
          From OTP verification to order updates, billing alerts, and customer
          engagement, TryNotifly helps deliver critical notifications across
          multiple channels.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild>
            <Link href="/pricing">Get started</Link>
          </Button>

          <Button variant="outline" asChild>
            <Link href="/contact">Talk to us</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
